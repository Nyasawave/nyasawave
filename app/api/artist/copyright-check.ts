import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple audio fingerprinting function
async function generateAudioFingerprint(buffer: ArrayBuffer): Promise<string> {
  // Create a simple hash of the audio file for comparison
  // In production, use a real audio fingerprinting library like Acoustid
  const hash = crypto.createHash('sha256');
  hash.update(Buffer.from(buffer));
  return hash.digest('hex');
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const audioFile = formData.get('audioFile') as File;

    if (!title) {
      return NextResponse.json(
        { error: 'Missing song title' },
        { status: 400 }
      );
    }

    // Flagged titles database (known copyrighted works)
    const flaggedTitles = [
      'despacito',
      'bohemian rhapsody',
      'blinding lights',
      'shape of you',
      'somebody that i used to know',
      'dance monkey',
      'uptown funk',
      'think twice',
      'hallelujah',
      'something in the way',
    ].map(t => t.toLowerCase());

    const titleLower = title.toLowerCase().trim();

    let copyrightStatus = 'clear';
    let message = 'Your song is clear to upload';
    let audioMatches = false;

    // Check title against flagged database
    if (flaggedTitles.includes(titleLower)) {
      copyrightStatus = 'flagged';
      message = 'This title matches a known copyrighted work';
    } else if (
      flaggedTitles.some(flagged =>
        titleLower.includes(flagged) || flagged.includes(titleLower)
      )
    ) {
      copyrightStatus = 'warning';
      message = 'Similar title found - verify you own the copyright';
    }

    // Audio file analysis
    if (audioFile) {
      try {
        const audioBuffer = await audioFile.arrayBuffer();
        const fingerprint = await generateAudioFingerprint(audioBuffer);

        // Simulated audio fingerprint database check
        // In production, check against Shazam, AcoustID, or similar services
        const flaggedFingerprints = [
          // Example fingerprints of known songs (would be real in production)
          'despacito_fingerprint_hash',
          'bohemian_rhapsody_hash',
        ];

        if (flaggedFingerprints.includes(fingerprint)) {
          copyrightStatus = 'flagged';
          audioMatches = true;
          message = 'Audio matches a known copyrighted recording';
        }

        // Check file size and format validity
        if (audioFile.size > 100 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Audio file too large (max 100MB)' },
            { status: 400 }
          );
        }

        if (!audioFile.type.startsWith('audio/')) {
          return NextResponse.json(
            { error: 'Invalid audio file format' },
            { status: 400 }
          );
        }
      } catch (err) {
        console.error('Audio analysis error:', err);
      }
    }

    return NextResponse.json({
      ok: true,
      copyrightStatus,
      message,
      title,
      artist,
      audioMatches,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Copyright check error:', err);
    return NextResponse.json(
      { error: 'Copyright check failed' },
      { status: 500 }
    );
  }
}
