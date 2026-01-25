export interface Playlist {
  id: string;
  title: string;
  description: string;
  songIds: string[];
  curated: boolean;
  image?: string;
}

export const playlists: Playlist[] = [
  {
    id: "p1",
    title: "Malawi Rising",
    description: "Upcoming artists shaping the future of African music.",
    curated: true,
    songIds: ["s6", "s8", "s2"],
  },
  {
    id: "p2",
    title: "Afrobeats Essentials",
    description: "Must-play tracks from Malawi's best producers.",
    curated: true,
    songIds: ["s1", "s9", "s5"],
  },
  {
    id: "p3",
    title: "Late Night Vibes",
    description: "Smooth sounds for evening sessions.",
    curated: true,
    songIds: ["s3", "s8", "s5", "s10"],
  },
  {
    id: "p4",
    title: "Hip-Hop Legends",
    description: "Best hip-hop from independent Malawian artists.",
    curated: true,
    songIds: ["s4", "s7"],
  },
  {
    id: "p5",
    title: "Fusion Experiments",
    description: "Genre-blending tracks that push boundaries.",
    curated: true,
    songIds: ["s3", "s10", "s1"],
  },
];
