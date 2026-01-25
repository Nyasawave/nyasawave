'use client';

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TournamentDetailPage() {
    const { data: session } = useSession();
    const params = useParams();
    const id = params.id as string;
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"info" | "participants" | "rankings" | "voting">("info");

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await fetch(`/api/tournaments/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTournament(data.tournament);
                }
            } catch (error) {
                console.error("Failed to fetch tournament:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTournament();
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-black pt-20 flex items-center justify-center">
                <p className="text-zinc-400">Loading tournament...</p>
            </main>
        );
    }

    if (!tournament) {
        return (
            <main className="min-h-screen bg-black pt-20 flex items-center justify-center">
                <p className="text-zinc-400">Tournament not found</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">{tournament.name}</h1>
                    <p className="text-xl text-zinc-400">{tournament.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <p className="text-zinc-500 text-sm">Prize Pool</p>
                        <p className="text-2xl font-bold text-green-400">${tournament.prizePool || 0}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <p className="text-zinc-500 text-sm">Participants</p>
                        <p className="text-2xl font-bold text-blue-400">{tournament.participantCount || 0}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <p className="text-zinc-500 text-sm">Status</p>
                        <p className={`text-2xl font-bold ${tournament.status === "active" ? "text-green-400" : "text-zinc-400"}`}>
                            {tournament.status}
                        </p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <p className="text-zinc-500 text-sm">Entry Fee</p>
                        <p className="text-2xl font-bold text-purple-400">${tournament.entryFee || 0}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="flex border-b border-zinc-800">
                        {(["info", "participants", "rankings", "voting"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 px-6 text-center font-semibold transition ${activeTab === tab
                                        ? "text-white border-b-2 border-green-500"
                                        : "text-zinc-400 hover:text-zinc-300"
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {activeTab === "info" && (
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Tournament Information</h3>
                                <div className="space-y-4 text-zinc-300">
                                    <p>
                                        <span className="text-zinc-500">Start Date:</span> {tournament.startDate || "TBD"}
                                    </p>
                                    <p>
                                        <span className="text-zinc-500">End Date:</span> {tournament.endDate || "TBD"}
                                    </p>
                                    <p>
                                        <span className="text-zinc-500">Max Participants:</span> {tournament.maxParticipants || "Unlimited"}
                                    </p>
                                    <p className="mt-4">
                                        <span className="text-zinc-500">Description:</span>
                                        <p className="mt-2">{tournament.fullDescription || tournament.description}</p>
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "participants" && (
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Participants</h3>
                                <p className="text-zinc-400">Tournament participants will be listed here.</p>
                            </div>
                        )}

                        {activeTab === "rankings" && (
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Rankings</h3>
                                <p className="text-zinc-400">Current rankings will be displayed here.</p>
                            </div>
                        )}

                        {activeTab === "voting" && (
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Vote for Songs</h3>
                                <p className="text-zinc-400">Voting information will be displayed here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                    {session?.user?.roles?.includes("ARTIST") && (
                        <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition">
                            Join Tournament
                        </button>
                    )}
                    {tournament.status === "active" && (
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
                            Vote Now
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
