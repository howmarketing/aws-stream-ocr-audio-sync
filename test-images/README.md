# Test Images for OCR Testing

## Quick Test Command

Once you have a scoreboard image, use this command:

```bash
# From the applications directory
curl -X POST http://localhost:4000/api/ocr/upload \
  -F "image=@test-images/scoreboard.jpg" \
  | jq .
```

## Option 1: Use a Screenshot (Recommended)

### On macOS:
1. Open a sports game video/stream with a visible scoreboard
2. Press `Cmd + Shift + 4` to take a screenshot
3. Select the scoreboard area
4. Save it to this directory as `scoreboard.jpg`

### On any platform:
1. Take a screenshot of a scoreboard showing game clock (MM:SS format)
2. Save it to: `/Users/m4/Documents/Gabs/bd-tasks/envs/applications/aws-stream-ocr-audio-sync/test-images/scoreboard.jpg`

## Option 2: Download a Sample Image

Visit any sports website and right-click save an image showing a scoreboard with visible game clock.

Good sources:
- ESPN.com (live game screenshots)
- NBA.com (game highlights)
- NFL.com (game photos)

Save as: `scoreboard.jpg` in this directory

## Option 3: Create a Simple Test Image

Create a simple image with text showing a time in MM:SS format:

### Using Python (if installed):
```bash
python3 << 'EOF'
from PIL import Image, ImageDraw, ImageFont
import os

# Create a simple scoreboard image
img = Image.new('RGB', (800, 200), color='black')
draw = ImageDraw.Draw(img)

# Use default font (or specify a path to a .ttf file)
try:
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 80)
    except:
        font = ImageFont.truetype("/Users/m4/Documents/Gabs/bd-tasks/envs/applications/aws-stream-ocr-audio-sync/test-images/ArialBold.ttf", 80)
except:
    font = ImageFont.load_default()

# Draw clock time
draw.text((300, 50), "12:34", fill='white', font=font)

# Save
output_path = "/Users/m4/Documents/Gabs/bd-tasks/envs/applications/aws-stream-ocr-audio-sync/test-images/scoreboard.jpg"
img.save(output_path)
print(f"Test image created: {output_path}")
EOF
```

### Using macOS Preview:
1. Open Preview app
2. File → New from Clipboard (after copying text "12:34")
3. Add text with large font showing "12:34"
4. Save as `scoreboard.jpg` in this directory

## Option 4: Use the Frontend UI (Easiest)

1. Open http://localhost:3030
2. Click "Open Player"
3. Click "Sync with Scoreboard"
4. Drag and drop ANY image with visible numbers
5. The system will process it automatically

## Test Image Requirements

For best OCR results, your test image should have:
- ✅ Visible clock time in MM:SS format (e.g., 12:34)
- ✅ Clear, legible numbers
- ✅ Good contrast (dark numbers on light background or vice versa)
- ✅ Resolution: At least 800x600px
- ✅ Format: JPEG or PNG
- ✅ File size: Under 10MB

## Verification

After creating your test image, verify it:

```bash
# Check the file exists
ls -lh test-images/scoreboard.jpg

# View the file
open test-images/scoreboard.jpg

# Test OCR
curl -X POST http://localhost:4000/api/ocr/upload \
  -F "image=@test-images/scoreboard.jpg" \
  | jq .
```

Expected response:
```json
{
  "success": true,
  "result": {
    "clock": "12:34",
    "score": { "home": 0, "away": 0 },
    "confidence": 0.75,
    "metadata": {
      "processingTime": 1823,
      "imageSize": { "width": 800, "height": 200 },
      "rawText": "12:34"
    }
  }
}
```
