# BnbMargins - Namecheap Deployment Checklist

## ✅ Pre-Deployment Checklist

### Local Environment Setup
- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables configured in `.env.production`
- [ ] Application builds successfully (`npm run build`)
- [ ] Application runs locally (`npm start`)

### Files Ready for Upload
- [ ] `src/` folder
- [ ] `public/` folder  
- [ ] `.next/` folder (generated after build)
- [ ] `package.json`
- [ ] `package-lock.json`
- [ ] `next.config.ts`
- [ ] `server.js`
- [ ] `tsconfig.json`
- [ ] `tailwind.config.ts`
- [ ] `postcss.config.mjs`

### Files to EXCLUDE
- [ ] `node_modules/` (will be installed on server)
- [ ] `.git/`
- [ ] `.env.local`
- [ ] `.env.example`
- [ ] `README.md`
- [ ] `.gitignore`
- [ ] Development-only files

## 🚀 Deployment Steps

### Step 1: Namecheap cPanel Setup
- [ ] Log into Namecheap account
- [ ] Access cPanel
- [ ] Navigate to File Manager
- [ ] Create/select app directory (NOT in public_html)

### Step 2: File Upload
- [ ] Upload ZIP file of deployment files
- [ ] Extract ZIP file in app directory
- [ ] Verify all files extracted correctly

### Step 3: Node.js App Configuration
- [ ] Open "Setup Node.js App" in cPanel
- [ ] Click "CREATE APPLICATION"
- [ ] Set Node.js version (18.x or 20.x recommended)
- [ ] Set Application mode to "Production"
- [ ] Set Application root to your app directory
- [ ] Set Application URL to your domain
- [ ] Set Application startup file to `server.js`

### Step 4: Environment Variables
Add these environment variables in the Node.js app configuration:
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_SUPABASE_URL=your-supabase-url`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`
- [ ] `NEXT_PUBLIC_APP_NAME=BnbMargins`
- [ ] `NEXT_PUBLIC_APP_DESCRIPTION=Comprehensive Airbnb Profit & Loss Dashboard`

### Step 5: Install Dependencies & Start
- [ ] Click "CREATE" to create the application
- [ ] Stop the application temporarily
- [ ] Navigate to "Detected Configuration Files"
- [ ] Click "Run NPM Install"
- [ ] Wait for installation to complete
- [ ] Start the application

### Step 6: Testing
- [ ] Application shows as "Running" in cPanel
- [ ] Visit application URL
- [ ] Test user authentication
- [ ] Test dashboard access
- [ ] Test Supabase data loading
- [ ] Check for any console errors

## 🔧 Troubleshooting

### Common Issues
- [ ] Application won't start → Check startup file is `server.js`
- [ ] Database errors → Verify Supabase credentials
- [ ] Build errors → Check error logs in cPanel
- [ ] Static files not loading → Verify `.next` folder uploaded

### If Problems Occur
- [ ] Check application logs in cPanel
- [ ] Verify environment variables are set correctly
- [ ] Ensure all required files were uploaded
- [ ] Test locally with same environment variables
- [ ] Contact Namecheap support for hosting-specific issues

## 📝 Post-Deployment

### Verification
- [ ] All pages load correctly
- [ ] User authentication works
- [ ] Database operations function
- [ ] No console errors
- [ ] Performance is acceptable

### Documentation
- [ ] Document any custom configurations
- [ ] Save environment variable values securely
- [ ] Note any deployment-specific changes

## 🔄 Future Updates

### To Update the Application
- [ ] Make changes locally
- [ ] Test thoroughly
- [ ] Run `npm run build:production`
- [ ] Upload changed files or create new deployment package
- [ ] Restart Node.js application in cPanel

---

**Note**: This checklist ensures a smooth deployment process. Check off each item as you complete it to track your progress.
