# FFmpeg Worker - Audio Ingestion and HLS Generation
FROM linuxserver/ffmpeg:latest

# Install additional utilities
RUN apk add --no-cache \
    bash \
    curl \
    coreutils

# Create working directory
WORKDIR /app

# Create storage directory
RUN mkdir -p /storage/hls && chmod -R 777 /storage/hls

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Default environment variables
ENV STREAM_URL="http://stream.live.vc.bbcmedia.co.uk/bbc_world_service"
ENV HLS_TIME="2"
ENV HLS_LIST_SIZE="10"
ENV HLS_PATH="/storage/hls"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD ls ${HLS_PATH}/*.m3u8 || exit 1

# Run entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
