'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ExtendedSession } from '@/app/types/auth';

interface Settings {
    userId: string;
    name: string;
    email: string;
    username: string;
    bio: string;
    profileImage: string | null;
    theme: string;
    notifications: boolean;
    emailNotifications: boolean;
    privateProfile: boolean;
}

export default function MarketerSettingsPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        if (session && !session.user?.roles?.includes('MARKETER')) {
            router.push('/unauthorized');
            return;
        }

        const loadSettings = async () => {
            try {
                const res = await fetch('/api/user/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                } else {
                    setMessage('Failed to load settings');
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
                setMessage('Error loading settings');
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            loadSettings();
        }
    }, [session, router]);

    const handleChange = (field: string, value: any) => {
        if (settings) {
            setSettings({ ...settings, [field]: value });
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                setMessage('✓ Settings saved successfully');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('✗ Failed to save settings');
            }
        } catch (error) {
            console.error('Save error:', error);
            setMessage('✗ Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading settings...</div>;
    }

    if (!settings) {
        return <div className="p-8 text-center text-red-500">Failed to load settings</div>;
    }

    return (
        <div className="min-h-screen bg-black pt-20 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">Marketer Settings</h1>
                <p className="text-zinc-400 mb-8">Manage your profile and campaign preferences</p>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.startsWith('✓') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                        {message}
                    </div>
                )}

                <div className="bg-zinc-900 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Profile</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                            <input
                                type="text"
                                value={settings.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)} aria-label="Marketer Name" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Username</label>
                            <input
                                type="text"
                                value={settings.username || ''}
                                onChange={(e) => handleChange('username', e.target.value)}
                                aria-label="Username"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
                            <textarea
                                value={settings.bio || ''}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                aria-label="Bio"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white h-24"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Account</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={settings.email || ''}
                                disabled
                                aria-label="Email"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-zinc-500"
                            />
                            <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                    <div className="space-y-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={(e) => handleChange('notifications', e.target.checked)}
                                className="mr-3 w-4 h-4"
                            />
                            <span className="text-zinc-300">Enable notifications</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                                className="mr-3 w-4 h-4"
                            />
                            <span className="text-zinc-300">Email notifications</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={settings.privateProfile}
                                onChange={(e) => handleChange('privateProfile', e.target.checked)}
                                className="mr-3 w-4 h-4"
                            />
                            <span className="text-zinc-300">Private profile</span>
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold py-3 rounded-lg transition"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
