export interface Artist {
  id: string;
  name: string;
  slug: string;
  genre: string;
  verified: boolean;
  upcoming: boolean;
  image?: string;
  bio?: string;
  monthlyListeners?: number;
  followers?: number;
}

export const artists: Artist[] = [
  {
    id: "1",
    name: "Nozipho Mkhize",
    slug: "nozipho-mkhize",
    genre: "Afrobeats",
    verified: true,
    upcoming: false,
    bio: "Rising Malawian producer blending traditional sounds with modern beats.",
    monthlyListeners: 245000,
    followers: 18000,
  },
  {
    id: "2",
    name: "Kanye Banda",
    slug: "kanye-banda",
    genre: "Hip-Hop",
    verified: true,
    upcoming: false,
    bio: "Storyteller from Lilongwe. Independent artist with 4 releases.",
    monthlyListeners: 156000,
    followers: 12500,
  },
  {
    id: "3",
    name: "Lungu Tunes",
    slug: "lungu-tunes",
    genre: "Electronic/Afro",
    verified: false,
    upcoming: true,
    bio: "Bedroom producer. First EP coming February 2026.",
    monthlyListeners: 8500,
    followers: 2100,
  },
  {
    id: "4",
    name: "Malawi Sounds Collective",
    slug: "malawi-sounds-collective",
    genre: "Folk/Instrumental",
    verified: true,
    upcoming: false,
    bio: "5-piece band preserving traditional Malawian music.",
    monthlyListeners: 89000,
    followers: 7200,
  },
  {
    id: "5",
    name: "Chipo Livingstone",
    slug: "chipo-livingstone",
    genre: "Reggae/Soul",
    verified: false,
    upcoming: false,
    bio: "Soulful vocalist. Independent releases on Spotify.",
    monthlyListeners: 42000,
    followers: 5800,
  },
  {
    id: "6",
    name: "Rhythm Collective",
    slug: "rhythm-collective",
    genre: "Fusion",
    verified: true,
    upcoming: false,
    bio: "Genre-blending collective from Blantyre.",
    monthlyListeners: 127000,
    followers: 9400,
  },
  {
    id: "7",
    name: "Local Beats Studio",
    slug: "local-beats-studio",
    genre: "Hip-Hop/Trap",
    verified: false,
    upcoming: false,
    bio: "Production duo. Beat makers for emerging artists.",
    monthlyListeners: 56000,
    followers: 4300,
  },
  {
    id: "8",
    name: "Tendai Kachisa",
    slug: "tendai-kachisa",
    genre: "Amapiano",
    verified: false,
    upcoming: true,
    bio: "Amapiano producer inspired by South African beats.",
    monthlyListeners: 15000,
    followers: 3100,
  },
];
