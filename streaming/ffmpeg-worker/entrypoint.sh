#!/bin/bash
set -e

echo "=========================================="
echo "FFmpeg Worker - Audio Streaming to HLS"
echo "=========================================="
echo "Stream URL: ${STREAM_URL}"
echo "HLS Segment Duration: ${HLS_TIME}s"
echo "Playlist Size: ${HLS_LIST_SIZE}"
echo "Output Path: ${HLS_PATH}"
echo "=========================================="

# Ensure output directory exists
mkdir -p "${HLS_PATH}"

# Clean any existing segments on startup (optional)
echo "Cleaning existing segments..."
rm -f "${HLS_PATH}"/*.ts
rm -f "${HLS_PATH}"/*.m3u8

echo "Starting FFmpeg ingestion..."

# Determine if we should loop (for local files)
LOOP_FLAG=""
if [ "${ENABLE_LOOP}" = "true" ]; then
    echo "Loop mode enabled (for local file playback)"
    LOOP_FLAG="-stream_loop -1"
fi

# FFmpeg command for low-latency HLS generation
# -re flag: read input at native frame rate (real-time, not as fast as possible)
ffmpeg \
    -re \
    ${LOOP_FLAG} \
    -i "${STREAM_URL}" \
    -c:a aac \
    -b:a 128k \
    -ar 48000 \
    -ac 2 \
    -f hls \
    -hls_time "${HLS_TIME}" \
    -hls_list_size "${HLS_LIST_SIZE}" \
    -hls_flags independent_segments+delete_segments+append_list \
    -hls_segment_type mpegts \
    -hls_segment_filename "${HLS_PATH}/segment%03d.ts" \
    -start_number 0 \
    "${HLS_PATH}/index.m3u8"

# This line is reached only if FFmpeg exits
echo "FFmpeg process ended. Exiting..."
exit 1
