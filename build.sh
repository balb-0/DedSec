#!/bin/bash

# Script de build para produção no Render
# Este script builda o frontend e copia os arquivos para o backend

echo "🔨 Building frontend..."
cd src/frontend
npm install
npm run build

echo "📦 Copying frontend build to backend..."
cd ../..
mkdir -p src/backend-iot/src/../../frontend/dist
cp -r src/frontend/dist/* src/backend-iot/src/../../frontend/dist/ 2>/dev/null || true

echo "✅ Build complete!"

