#!/bin/bash

# AezCrib Frontend Build and Deploy Script
# This script builds the React app and prepares it for deployment to Hostinger

set -e

echo "🚀 Starting AezCrib Frontend Build Process..."

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building production version..."
npm run build

echo "📁 Preparing deployment files..."

# Create deployment directory
DEPLOY_DIR="../deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy built files
cp -r out/* $DEPLOY_DIR/ 2>/dev/null || cp -r .next/standalone/* $DEPLOY_DIR/ 2>/dev/null || echo "Using static export..."

# If using static export
if [ -d ".next/static" ]; then
    cp -r .next/static $DEPLOY_DIR/_next/static
fi

# Copy public files
if [ -d "public" ]; then
    cp -r public/* $DEPLOY_DIR/
fi

echo "✅ Build completed successfully!"
echo ""
echo "📋 Deployment Instructions:"
echo "1. Navigate to your Hostinger File Manager"
echo "2. Go to public_html directory" 
echo "3. Upload all files from the 'deploy' directory to public_html"
echo "4. Make sure your Drupal installation remains in public_html/app/"
echo ""
echo "📂 Files ready for deployment in: $(pwd)/../deploy"
echo ""
echo "🔗 After deployment:"
echo "   - Your React app will be accessible at: https://aezcrib.xyz"
echo "   - Drupal admin will remain at: https://aezcrib.xyz/app/user/login"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. No additional composer install needed (using core modules)"
echo "   2. Enable the aezcrib_auth module in Drupal admin"
echo "   3. Verify user roles are created properly"