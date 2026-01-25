# 🧪 NyasaWave Platform - Comprehensive Testing Guide

## Before You Start

Ensure:

- [ ] Database is reset with `pnpm reset-db`
- [ ] Server is running with `pnpm dev`
- [ ] All dependencies installed with `pnpm install`
- [ ] Environment variables configured in `.env.local`
- [ ] No TypeScript build errors

---

## Core Feature Tests

### Authentication & Authorization

#### Login/Logout

- [ ] Login with <admin@test.com> succeeds
- [ ] Login with <artist1@test.com> succeeds
- [ ] Login with <user1@test.com> succeeds
- [ ] Invalid credentials show error message
- [ ] Logout clears session and redirects to login
- [ ] Protected pages redirect to login when not authenticated

#### Session Management

- [ ] Page refresh maintains session
- [ ] Multiple tabs share same session
- [ ] Logout in one tab logs out all tabs
- [ ] User data matches the logged-in user

### Admin Dashboard

#### Access & Navigation

- [ ] Only <admin@test.com> can access `/admin`
- [ ] Artists and users redirected from admin routes
- [ ] Admin dashboard loads without errors
- [ ] All navigation links work

#### User Management

- [ ] View all users in the system
- [ ] User list shows email, name, role, created date
- [ ] Search functionality finds users by email
- [ ] Pagination works if more than 10 users
- [ ] Click user shows detailed profile

#### Analytics

- [ ] Total users count displays correctly
- [ ] Total artists count accurate
- [ ] Total tracks count accurate
- [ ] Revenue metrics calculate correctly
- [ ] Charts render without errors

#### Payments

- [ ] View all payment transactions
- [ ] Filter by payment status
- [ ] Payment amounts display in correct currency (MWK)
- [ ] Search functionality works
- [ ] Payment details accessible

---

## Artist Features

### Artist Profile

#### View & Edit

- [ ] Artist dashboard accessible at `/artist`
- [ ] Profile shows correct artist name
- [ ] Bio displays correctly
- [ ] Profile image shows (or placeholder if not set)
- [ ] Verified status displays
- [ ] Country shows "Malawi" by default

#### Profile Updates

- [ ] Can edit artist bio
- [ ] Can edit artist name
- [ ] Can upload new profile image
- [ ] Changes save and persist
- [ ] Success message appears after update

### Track Management

#### Upload Track

- [ ] Navigate to upload page
- [ ] Fill in track title
- [ ] Fill in description
- [ ] Select genre from dropdown
- [ ] Upload audio file (test with MP3)
- [ ] Upload cover art image
- [ ] Submit form successfully
- [ ] Track appears in dashboard immediately

#### View Tracks

- [ ] Artist dashboard shows all uploaded tracks
- [ ] Each track displays title, duration, genre
- [ ] Sample tracks created during reset display
- [ ] Play count shows correctly
- [ ] Like count shows correctly

#### Edit Track

- [ ] Click edit on a track
- [ ] Update title
- [ ] Update description
- [ ] Update genre
- [ ] Save changes successfully

#### Delete Track

- [ ] Click delete on a track
- [ ] Confirmation dialog appears
- [ ] Confirm deletion removes track
- [ ] Track no longer appears in list
- [ ] Track no longer appears in discover page

### Track Analytics

#### View Metrics

- [ ] Total plays count displays
- [ ] Total likes count displays
- [ ] Plays increase after user listens to track
- [ ] Likes increase after user likes track
- [ ] Analytics update in real-time

### Track Boost/Promotion

#### Create Boost

- [ ] Click boost button on track
- [ ] Select boost tier (free/premium/global/sponsor)
- [ ] Pricing displays correctly for each tier
- [ ] Set boost start date
- [ ] Set boost end date
- [ ] Complete payment (if paid tier)
- [ ] Boost creates successfully

#### Manage Boosts

- [ ] View all active boosts
- [ ] Boost status shows (pending/active/completed)
- [ ] Can stop active boost
- [ ] Can view boost performance
- [ ] Boost impressions tracked
- [ ] Boost clicks tracked

### Marketplace Ads

#### Create Ad

- [ ] Navigate to ads section
- [ ] Select ad placement type
  - [ ] Discover featured
  - [ ] Homepage banner
  - [ ] Artist page
  - [ ] City promotion
  - [ ] Trending chart
- [ ] Choose location (city or national)
- [ ] Enter ad title
- [ ] Enter ad description
- [ ] Upload ad image
- [ ] Set budget
- [ ] Set duration
- [ ] Create ad successfully

#### Manage Ads

- [ ] View all created ads
- [ ] Edit ad details
- [ ] Stop/pause ad
- [ ] Delete ad
- [ ] View ad performance metrics
- [ ] Check impressions
- [ ] Check clicks

### Earnings & Withdrawals

#### View Earnings

- [ ] Total earnings displays
- [ ] Current balance shows
- [ ] Earnings breakdown by track
- [ ] Earnings from boosts calculation
- [ ] Earnings update correctly

#### Request Withdrawal

- [ ] Navigate to withdrawals
- [ ] View withdrawal history
- [ ] Enter withdrawal amount
- [ ] Select payment method
- [ ] Request withdrawal
- [ ] Withdrawal status shows as pending
- [ ] Previous withdrawals display in history
- [ ] Withdrawn amount deducted from balance

---

## User Features

### Discover Page

#### Browse & View

- [ ] Discover page loads with tracks
- [ ] Tracks display title, artist, genre
- [ ] Artist images display
- [ ] Track cover art displays
- [ ] Can scroll through multiple tracks
- [ ] Pagination works if many tracks

#### Filter & Search

- [ ] Filter by genre
- [ ] Genre filter updates results
- [ ] Search for track title
- [ ] Search for artist name
- [ ] Search results accurate
- [ ] Clear filters button works

### Track Playback

#### Playing Tracks

- [ ] Click play on a track
- [ ] Audio player appears
- [ ] Audio plays from beginning
- [ ] Progress bar displays correctly
- [ ] Current time updates
- [ ] Duration displays correctly
- [ ] Play button toggles to pause

#### Playback Controls

- [ ] Play/pause button works
- [ ] Next button skips to next track
- [ ] Previous button replays current or goes to last track
- [ ] Volume slider adjusts volume
- [ ] Seek bar dragging works
- [ ] Current time reflects dragging position
- [ ] Mute button works

### Track Interaction

#### Like/Unlike

- [ ] Click like button on track
- [ ] Heart fills/highlights
- [ ] Like count increments
- [ ] Click again to unlike
- [ ] Heart empties
- [ ] Like count decrements
- [ ] Likes persist on page refresh

#### Share Track

- [ ] Click share button (if available)
- [ ] Share options appear
- [ ] Can copy link to clipboard
- [ ] Can share to social media (if configured)

### Playlists

#### Create Playlist

- [ ] Navigate to playlists
- [ ] Click create new playlist
- [ ] Enter playlist name
- [ ] Enter description (optional)
- [ ] Create playlist
- [ ] Playlist appears in list

#### Manage Playlist

- [ ] View all playlists
- [ ] Click to open playlist
- [ ] Add track to playlist
- [ ] Remove track from playlist
- [ ] Reorder tracks (drag/drop or buttons)
- [ ] Edit playlist name
- [ ] Edit playlist description
- [ ] Delete playlist

#### Play Playlist

- [ ] Click play on playlist
- [ ] Plays all tracks in order
- [ ] Next button moves to next track in playlist
- [ ] Previous button goes to previous track

### Artist Pages

#### View Artist Profile

- [ ] Click on artist name from track
- [ ] Artist profile page loads
- [ ] Artist name displays
- [ ] Artist bio displays
- [ ] Artist image displays
- [ ] Verified badge shows if verified
- [ ] Can see all artist tracks
- [ ] Artist stats display (follower count if available)

#### Artist Tracks

- [ ] All tracks by artist display
- [ ] Can play tracks from artist page
- [ ] Can like tracks
- [ ] Can add to playlist

---

## Data Persistence Tests

### Database Persistence

- [ ] Create data (track, playlist, etc.)
- [ ] Refresh page (F5)
- [ ] Data still exists
- [ ] Correct data displays

### Session Persistence

- [ ] Login to account
- [ ] Close browser tab
- [ ] Reopen browser/return to site
- [ ] Still logged in (if session storage enabled)
- [ ] User data visible

### State Management

- [ ] Playing track
- [ ] Navigate to different page
- [ ] Return to discover page
- [ ] Playback state preserved (if feature exists)

---

## Error Handling Tests

### Invalid Input

- [ ] Submit empty track title
- [ ] Submit empty playlist name
- [ ] Submit very long text (1000+ characters)
- [ ] Special characters in input (é, ñ, 中, etc.)
- [ ] Error message displays
- [ ] Form does not submit

### File Upload Errors

- [ ] Upload non-audio file as track
- [ ] Upload non-image file as cover art
- [ ] Upload oversized file
- [ ] Error message displays
- [ ] File not saved

### Network Errors

- [ ] Simulate offline mode (DevTools)
- [ ] Try to perform action
- [ ] Error message or offline indicator appears
- [ ] Can retry when online

### Access Control

- [ ] Try accessing `/admin` as regular user
- [ ] Redirected to login or unauthorized page
- [ ] Try accessing other user's data directly
- [ ] Cannot access/see other user's data

---

## Performance Tests

### Page Load Times

- [ ] Homepage loads in < 3 seconds
- [ ] Discover page loads in < 3 seconds
- [ ] Artist dashboard loads in < 2 seconds
- [ ] Audio player initializes quickly
- [ ] Images load progressively

### Responsiveness

- [ ] All buttons respond immediately on click
- [ ] No lag when scrolling
- [ ] Search results appear quickly
- [ ] Filter changes apply quickly

### Memory

- [ ] Open app, check DevTools memory
- [ ] Navigate around
- [ ] Play tracks, pause, play
- [ ] Memory usage doesn't continuously grow
- [ ] No memory leaks on extended use

---

## UI/UX Tests

### Responsive Design

- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1920px width)
- [ ] All elements visible at all sizes
- [ ] Buttons clickable on touch
- [ ] Navigation adapts to screen size

### Visual Design

- [ ] Colors match design spec
- [ ] Typography consistent
- [ ] Spacing/padding consistent
- [ ] Images not distorted
- [ ] No overlapping elements
- [ ] Dark mode works (if available)

### Accessibility

- [ ] Can tab through elements with keyboard
- [ ] Can submit forms with keyboard
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] Color contrast meets WCAG standards
- [ ] Audio player has captions (if applicable)

### User Feedback

- [ ] Loading spinners appear during operations
- [ ] Success messages appear for actions
- [ ] Error messages clear and helpful
- [ ] Confirmation dialogs for destructive actions
- [ ] Toast notifications for updates

---

## Browser Compatibility

Test on all supported browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

All features should work identically across browsers.

---

## Security Tests

### Authentication

- [ ] Passwords not visible in input fields
- [ ] JWT token stored securely
- [ ] Cannot access admin pages without admin role
- [ ] Cannot view other user's payment history
- [ ] Session timeout after inactivity (if configured)

### Input Validation

- [ ] Cannot inject HTML via input fields
- [ ] Cannot perform SQL injection
- [ ] Special characters handled safely
- [ ] File uploads scanned/validated

---

## Final Checklist

Before declaring platform ready for users:

- [ ] All test cases passed
- [ ] No console errors (F12 Developer Tools)
- [ ] No TypeScript errors (`pnpm build`)
- [ ] No ESLint errors (`pnpm lint`)
- [ ] Database has clean test data
- [ ] Images load correctly
- [ ] Audio plays correctly
- [ ] Forms validate properly
- [ ] Error messages helpful
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Accessible
- [ ] Secure

---

**Testing Complete!** 🎉

If all tests pass, the platform is ready for users.
