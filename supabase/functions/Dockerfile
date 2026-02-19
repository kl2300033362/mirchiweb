FROM denoland/deno:latest

WORKDIR /app

# Copy runtime dependencies
COPY deno.json deno.lock* ./

# Copy functions
COPY music-api ./music-api

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD deno eval "try {await fetch('http://localhost:8000/health')} catch (e) {Deno.exit(1)}"

# Run Edge Functions
CMD ["deno", "run", "--allow-all", "music-api/index.ts"]
