# Audio Sync Platform - Manual Testing Guide

This guide provides step-by-step instructions for manually testing the Audio Sync Platform, including the sync with scoreboard feature.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Health Checks](#system-health-checks)
3. [Testing Audio Streaming](#testing-audio-streaming)
4. [Testing OCR Upload](#testing-ocr-upload)
5. [Testing Sync with Scoreboard](#testing-sync-with-scoreboard)
6. [Complete End-to-End Test](#complete-end-to-end-test)
7. [Troubleshooting](#troubleshooting)
8. [Test Checklist](#test-checklist)

---

## Prerequisites

### 1. Start All Services

```bash
cd /path/to/applications
docker compose up -d
```

Wait ~30 seconds for all services to be healthy:

```bash
docker compose ps
```

Expected output:
```
NAME                  STATUS
audio-sync-backend    Up 2 minutes (healthy)
audio-sync-ffmpeg     Up 2 minutes (healthy)
audio-sync-frontend   Up 2 minutes
audio-sync-indexer    Up 2 minutes
audio-sync-ocr        Up 2 minutes
```

### 2. Verify Services Are Running

```bash
# Backend API
curl http://localhost:4000/api/health

# Frontend
curl http://localhost:3030

# OCR Service
curl http://localhost:3001/health
```

### 3. Required Tools

- **Browser**: Chrome, Firefox, or Safari (latest version)
- **curl**: For API testing
- **jq**: For JSON formatting (optional)
- **Test Images**: Sample scoreboard screenshots

---

## System Health Checks

### 1. Check All Services

```bash
# Check backend health
curl -s http://localhost:4000/api/health | jq .

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2025-12-11T18:00:00.000Z",
#   "service": "audio-sync-backend",
#   "version": "1.0.0"
# }
```

### 2. Check HLS Playlist Availability

```bash
# Check if HLS playlist exists
curl -I http://localhost:4000/api/hls/playlist

# Expected: HTTP/1.1 200 OK (or 404 if stream not started yet)
```

### 3. Check Docker Logs

```bash
# Check for any errors in services
docker logs audio-sync-backend --tail 50
docker logs audio-sync-ffmpeg --tail 50
docker logs audio-sync-indexer --tail 50
docker logs audio-sync-ocr --tail 50
docker logs audio-sync-frontend --tail 50
```

Look for:
- ✅ No error messages
- ✅ Services reporting "ready" or "listening"
- ✅ No connection failures

---

## Testing Audio Streaming

### 1. Access the Frontend

1. Open browser and navigate to: http://localhost:3030
2. Click "Open Player" button
3. You should see the Audio Player page

### 2. Start Audio Playback

1. Click the **Play** button (blue button)
2. Verify:
   - ✅ Button changes to "Pause"
   - ✅ Green pulsing indicator appears
   - ✅ Status shows "Playing"
   - ✅ Current time counter starts updating

**Expected Behavior**:
- If stream is available: Audio should play
- If no stream yet: You may see errors in console (normal during initial startup)

### 3. Test Seek Controls

1. While playing, click the **+10s** button
2. Verify:
   - ✅ Time jumps forward ~10 seconds
   - ✅ Audio continues playing

3. Click the **-10s** button
4. Verify:
   - ✅ Time jumps backward ~10 seconds

5. Test fine controls:
   - Click **+1.5s**: time increases by 1.5 seconds
   - Click **-1.5s**: time decreases by 1.5 seconds

### 4. Test Pause/Resume

1. Click **Pause** button
2. Verify:
   - ✅ Status changes to "Paused"
   - ✅ Indicator turns gray
   - ✅ Time counter stops

3. Click **Play** again
4. Verify:
   - ✅ Audio resumes from same position
   - ✅ Time counter continues

---

## Testing OCR Upload

### 1. Prepare Test Images

Create or use sample scoreboard screenshots. For testing, you can use the provided test images or create your own:

**Good Test Images Should Have**:
- Clear, legible scoreboard with game clock (MM:SS format)
- Good lighting (not too dark or bright)
- Scoreboard centered in frame
- High resolution (720p or higher)

**Create a Test Image**:
You can use any scoreboard image or create a simple one:

```bash
# Create a test directory
mkdir -p test-images

# Download or add your scoreboard screenshots here
# Supported formats: JPEG, PNG
```

### 2. Test OCR via API (Command Line)

```bash
# Test with a sample image
curl -X POST http://localhost:4000/api/ocr/upload \
  -F "image=@test-images/scoreboard.jpg" \
  | jq .
```

**Expected Response**:
```json
{
  "success": true,
  "result": {
    "clock": "12:34",
    "score": {
      "home": 21,
      "away": 17
    },
    "confidence": 0.89,
    "metadata": {
      "processingTime": 1823,
      "imageSize": {
        "width": 1920,
        "height": 1080
      },
      "rawText": "12:34\\nHOME 21 AWAY 17\\nQ3"
    }
  }
}
```

**Verify**:
- ✅ `success` is `true`
- ✅ `clock` matches the time in your image (format: "MM:SS")
- ✅ `confidence` is between 0.0 and 1.0
- ✅ `processingTime` is < 3000ms

### 3. Test OCR Error Handling

```bash
# Test with invalid file type
curl -X POST http://localhost:4000/api/ocr/upload \
  -F "image=@test.txt" \
  | jq .

# Expected: 400 Bad Request
# {
#   "statusCode": 400,
#   "message": "Only JPEG and PNG images are allowed"
# }
```

```bash
# Test without file
curl -X POST http://localhost:4000/api/ocr/upload | jq .

# Expected: 400 Bad Request
# {
#   "statusCode": 400,
#   "message": "No file uploaded"
# }
```

---

## Testing Sync with Scoreboard

### 1. Via Browser (Recommended)

#### Step 1: Open Player Page

1. Navigate to: http://localhost:3030
2. Click "Open Player"
3. Start audio playback (click Play button)

#### Step 2: Open Sync Modal

1. Click the **"Sync with Scoreboard"** button (top-right)
2. The sync modal should open
3. Verify:
   - ✅ Upload area is visible
   - ✅ "Browse Files" button works
   - ✅ Drag-and-drop zone is active

#### Step 3: Upload Scoreboard Image

**Method A: Drag and Drop**
1. Drag a scoreboard image file onto the upload area
2. Release to upload

**Method B: Click to Browse**
1. Click "Browse Files" button
2. Select a scoreboard image from your computer
3. Click "Open"

#### Step 4: Review OCR Results

After upload, the modal will show:

1. **Image Preview**: Your uploaded image
2. **Processing Indicator**: Spinner while processing (2-3 seconds)
3. **OCR Results**:
   - **Game Clock**: Detected time (e.g., "12:34")
   - **Score**: Detected score (e.g., "21 - 17")
   - **Confidence Meter**: Visual indicator (green/yellow/red)
   - **Confidence Score**: Percentage (e.g., "89%")
   - **Metadata**: Processing time, image size, raw text

**Verify Results**:
- ✅ Clock time matches what's in your image
- ✅ Confidence score > 70% (ideally > 80%)
- ✅ Processing time < 3 seconds
- ✅ No error messages

#### Step 5: Sync Player

1. If results look good, click **"Sync Player"** button
2. Verify:
   - ✅ Success message appears: "Synced to XX:XX"
   - ✅ Modal closes
   - ✅ Audio player seeks to detected time
   - ✅ Green confirmation banner shows synced timestamp
   - ✅ Playback continues from new position

**OR**

1. If results look wrong, click **"Retake Photo"** button
2. Upload area reappears
3. Try again with a better image

### 2. Via API (Advanced)

#### Step 1: Upload Image for OCR

```bash
# Upload scoreboard image
OCR_RESPONSE=$(curl -s -X POST http://localhost:4000/api/ocr/upload \
  -F "image=@test-images/scoreboard.jpg")

echo "$OCR_RESPONSE" | jq .

# Extract clock and confidence
CLOCK=$(echo "$OCR_RESPONSE" | jq -r '.result.clock')
CONFIDENCE=$(echo "$OCR_RESPONSE" | jq -r '.result.confidence')

echo "Detected Clock: $CLOCK"
echo "Confidence: $CONFIDENCE"
```

#### Step 2: Sync with Detected Time

```bash
# Sync player with detected clock time
SYNC_RESPONSE=$(curl -s -X POST http://localhost:4000/api/sync \
  -H "Content-Type: application/json" \
  -d "{
    \"clock\": \"$CLOCK\",
    \"confidence\": $CONFIDENCE
  }")

echo "$SYNC_RESPONSE" | jq .
```

**Expected Response**:
```json
{
  "success": true,
  "syncedTimestamp": 754,  // seconds
  "confidence": 0.92,
  "drift": 0.3,  // seconds
  "metadata": {
    "segmentId": 377,
    "segmentStart": 754,
    "segmentEnd": 756,
    "clockTime": "12:34"
  }
}
```

**OR if segment not found**:
```json
{
  "statusCode": 404,
  "message": "No segment found for clock time: 12:34"
}
```

**Verify**:
- ✅ `success` is `true`
- ✅ `syncedTimestamp` is a positive number
- ✅ `confidence` is high (> 0.80)
- ✅ `drift` is small (< 1.0 second)
- ✅ `metadata` includes segment information

---

## Complete End-to-End Test

### Full Workflow Test

This test simulates a complete user journey from start to finish.

#### 1. Setup

```bash
# Ensure all services are running
docker compose ps

# Verify backend health
curl -s http://localhost:4000/api/health | jq .
```

#### 2. Start Audio Stream

1. Open browser: http://localhost:3030
2. Click "Open Player"
3. Click "Play" button
4. Wait for audio to start (may take 5-10 seconds for first segments)

#### 3. Take/Prepare Scoreboard Screenshot

1. Find or create a clear scoreboard image
2. Note the actual time shown on scoreboard (e.g., 12:34)
3. Save as JPEG or PNG

#### 4. Perform OCR Upload

1. In the player page, click "Sync with Scoreboard"
2. Upload your scoreboard image
3. Wait for OCR processing (~2 seconds)

#### 5. Verify OCR Accuracy

Check that:
- ✅ Detected clock time matches actual time in image
- ✅ Confidence score > 70% (preferably > 80%)
- ✅ Processing completed within 3 seconds
- ✅ No errors displayed

#### 6. Sync Player

1. Click "Sync Player" button
2. Observe:
   - ✅ Success message appears
   - ✅ Modal closes
   - ✅ Audio seeks to new position
   - ✅ Time display updates to synced time
   - ✅ Playback continues smoothly

#### 7. Verify Sync Accuracy

1. Compare current player time with original scoreboard time
2. They should be within ±1 second
3. If drift is larger, check confidence scores

#### 8. Test Post-Sync Controls

After syncing, verify:
- ✅ Seek controls still work (-10s, +10s, ±1.5s)
- ✅ Pause/Play still functions
- ✅ Time display continues updating
- ✅ Can re-sync with another image if needed

---

## Testing OCR with Various Scenarios

### Test Case 1: High Quality Image

**Setup**: Clear, well-lit scoreboard screenshot (1920x1080 or higher)

**Expected Result**:
- ✅ Confidence > 90%
- ✅ Clock detection accurate
- ✅ Processing time < 2 seconds

### Test Case 2: Low Light Image

**Setup**: Dark scoreboard image with visible clock

**Expected Result**:
- ✅ Confidence 70-90%
- ✅ Clock detection may be accurate
- ✅ Processing time < 3 seconds

### Test Case 3: Blurry Image

**Setup**: Slightly blurred scoreboard

**Expected Result**:
- ✅ Confidence 50-80%
- ⚠️ Clock detection may be inaccurate
- ✅ System handles gracefully (no crashes)

### Test Case 4: Invalid Time Format

**Setup**: Scoreboard without standard MM:SS format

**Expected Result**:
- ✅ Low confidence score
- ⚠️ May not detect clock
- ✅ Error message or "No clock detected"

### Test Case 5: Large File Size

**Setup**: High-resolution image (>5MB, <10MB)

**Expected Result**:
- ✅ Upload succeeds
- ✅ Processing takes longer (~3-5 seconds)
- ✅ Results still accurate

### Test Case 6: File Too Large

**Setup**: Image >10MB

**Expected Result**:
- ❌ Upload fails
- ✅ Error message: "File size exceeds 10MB limit"

### Test Case 7: Wrong File Type

**Setup**: Upload PDF, GIF, or text file

**Expected Result**:
- ❌ Upload fails
- ✅ Error message: "Only JPEG and PNG images are allowed"

---

## Troubleshooting

### Issue: "No segments available"

**Symptoms**: Sync fails with "No segment found for clock time"

**Causes**:
- HLS stream hasn't generated segments yet
- Requested time is in the future
- Segments have aged out (>20 seconds old)

**Solutions**:
1. Wait 10-15 seconds for segments to be generated
2. Check FFmpeg is running: `docker logs audio-sync-ffmpeg`
3. Verify indexer is indexing: `docker logs audio-sync-indexer`
4. Check segment directory: `docker exec audio-sync-backend ls -la /storage/hls/`

### Issue: OCR Confidence Very Low

**Symptoms**: Confidence < 50%

**Causes**:
- Poor image quality
- Non-standard scoreboard format
- Glare or reflections
- Image too small

**Solutions**:
1. Retake photo with better lighting
2. Ensure scoreboard is centered and in focus
3. Use higher resolution image
4. Avoid glare/reflections
5. Crop image to focus on scoreboard

### Issue: Sync Time Incorrect

**Symptoms**: Synced time doesn't match scoreboard

**Causes**:
- OCR misread the clock
- Segments not properly indexed
- Time drift in system

**Solutions**:
1. Check OCR confidence score
2. Manually verify detected clock time
3. Use seek controls to fine-tune (±1.5s)
4. Re-sync with a better image
5. Check indexer logs for errors

### Issue: Audio Won't Play

**Symptoms**: Click Play but no audio

**Causes**:
- FFmpeg not streaming yet
- HLS playlist not available
- Browser audio policy (requires user interaction)

**Solutions**:
1. Wait 10-15 seconds after starting services
2. Check FFmpeg: `docker logs audio-sync-ffmpeg`
3. Verify HLS playlist: `curl http://localhost:4000/api/hls/playlist`
4. Try refreshing the page
5. Check browser console for errors

### Issue: Upload Fails

**Symptoms**: Image upload returns error

**Causes**:
- File too large (>10MB)
- Wrong file type
- OCR service not running

**Solutions**:
1. Check file size: `ls -lh your-image.jpg`
2. Verify file type: `file your-image.jpg`
3. Check OCR service: `docker logs audio-sync-ocr`
4. Resize image if too large
5. Convert to JPEG or PNG if needed

---

## Test Checklist

### Pre-Testing Setup
- [ ] All Docker containers running
- [ ] Services show as "healthy"
- [ ] Backend health check passes
- [ ] HLS playlist accessible (or generating)
- [ ] Test images prepared

### Audio Streaming Tests
- [ ] Frontend loads at http://localhost:3030
- [ ] Player page accessible
- [ ] Play button starts audio
- [ ] Pause button stops audio
- [ ] Seek controls work (+/-10s, +/-1.5s)
- [ ] Time display updates correctly
- [ ] Status indicator changes (playing/paused)

### OCR Upload Tests
- [ ] Sync modal opens
- [ ] Image upload works (drag & drop)
- [ ] Image upload works (file browser)
- [ ] Processing indicator shows
- [ ] OCR results displayed
- [ ] Clock time detected correctly
- [ ] Confidence score shown
- [ ] Metadata displayed
- [ ] Retake button works
- [ ] File size validation (reject >10MB)
- [ ] File type validation (reject non-JPEG/PNG)

### Sync Tests
- [ ] Sync button available after OCR
- [ ] Sync succeeds with valid data
- [ ] Success message displayed
- [ ] Modal closes after sync
- [ ] Audio seeks to correct time
- [ ] Playback continues after sync
- [ ] Seek controls work after sync
- [ ] Can re-sync multiple times

### API Tests
- [ ] GET /api/health returns 200
- [ ] POST /api/ocr/upload works
- [ ] POST /api/ocr/upload rejects invalid files
- [ ] POST /api/sync works with valid data
- [ ] POST /api/sync rejects invalid clock format
- [ ] GET /api/hls/playlist works

### Error Handling Tests
- [ ] Invalid file type shows error
- [ ] File too large shows error
- [ ] Missing segments handled gracefully
- [ ] Low confidence warnings shown
- [ ] Network errors handled
- [ ] OCR service down handled
- [ ] Invalid clock format rejected

### Performance Tests
- [ ] OCR processing < 3 seconds
- [ ] Sync operation < 500ms
- [ ] Page load < 2 seconds
- [ ] No memory leaks after multiple syncs
- [ ] Concurrent uploads handled

### Edge Cases
- [ ] Clock time 00:00 works
- [ ] Clock time 59:59 works
- [ ] Very small images processed
- [ ] Very large (but valid) images processed
- [ ] Multiple rapid syncs work
- [ ] Sync with low confidence (<70%)
- [ ] Sync with future time (not yet available)

---

## Additional Testing Resources

### Sample API Requests

**OCR Upload with curl**:
```bash
curl -X POST http://localhost:4000/api/ocr/upload \
  -F "image=@path/to/scoreboard.jpg" \
  -v
```

**Sync Request with curl**:
```bash
curl -X POST http://localhost:4000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"clock": "12:34", "confidence": 0.95}' \
  -v
```

**Check HLS Segments**:
```bash
# List HLS files
docker exec audio-sync-backend ls -la /storage/hls/

# Check segment database
docker exec audio-sync-backend sqlite3 /storage/index/segments.db \
  "SELECT sequence, start, end FROM segments ORDER BY sequence DESC LIMIT 10;"
```

### Automated Test Script

Create a quick test script:

```bash
#!/bin/bash
# quick-test.sh

echo "=== Audio Sync Platform - Quick Test ==="

echo "1. Checking services..."
docker compose ps

echo "2. Testing backend health..."
curl -s http://localhost:4000/api/health | jq .

echo "3. Testing OCR upload..."
curl -s -X POST http://localhost:4000/api/ocr/upload \
  -F "image=@test-images/scoreboard.jpg" | jq .

echo "4. Testing sync (requires segments)..."
curl -s -X POST http://localhost:4000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"clock": "12:34", "confidence": 0.95}' | jq .

echo "5. Checking HLS playlist..."
curl -I http://localhost:4000/api/hls/playlist

echo "=== Tests Complete ==="
```

Make it executable and run:
```bash
chmod +x quick-test.sh
./quick-test.sh
```

---

## Performance Benchmarks

Expected performance on modern hardware:

| Metric | Target | Typical |
|--------|--------|---------|
| OCR Processing Time | < 3s | 1.5-2s |
| Sync Operation | < 500ms | ~10ms |
| HLS Latency | < 6s | ~5.8s |
| Page Load Time | < 3s | ~1.5s |
| API Response Time | < 200ms | 50-100ms |

---

## Support and Issues

If you encounter issues during testing:

1. **Check Logs**: `docker compose logs -f`
2. **Restart Services**: `docker compose restart`
3. **Rebuild**: `docker compose up --build -d`
4. **Clean Start**:
   ```bash
   docker compose down -v
   docker compose up --build -d
   ```

5. **Report Issues**: Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots
   - Relevant log outputs
   - System information

---

**Version**: 1.0.0
**Last Updated**: December 11, 2025
**Platform**: Audio Sync Platform
