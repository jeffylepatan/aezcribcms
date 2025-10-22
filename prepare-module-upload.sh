#!/bin/bash

# Quick upload script for module files
# Run this after making changes to the authentication module

echo "📁 Preparing module files for upload..."

MODULE_DIR="modules/custom/aezcrib_auth"
UPLOAD_DIR="upload_to_server"

# Create upload directory
rm -rf $UPLOAD_DIR
mkdir -p $UPLOAD_DIR/$MODULE_DIR/src/Controller

# Copy files
cp $MODULE_DIR/aezcrib_auth.info.yml $UPLOAD_DIR/$MODULE_DIR/
cp $MODULE_DIR/aezcrib_auth.module $UPLOAD_DIR/$MODULE_DIR/
cp $MODULE_DIR/aezcrib_auth.routing.yml $UPLOAD_DIR/$MODULE_DIR/
cp $MODULE_DIR/src/Controller/AuthController.php $UPLOAD_DIR/$MODULE_DIR/src/Controller/

echo "✅ Files ready for upload in: $UPLOAD_DIR"
echo ""
echo "📋 Upload Instructions:"
echo "1. Go to Hostinger File Manager"
echo "2. Navigate to: public_html/app/modules/custom/"
echo "3. Upload the aezcrib_auth folder from $UPLOAD_DIR"
echo "4. Replace existing files when prompted"
echo "5. Clear Drupal cache at: https://aezcrib.xyz/app/admin/config/development/performance"
echo ""
echo "📂 Files to upload:"
ls -la $UPLOAD_DIR/$MODULE_DIR/
ls -la $UPLOAD_DIR/$MODULE_DIR/src/Controller/