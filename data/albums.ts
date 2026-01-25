export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  year: number;
  genre: string;
  trackCount: number;
  image?: string;
}

export const albums: Album[] = [
  {
    id: "a1",
    title: "Urban Rhythms",
    artist: "Nozipho Mkhize",
    artistId: "1",
    year: 2025,
    genre: "Afrobeats",
    trackCount: 12,
  },
  {
    id: "a2",
    title: "Stories",
    artist: "Kanye Banda",
    artistId: "2",
    year: 2024,
    genre: "Hip-Hop",
    trackCount: 14,
  },
  {
    id: "a3",
    title: "Heritage",
    artist: "Malawi Sounds Collective",
    artistId: "4",
    year: 2025,
    genre: "Folk/Instrumental",
    trackCount: 10,
  },
  {
    id: "a4",
    title: "Fusion Sessions",
    artist: "Rhythm Collective",
    artistId: "6",
    year: 2025,
    genre: "Fusion",
    trackCount: 9,
  },
  {
    id: "a5",
    title: "Soul Sessions",
    artist: "Chipo Livingstone",
    artistId: "5",
    year: 2024,
    genre: "Soul",
    trackCount: 8,
  },
  {
    id: "a6",
    title: "First Light",
    artist: "Lungu Tunes",
    artistId: "3",
    year: 2025,
    genre: "Electronic",
    trackCount: 6,
  },
  {
    id: "a7",
    title: "City Sounds",
    artist: "Local Beats Studio",
    artistId: "7",
    year: 2024,
    genre: "Hip-Hop/Trap",
    trackCount: 11,
  },
  {
    id: "a8",
    title: "Amapiano Nights",
    artist: "Tendai Kachisa",
    artistId: "8",
    year: 2025,
    genre: "Amapiano",
    trackCount: 7,
  },
];
