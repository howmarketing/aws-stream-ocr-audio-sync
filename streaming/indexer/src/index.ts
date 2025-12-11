import * as fs from 'fs';
import * as path from 'path';
import chokidar from 'chokidar';
import Database from 'better-sqlite3';

// Configuration from environment
const HLS_PATH = process.env.HLS_PATH || '/storage/hls';
const INDEX_DB_PATH = process.env.INDEX_DB_PATH || '/storage/index/segments.db';
const SEGMENT_DURATION = parseFloat(process.env.SEGMENT_DURATION || '2');

console.log('========================================');
console.log('Indexer Worker - HLS Segment Tracker');
console.log('========================================');
console.log(`HLS Path: ${HLS_PATH}`);
console.log(`Index DB: ${INDEX_DB_PATH}`);
console.log(`Segment Duration: ${SEGMENT_DURATION}s`);
console.log('========================================\n');

// Initialize SQLite database
function initializeDatabase(): Database.Database {
  const dbDir = path.dirname(INDEX_DB_PATH);

  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(INDEX_DB_PATH);

  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL');

  // Create table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sequence INTEGER UNIQUE NOT NULL,
      filename TEXT NOT NULL,
      start REAL NOT NULL,
      end REAL NOT NULL,
      duration REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Create index on sequence for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sequence ON segments(sequence);
    CREATE INDEX IF NOT EXISTS idx_start_time ON segments(start);
  `);

  console.log('✓ Database initialized\n');
  return db;
}

// Extract sequence number from filename
function extractSequence(filename: string): number | null {
  const match = filename.match(/segment(\d+)\.ts$/);
  return match ? parseInt(match[1], 10) : null;
}

// Index a segment
function indexSegment(db: Database.Database, filename: string): void {
  const sequence = extractSequence(filename);

  if (sequence === null) {
    console.warn(`⚠ Skipped invalid filename: ${filename}`);
    return;
  }

  // Calculate timestamps
  const start = sequence * SEGMENT_DURATION;
  const end = start + SEGMENT_DURATION;
  const createdAt = new Date().toISOString();

  try {
    const insert = db.prepare(`
      INSERT INTO segments (sequence, filename, start, end, duration, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(sequence) DO UPDATE SET
        filename = excluded.filename,
        created_at = excluded.created_at
    `);

    insert.run(sequence, filename, start, end, SEGMENT_DURATION, createdAt);

    console.log(`✓ Indexed: ${filename} | Seq: ${sequence} | Time: ${start.toFixed(1)}s - ${end.toFixed(1)}s`);
  } catch (error) {
    console.error(`✗ Failed to index ${filename}:`, error);
  }
}

// Main function
function main() {
  const db = initializeDatabase();

  // Ensure HLS directory exists
  if (!fs.existsSync(HLS_PATH)) {
    fs.mkdirSync(HLS_PATH, { recursive: true });
  }

  // Index existing segments on startup
  console.log('Indexing existing segments...\n');
  const existingFiles = fs.readdirSync(HLS_PATH).filter(f => f.endsWith('.ts'));

  for (const file of existingFiles) {
    indexSegment(db, file);
  }

  console.log(`\n✓ Indexed ${existingFiles.length} existing segments\n`);
  console.log('👀 Watching for new segments...\n');

  // Watch for new segments
  const watcher = chokidar.watch(path.join(HLS_PATH, '*.ts'), {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100
    }
  });

  watcher.on('add', (filePath) => {
    const filename = path.basename(filePath);
    indexSegment(db, filename);
  });

  watcher.on('error', (error) => {
    console.error('Watcher error:', error);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\nShutting down indexer...');
    watcher.close();
    db.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\nShutting down indexer...');
    watcher.close();
    db.close();
    process.exit(0);
  });
}

// Start the indexer
main();
