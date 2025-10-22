#!/bin/bash

# Script to prepare aezcrib_auth module for upload to Hostinger
# Run this script from the root of your project

echo "🚀 Preparing aezcrib_auth module for upload to Hostinger..."

# Create upload directory
mkdir -p upload_to_hostinger
rm -rf upload_to_hostinger/aezcrib_auth

# Copy the module
cp -r modules/custom/aezcrib_auth upload_to_hostinger/

echo "✅ Module prepared in upload_to_hostinger/aezcrib_auth"
echo ""
echo "📋 Next steps:"
echo "1. Upload the 'aezcrib_auth' folder to your Hostinger file manager"
echo "2. Place it in: /public_html/app/modules/custom/"
echo "3. Replace the existing aezcrib_auth folder"
echo "4. Clear Drupal cache: /app/admin/config/development/performance"
echo "5. Test CORS from localhost:3000"
echo ""
echo "🔗 File structure should be:"
echo "   /public_html/app/modules/custom/aezcrib_auth/aezcrib_auth.info.yml"
echo "   /public_html/app/modules/custom/aezcrib_auth/aezcrib_auth.routing.yml"
echo "   /public_html/app/modules/custom/aezcrib_auth/src/Controller/AuthController.php"