#!/usr/bin/env bash
set -euo pipefail
cd /opt/iphonefixit/frontend
export IMAGE="${1:?Pass a full image with commit SHA tag}"
[[ "$IMAGE" =~ ^[a-z0-9_-]+/iphonefixit-frontend:[a-f0-9]{40}$ ]] || exit 2
# Both repositories share this lock, so they cannot deploy concurrently.
exec 9>/opt/iphonefixit/deploy.lock
flock -w 600 9
# Bootstrap creates the shared network before either pipeline is enabled.
docker network inspect iphonefixit >/dev/null

previous_image=$(cat last-successful-image 2>/dev/null || true)
docker compose config --quiet
docker compose pull
if docker compose up -d --wait --wait-timeout 240; then
    printf '%s\n' "$IMAGE" > last-successful-image
else
    echo 'Deployment failed its health check.' >&2
    if [ -n "$previous_image" ]; then
        echo 'Restoring the previous successful image.' >&2
        export IMAGE="$previous_image"
        docker compose up -d --wait --wait-timeout 240
    fi
    exit 1
fi
