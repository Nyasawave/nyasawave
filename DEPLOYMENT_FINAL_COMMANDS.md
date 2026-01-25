# 🔧 NYASAWAVE FINAL COMMAND REFERENCE & DEPLOYMENT GUIDE

**Status**: ALL PHASES COMPLETE ✅  
**Ready for Deployment**: YES ✅  
**Production Build**: Verified ✅

---

## 🚀 IMMEDIATE ACTION: DEPLOY TO PRODUCTION

### Option 1: Vercel (Easiest - 5 minutes)

```bash
# Step 1: Install Vercel CLI
npm install -g vercel

# Step 2: Navigate to project
cd e:\nyasawave-projects\nyasawave

# Step 3: Login to Vercel
vercel login

# Step 4: Deploy to production
vercel --prod

# Step 5: Set environment variables in Vercel dashboard
# NEXTAUTH_URL=https://yourdomain.com
# NEXTAUTH_SECRET=your-secret-key
# DATABASE_URL=your-supabase-url
# ADMIN_EMAIL=trapkost2020@mail.com

# Done! Your site is now live at https://nyasawave.vercel.app
```

### Option 2: Railway (Faster - 2 minutes)

```bash
# Step 1: Sign up at railway.app
# Step 2: Connect GitHub repo to Railway
# Step 3: Add Postgres database plugin
# Step 4: Set environment variables
# Step 5: Click Deploy
# Done! Site live in ~2 minutes
```

### Option 3: Docker + Google Cloud Run (More control)

```bash
# Step 1: Build Docker image
docker build -t gcr.io/your-project/nyasawave:latest .

# Step 2: Push to Google Container Registry
docker push gcr.io/your-project/nyasawave:latest

# Step 3: Deploy to Cloud Run
gcloud run deploy nyasawave \
  --image gcr.io/your-project/nyasawave:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars "DATABASE_URL=your-url,NEXTAUTH_SECRET=your-secret"

# Done! Service live at https://nyasawave-xxxxx.run.app
```

---

## 📋 REQUIRED ENVIRONMENT VARIABLES

Before deploying, ensure these are set:

```bash
# Critical (Required for production)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
ADMIN_EMAIL=trapkost2020@mail.com

# Optional (For file uploads, payments, analytics)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_KEY=your-key
FLUTTERWAVE_PUBLIC_KEY=your-key
FLUTTERWAVE_SECRET_KEY=your-key
FLUTTERWAVE_WEBHOOK_SECRET=your-key
GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
SENTRY_DSN=https://...@sentry.io/...
```

### Generate NEXTAUTH_SECRET

```bash
# On Windows (PowerShell)
$bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
[Convert]::ToBase64String($bytes)

# On Mac/Linux
openssl rand -base64 32
```

---

## 🔨 LOCAL DEVELOPMENT COMMANDS

### Setup (First Time)

```bash
# Clone and navigate
cd e:\nyasawave-projects\nyasawave

# Install dependencies
pnpm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
npx prisma migrate dev

# Start development server
pnpm dev

# Open browser to http://localhost:3000
```

### Development

```bash
# Start development server with hot reload
pnpm dev

# Run build (verify no errors)
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check

# Database
npx prisma studio              # Open database GUI
npx prisma migrate dev --name  # Create migration
npx prisma db push            # Push schema to DB
npx prisma db seed            # Seed test data
```

---

## 🚢 DEPLOYMENT CHECKLIST

### Pre-Deployment (Run these before deploying)

```bash
# 1. Verify all tests pass
pnpm test

# 2. Run build
pnpm build

# 3. Verify no errors
echo "Check for .next folder and no errors above"

# 4. Verify env variables
cat .env.local
# Ensure: NEXTAUTH_SECRET, DATABASE_URL, ADMIN_EMAIL are set

# 5. Run database migrations
DATABASE_URL=your-prod-url npx prisma db push

# 6. Create admin user (optional)
npx prisma db seed
```

### Deploy to Vercel

```bash
# Simplest: Connect GitHub to Vercel
# - Go to vercel.com/new
# - Select GitHub repo
# - Add environment variables
# - Click Deploy

# Or use CLI:
vercel --prod --env-file .env.local
```

### Post-Deployment (After deploying)

```bash
# 1. Test production URL
curl https://yourdomain.com
# Should return HTML homepage

# 2. Test API
curl https://yourdomain.com/api/health
# Should return 200 OK

# 3. Test authentication
# Open https://yourdomain.com in browser
# Try login with test account
# Verify theme is dark
# Verify role-specific dashboard loads

# 4. Monitor logs
# Check error tracking (Sentry/LogRocket)
# Monitor database performance
# Check API response times

# 5. If all good: Celebrate! 🎉
```

---

## 📊 VERIFY SETUP IS CORRECT

### Test Authentication

```bash
# 1. Create test user account
EMAIL=test@example.com
PASSWORD=TestPassword123!

# 2. Login via UI at https://yourdomain.com/api/auth/signin
# 3. Should see dark theme
# 4. Should see role-specific dashboard

# 3. Test Admin (if you are admin email)
# 4. Should have access to /admin routes
# 5. Should see admin dashboard
```

### Test Theme System

```bash
# 1. Open DevTools (F12)
# 2. Go to Application → Local Storage
# 3. Should see: { "theme": "dark" }
# 4. Refresh page
# 5. Theme should persist
# 6. Should be dark mode globally
```

### Test API

```bash
# Get all tracks
curl https://yourdomain.com/api/tracks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get user theme
curl https://yourdomain.com/api/user/theme \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return JSON response with no errors
```

---

## 🔧 TROUBLESHOOTING

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build

# If still fails:
# Check for TypeScript errors: pnpm type-check
# Check for lint errors: pnpm lint
# Review error message carefully
```

### Database Connection Error

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# If fails:
# 1. Check DATABASE_URL is correct
# 2. Verify IP whitelist in Supabase dashboard
# 3. Verify network access is enabled
# 4. Check Supabase status page
```

### Authentication Not Working

```bash
# 1. Verify NEXTAUTH_SECRET is set
vercel env ls | grep NEXTAUTH_SECRET

# 2. Verify NEXTAUTH_URL matches domain
vercel env ls | grep NEXTAUTH_URL

# 3. Check NextAuth logs in deployment
# 4. Clear browser cookies and try again
```

### File Upload Not Working

```bash
# 1. Verify Supabase Storage bucket exists
# 2. Check CORS settings in Storage settings
# 3. Verify bucket is public (or auth correctly)
# 4. Check file size isn't over limit
# 5. Review network tab in DevTools
```

### Site is Slow

```bash
# 1. Check bundle size
npm run build
# Look at .next/static sizes

# 2. Run Lighthouse audit
# Open DevTools → Lighthouse
# Run performance audit
# Review suggestions

# 3. Check database queries
# Enable slow query logging in Supabase
# Optimize slow queries

# 4. Enable caching
# Set Cache-Control headers
# Configure CDN
```

---

## 📈 MONITOR PRODUCTION

### Set Up Error Tracking

```bash
# Install Sentry
pnpm add @sentry/nextjs

# Initialize in next.config.js
# Reference Sentry docs

# Test error tracking
// In a page component
throw new Error("Test error");
// Should appear in Sentry dashboard
```

### Set Up Analytics

```bash
# Install Google Analytics
pnpm add next-google-analytics

# Add to layout.tsx
import { GoogleAnalytics } from "next-google-analytics";

// In render:
<GoogleAnalytics trackPageViews />

# Set GOOGLE_ANALYTICS_ID env var
# Verify data in Google Analytics dashboard
```

### Monitor Database

```bash
# Supabase monitoring
# 1. Go to Supabase dashboard
# 2. Check: Database → Logs
# 3. Look for slow queries
# 4. Check: Database → Replication

# Set up alerts
# 1. Go to Supabase → Settings → Monitoring
# 2. Enable PgBouncer
# 3. Set up alerts for slow queries
# 4. Set up alerts for storage limits
```

### Monitor Uptime

```bash
# Use UptimeRobot (free)
# 1. Go to uptimerobot.com
# 2. Add monitor: https://yourdomain.com
# 3. Set check interval: 5 minutes
# 4. Get alerts if site goes down
```

---

## 🔄 ROLLBACK PROCEDURE

If something goes wrong:

```bash
# 1. Rollback application (Vercel)
vercel rollback

# Or manually:
git revert HEAD~1
git push

# 2. Rollback database (if needed)
# Supabase → Database → Backups → Restore

# 3. Clear cache
# Vercel dashboard → Deployments → Clear Cache

# 4. Test in staging first next time!
```

---

## 📚 IMPORTANT FILES TO KNOW

### Configuration

- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `.env.local` - Local environment variables
- `prisma/schema.prisma` - Database schema

### Core Application

- `app/layout.tsx` - Root layout
- `middleware.ts` - Route protection middleware
- `app/api/auth/[...nextauth]/route.ts` - Authentication
- `app/contexts/ThemeContext.tsx` - Theme system
- `app/api/user/theme/route.ts` - Theme API

### Role-Specific Layouts

- `app/artist/layout.tsx` - Artist layout
- `app/listener/layout.tsx` - Listener layout
- `app/entrepreneur/layout.tsx` - Entrepreneur layout
- `app/marketer/layout.tsx` - Marketer layout
- `app/admin/layout.tsx` - Admin layout

### Documentation

- `README.md` - Project overview
- `PRODUCTION_DEPLOYMENT_PACKAGE.md` - Deployment guide
- `FINAL_PHASE_COMPLETION_REPORT.md` - Completion report
- `PHASES_6-12_IMPLEMENTATION_GUIDE.md` - Feature guide

---

## ✅ FINAL CHECKLIST BEFORE LAUNCH

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Production build successful (`pnpm build`)
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Admin user created
- [ ] Theme system tested
- [ ] Authentication tested
- [ ] All role dashboards work
- [ ] API endpoints responding
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] SSL certificate valid
- [ ] Domain pointing to deployment
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Team notified of launch

---

## 🎯 SUCCESS CRITERIA

After deployment, verify:

✅ **Functionality**

- [ ] Login works with any role
- [ ] Dark theme applied globally
- [ ] All dashboards accessible
- [ ] Player plays tracks
- [ ] Playlists work
- [ ] Upload interface shows
- [ ] Admin dashboard shows

✅ **Performance**

- [ ] Page loads < 2 seconds
- [ ] API responds < 500ms
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Images load correctly

✅ **Security**

- [ ] Non-admin can't access /admin
- [ ] Wrong role can't access restricted routes
- [ ] HTTPS enabled
- [ ] Secrets not in code
- [ ] Rate limiting works

✅ **Reliability**

- [ ] No 404s
- [ ] No unhandled errors
- [ ] Database connected
- [ ] Backups running
- [ ] Monitoring active

---

## 📞 SUPPORT

**Documentation**: Read the 3 completion files  
**Issues**: Check troubleshooting section above  
**Emergency**: Contact development team  
**Admin Access**: Use email: <trapkost2020@mail.com>

---

## 🎉 YOU'RE READY TO LAUNCH

```bash
# Final command to deploy:
cd e:\nyasawave-projects\nyasawave
vercel --prod

# Then:
# 1. Set environment variables in Vercel dashboard
# 2. Wait for deployment to complete
# 3. Test production URL
# 4. Celebrate! 🎊
```

---

**Everything is production-ready. Let's launch! 🚀**

*Generated: 2026-01-25*  
*Version: 2.0.0-production*  
*All phases: COMPLETE ✅*
