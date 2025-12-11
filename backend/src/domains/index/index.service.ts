import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import * as path from 'path';

export interface Segment {
  id: number;
  sequence: number;
  filename: string;
  start: number;
  end: number;
  duration: number;
  created_at: string;
}

@Injectable()
export class IndexService implements OnModuleInit, OnModuleDestroy {
  private db: Database.Database;
  private readonly dbPath: string;

  constructor(private configService: ConfigService) {
    const storagePath = this.configService.get<string>('STORAGE_PATH', '/storage');
    this.dbPath = path.join(storagePath, 'index', 'segments.db');
  }

  onModuleInit() {
    try {
      this.db = new Database(this.dbPath, { readonly: true });
      console.log(`✓ Connected to index database: ${this.dbPath}`);
    } catch (error) {
      console.warn(`⚠ Index database not yet available: ${this.dbPath}`);
      console.warn('  Waiting for indexer worker to create it...');
    }
  }

  onModuleDestroy() {
    if (this.db) {
      this.db.close();
    }
  }

  /**
   * Get recent segments
   */
  getRecentSegments(limit: number = 10): Segment[] {
    if (!this.db) {
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM segments
        ORDER BY sequence DESC
        LIMIT ?
      `);
      return stmt.all(limit) as Segment[];
    } catch (error) {
      console.error('Error fetching segments:', error);
      return [];
    }
  }

  /**
   * Get segment by sequence number
   */
  getSegmentBySequence(sequence: number): Segment | null {
    if (!this.db) {
      return null;
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM segments
        WHERE sequence = ?
      `);
      return stmt.get(sequence) as Segment | null;
    } catch (error) {
      console.error('Error fetching segment:', error);
      return null;
    }
  }

  /**
   * Find the closest segment for a given timestamp
   */
  findSegmentByTime(timestamp: number): Segment | null {
    if (!this.db) {
      return null;
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM segments
        WHERE start <= ? AND end >= ?
        LIMIT 1
      `);
      let result = stmt.get(timestamp, timestamp) as Segment | null;

      // If no exact match, find the closest one
      if (!result) {
        const closestStmt = this.db.prepare(`
          SELECT * FROM segments
          ORDER BY ABS(start - ?) ASC
          LIMIT 1
        `);
        result = closestStmt.get(timestamp) as Segment | null;
      }

      return result;
    } catch (error) {
      console.error('Error finding segment by time:', error);
      return null;
    }
  }

  /**
   * Get database statistics
   */
  getStats() {
    if (!this.db) {
      return {
        totalSegments: 0,
        oldestSegment: null,
        newestSegment: null,
        totalDuration: 0,
      };
    }

    try {
      const total = this.db.prepare('SELECT COUNT(*) as count FROM segments').get() as { count: number };
      const oldest = this.db.prepare('SELECT * FROM segments ORDER BY sequence ASC LIMIT 1').get() as Segment | null;
      const newest = this.db.prepare('SELECT * FROM segments ORDER BY sequence DESC LIMIT 1').get() as Segment | null;

      return {
        totalSegments: total.count,
        oldestSegment: oldest,
        newestSegment: newest,
        totalDuration: newest && oldest ? newest.end - oldest.start : 0,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalSegments: 0,
        oldestSegment: null,
        newestSegment: null,
        totalDuration: 0,
      };
    }
  }
}
