# Audio Sync Platform - User Guide

Welcome to the Audio Sync Platform! This guide will help you get started with streaming audio and synchronizing playback with live scoreboards.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Audio Playback](#audio-playback)
3. [OCR Synchronization](#ocr-synchronization)
4. [Troubleshooting](#troubleshooting)
5. [Tips & Best Practices](#tips--best-practices)
6. [FAQ](#faq)

---

## Getting Started

### System Requirements

- **Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **Internet**: Stable connection for audio streaming
- **Device**: Desktop or mobile device

### Accessing the Platform

1. Open your web browser
2. Navigate to: http://localhost:3030 (development) or your production URL
3. Click "Open Player" to start

---

## Audio Playback

### Basic Controls

The audio player provides simple controls for listening to the live audio stream:

**Play/Pause Button**
- Click the large blue button to start or pause playback
- Icon changes between play ▶ and pause ⏸

**Current Time Display**
- Shows the current playback position in MM:SS format
- Updates in real-time as audio plays

**Seek Controls**
- `-10s`: Jump back 10 seconds
- `-1.5s`: Fine adjustment back 1.5 seconds
- `+1.5s`: Fine adjustment forward 1.5 seconds
- `+10s`: Jump forward 10 seconds

### Stream Status Indicator

A small circle next to the status text shows:
- 🟢 **Green (pulsing)**: Audio is playing
- ⚪ **Gray**: Audio is paused

### Latency

The platform uses low-latency HLS streaming with approximately 6 seconds of delay from the live source. This is normal and expected behavior.

---

## OCR Synchronization

The platform's most powerful feature is automatic synchronization with scoreboard screenshots. This allows you to jump directly to a specific game moment.

### How It Works

1. **Take a Screenshot**: Capture an image of your TV/screen showing the scoreboard
2. **Upload Image**: The system extracts the game clock and score using OCR
3. **Verify Results**: Review the detected clock time and confidence score
4. **Sync**: Jump to that exact moment in the audio stream

### Step-by-Step Guide

#### Step 1: Take a Scoreboard Screenshot

**Best Practices for Screenshots:**
- ✅ **Clear and well-lit**: Avoid glare or shadows
- ✅ **Centered**: Scoreboard should be prominently visible
- ✅ **High resolution**: At least 720p quality
- ✅ **Straight angle**: Not tilted or skewed
- ❌ **Avoid**: Blurry, dark, or obstructed scoreboards

**Supported Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)

**Examples of Good Screenshots:**
```
Good: Clear, bright, centered scoreboard
12:34  HOME 21 - AWAY 17  Q3

Bad: Dark, blurry, or missing information
??:??  ????  ? - ???? ??
```

#### Step 2: Click "Sync with Scoreboard"

1. Click the blue "Sync with Scoreboard" button in the top-right
2. A modal window will appear with upload options

#### Step 3: Upload Your Screenshot

**Method 1: Drag and Drop**
- Drag your screenshot file into the upload area
- Release to upload

**Method 2: Click to Browse**
- Click the "Browse Files" button
- Select your screenshot from your device
- Click "Open"

**Upload Feedback:**
- Preview of your image appears
- Processing spinner shows OCR is running
- Typical processing time: 2-3 seconds

#### Step 4: Review OCR Results

The system will display detected information:

**Game Clock**
- Format: MM:SS (e.g., "12:34")
- This is the game time from the scoreboard

**Score**
- Format: HOME - AWAY (e.g., "21 - 17")
- Used for validation (optional)

**Confidence Meter**
- Excellent (90-100%): Green, high accuracy
- Good (70-89%): Yellow, acceptable
- Low (<70%): Red, may be inaccurate

**Metadata**
- Processing time
- Image resolution
- Raw OCR text

#### Step 5: Sync or Retake

**If Results Look Good:**
- Click "Sync Player" button
- Audio will jump to the detected game time
- Success message appears with timestamp

**If Results Look Wrong:**
- Click "Retake Photo" button
- Try again with a better screenshot
- Tips: Better lighting, clearer angle, higher resolution

#### Step 6: Playback Synced

- Audio player seeks to the synced timestamp
- Green confirmation banner shows the synced time
- You can continue using seek controls normally
- The sync point is now your reference

### Understanding Confidence Scores

The platform calculates confidence based on multiple factors:

| Confidence | Color | Meaning | Action |
|------------|-------|---------|--------|
| 90-100% | 🟢 Green | Excellent accuracy | Safe to sync |
| 70-89% | 🟡 Yellow | Good accuracy | Usually safe |
| 50-69% | 🟡 Yellow | Acceptable | Review carefully |
| < 50% | 🔴 Red | Low accuracy | Retake recommended |

**Confidence Factors:**
- **OCR Accuracy** (40%): How clearly the text was detected
- **Clock Plausibility** (30%): Is the time realistic for the sport?
- **Time Drift** (20%): How far off from available segments?
- **Segment Continuity** (10%): Are nearby segments available?

---

## Troubleshooting

### Audio Not Playing

**Problem**: Clicked play but no sound

**Solutions:**
1. Check your device volume
2. Check browser audio permissions
3. Try refreshing the page (F5)
4. Check internet connection
5. Verify stream is active

### 404 Errors / Segments Not Loading

**Problem**: "Failed to load segment" errors

**Solutions:**
1. Wait a few seconds for segments to become available
2. Check if FFmpeg worker is running
3. Refresh the page
4. Check Docker container status

### OCR Not Detecting Clock

**Problem**: "No clock detected" or blank results

**Solutions:**
1. Retake screenshot with better lighting
2. Ensure scoreboard is clearly visible
3. Try different angle or zoom level
4. Check image file format (JPEG/PNG only)
5. Ensure clock is in MM:SS format on scoreboard

### Low Confidence Score

**Problem**: Confidence below 70%

**Solutions:**
1. Retake with higher resolution image
2. Ensure scoreboard text is sharp and clear
3. Avoid glare or screen reflection
4. Make sure scoreboard is centered in frame
5. Try capturing during a still moment (not during motion blur)

### Sync Jumps to Wrong Time

**Problem**: Synced time doesn't match scoreboard

**Solutions:**
1. Verify OCR detected the correct clock time
2. Check if game is in overtime/extended period
3. Ensure audio stream has reached that game time
4. Try syncing with a different scoreboard screenshot
5. Use seek controls to fine-tune position

### Player Shows "Paused" But Should Be Playing

**Problem**: Status indicator doesn't match playback

**Solutions:**
1. Click play/pause button to reset state
2. Refresh the browser page
3. Clear browser cache
4. Check for browser console errors

---

## Tips & Best Practices

### For Best Audio Experience

1. **Use Wired Connection**: Ethernet is more stable than WiFi
2. **Close Other Streams**: Reduce bandwidth usage
3. **Use Headphones**: Better audio quality and less latency perception
4. **Update Browser**: Keep your browser up to date for best HLS support

### For Best OCR Accuracy

1. **Screenshot During Timeouts**: Still scoreboards are clearer
2. **Full Screen**: Capture scoreboard at maximum size
3. **Native Resolution**: Don't zoom or crop before uploading
4. **Consistent Source**: Use same TV/stream for better results
5. **Test First**: Try OCR with a test image before the critical moment

### For Seamless Sync

1. **Sync Early**: Don't wait until a critical moment
2. **Verify Clock**: Double-check the detected time before syncing
3. **Use Fine Seek**: After sync, use ±1.5s buttons for perfect alignment
4. **Re-sync If Needed**: You can sync multiple times during a game
5. **Trust Confidence**: 80%+ confidence is very reliable

---

## FAQ

### General Questions

**Q: Is this platform free to use?**
A: Yes, this is an open-source platform. No costs or subscriptions required.

**Q: Do I need to create an account?**
A: No, the platform currently doesn't require authentication.

**Q: Can I use this on mobile?**
A: Yes, it works on mobile browsers, though desktop provides better experience for screenshots.

**Q: What sports are supported?**
A: Any sport with a visible game clock in MM:SS format.

### Audio Questions

**Q: Why is there a 6-second delay?**
A: This is inherent to HLS streaming technology. It's necessary for buffering and segment delivery.

**Q: Can I reduce the latency?**
A: Not significantly without degrading quality. 6 seconds is considered low-latency for HLS.

**Q: Does the audio quality degrade over time?**
A: No, audio quality remains consistent throughout the stream (AAC 128kbps).

**Q: Can I download the audio?**
A: Currently, no. The platform is designed for live streaming only.

### OCR Questions

**Q: How accurate is the OCR?**
A: Typically 95%+ with good quality screenshots. Confidence score indicates accuracy.

**Q: What languages does OCR support?**
A: Currently optimized for English/Western numerals. Arabic numerals for time and score.

**Q: Why did OCR fail on my screenshot?**
A: Common causes: poor lighting, low resolution, non-standard scoreboard format, glare/reflections.

**Q: Can I manually enter the clock time?**
A: Not currently, but this is planned for a future update.

**Q: How long does OCR processing take?**
A: Typically 2-3 seconds per image.

### Sync Questions

**Q: How accurate is the sync?**
A: Within ±0.5 seconds with high confidence scores.

**Q: What if my game is in overtime?**
A: The system handles times up to 120:00 (2 hours).

**Q: Can I sync to a time that hasn't happened yet?**
A: No, you can only sync to times that have already been streamed.

**Q: Does sync work with recorded/replay audio?**
A: Yes, as long as the audio has been indexed by the system.

**Q: Can multiple people sync independently?**
A: Yes, each user's sync is independent and doesn't affect others.

### Technical Questions

**Q: What technologies does this use?**
A: Frontend: Next.js 15, Backend: NestJS + Fastify, OCR: Tesseract, Streaming: FFmpeg + HLS

**Q: Is my screenshot data stored?**
A: Screenshots are temporarily stored for processing and can be manually deleted.

**Q: Can I self-host this platform?**
A: Yes, it's fully open-source and can be deployed via Docker Compose.

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest versions). HLS.js provides broad compatibility.

**Q: Does it work offline?**
A: No, internet connection required for streaming and OCR processing.

---

## Advanced Usage

### Keyboard Shortcuts (Coming Soon)

Planned shortcuts:
- `Space`: Play/Pause
- `←`: Seek back 10s
- `→`: Seek forward 10s
- `Shift + ←`: Seek back 1.5s
- `Shift + →`: Seek forward 1.5s
- `S`: Open sync modal

### Integration with Other Tools

The platform provides a REST API for integration:
- See [API.md](./API.md) for complete API documentation
- Build custom clients or automation tools
- Integrate with scoreboard APIs

---

## Getting Help

### Support Resources

- **Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- **API Reference**: See [API.md](./API.md) for API documentation
- **GitHub Issues**: Report bugs or request features
- **Community Forums**: Discuss usage and share tips

### Reporting Issues

When reporting problems, please include:
1. Browser and version
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots (if applicable)
5. Console errors (F12 → Console tab)

---

## What's Next?

### Upcoming Features

- Manual clock time entry
- Sync history and bookmarks
- Multiple audio stream support
- Mobile app (iOS/Android)
- Keyboard shortcuts
- Video sync support
- Multi-language scoreboards

### Stay Updated

- Watch the GitHub repository
- Check release notes
- Join the community Discord

---

## Quick Reference Card

| Action | How To |
|--------|--------|
| Play audio | Click blue play button |
| Pause audio | Click blue pause button |
| Jump back 10s | Click "-10s" button |
| Jump forward 10s | Click "+10s" button |
| Fine tune back | Click "-1.5s" button |
| Fine tune forward | Click "+1.5s" button |
| Open sync modal | Click "Sync with Scoreboard" |
| Upload screenshot | Drag & drop or click browse |
| Sync playback | Click "Sync Player" after OCR |
| Retake photo | Click "Retake Photo" |
| Close sync modal | Click X in top-right |

---

**Version**: 1.0.0
**Last Updated**: December 11, 2025
**Platform**: Audio Sync Platform

---

*Happy listening and perfect synchronization!* 🎧⚡