#!/bin/sh
# Copy seed database to volume if empty or corrupted
if [ ! -f /app/data/fpkg.db ] || [ "$(node -e "const d=require('better-sqlite3')('/app/data/fpkg.db');console.log(d.prepare('SELECT COUNT(*) as c FROM entities').get().c)" 2>/dev/null)" = "0" ]; then
  echo "Initializing database from seed..."
  rm -f /app/data/fpkg.db /app/data/fpkg.db-wal /app/data/fpkg.db-shm
  cp /app/data-seed/fpkg.db /app/data/fpkg.db
  echo "Database initialized with seed data!"
fi
exec node server.js
