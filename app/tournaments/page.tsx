'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { ExtendedSession } from "@/app/types/auth";

export default function TournamentsPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await fetch("/api/tournaments");
                if (response.ok) {
                    const data = await response.json();
                    setTournaments(data.tournaments || []);
                }
            } catch (error) {
                console.error("Failed to fetch tournaments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Music Tournaments</h1>
                    <p className="text-xl text-zinc-400">
                        Compete with other artists and showcase your talent
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-12">
                    <Link
                        href="/tournaments/create"
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                    >
                        Create Tournament
                    </Link>
                    {session?.user?.roles?.includes("ARTIST") && (
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
                            My Tournaments
                        </button>
                    )}
                </div>

                {/* Tournaments Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Loading tournaments...</p>
                    </div>
                ) : tournaments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.map((tournament) => (
                            <div
                                key={tournament.id}
                                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-green-500 transition cursor-pointer"
                                onClick={() => router.push(`/tournaments/${tournament.id}`)}
                            >
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {tournament.name}
                                </h3>
                                <p className="text-zinc-400 mb-4">{tournament.description}</p>

                                <div className="space-y-2 text-sm text-zinc-300">
                                    <p>
                                        <span className="text-zinc-500">Prize Pool:</span> ${tournament.prizePool || 0}
                                    </p>
                                    <p>
                                        <span className="text-zinc-500">Participants:</span> {tournament.participantCount || 0}
                                    </p>
                                    <p>
                                        <span className="text-zinc-500">Status:</span>{" "}
                                        <span className={tournament.status === "active" ? "text-green-400" : "text-zinc-400"}>
                                            {tournament.status}
                                        </span>
                                    </p>
                                </div>

                                <button className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded transition font-semibold">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-zinc-400 mb-4">No tournaments available yet</p>
                        {session?.user?.roles?.includes("ARTIST") && (
                            <p className="text-sm text-zinc-500">
                                Be the first to create a tournament!
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
