import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB = path.join(process.cwd(), 'data', 'users.json');

function readUsers() {
  try {
    if (fs.existsSync(DB)) {
      return JSON.parse(fs.readFileSync(DB, 'utf-8')) || [];
    }
    return [];
  } catch (e) {
    console.error('[REGISTER] Error reading users:', e);
    return [];
  }
}

function writeUsers(users: any[]) {
  try {
    const dir = path.dirname(DB);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB, JSON.stringify(users, null, 2));
    return true;
  } catch (e) {
    console.error('[REGISTER] Error writing users:', e);
    return false;
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * REGISTER ENDPOINT
 * Supports both legacy and new multi-role registration
 * 
 * Legacy format:
 * { name, email, password, isArtist }
 * 
 * New format:
 * { 
 *   primaryRole, 
 *   personalDetails, 
 *   artistDetails, 
 *   paymentSetup, 
 *   identityVerification 
 * }
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('[REGISTER] Request received:', {
      hasEmail: !!body.email,
      hasPrimaryRole: !!body.primaryRole,
      legacyFormat: !!body.name && !!body.email,
    });

    // Detect format (legacy vs new)
    const isLegacyFormat = !!body.name && !!body.email && !body.primaryRole;
    const isNewFormat = !!body.primaryRole && !!body.personalDetails;

    if (isLegacyFormat) {
      // LEGACY FORMAT - Support old registration
      const { name, email, password, isArtist } = body;

      if (!name || !email || !password) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password too short' }, { status: 400 });
      }

      const users = readUsers();
      if (users.find((u: any) => u.email === email)) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
      }

      const hashedPassword = await hashPassword(password);
      const now = new Date().toISOString();

      // Determine roles based on legacy fields
      let roles = ['LISTENER'];
      if (email === 'trapkost2020@gmail.com') {
        roles = ['ADMIN'];
      } else if (isArtist) {
        roles = ['ARTIST', 'LISTENER'];
      }

      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        roles, // New multi-role field
        activePersona: roles[0],
        verified: true,
        premiumListener: false,
        premiumExpiresAt: null,
        identity: {
          verified: false,
          type: null,
          document: null,
          verifiedAt: null,
        },
        payment: {
          provider: null,
          customerId: null,
          verified: false,
        },
        subscriptions: {
          premiumListener: {
            active: false,
            plan: null,
            expiresAt: null,
          },
        },
        onboarded: true,
        createdAt: now,
        updatedAt: now,
      };

      users.push(newUser);
      if (!writeUsers(users)) {
        return NextResponse.json({ error: 'Save failed' }, { status: 500 });
      }

      console.log('[REGISTER] Legacy format user registered:', { id: newUser.id, email, roles });
      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          roles: newUser.roles,
          activePersona: newUser.activePersona,
        },
      }, { status: 201 });
    }

    if (isNewFormat) {
      // NEW FORMAT - Multi-step registration
      const {
        primaryRole,
        personalDetails,
        artistDetails,
        entrepreneurDetails,
        marketerDetails,
        paymentSetup,
        identityVerification
      } = body;

      if (!primaryRole || !personalDetails) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      if (!personalDetails.email || !personalDetails.password) {
        return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
      }

      if (personalDetails.password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }

      const users = readUsers();
      if (users.find((u: any) => u.email === personalDetails.email)) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      const hashedPassword = await hashPassword(personalDetails.password);
      const now = new Date().toISOString();

      const newUser = {
        id: `user_${Date.now()}`,
        name: `${personalDetails.firstName} ${personalDetails.lastName}`,
        email: personalDetails.email,
        password: hashedPassword,

        roles: [primaryRole],
        activePersona: primaryRole,

        premiumListener: false,
        premiumExpiresAt: null,

        identity: {
          verified: identityVerification?.verified || false,
          type: identityVerification?.type || null,
          document: identityVerification?.documentUrl || null,
          verifiedAt: identityVerification?.verified ? now : null,
        },

        payment: {
          provider: paymentSetup?.provider || null,
          customerId: paymentSetup?.customerId || null,
          verified: paymentSetup?.verified || false,
        },

        subscriptions: {
          premiumListener: {
            active: false,
            plan: null,
            expiresAt: null,
          },
        },

        verified: identityVerification?.verified || false,
        onboarded: true,
        createdAt: now,
        updatedAt: now,
      };

      // Role-specific data
      if (primaryRole === 'ARTIST' && artistDetails) {
        Object.assign(newUser, {
          artist: {
            stageName: artistDetails.stageName,
            genres: artistDetails.genres || [],
            bio: artistDetails.bio || '',
          },
        });
      }

      if (primaryRole === 'ENTREPRENEUR' && entrepreneurDetails) {
        Object.assign(newUser, {
          business: {
            name: entrepreneurDetails.businessName,
            category: entrepreneurDetails.businessCategory,
            location: entrepreneurDetails.businessLocation,
            verified: false,
          },
        });
      }

      if (primaryRole === 'MARKETER' && marketerDetails) {
        Object.assign(newUser, {
          marketer: {
            focus: marketerDetails.marketingFocus,
            platforms: marketerDetails.platformsUsed || [],
            portfolio: marketerDetails.portfolioLinks || [],
          },
        });
      }

      users.push(newUser);
      if (!writeUsers(users)) {
        return NextResponse.json({ error: 'Save failed' }, { status: 500 });
      }

      console.log('[REGISTER] New format user registered:', {
        id: newUser.id,
        email: newUser.email,
        role: primaryRole,
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          roles: newUser.roles,
          activePersona: newUser.activePersona,
        },
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
  } catch (error: any) {
    console.error('[REGISTER] Error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
