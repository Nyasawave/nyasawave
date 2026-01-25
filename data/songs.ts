export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album?: string;
  genre: string;
  src: string;
  streamUrl?: string;
  cover?: string;
  duration: number; // seconds
  plays: number;
  likes: number;
  // Optional fields for scheduling and promotion
  scheduledAt?: string; // ISO datetime when the song is set to release
  isBoosted?: boolean; // whether the track is currently boosted
  boostExpiresAt?: string; // ISO datetime when boost expires
}

export const songs: Song[] = [
  {
    id: "s1",
    title: "Nyasa Vibes",
    artist: "Nozipho Mkhize",
    artistId: "1",
    album: "Urban Rhythms",
    genre: "Afrobeats",
    src: "/audio/sample.mp3",
    streamUrl: "/audio/sample.mp3",
    cover: "/covers/cover1.jpg",
    duration: 243,
    plays: 524000,
    likes: 18200,
  },
  {
    id: "s2",
    title: "Lake Flow",
    artist: "Malawi Sounds Collective",
    artistId: "4",
    album: "Heritage",
    genre: "Folk/Instrumental",
    src: "/audio/sample.mp3",
    streamUrl: "/audio/sample.mp3",
    cover: "/covers/cover2.jpg",
    duration: 267,
    plays: 156000,
    likes: 7200,
  },
  {
    id: "s3",
    title: "African Sunset",
    artist: "Rhythm Collective",
    artistId: "6",
    album: "Fusion Sessions",
    genre: "Fusion",
    src: "/audio/sample.mp3",
    streamUrl: "/audio/sample.mp3",
    cover: "/covers/cover3.jpg",
    duration: 298,
    plays: 89000,
    likes: 5100,
  },
  {
    id: "s4",
    title: "Malawi Dreams",
    artist: "Kanye Banda",
    artistId: "2",
    album: "Stories",
    genre: "Hip-Hop",
    src: "/audio/sample.mp3",
    streamUrl: "/audio/sample.mp3",
    cover: "/covers/cover4.jpg",
    duration: 215,
    plays: 234000,
    likes: 12100,
  },
  {
    id: "s5",
    title: "Rise Up",
    artist: "Chipo Livingstone",
    artistId: "5",
    album: "Soul Sessions",
    genre: "Soul",
    src: "/audio/sample.mp3",
    streamUrl: "/audio/sample.mp3",
    cover: "/covers/cover5.jpg",
    duration: 289,
    plays: 145000,
    likes: 9800,
  },
  {
    id: "s6",
    title: "Digital Dreams",
    artist: "Lungu Tunes",
    artistId: "3",
    album: "First Light",
    genre: "Electronic",
    src: "/audio/sample.mp3",
    streamUrl: "/audio/sample.mp3",
    cover: "/covers/cover6.jpg",
    duration: 256,
    plays: 42000,
    likes: 3200,
  },
  {
    id: "s7",
    title: "Blantyre Nights",
    artist: "Local Beats Studio",
    artistId: "7",
    album: "City Sounds",
    genre: "Hip-Hop/Trap",
    src: "/audio/sample.mp3",
    streamUrl: "/audio/sample.mp3",
    cover: "/covers/cover7.jpg",
    plays: 178000,
    likes: 8900,
    duration: 203,
  },
  {
    id: "s8",
    title: "Piano Journey",
    artist: "Tendai Kachisa",
    artistId: "8",
    album: "Amapiano Nights",
    genre: "Amapiano",
    src: "/audio/sample.mp3",
    plays: 67000,
    likes: 4300,
    duration: 272,
  },
  {
    id: "s9",
    title: "Lilongwe Rhythm",
    artist: "Nozipho Mkhize",
    artistId: "1",
    album: "Urban Rhythms",
    genre: "Afrobeats",
    src: "/audio/sample.mp3",
    plays: 612000,
    likes: 21000,
    duration: 278,
  },
  {
    id: "s10",
    title: "Coastal Vibes",
    artist: "Rhythm Collective",
    artistId: "6",
    album: "Fusion Sessions",
    genre: "Fusion",
    src: "/audio/sample.mp3",
    plays: 98000,
    likes: 6200,
    duration: 241,
  },
];
