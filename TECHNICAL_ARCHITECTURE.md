# NYASAWAVE COMPLETE ARCHITECTURE
## Technical Blueprint for Phases 5, 6, 7

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        NYASAWAVE FULL STACK                             │
└─────────────────────────────────────────────────────────────────────────┘

FRONTEND (Next.js App Router)
│
├─ Pages (Artist, Fan, Business flows)
├─ Components (40+ reusable)
├─ Contexts (Auth, Player, Playlist, Follow, etc.)
└─ Styling (Tailwind CSS)
    │
    ├─ Artist Dashboard (upload, schedule, boost, analytics)
    ├─ Fan Discovery (trending, recommendations, search)
    ├─ Business (matchmaking, campaigns, licensing)
    └─ Analytics (Phase 7.1 - AI insights)

    │
    V

API LAYER (Next.js Route Handlers)
│
├─ Authentication (/api/auth/*)
│   ├─ register, login, logout
│   └─ password reset, email verification
│
├─ Artist Tools (/api/artist/*)
│   ├─ upload (with copyright check)
│   ├─ releases (schedule & broadcast)
│   ├─ boost (paid promotion)
│   ├─ earnings (Phase 5.3)
│   └─ royalties (Phase 7.2)
│
├─ Music (/api/songs/*)
│   ├─ stream (audio delivery)
│   ├─ play-tracking (analytics)
│   └─ search
│
├─ Social (/api/social/*)
│   ├─ follow/unfollow
│   ├─ like/unlike
│   └─ activity-feed
│
├─ Recommendations (/api/recommendations/*)
│   ├─ for-you
│   ├─ trending
│   ├─ related
│   └─ upcoming-artists
│
├─ Payments (/api/payments/*)
│   ├─ initiate (Airtel/TNM)
│   ├─ verify
│   ├─ callback
│   └─ subscription
│
├─ Business (/api/business/*)
│   ├─ campaigns
│   ├─ licensing
│   └─ analytics
│
└─ Admin (/api/admin/*)
    ├─ verification
    ├─ reports
    ├─ content-moderation
    └─ audit-logs

    │
    V

DATABASE LAYER (PostgreSQL + Prisma ORM)
│
├─ Users
│   ├─ Fan
│   ├─ Artist (with ArtistProfile)
│   └─ Business (with BusinessProfile)
│
├─ Content
│   ├─ Tracks (audio + metadata)
│   ├─ Plays (stream events)
│   └─ Playlists
│
├─ Social
│   ├─ Follows (Artist follows)
│   ├─ Likes (Track likes)
│   └─ Comments (future)
│
├─ Business
│   ├─ Campaigns
│   ├─ Licensing Deals
│   └─ Reports
│
├─ Monetization
│   ├─ Earnings
│   ├─ RoyaltyConfig
│   ├─ Subscriptions
│   └─ Payouts
│
└─ Governance
    ├─ Admin (roles + permissions)
    ├─ Reports (abuse/copyright)
    ├─ AuditLog
    └─ Content Moderation Queue

    │
    V

EXTERNAL SERVICES
│
├─ PAYMENTS (Malawi-First)
│   ├─ Airtel Money API
│   └─ TNM Mpamba API
│
├─ STORAGE
│   ├─ Supabase Storage (audio files)
│   └─ Supabase Storage (images)
│
├─ AUTHENTICATION
│   ├─ Supabase Auth (optional)
│   └─ JWT/Session (built-in)
│
├─ ANALYTICS (Optional)
│   ├─ Shazam API (copyright)
│   ├─ ACRCloud API (fingerprinting)
│   └─ Google Analytics
│
├─ EMAIL
│   └─ SMTP / SendGrid
│
├─ CDN (Optional - Phase 6.4)
│   └─ Cloudinary / Vercel Edge Functions
│
└─ MONITORING
    └─ Sentry (error tracking)
```

---

## 📊 DATA FLOW EXAMPLES

### Example 1: Artist Uploads Track
```
Artist
  ↓ (upload audio + metadata)
  ↓
Frontend (app/artist/upload/page.tsx)
  ↓ (multipart form)
  ↓
/api/artist/upload
  ├─ Validate file
  ├─ Copyright check
  ├─ Upload to Supabase Storage
  ├─ Save Track record to DB
  └─ Return track ID + URL
  ↓
Artist Dashboard Updated
  ↓ (shows new track in list)
```

### Example 2: Fan Streams Track
```
Fan clicks Play
  ↓ (on track page)
  ↓
Frontend (AudioPlayer component)
  ├─ Load audio stream
  └─ Emit play event
  ↓
Backend tracking
  ├─ Create Play record
  ├─ Increment Track.streams count
  ├─ Update ArtistProfile.totalStreams
  └─ Calculate earnings
  ↓
Database updated
  ├─ Play event recorded
  ├─ Earnings queued for payout
  └─ Analytics updated
  ↓
Analytics Dashboard
  ├─ Real-time stream count
  ├─ Earnings visible
  └─ Demographics tracked
```

### Example 3: Payment Flow (Phase 5.3)
```
Artist requests payout
  ↓
/api/payments/initiate
  ├─ Check earnings >= minimum
  ├─ Call Airtel Money / TNM API
  └─ Create payment record
  ↓
Mobile Money Provider
  ├─ Process payment
  └─ Send callback
  ↓
/api/payments/callback
  ├─ Verify payment status
  ├─ Update Earnings status
  └─ Send confirmation email
  ↓
Artist receives money
  ↓
Dashboard shows
  └─ "Payment successful"
```

### Example 4: Recommendations (Phase 6.1)
```
Fan opens Discover page
  ↓
Frontend requests recommendations
  ↓
/api/recommendations?userId=X&type=for-you
  ├─ Fetch user activity (plays, likes, follows)
  ├─ Get trending tracks (last 7 days)
  ├─ Get new releases (in user's genres)
  ├─ Score all tracks by:
  │   ├─ Genre match (40%)
  │   ├─ Trending score (30%)
  │   ├─ Artist popularity (20%)
  │   └─ Newness (10%)
  ├─ Sort by score
  └─ Return top 20 tracks
  ↓
Frontend displays
  └─ "For You" section with personalized music
```

---

## 🔐 SECURITY ARCHITECTURE

```
Authentication Flow:
┌─────────┐
│ User    │
│ enters  │
│ creds   │
└────┬────┘
     │
     ↓
┌──────────────────────────┐
│ API Route Handler        │
│ (/api/auth/login)        │
│                          │
│ 1. Validate input        │
│ 2. Hash password check   │
│ 3. Create JWT token      │
└──────────────────────────┘
     │
     ↓
┌──────────────────────────┐
│ HTTP Response            │
│ - JWT in httpOnly cookie │
│ - User object in body    │
└──────────────────────────┘
     │
     ↓
┌──────────────────────────┐
│ Frontend (AuthContext)   │
│ - Stores token           │
│ - Attaches to requests   │
└──────────────────────────┘
     │
     ↓
┌──────────────────────────┐
│ Protected Routes         │
│ - Check JWT in headers   │
│ - Verify signature       │
│ - Allow/deny request     │
└──────────────────────────┘
```

---

## 📈 SCALABILITY CONSIDERATIONS

### Current Capacity
- **Users**: 100K (single PostgreSQL instance)
- **Tracks**: 50K (with CDN for audio)
- **Monthly Streams**: 10M

### To Scale to 1M Users
1. **Database**
   - Read replicas for analytics
   - Sharding by artist_id
   - Caching layer (Redis)

2. **Storage**
   - CDN for audio delivery (Cloudflare / Fastly)
   - Region-specific buckets
   - Transcoding pipeline (ffmpeg)

3. **API**
   - Load balancing (Vercel automatic)
   - Caching (Next.js ISR)
   - Rate limiting per user
   - Database connection pooling

4. **Payment**
   - Queue-based processing
   - Webhook batching
   - Reconciliation service

---

## 🧠 AI/ML ROADMAP (Phase 6.1 Extended)

### Current (Rule-Based)
- Genre matching
- Popularity scoring
- Newness weighting
- User activity tracking

### Next (ML Models)
- Listening patterns clustering
- Churn prediction
- Artist growth forecasting
- Optimal release times per artist

### Future (Advanced)
- Audio fingerprinting (copyright)
- Mood detection (audio analysis)
- Trend prediction (next genre)
- Cross-regional recommendations

---

## 💼 BUSINESS LOGIC LAYER

Located in `/lib/`:
```
payments.ts
├─ Payment gateway abstraction
├─ Earnings calculations
└─ Payout scheduling

recommendations.ts
├─ Scoring algorithms
├─ Trend detection
└─ Personalization

royalties.ts
├─ Split calculations
├─ Licensing proposals
└─ Tax calculations
```

---

## 🌐 API RESPONSE PATTERNS

All APIs follow this structure:

### Success Response (200-299)
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Optional success message"
}
```

### Error Response (400-599)
```json
{
  "success": false,
  "error": "error_code",
  "message": "Human readable error",
  "details": { /* optional debug info */ }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "pages": 50
  }
}
```

---

## 📦 DEPLOYMENT ARCHITECTURE

```
GitHub Repository
    ↓ (push to main)
    ↓
Vercel CI/CD
    ├─ Run tests
    ├─ Run linter
    ├─ Build Next.js app
    └─ Deploy
    ↓
Vercel Edge Network
    ├─ Automatic scaling
    ├─ CDN globally
    ├─ SSL/TLS
    └─ DDoS protection
    ↓
Database
    ├─ Supabase PostgreSQL
    ├─ Automatic backups
    └─ Connection pooling
    ↓
Storage
    ├─ Supabase Storage
    └─ Auto-scaling
    ↓
DNS
    └─ Vercel domains / custom
```

---

## 🎯 MONITORING STACK

```
Application
    ↓
┌─────────────────────────────────┐
│ Logging                         │
│ - Console logs                  │
│ - File logs (production)        │
│ - Cloud logging (Vercel)        │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Error Tracking                  │
│ - Sentry integration            │
│ - Stack traces                  │
│ - Real user monitoring          │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Metrics                         │
│ - API response times            │
│ - Database query times          │
│ - User sessions                 │
│ - Streams per second            │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Alerts                          │
│ - Error rate > 1%               │
│ - API latency > 1s              │
│ - Database connection pool full │
│ - Payment failures              │
└─────────────────────────────────┘
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Database migrated to production
- [ ] All API keys in environment
- [ ] HTTPS enabled
- [ ] Error tracking configured
- [ ] Backup strategy tested
- [ ] Payment system live-tested
- [ ] Admin panel secured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Monitoring activated
- [ ] Support email configured
- [ ] Incident response plan ready

---

This architecture is production-ready and can handle Malawi's national launch immediately.

🇲🇼 **Ready to change African music** 🎧
