# BnbMargins - Namecheap Shared Hosting Deployment Guide

This guide provides step-by-step instructions for deploying the BnbMargins Next.js application to Namecheap shared hosting with Node.js support.

## Prerequisites

- Namecheap shared hosting account with Node.js support
- cPanel access
- Your Supabase project credentials
- Local development environment with Node.js installed

## Step 1: Prepare Your Local Environment

### 1.1 Install Dependencies
```bash
npm install
```

### 1.2 Set Up Environment Variables
1. Copy the production environment template:
   ```bash
   cp .env.production.example .env.production
   ```

2. Edit `.env.production` with your actual Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 1.3 Test the Build Locally
```bash
npm run build:production
npm start
```

Visit `http://localhost:3000` to ensure everything works correctly.

## Step 2: Build for Production

### 2.1 Clean and Build
```bash
npm run build:production
```

### 2.2 Verify Build Success
Ensure there are no errors during the build process. Fix any issues before proceeding.

## Step 3: Prepare Files for Upload

### 3.1 Create Deployment Package
1. Create a new folder for deployment files
2. Copy the following files and folders to the deployment folder:
   - `src/` (entire folder)
   - `public/` (entire folder)
   - `.next/` (entire folder - created after build)
   - `package.json`
   - `package-lock.json`
   - `next.config.ts`
   - `server.js`
   - `tsconfig.json`
   - `tailwind.config.ts` (if exists)
   - `postcss.config.mjs`

### 3.2 Exclude These Files/Folders
- `node_modules/` (will be installed on server)
- `.git/`
- `.env.local`
- `.env.example`
- `README.md`
- `.gitignore`
- Any development-only files

### 3.3 Create ZIP Archive
Create a ZIP file of all the deployment files.

## Step 4: Upload to Namecheap

### 4.1 Access cPanel
1. Log into your Namecheap account
2. Navigate to your hosting dashboard
3. Open cPanel

### 4.2 Upload Files
1. Open **File Manager** in cPanel
2. Navigate to or create a directory for your app (NOT in public_html)
3. Upload your ZIP file
4. Extract the ZIP file in the directory

## Step 5: Configure Node.js Application

### 5.1 Create Node.js App
1. In cPanel, find and open **Setup Node.js App**
2. Click **+ CREATE APPLICATION**
3. Configure the application:
   - **Node.js version**: Select the latest stable version (18.x or 20.x recommended)
   - **Application mode**: Production
   - **Application root**: Path to your uploaded files directory
   - **Application URL**: Your domain or subdomain
   - **Application startup file**: `server.js`

### 5.2 Add Environment Variables
In the Node.js app configuration, add your environment variables:
- `NODE_ENV`: `production`
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `NEXT_PUBLIC_APP_NAME`: `BnbMargins`
- `NEXT_PUBLIC_APP_DESCRIPTION`: `Comprehensive Airbnb Profit & Loss Dashboard`

### 5.3 Create the Application
Click **CREATE** to create the Node.js application.

## Step 6: Install Dependencies and Start

### 6.1 Install Node.js Packages
1. **Stop** the application temporarily
2. Navigate to **Detected Configuration Files**
3. Click **Run NPM Install** to install all dependencies
4. Wait for the installation to complete

### 6.2 Start the Application
1. Click **START APP** to start your application
2. Check the application status - it should show as "Running"

## Step 7: Test Your Deployment

### 7.1 Access Your Application
1. Open a new browser tab
2. Navigate to your application URL
3. Verify that the application loads correctly
4. Test key functionality:
   - User authentication
   - Dashboard access
   - Data loading from Supabase

### 7.2 Check Logs
If there are issues, check the application logs in cPanel for error messages.

## Troubleshooting

### Common Issues and Solutions

1. **Application won't start**
   - Check that `server.js` is set as the startup file
   - Verify all environment variables are set correctly
   - Check the error logs for specific error messages

2. **Database connection issues**
   - Verify Supabase credentials are correct
   - Ensure Supabase project is active and accessible
   - Check that the database URL format is correct

3. **Build errors**
   - Run `npm run build:production` locally first
   - Fix any TypeScript or linting errors
   - Ensure all dependencies are properly installed

4. **Static files not loading**
   - Verify the `.next` folder was uploaded
   - Check that the `public` folder is included
   - Ensure proper file permissions

### Getting Help

- Check Namecheap's Node.js documentation
- Review application logs in cPanel
- Test the application locally with the same environment variables
- Contact Namecheap support for hosting-specific issues

## Updating Your Application

To update your deployed application:

1. Make changes locally
2. Test thoroughly
3. Run `npm run build:production`
4. Upload only the changed files or create a new deployment package
5. Restart the Node.js application in cPanel

## Security Notes

- Never commit real environment variables to version control
- Keep your Supabase service role key secure
- Regularly update dependencies for security patches
- Monitor your application logs for any suspicious activity

---

**Congratulations!** Your BnbMargins application should now be successfully deployed on Namecheap shared hosting.
