# Test Credentials - NyasaWave Platform

Use these credentials to test each role in the development environment.

## Test Accounts

### Admin Account

- **Email:** `admin@test.com`
- **Password:** `test123`
- **Roles:** ADMIN
- **Access:** `/admin/dashboard`

### Artist Account

- **Email:** `artist@test.com`
- **Password:** *(bcrypt hash - use signup to create new)*
- **Roles:** ARTIST, LISTENER
- **Access:** `/artist/dashboard`

### Marketer Account

- **Email:** `marketer@test.com`
- **Password:** `test123`
- **Roles:** MARKETER, LISTENER
- **Access:** `/marketer/dashboard`

### Entrepreneur Account

- **Email:** `entrepreneur@test.com`
- **Password:** `test123`
- **Roles:** ENTREPRENEUR, LISTENER
- **Access:** `/entrepreneur/dashboard`

### Listener Account

- **Email:** `listener@test.com`
- **Password:** `test123`
- **Roles:** LISTENER
- **Access:** `/listener/dashboard`

## Alternative Admin Account

- **Email:** `trapkost2020@gmail.com`
- **Password:** *(bcrypt hash)*

## Testing Workflow

1. **Login** with any of the test accounts above
2. **Navigate** to the corresponding role dashboard
3. **Role Switching**: Use the RoleContextSwitcher in the header to switch between roles (if multi-role)
4. **Dashboard Features**:
   - Admin: View system stats, manage users, content, tournaments
   - Artist: Upload music, track streams, analytics
   - Marketer: Manage campaigns, track reach and earnings
   - Entrepreneur: Manage businesses, ads, payments
   - Listener: Discover music, library, profile

## API Endpoints (Mock Data)

- `GET /api/admin/stats` - Admin system statistics
- `GET /api/admin/content` - Content management
- `GET /api/admin/tournaments` - Tournament list
- `GET /api/artist/stats` - Artist statistics
- `GET /api/listener/stats` - Listener statistics
- `GET /api/marketer/stats` - Marketer statistics
- `GET /api/entrepreneur/stats` - Entrepreneur statistics

## Notes

- All test accounts are pre-configured in `data/users.json`
- Passwords are bcrypt hashed (cost factor 10)
- Multi-role users can switch personas using RoleContextSwitcher
- Authentication uses NextAuth v4 with JWT strategy
- Session expires after 30 days of inactivity
