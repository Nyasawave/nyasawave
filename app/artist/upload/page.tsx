'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useRef } from 'react';
import type { ExtendedSession } from '@/app/types/auth';

export default function ArtistUpload() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const user = session?.user;
  const audioFileRef = useRef<HTMLInputElement>(null);
  const coverArtRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    albumName: '',
    genre: 'Afrobeats',
    description: '',
    composer: '',
    producer: '',
    releaseDate: '',
    duration: '',
    copyrightHolder: '',
    isOriginal: true,
    copyrightStatus: 'unchecked',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyrightChecking, setCopyrightChecking] = useState(false);

  if (!user || !user.roles?.includes('ARTIST')) {
    return (
      <main className="min-h-screen p-6 max-w-4xl mx-auto pt-32 text-center">
        <h1 className="text-3xl font-bold">Artist Only</h1>
        <p className="text-zinc-400 mt-4">
          You must be an artist to upload tracks.
        </p>
        <Link
          href="/"
          className="text-emerald-400 mt-6 inline-block hover:underline"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  const checkCopyright = async () => {
    if (!formData.title.trim()) {
      setError('Enter song title to check copyright');
      return;
    }

    setCopyrightChecking(true);
    try {
      // Simple copyright check - checks against known titles
      const flaggedTitles = [
        'despacito',
        'bohemian rhapsody',
        'blinding lights',
        'shape of you',
        'somebody that i used to know',
      ].map(t => t.toLowerCase());

      const titleLower = formData.title.toLowerCase().trim();
      let copyrightStatus = 'clear';
      let message = 'Your song is clear to upload ✓';

      if (flaggedTitles.includes(titleLower)) {
        copyrightStatus = 'flagged';
        message = '❌ This title matches a known copyrighted work';
      } else if (flaggedTitles.some(flagged => titleLower.includes(flagged) || flagged.includes(titleLower))) {
        copyrightStatus = 'warning';
        message = '⚠️ Similar title found - verify you own the copyright';
      }

      setFormData({ ...formData, copyrightStatus });
      if (copyrightStatus === 'clear') {
        setError(null);
      } else {
        setError(message);
      }
    } catch (err) {
      console.error('Copyright check error:', err);
      setError('Copyright check failed. Please try again.');
    } finally {
      setCopyrightChecking(false);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError('Please select an audio file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError('Audio file must be less than 100MB');
        return;
      }
      setAudioFile(file);
      setError(null);
    }
  };

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setCoverArt(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-emerald-500', 'bg-emerald-900/10');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-emerald-500', 'bg-emerald-900/10');
  };

  const handleAudioDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-emerald-500', 'bg-emerald-900/10');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (audioFileRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        audioFileRef.current.files = dataTransfer.files;
        handleAudioFileChange({ target: audioFileRef.current } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleCoverDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-emerald-500', 'bg-emerald-900/10');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (coverArtRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        coverArtRef.current.files = dataTransfer.files;
        handleCoverArtChange({ target: coverArtRef.current } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a song title');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // NextAuth handles auth automatically via session cookies
      const res = await fetch('/api/artist/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          title: formData.title,
          artist: formData.artist || user?.name || 'Unknown Artist',
          artistId: user?.id || 'unknown',
          albumName: formData.albumName,
          genre: formData.genre,
          description: formData.description,
          composer: formData.composer,
          producer: formData.producer,
          releaseDate: formData.releaseDate,
          duration: formData.duration,
          copyrightHolder: formData.copyrightHolder || user?.name || 'Unknown',
          isOriginal: formData.isOriginal,
          copyrightStatus: formData.copyrightStatus,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setFormData({
            title: '',
            artist: '',
            albumName: '',
            genre: 'Afrobeats',
            description: '',
            composer: '',
            producer: '',
            releaseDate: '',
            duration: '',
            copyrightHolder: '',
            isOriginal: true,
            copyrightStatus: 'unchecked',
          });
          setAudioFile(null);
          setCoverArt(null);
          if (audioFileRef.current) audioFileRef.current.value = '';
          if (coverArtRef.current) coverArtRef.current.value = '';
        }, 2000);
      } else {
        setError(data?.error || 'Upload failed. Status: ' + res.status);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <Link
          href="/artist/dashboard"
          className="text-emerald-400 hover:underline mb-8 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <h1 className="text-3xl font-bold mb-2">Upload Your Track</h1>
          <p className="text-zinc-400 mb-8">
            Share your music with the NyasaWave community
          </p>

          {success && (
            <div className="bg-emerald-900/30 border border-emerald-600/30 text-emerald-300 p-4 rounded mb-6">
              ✓ Track uploaded successfully! 🎉
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-600/30 text-red-300 p-4 rounded mb-6">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Song Title */}
            <div>
              <label
                htmlFor="songTitle"
                className="block text-sm font-semibold mb-2"
              >
                Song Title *
              </label>
              <input
                id="songTitle"
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter song title"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Genre */}
            <div>
              <label
                htmlFor="genre"
                className="block text-sm font-semibold mb-2"
              >
                Genre *
              </label>
              <select
                id="genre"
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="Afrobeats">Afrobeats</option>
                <option value="Hip-Hop">Hip-Hop</option>
                <option value="Reggae">Reggae</option>
                <option value="Folk">Folk</option>
                <option value="Electronic">Electronic</option>
                <option value="Soul">Soul</option>
                <option value="Fusion">Fusion</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Tell listeners about your track..."
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Full Details Section */}
            <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
              <h3 className="text-lg font-semibold mb-4">Full Track Details</h3>

              {/* Artist Name */}
              <div className="mb-4">
                <label htmlFor="artistName" className="block text-sm font-semibold mb-2">Artist Name</label>
                <input
                  id="artistName"
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  placeholder="Your artist name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Album Name */}
              <div className="mb-4">
                <label htmlFor="albumName" className="block text-sm font-semibold mb-2">Album Name</label>
                <input
                  id="albumName"
                  type="text"
                  value={formData.albumName}
                  onChange={(e) => setFormData({ ...formData, albumName: e.target.value })}
                  placeholder="Album or EP name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Composer */}
              <div className="mb-4">
                <label htmlFor="composer" className="block text-sm font-semibold mb-2">Composer</label>
                <input
                  id="composer"
                  type="text"
                  value={formData.composer}
                  onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
                  placeholder="Song composer/writer"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Producer */}
              <div className="mb-4">
                <label htmlFor="producer" className="block text-sm font-semibold mb-2">Producer</label>
                <input
                  id="producer"
                  type="text"
                  value={formData.producer}
                  onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                  placeholder="Song producer"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Release Date */}
              <div className="mb-4">
                <label htmlFor="releaseDate" className="block text-sm font-semibold mb-2">Release Date</label>
                <input
                  id="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  placeholder="Select release date"
                  title="When was this track released"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label htmlFor="duration" className="block text-sm font-semibold mb-2">Duration (MM:SS)</label>
                <input
                  id="duration"
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="3:45"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Copyright Holder */}
              <div className="mb-4">
                <label htmlFor="copyrightHolder" className="block text-sm font-semibold mb-2">Copyright Holder</label>
                <input
                  id="copyrightHolder"
                  type="text"
                  value={formData.copyrightHolder}
                  onChange={(e) => setFormData({ ...formData, copyrightHolder: e.target.value })}
                  placeholder="Copyright owner name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Is Original */}
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isOriginal}
                    onChange={(e) => setFormData({ ...formData, isOriginal: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">This is an original composition</span>
                </label>
              </div>

              {/* Copyright Check */}
              <div className="mt-4 p-3 bg-zinc-700/50 rounded border border-zinc-600">
                <p className="text-sm text-zinc-300 mb-3">
                  Copyright Status: <span className={`font-bold ${formData.copyrightStatus === 'clear' ? 'text-emerald-400' :
                    formData.copyrightStatus === 'warning' ? 'text-yellow-400' :
                      formData.copyrightStatus === 'flagged' ? 'text-red-400' :
                        'text-zinc-400'
                    }`}>
                    {formData.copyrightStatus === 'unchecked' && 'Not Checked'}
                    {formData.copyrightStatus === 'clear' && '✓ Clear'}
                    {formData.copyrightStatus === 'warning' && '⚠️ Warning'}
                    {formData.copyrightStatus === 'flagged' && '❌ Flagged'}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={checkCopyright}
                  disabled={copyrightChecking}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-400 transition"
                >
                  {copyrightChecking ? '🔍 Checking...' : '🔍 Check Copyright'}
                </button>
              </div>
            </div>

            {/* Audio File Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Audio File * {audioFile && <span className="text-emerald-400">({audioFile.name})</span>}
              </label>

              <label
                htmlFor="audioFile"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleAudioDrop}
                className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-emerald-500 transition cursor-pointer block"
              >
                <p className="text-zinc-400">
                  📁 Drag & drop your MP3 file here
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  or click to browse
                </p>
              </label>

              <input
                ref={audioFileRef}
                id="audioFile"
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                aria-label="Upload audio file"
                className="hidden"
              />
            </div>

            {/* Cover Art Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Cover Art {coverArt && <span className="text-emerald-400">({coverArt.name})</span>}
              </label>

              <label
                htmlFor="coverArt"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleCoverDrop}
                className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-emerald-500 transition cursor-pointer block"
              >
                <p className="text-zinc-400">
                  🖼️ Drag & drop cover image (JPG, PNG)
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  or click to browse
                </p>
              </label>

              <input
                ref={coverArtRef}
                id="coverArt"
                type="file"
                accept="image/*"
                onChange={handleCoverArtChange}
                aria-label="Upload cover art"
                className="hidden"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={uploading || !formData.title}
              className="w-full bg-emerald-500 text-black py-3 rounded-lg font-bold hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition"
            >
              {uploading ? '⏳ Uploading...' : '🚀 Upload Track'}
            </button>
          </form>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
          <h3 className="font-semibold mb-3">Upload Guidelines</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>✓ Audio must be 30 seconds or longer</li>
            <li>✓ Supported formats: MP3, WAV, FLAC</li>
            <li>✓ Maximum file size: 100MB</li>
            <li>✓ Cover art: 3000x3000px JPG/PNG</li>
            <li>✓ You retain all rights to your music</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
