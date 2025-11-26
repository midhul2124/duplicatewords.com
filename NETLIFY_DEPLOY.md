# Deploy to Netlify - Quick Guide

## Option 1: Deploy via Netlify Dashboard (Easiest)

1. **Build your project locally first** (to test):
   ```bash
   npm run build
   ```

2. **Go to [netlify.com](https://netlify.com)** and sign up/login

3. **Drag & Drop Method:**
   - After running `npm run build`, you'll have a `dist` folder
   - Go to Netlify dashboard
   - Drag the entire `dist` folder to the deploy area
   - Your site will be live in seconds!

4. **GitHub Integration (Recommended for auto-deploy):**
   - Push your code to GitHub
   - In Netlify dashboard, click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Netlify will auto-detect Vite settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

## Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize and deploy:**
   ```bash
   netlify init
   netlify deploy --prod
   ```

## Configuration

The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect rules (for React Router if you add it later)

## Your Site URL

After deployment, you'll get a URL like:
- `https://random-name-123456.netlify.app`

You can customize it in Netlify dashboard → Site settings → Change site name

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Follow DNS configuration instructions

## Auto-Deploy

If you connected GitHub:
- Every push to main/master branch = automatic deployment
- Pull requests = preview deployments

## Need Help?

- Netlify Docs: https://docs.netlify.com
- Support: https://www.netlify.com/support/

