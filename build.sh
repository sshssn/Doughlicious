#!/bin/bash
set -e
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la
echo "Installing frontend dependencies..."
cd frontend || exit 1
npm install
echo "Building frontend..."
npm run build
