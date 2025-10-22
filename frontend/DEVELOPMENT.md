# 🚀 Local Development Guide

## Quick Start

### Start Development Server
```bash
cd frontend
npm run dev
```

Your React app will be available at: **http://localhost:3000**

## 🔗 API Connection

- **Local Frontend**: http://localhost:3000
- **Remote API**: https://aezcrib.xyz/app (your live Drupal)
- **Authentication**: Will work seamlessly between local and remote

## 🛠️ Development Workflow

### 1. **Make Changes**
- Edit files in `frontend/src/`
- Changes will hot-reload automatically
- No need to restart the server

### 2. **Test Authentication**
- Login/Registration will work with your live Drupal
- Sessions are maintained across local/remote
- User data stored in browser localStorage

### 3. **Build for Production**
```bash
# From project root
./build-deploy.sh
```

### 4. **Deploy**
- Upload files from `/deploy` folder to Hostinger
- Only upload when you're ready to publish changes

## 📁 Development Structure

```
frontend/
├── src/
│   ├── app/              # Pages (routing)
│   │   ├── page.tsx      # Home page
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   └── dashboard/    # Dashboard page
│   ├── components/       # Reusable components
│   │   └── Navbar.tsx    # Navigation component
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── services/         # API services
│   │   └── auth.ts       # Authentication service
│   └── types/           # TypeScript types
│       └── auth.ts      # Auth type definitions
├── .env.development     # Local development config
├── .env.local          # Local overrides (ignored by git)
└── package.json        # Dependencies and scripts
```

## 🎯 Available Scripts

```bash
npm run dev          # Start development server
npm run dev:api      # Start with API info
npm run build:prod   # Build for production
npm run lint         # Check code quality
```

## 🔧 Environment Variables

### Development (.env.development)
- `NEXT_PUBLIC_API_URL=https://aezcrib.xyz/app`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

### Production (.env.local)
- `NEXT_PUBLIC_API_URL=https://aezcrib.xyz/app`
- `NEXT_PUBLIC_SITE_URL=https://aezcrib.xyz`

## 🚀 Adding New Features

### 1. **New Pages**
- Create files in `src/app/`
- Example: `src/app/about/page.tsx`
- Automatically routed to `/about`

### 2. **New Components**
- Add to `src/components/`
- Import and use in pages
- Follow existing patterns

### 3. **API Integration**
- Use the `api` instance from `src/services/auth.ts`
- Add new service files for different features
- Handle authentication automatically

## 🔄 Development vs Production

| Feature | Development | Production |
|---------|------------|------------|
| Hot Reload | ✅ Yes | ❌ No |
| Source Maps | ✅ Yes | ❌ No |
| Optimization | ❌ Minimal | ✅ Full |
| Bundle Size | 📦 Larger | 📦 Optimized |
| Build Type | 🔧 Dev Server | 📁 Static Files |

## 🛡️ CORS & Authentication

- **CORS**: Handled by your Drupal module
- **Sessions**: Shared between localhost:3000 and aezcrib.xyz
- **Credentials**: Automatically included in API calls

## 📋 Common Development Tasks

### Adding a New Page
1. Create `src/app/newpage/page.tsx`
2. Add navigation link in `Navbar.tsx`
3. Test locally with `npm run dev`

### Modifying Authentication
1. Edit `src/services/auth.ts`
2. Update types in `src/types/auth.ts`
3. Modify context in `src/contexts/AuthContext.tsx`

### Styling Changes
1. Edit component files directly (Tailwind classes)
2. Global styles in `src/app/globals.css`
3. Changes appear immediately

## 🔍 Debugging Tips

### Check API Calls
- Open browser DevTools (F12)
- Go to Network tab
- Watch API requests to `/app/api/auth/*`

### Authentication Issues
- Check browser localStorage for user data
- Verify API URL in environment variables
- Confirm Drupal module is enabled

### Build Issues
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run lint`

---

**Happy coding!** 🎉 You can now develop locally while using your live Drupal backend.