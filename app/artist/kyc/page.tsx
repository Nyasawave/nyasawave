'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ExtendedSession } from '@/app/types/auth';

export default function ArtistKYCPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const user = session?.user;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        nationality: 'Malawi',
        country: 'Malawi',
        city: '',
        address: '',
        phone: '',
        idType: 'national_id',
        idNumber: '',
    });

    const [files, setFiles] = useState({
        idFront: null as File | null,
        idBack: null as File | null,
        profilePhoto: null as File | null,
    });

    if (!user) {
        return (
            <main className="min-h-screen pt-32 pb-16 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Sign In Required</h1>
                    <p className="text-zinc-400 mb-8">Please sign in to submit your KYC information.</p>
                    <Link href="/signin" className="bg-emerald-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-emerald-300 transition inline-block">
                        Sign In
                    </Link>
                </div>
            </main>
        );
    }

    if (!user.roles?.includes('ARTIST')) {
        return (
            <main className="min-h-screen pt-32 pb-16 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Artists Only</h1>
                    <p className="text-zinc-400 mb-8">This page is for registered artists. Please upgrade your account.</p>
                    <Link href="/artist/dashboard" className="bg-emerald-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-emerald-300 transition inline-block">
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'idFront' | 'idBack' | 'profilePhoto') => {
        if (e.target.files?.[0]) {
            setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate required fields
            if (!formData.fullName || !formData.dateOfBirth || !formData.phone || !formData.idNumber) {
                throw new Error('Please fill in all required fields');
            }

            if (!files.idFront || !files.idBack) {
                throw new Error('Please upload ID front and back');
            }

            // Create FormData for file upload
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('dateOfBirth', formData.dateOfBirth);
            data.append('nationality', formData.nationality);
            data.append('country', formData.country);
            data.append('city', formData.city);
            data.append('address', formData.address);
            data.append('phone', formData.phone);
            data.append('idType', formData.idType);
            data.append('idNumber', formData.idNumber);
            data.append('idFront', files.idFront);
            data.append('idBack', files.idBack);
            if (files.profilePhoto) {
                data.append('profilePhoto', files.profilePhoto);
            }

            const response = await fetch('/api/artist/kyc', {
                method: 'POST',
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit KYC');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/artist/dashboard');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black pt-32 pb-16 px-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Artist Verification (KYC)</h1>
                    <p className="text-zinc-400">Submit your identity documents to unlock monetization features.</p>
                </div>

                {success && (
                    <div className="bg-emerald-900/20 border border-emerald-500 text-emerald-300 p-4 rounded-lg mb-6">
                        ✓ KYC submitted successfully! Redirecting...
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 space-y-6">

                    {/* Personal Information */}
                    <fieldset className="space-y-4">
                        <legend className="text-lg font-semibold text-white mb-4">Personal Information</legend>

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-zinc-300 mb-2">
                                Full Legal Name *
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                placeholder="As it appears on ID"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-zinc-300 mb-2">
                                Date of Birth *
                            </label>
                            <input
                                id="dateOfBirth"
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="nationality" className="block text-sm font-medium text-zinc-300 mb-2">
                                Nationality
                            </label>
                            <input
                                id="nationality"
                                type="text"
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                                Phone Number *
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                placeholder="+265..."
                                required
                            />
                        </div>
                    </fieldset>

                    {/* Address Information */}
                    <fieldset className="space-y-4">
                        <legend className="text-lg font-semibold text-white mb-4">Address</legend>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-zinc-300 mb-2">
                                Country
                            </label>
                            <input
                                id="country"
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-zinc-300 mb-2">
                                City
                            </label>
                            <input
                                id="city"
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                placeholder="Lilongwe, Blantyre, etc."
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-zinc-300 mb-2">
                                Street Address
                            </label>
                            <input
                                id="address"
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                            />
                        </div>
                    </fieldset>

                    {/* Identification */}
                    <fieldset className="space-y-4">
                        <legend className="text-lg font-semibold text-white mb-4">Identification</legend>

                        <div>
                            <label htmlFor="idType" className="block text-sm font-medium text-zinc-300 mb-2">
                                ID Type
                            </label>
                            <select
                                id="idType"
                                name="idType"
                                value={formData.idType}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                            >
                                <option value="national_id">National ID</option>
                                <option value="passport">Passport</option>
                                <option value="driver_license">Driver's License</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="idNumber" className="block text-sm font-medium text-zinc-300 mb-2">
                                ID Number *
                            </label>
                            <input
                                id="idNumber"
                                type="text"
                                name="idNumber"
                                value={formData.idNumber}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="idFront" className="block text-sm font-medium text-zinc-300 mb-2">
                                ID Front Photo *
                            </label>
                            <input
                                id="idFront"
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileChange(e, 'idFront')}
                                className="w-full"
                                required
                            />
                            {files.idFront && <p className="text-sm text-emerald-400 mt-1">✓ {files.idFront.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="idBack" className="block text-sm font-medium text-zinc-300 mb-2">
                                ID Back Photo *
                            </label>
                            <input
                                id="idBack"
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileChange(e, 'idBack')}
                                className="w-full"
                                required
                            />
                            {files.idBack && <p className="text-sm text-emerald-400 mt-1">✓ {files.idBack.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="profilePhoto" className="block text-sm font-medium text-zinc-300 mb-2">
                                Profile Photo (Optional)
                            </label>
                            <input
                                id="profilePhoto"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'profilePhoto')}
                                className="w-full"
                            />
                            {files.profilePhoto && <p className="text-sm text-emerald-400 mt-1">✓ {files.profilePhoto.name}</p>}
                        </div>
                    </fieldset>

                    {/* Submit */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-400 text-black font-semibold py-3 rounded-lg hover:bg-emerald-300 transition disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit for Verification'}
                        </button>
                        <p className="text-xs text-zinc-500 mt-4 text-center">
                            Your information is secure and encrypted. We comply with GDPR and local privacy laws.
                        </p>
                    </div>
                </form>
            </div>
        </main>
    );
}
