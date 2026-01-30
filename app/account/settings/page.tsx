'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { ExtendedSession } from "@/app/types/auth";

export default function AccountSettingsPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        bio: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!session?.user) {
            router.push('/login');
            return;
        }

        // Initialize form with user data
        setFormData({
            name: session.user.name || '',
            email: session.user.email || '',
            username: (session.user as any)?.username || '',
            bio: (session.user as any)?.bio || '',
        });
        setLoading(false);
    }, [session, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Profile updated successfully');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black pt-20">
                <div className="text-center py-12">
                    <p className="text-zinc-400">Loading settings...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-white mb-8">Account Settings</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-white font-semibold mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-green-600 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-white font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-green-600 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-white font-semibold mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-green-600 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-white font-semibold mb-2">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself"
                            rows={4}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-green-600 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </main>
    );
}
