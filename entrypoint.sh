#!/bin/sh
set -e

# Fix ownership of mounted data directory so node user can write
chown -R node:node /app/data

# Drop privileges and execute as node user
exec gosu node "$@"
