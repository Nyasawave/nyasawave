# 🚀 Quick Start - Account Reset & Testing

## Prerequisites

- Node.js and pnpm installed
- Database configured in `.env.local`
- All environment variables filled in

## Steps to Reset & Test

### 1. Install Dependencies

```bash
cd e:\nyasawave-projects\nyasawave
pnpm install
```

### 2. Push Database Schema

```bash
npx prisma db push
```

### 3. Reset All Accounts & Create Test Accounts

```bash
pnpm reset-db
```

This creates:

- 6 test accounts (1 admin, 2 artists, 3 regular users)
- Sample tracks for each artist
- All with fresh, clean data

### 4. Start Development Server

```bash
pnpm dev
```

Server runs on `http://localhost:3000`

### 5. Begin Testing

Use the test accounts to verify all features work correctly.

---

## Test Accounts

```bash
Admin:
- Email: admin@test.com
- Password: AdminTest123!

Artists:
- Email: artist1@test.com | Password: ArtistTest123!
- Email: artist2@test.com | Password: ArtistTest123!

Users:
- Email: user1@test.com | Password: UserTest123!
- Email: user2@test.com | Password: UserTest123!
- Email: listener@test.com | Password: ListenerTest123!
```

---

## Feature Testing Checklist

### Authentication

- [ ] All accounts can login
- [ ] Invalid credentials rejected
- [ ] Logout works
- [ ] Session persists on refresh

### Artist Features

- [ ] View dashboard
- [ ] View sample tracks
- [ ] Upload new track
- [ ] Edit track details
- [ ] View earnings
- [ ] Create track boost
- [ ] Create marketplace ad

### User Features

- [ ] Browse discover page
- [ ] Play tracks
- [ ] Like/unlike tracks
- [ ] Create playlist
- [ ] Add tracks to playlist
- [ ] Search for tracks
- [ ] View artist profiles

### Admin Features

- [ ] Access dashboard
- [ ] View all users
- [ ] View analytics
- [ ] View payments

### Data Integrity

- [ ] Accounts exist in database
- [ ] Sample tracks exist
- [ ] Data persists on server restart

---

## Troubleshooting

### Reset Script Fails

```bash
rm -rf node_modules/.prisma
pnpm install
pnpm reset-db
```

### Database Connection Error

```bash
npx prisma db push
```

### Port 3000 In Use (Windows)

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Clean Build

```bash
rm -rf .next
pnpm build
```

---

**Ready for Testing!** ✅
