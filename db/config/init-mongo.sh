#!/bin/sh

# AI Assistance Disclosure
# Tool: ChatGPT  
# Scope: Debugged to ensure successful MongoDB connection and proper replica set initialisation.  
# Author review: I validated correctness. 

MONGO_HOST=mongo
REPL_SET=rs0

echo "Waiting for Mongo to be reachable at $MONGO_HOST:27017..."

# Wait until Mongo is reachable
until mongosh --host "$MONGO_HOST" --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  echo "Mongo not ready, waiting..."
  sleep 1
done

echo "Mongo is reachable. Checking if replica set is already initialized..."

# Check if the replica set is already initialized
IS_RS_INIT=$(mongosh --host "$MONGO_HOST" --quiet --eval "rs.status().ok" 2>/dev/null || echo 0)

if [ "$IS_RS_INIT" = "1" ]; then
  echo "Replica set already initialized. Skipping rs.initiate."
else
  echo "Initializing replica set..."
  mongosh --host "$MONGO_HOST" --eval "rs.initiate({_id: '$REPL_SET', members: [{ _id: 0, host: '$MONGO_HOST:27017' }]})"
  echo "Replica set initialized."
fi
