"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlaylists } from "@/context/PlaylistContext";
import { useSongs } from "@/context/SongContext";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Input from "@/components/Input";

export default function PlaylistsPage() {
  const { playlists } = usePlaylists();
  const { songs } = useSongs();
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<(typeof playlists)[0] | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const createPlaylist = () => {
    if (!playlistName.trim()) return;
    const newPlaylist = {
      id: `pl-${Date.now()}`,
      title: playlistName,
      description: "My custom playlist",
      songIds: [],
      curated: false,
    };
    setUserPlaylists([...userPlaylists, newPlaylist]);
    setPlaylistName("");
    setOpenCreate(false);
  };

  return (
    <main className="min-h-screen p-6 pt-32 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Playlists</h1>
          <p className="text-zinc-400">Create and manage your playlists.</p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>+ Create Playlist</Button>
      </div>

      {/* FEATURED PLAYLISTS */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.slice(0, 8).map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => {
                setSelectedPlaylist(playlist);
                setOpenDetail(true);
              }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 cursor-pointer hover:border-emerald-400 transition"
            >
              <div className="w-full h-32 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded mb-3 flex items-center justify-center text-3xl">
                🎵
              </div>
              <h3 className="font-semibold truncate">{playlist.title}</h3>
              <p className="text-xs text-zinc-400 mt-1">{playlist.songIds?.length || 0} tracks</p>
            </div>
          ))}
        </div>
      </section>

      {/* USER PLAYLISTS */}
      {userPlaylists.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">My Playlists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className="rounded-2xl border border-emerald-600/30 bg-emerald-900/10 p-4 cursor-pointer hover:bg-emerald-900/20 transition"
              >
                <div className="w-full h-32 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded mb-3 flex items-center justify-center text-3xl">
                  📝
                </div>
                <h3 className="font-semibold truncate">{playlist.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">{playlist.songIds?.length || 0} tracks</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CREATE PLAYLIST MODAL */}
      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Create Playlist">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Playlist Name</label>
            <Input
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="My awesome playlist"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button onClick={createPlaylist} disabled={!playlistName.trim()}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* PLAYLIST DETAIL MODAL */}
      <Modal open={openDetail} onClose={() => setOpenDetail(false)} title={selectedPlaylist?.title || ""}>
        {selectedPlaylist && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">{selectedPlaylist.description}</p>
            <div>
              <p className="text-sm text-zinc-400 mb-2">Tracks</p>
              {selectedPlaylist.songIds && selectedPlaylist.songIds.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedPlaylist.songIds.map((songId: string, idx: number) => {
                    const song = songs.find((s) => s.id === songId);
                    return song ? (
                      <div key={idx} className="text-sm py-2 border-b border-zinc-800">
                        <p>{song.title}</p>
                        <p className="text-xs text-zinc-400">{song.artist}</p>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No tracks in this playlist yet.</p>
              )}
            </div>
            <Button onClick={() => setOpenDetail(false)}>Close</Button>
          </div>
        )}
      </Modal>
    </main>
  );
}
