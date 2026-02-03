# 🚀 NYASAWAVE PRODUCTION DEPLOYMENT CHECKLIST
## Supabase + Vercel + Domain Setup

**Last Updated:** February 3, 2026  
**Status:** Ready to Deploy  
**Estimated Time:** 2-3 hours

---

## ✅ PRE-DEPLOYMENT VALIDATION

Before deploying, run these local tests:

### 1. Build Test
```bash
cd e:\nyasawave-projects\nyasawave
npm run build
# Should complete with: "Compiled successfully" with 0 errors
```

### 2. Dev Server Test
```bash
npm run dev
# Visit http://localhost:3000
# Check console for errors
# Test /discover page loads songs
# Test /marketplace shows products
```

### 3. Role Test
```bash
# Login as trapkost2020@mail.com
# Click role switcher
# Switch roles (admin → artist → listener)
# Verify middleware allows access
# Check no 404 errors
```

### 4. API Test
```bash
# Open browser console
# Go to http://localhost:3000/api/songs
# Should return JSON array of songs
# Check if data.length > 0
```

---

## 🔧 STEP 1: SUPABASE SETUP (45 mins)

### 1.1 Create Supabase Project

1. Go to **https://supabase.com**
2. Sign in / Sign up
3. Click **"New project"**
4. Configure:
   - **Name:** `nyasawave-prod`
   - **Database Password:** (auto-generated, save it)
   - **Region:** Choose closest to target users (e.g., `eu-west-1` for EU, or `ap-southeast-1` for Asia)
   - **Pricing Plan:** Free (or Pro if expecting >50k MAU)
5. Wait 2-3 mins for database to initialize
6. **SAVE CONNECTION INFO**

### 1.2 Get Database URL

In Supabase dashboard:
1. Go to **Settings → Database**
2. Find **Connection string** section
3. Select **"URI"** option (not "psql")
4. Copy the string that looks like:
   ```
   postgresql://postgres:PASSWORD@host:5432/postgres
   ```
5. **Keep this secret** — it's your DATABASE_URL

### 1.3 Configure Prisma Connection

In your project, create/update `.env.production.local`:
```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.RANDOM.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://nyasawave.com"
NEXTAUTH_SECRET="generate_random_32_char_string"

# Payment APIs (fill these in)
AIRTEL_API_KEY="your_airtel_key"
AIRTEL_MERCHANT_CODE="your_merchant_code"
TNM_API_KEY="your_tnm_key"
TNM_MERCHANT_CODE="your_merchant_code"

# Admin Email (CRITICAL)
NEXT_PUBLIC_ADMIN_EMAIL="trapkost2020@mail.com"
```

### 1.4 Run Prisma Migrations

**Option A: Using Prisma Migrate (Recommended)**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations against production DB
# This creates all tables from schema.prisma
npx prisma migrate deploy

# Verify migration succeeded
npx prisma db seed
```

**Option B: If prisma migrate fails**
```bash
# Fall back to push (warning: may lose data)
npx prisma db push --force-reset

# Then seed
npx prisma db seed
```

### 1.5 Seed Sample Data

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { songs } from '../data/songs';
import { artists } from '../data/artists';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample data...');
  
  // Create sample users
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: await hashPassword('password123'),
      roles: ['LISTENER'],
      verified: true,
    },
  });
  
  console.log('✅ Created test user:', user.id);
  console.log('✅ Seeding complete');
}

async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs');
  return bcrypt.hash(password, 10);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Then run:
```bash
npx prisma db seed
```

### 1.6 Test Supabase Connection

```bash
# Test the connection
npx prisma studio

# Should open admin UI showing all tables
# Verify you can see: User, Artist, Track, Tournament, etc.
```

---

## 🚀 STEP 2: VERCEL DEPLOYMENT (45 mins)

### 2.1 Connect GitHub Repository

1. Go to **https://vercel.com**
2. Sign in with GitHub
3. Click **"Add New → Project"**
4. Select your **nyasawave** repository
5. Click **"Import"**

### 2.2 Configure Environment Variables

In Vercel project settings → **Environment Variables**:

**Add Production Variables:**
```
DATABASE_URL = (from Supabase)
NEXTAUTH_URL = https://nyasawave.com
NEXTAUTH_SECRET = (generate: openssl rand -base64 32)
NEXT_PUBLIC_ADMIN_EMAIL = trapkost2020@mail.com
AIRTEL_API_KEY = (from Airtel Money)
AIRTEL_MERCHANT_CODE = (from Airtel Money)
TNM_API_KEY = (from TNM Mpamba)
TNM_MERCHANT_CODE = (from TNM Mpamba)
NODE_ENV = production
```

**For Preview (Development):**
```
DATABASE_URL = (same Supabase, or separate dev DB)
NEXTAUTH_URL = https://YOUR_PREVIEW_URL.vercel.app
NEXTAUTH_SECRET = (same as production)
```

### 2.3 Configure Build Settings

In project settings → **Build & Development Settings**:
- **Framework:** Next.js (should auto-detect)
- **Build Command:** `npm run build` or use default
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (3-5 mins)
3. Check build logs for errors
4. Click preview URL when ready
5. Test on preview deployment:
   - Can you load home page?
   - Do songs load on /discover?
   - Can you login?

### 2.5 Test Production Deployment

If preview passes, deploy to production:
1. Click **"Promote to Production"** on preview
2. Or wait for main branch to auto-deploy
3. Visit `https://YOUR_PREVIEW_URL.vercel.app`
4. Run smoke tests:
   ```
   [ ] Home page loads
   [ ] /discover shows songs
   [ ] /login works
   [ ] /marketplace shows products
   [ ] /admin restricts to admin email
   [ ] Profile settings save
   ```

---

## 🌐 STEP 3: CUSTOM DOMAIN SETUP (15 mins)

### 3.1 Buy Domain (if needed)

Options:
- **Namecheap** (cheap, reliable)
- **Google Domains** (integrated)
- **Vercel Domains** (directly through Vercel)

For this guide, we'll use **Vercel Domains**:

1. In Vercel project → **Settings → Domains**
2. Click **"Add"**
3. Type domain: `nyasawave.com`
4. Click **"Add Domain"**
5. Pay annual fee (via Vercel)

### 3.2 Configure DNS (if using external registrar)

If you bought domain elsewhere (Namecheap, Google):

1. Get Vercel DNS records from: **Settings → Domains → nyasawave.com**
2. Copy all A, AAAA, CNAME records
3. Log into your registrar (Namecheap, Google, etc.)
4. Go to DNS management
5. Replace all records with Vercel's records
6. Save changes
7. Wait 24 hours for DNS propagation (sometimes instant)

### 3.3 Enable HTTPS/SSL

Vercel automatically provisions SSL certificate. Just wait 24 hrs.

Verify:
1. Visit `https://nyasawave.com`
2. Check browser shows 🔒 (secure)
3. No mixed content warnings

---

## ✉️ STEP 4: EMAIL SETUP (OPTIONAL - 15 mins)

For transactional emails (password reset, verification):

### Option A: Using Supabase's Built-in Email
1. In Supabase → **Settings → Email Templates**
2. Configure sender email (Supabase provides one)
3. Customize email templates
4. Enable in your code

### Option B: Using SendGrid/Mailgun (Better)
1. Sign up at **SendGrid.com** or **Mailgun.com**
2. Get API key
3. Add to Vercel env vars: `SENDGRID_API_KEY=...`
4. Update code to use SendGrid SDK

### Example Email Code:
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'sendgrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

await transporter.sendMail({
  from: 'noreply@nyasawave.com',
  to: user.email,
  subject: 'Verify your email',
  html: `<p>Click <a href="...">here</a> to verify</p>`,
});
```

---

## 💰 STEP 5: PAYMENT INTEGRATION (30 mins)

### 5.1 Airtel Money Integration

1. Go to **Airtel Money Developer Portal** (country-specific)
2. Register business account
3. Get credentials:
   - API Key
   - Merchant Code
   - Merchant Number
4. Add to Vercel env vars:
   ```
   AIRTEL_API_KEY=...
   AIRTEL_MERCHANT_CODE=...
   ```

### 5.2 TNM Mpamba Integration

1. Go to **TNM Developer Portal** (Malawi)
2. Apply for merchant account
3. Get credentials:
   - API Key
   - Merchant Code
   - Merchant Number
4. Add to Vercel env vars:
   ```
   TNM_API_KEY=...
   TNM_MERCHANT_CODE=...
   ```

### 5.3 Test Payment Flow

```typescript
// Test checkout API
const response = await fetch('/api/payments/initiate', {
  method: 'POST',
  body: JSON.stringify({
    amount: 100,
    phoneNumber: '+265888123456',
    provider: 'airtel', // or 'tnm'
  }),
});
```

---

## 🔒 STEP 6: SECURITY HARDENING (30 mins)

### 6.1 Add Security Headers

In `next.config.ts`:
```typescript
const headers = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers,
      },
    ];
  },
};
```

### 6.2 Enable Rate Limiting

Install: `npm install express-rate-limit`

Protect auth routes:
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // 5 attempts
  message: 'Too many login attempts',
});

export async function POST(req: Request) {
  // Apply rate limiter
  authLimiter(req as any, {} as any, () => {});
  // ... rest of login logic
}
```

### 6.3 Validate All Inputs

Use **Zod** (already probably installed):
```typescript
import { z } from 'zod';

const PaymentSchema = z.object({
  amount: z.number().positive().max(10000000),
  phoneNumber: z.string().regex(/^\+265\d{9}$/),
  provider: z.enum(['airtel', 'tnm']),
});

// In API route
const validated = PaymentSchema.parse(await req.json());
```

### 6.4 Enable Audit Logging

Every admin action should be logged:
```typescript
await prisma.auditLog.create({
  data: {
    userId: admin.id,
    action: 'BANNED_USER',
    targetId: bannedUser.id,
    details: JSON.stringify({ reason: 'Spam' }),
    timestamp: new Date(),
  },
});
```

---

## 📊 STEP 7: MONITORING & ANALYTICS (20 mins)

### 7.1 Error Tracking (Sentry)

1. Sign up at **sentry.io**
2. Create project (Next.js)
3. Get DSN
4. Add to `.env.production.local`: `SENTRY_DSN=...`
5. Install: `npm install @sentry/nextjs`

### 7.2 Usage Analytics (Mixpanel)

1. Sign up at **mixpanel.com**
2. Create project
3. Get token
4. Install: `npm install mixpanel-browser`
5. Track events:
   ```typescript
   import mixpanel from 'mixpanel-browser';
   
   mixpanel.init('YOUR_TOKEN');
   mixpanel.track('Song Played', {
     songId: '123',
     artist: 'Nozipho',
   });
   ```

### 7.3 Database Backups (Supabase)

Supabase auto-backups daily. To restore:
1. Go to **Supabase → Settings → Backups**
2. Click **"Restore"** on any backup
3. Choose target database
4. Confirm

---

## ✅ FINAL VERIFICATION CHECKLIST

Before telling users it's live:

**Functionality**
- [ ] Home page loads in < 3 seconds
- [ ] Songs load on /discover (>100 tracks)
- [ ] User can register
- [ ] User can login
- [ ] User can search for songs
- [ ] User can play songs
- [ ] Artist can upload song
- [ ] Buyer can purchase on marketplace
- [ ] Seller receives order notification
- [ ] Admin can login and see all users
- [ ] Admin can ban user
- [ ] Admin can verify artist KYC
- [ ] Tournament voting works
- [ ] Role switching works

**Performance**
- [ ] Lighthouse score > 80 (audit at PageSpeed)
- [ ] First Contentful Paint < 2 seconds
- [ ] Largest Contentful Paint < 3 seconds
- [ ] Cumulative Layout Shift < 0.1

**Security**
- [ ] HTTPS everywhere
- [ ] No mixed content
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] Input validation works
- [ ] Admin email protected

**Data**
- [ ] Supabase connection working
- [ ] Migrations ran successfully
- [ ] Sample data seeded
- [ ] User registrations save to DB
- [ ] Settings persist across sessions
- [ ] Transactions logged

**Monitoring**
- [ ] Error tracking (Sentry) receiving logs
- [ ] Analytics (Mixpanel) tracking events
- [ ] Database backups scheduled
- [ ] Logs accessible in Vercel dashboard

---

## 🆘 TROUBLESHOOTING

### Build Fails on Vercel
**Check:**
```bash
# Local build works?
npm run build

# Environment vars set in Vercel?
# Check: Settings → Environment Variables

# Any missing dependencies?
npm install

# Rebuild locally
npm run build
```

### 502 Bad Gateway After Deploy
**Causes:**
- Database not accessible (check DATABASE_URL)
- Prisma Client not generated (run `npx prisma generate`)
- API route error (check Vercel logs)

**Fix:**
```bash
# Regenerate Prisma
npx prisma generate

# Redeploy
git push # auto-deploys to Vercel
```

### Discover Shows 0 Tracks
**Check:**
1. Is /api/songs endpoint responding?
   - Visit: `https://nyasawave.com/api/songs`
   - Should return JSON array
2. Is SongContext loading?
   - Open browser DevTools → Console
   - Should see "[SongContext] Fetched X songs"
3. Is database seeded?
   - `npx prisma studio`
   - Check Track table has rows

### Users Can't Login
**Check:**
1. Is NEXTAUTH_URL correct?
   - Should be `https://nyasawave.com` (no /api/auth)
2. Is NEXTAUTH_SECRET set?
   - `echo $env:NEXTAUTH_SECRET`
3. Database users table has rows?
   - `npx prisma studio` → User table

### Payment Not Working
**Check:**
1. Are API keys set in Vercel env?
2. Is payment API endpoint responding?
   - `POST /api/payments/initiate`
3. Are webhooks configured?
   - Airtel/TNM should POST to `/api/payments/webhook`

---

## 📞 LAUNCH SUPPORT

Once live:

1. **Monitor** errors on Sentry.io
2. **Check** analytics on Mixpanel
3. **Review** database backups daily
4. **Read** Vercel deployment logs for warnings
5. **Test** user scenarios weekly

---

## 🎉 SUCCESS!

Once all checks pass, you're live. Announce to:
- Social media
- Email list
- Artist community
- Press/blogs

**Congratulations — NyasaWave is live!**

