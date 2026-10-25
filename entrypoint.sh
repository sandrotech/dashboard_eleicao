#!/bin/sh
node /app/telemetry.js &
exec nginx -g 'daemon off;'
