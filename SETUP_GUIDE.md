# AezCrib - React Frontend + Drupal Headless CMS Setup Guide

## 🎯 Overview

This setup creates a React frontend at the root domain (https://aezcrib.xyz) while keeping Drupal as a headless CMS at (https://aezcrib.xyz/app/). Users will interact with the React interface for authentication and content, while admins can still access the full Drupal admin panel.

## 📁 Project Structure

```
aezcribcms/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   ├── public/              # Static assets
│   └── package.json
├── modules/custom/aezcrib_auth/  # Custom Drupal module
├── build-deploy.sh          # Deployment script
├── composer.json            # Drupal dependencies
└── [Drupal core files]
```

## 🚀 Frontend Features

### ✅ Completed Features

1. **Authentication System**
   - Login page with email/password
   - Registration with role selection (Parent, Educator, Creator)
   - JWT token-based authentication
   - Auto-login after registration
   - Secure token storage with cookies

2. **User Interface**
   - Responsive design with Tailwind CSS
   - Modern React components with TypeScript
   - Role-based dashboard views
   - Navigation with user status

3. **User Roles**
   - **Parents**: Access educational content, track progress
   - **Educators**: Create lessons, manage students
   - **Creators**: Develop and monetize content

## 🔧 Backend (Drupal) Configuration

### Required Modules (Added to composer.json)

- `drupal/cors` - Cross-Origin Resource Sharing
- `drupal/jwt` - JWT Authentication
- `drupal/key` - Key management for JWT
- `drupal/restui` - REST UI (already installed)

### Custom Module: `aezcrib_auth`

Provides:
- Custom user roles (Parent, Educator, Creator)
- REST API endpoints for authentication
- JWT token generation and validation
- CORS configuration

### API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

## 📋 Deployment Instructions

### Step 1: Update Drupal Dependencies

```bash
# In your local project directory
composer install
```

### Step 2: Build React Frontend

```bash
# Run the build script
./build-deploy.sh
```

This will:
- Install frontend dependencies
- Build the React app for production
- Create a `deploy` folder with all static files

### Step 3: Deploy to Hostinger

1. **Upload React Files**
   - Go to Hostinger File Manager
   - Navigate to `public_html`
   - Upload all files from the `deploy` folder to `public_html` root
   - Make sure to maintain the directory structure

2. **Keep Drupal in /app**
   - Your existing Drupal installation should remain in `public_html/app/`
   - Do not overwrite the app directory

3. **Upload Drupal Changes**
   - Upload the updated `composer.json`
   - Upload the new `modules/custom/aezcrib_auth` folder
   - Run `composer install` in your Drupal directory

### Step 4: Configure Drupal

1. **Enable Modules**
   ```bash
   # Via Drush (if available)
   drush en cors jwt key aezcrib_auth -y
   
   # Or via Drupal admin UI
   # Go to /app/admin/modules and enable:
   # - CORS
   # - JWT
   # - Key
   # - AezCrib Authentication
   ```

2. **Configure JWT Key**
   - Go to `/app/admin/config/system/keys`
   - Create a new key for JWT signing
   - Use a strong random string (256-bit recommended)

3. **Configure CORS**
   - Go to `/app/admin/config/services/cors`
   - Enable CORS
   - Add allowed origins: `https://aezcrib.xyz`
   - Allow methods: GET, POST, PUT, DELETE, OPTIONS
   - Allow headers: Authorization, Content-Type

4. **Configure REST**
   - Go to `/app/admin/config/services/rest`
   - Enable JSON:API if not already enabled
   - Configure user authentication to accept JWT tokens

## 🔗 URLs After Deployment

- **Frontend (React)**: https://aezcrib.xyz
- **Drupal Admin**: https://aezcrib.xyz/app/user/login
- **API Base**: https://aezcrib.xyz/app/api/

## 🔐 Security Considerations

1. **JWT Token Security**
   - Tokens expire after 7 days
   - Stored securely in HTTP-only cookies
   - HTTPS enforced in production

2. **CORS Configuration**
   - Only allows specific origins
   - Credentials supported for authentication

3. **User Permissions**
   - Role-based access control
   - Minimal permissions for each role

## 🛠 Development Workflow

### Local Development

1. **Start Drupal locally** (if needed)
   ```bash
   # Update .env.local for local API
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

2. **Start React development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access locally**
   - Frontend: http://localhost:3000
   - Drupal: http://localhost:8080 (or your local setup)

### Making Changes

1. **Frontend Changes**
   - Edit files in `frontend/src/`
   - Test locally with `npm run dev`
   - Build and deploy with `./build-deploy.sh`

2. **Backend Changes**
   - Modify Drupal modules
   - Test functionality
   - Upload changes to server

## 🎨 Customization

### Styling
- Built with Tailwind CSS
- Edit `frontend/src/app/globals.css` for global styles
- Component-specific styles in individual files

### Adding Features
- New pages: Add to `frontend/src/app/`
- New components: Add to `frontend/src/components/`
- New API endpoints: Extend `aezcrib_auth` module

### Content Management
- Use Drupal's JSON:API for content
- Create content types in Drupal admin
- Consume via React frontend

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS module configuration
   - Verify allowed origins include your domain

2. **Authentication Failures**
   - Verify JWT module configuration
   - Check JWT key is properly set

3. **Build Errors**
   - Check Node.js version (16+ recommended)
   - Clear npm cache: `npm cache clean --force`

4. **API Connection Issues**
   - Verify API URL in environment variables
   - Check network connectivity
   - Confirm Drupal REST endpoints are enabled

### Debug Mode

Enable debug logging in Drupal:
```php
// In settings.php
$config['system.logging']['error_level'] = 'verbose';
```

## 📞 Support

For technical issues:
1. Check browser console for client-side errors
2. Check Drupal logs for server-side errors
3. Verify all modules are properly enabled
4. Test API endpoints individually

## 🔄 Future Enhancements

Planned features:
- Content management interface in React
- Subscription management
- Payment integration
- Advanced user profiles
- Content creation tools
- Analytics dashboard

---

**Note**: This is a headless CMS setup. The React frontend handles the user interface while Drupal manages content and user data through APIs.