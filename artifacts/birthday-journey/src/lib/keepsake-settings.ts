import {
  personal as defaultPersonal,
  media as defaultMedia,
  surprises as defaultSurprises,
  bouquetFlowers as defaultBouquetFlowers,
  flowerMessages as defaultFlowerMessages,
  letterNotes as defaultLetterNotes,
  loveReasons as defaultLoveReasons,
  alphabetWishes as defaultAlphabetWishes,
  photoShowerMoments as defaultPhotoShowerMoments,
  songs as defaultSongs,
  calendarEntries as defaultCalendarEntries,
  memoryMapStops as defaultMemoryMapStops,
  reservedDesignAssets as defaultReservedDesignAssets,
  characterLoveParts as defaultCharacterLoveParts,
} from '../content';

export type GiftKind =
  | 'photo-shower' | 'magazine' | 'bouquet' | 'letters' | 'jar' | 'poem'
  | 'spotify-book' | 'card' | 'alphabet' | 'scrapbook' | 'poster' | 'booth'
  | 'calendar' | 'character' | 'map' | 'cake' | 'custom';

export interface GiftCard {
  id: string;
  kind: GiftKind;
  art: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  placeholder: string;
  message: string;
  image: string;
}

export interface KeepsakeSettings {
  personal: Record<string, string>;
  media: Record<string, string>;
  gifts: GiftCard[];
  bouquetFlowers: string[];
  flowerMessages: string[];
  letterNotes: { photo: string; message: string }[];
  loveReasons: string[];
  alphabetWishes: { letter: string; wish: string }[];
  photoShowerMoments: { photo: string; message: string }[];
  songs: { title: string; dedication: string; lyric: string; spotifyUrl: string; photo: string; audio: string }[];
  calendarEntries: { date: string; photo: string; message: string }[];
  memoryMapStops: { photo: string; message: string }[];
  reservedDesignAssets: { magazine: string; scrapbook: string; poster: string; photoBooth: string };
  characterLoveParts: string[];
}

const giftLabels: Record<Exclude<GiftKind, 'custom'>, { title: string; subtitle: string; placeholder: string }> = {
  'photo-shower': { title: 'Photo shower', subtitle: 'Pull the string to reveal favorite moments', placeholder: '[ADD PHOTO SHOWER PHOTOS]' },
  magazine: { title: 'Birthday magazine', subtitle: 'Issue 18 · made for you', placeholder: '[ADD MAGAZINE PAGE CONTENT]' },
  bouquet: { title: 'A bouquet for you', subtitle: 'Eighteen little blooms', placeholder: '[ADD FLOWER MESSAGES]' },
  letters: { title: 'The letter box', subtitle: 'Eighteen letters, one at a time', placeholder: '[ADD 18 LETTERS]' },
  jar: { title: 'The love jar', subtitle: 'Eighteen things I adore', placeholder: '[ADD 18 LOVE NOTES]' },
  poem: { title: 'A poem page', subtitle: 'A few words, all yours', placeholder: '[ADD YOUR POEM]' },
  'spotify-book': { title: 'Our songbook', subtitle: 'Our soundtrack, page by page', placeholder: '[ADD SONG ARTWORK]' },
  card: { title: 'A birthday card', subtitle: 'Open it and let it unfold', placeholder: '[ADD YOUR CARD ART]' },
  alphabet: { title: 'The A-to-Z book', subtitle: 'Twenty-six wishes for you', placeholder: '[ADD A–Z WISHES]' },
  scrapbook: { title: 'Our scrapbook', subtitle: 'Little pieces of us', placeholder: '[ADD SCRAPBOOK PAGES]' },
  poster: { title: 'A birthday poster', subtitle: 'Made to be kept', placeholder: '[ADD POSTER ART]' },
  booth: { title: 'Photo booth', subtitle: 'A strip of silly snapshots', placeholder: '[ADD PHOTO BOOTH PHOTOS]' },
  calendar: { title: 'Our days together', subtitle: 'A calendar of memories', placeholder: '[ADD DATES & MEMORIES]' },
  character: { title: 'A pop-out love card', subtitle: 'A very big, unfolding feeling', placeholder: '[ADD LOVE NOTES]' },
  map: { title: 'A map of memories', subtitle: 'Tap a pin to visit a moment', placeholder: '[ADD MEMORY STOPS]' },
  cake: { title: 'The birthday cake', subtitle: 'Eighteen candles, one wish', placeholder: '[ADD YOUR CAKE WISH]' },
};

const artForKind: Record<GiftKind, string> = {
  'photo-shower': 'photo', magazine: 'magazine', bouquet: 'bouquet', letters: 'letters',
  jar: 'jar', poem: 'poem', 'spotify-book': 'music', card: 'card', alphabet: 'alphabet',
  scrapbook: 'scrapbook', poster: 'poster', booth: 'booth', calendar: 'calendar',
  character: 'character', map: 'map', cake: 'cake', custom: 'custom',
};

export const getGiftLabel = (kind: GiftKind) =>
  kind === 'custom'
    ? { title: 'A custom keepsake', subtitle: 'A little something just for you', placeholder: 'Add your message' }
    : giftLabels[kind];

export const getArtForKind = (kind: GiftKind) => artForKind[kind];
export const giftKinds = Object.keys(artForKind) as GiftKind[];

export function createDefaultSettings(): KeepsakeSettings {
  return {
    personal: { ...defaultPersonal },
    media: { ...defaultMedia },
    gifts: defaultSurprises.map(({ id, art }) => {
      const kind = id as GiftKind;
      const label = getGiftLabel(kind);
      return {
        id,
        kind,
        art,
        title: label.title,
        subtitle: label.subtitle,
        enabled: true,
        placeholder: label.placeholder,
        message: '',
        image: '',
      };
    }),
    bouquetFlowers: [...defaultBouquetFlowers],
    flowerMessages: [...defaultFlowerMessages],
    letterNotes: defaultLetterNotes.map((note) => ({ ...note })),
    loveReasons: [...defaultLoveReasons],
    alphabetWishes: defaultAlphabetWishes.map((wish) => ({ ...wish })),
    photoShowerMoments: defaultPhotoShowerMoments.map((moment) => ({ ...moment })),
    songs: defaultSongs.map((song) => ({ ...song, spotifyUrl: '' })),
    calendarEntries: defaultCalendarEntries.map((entry) => ({ ...entry })),
    memoryMapStops: defaultMemoryMapStops.map((stop) => ({ ...stop })),
    reservedDesignAssets: { ...defaultReservedDesignAssets },
    characterLoveParts: [...defaultCharacterLoveParts],
  };
}

const SETTINGS_KEY = 'birthday-journey-personalization-v1';

export function loadSettings(): KeepsakeSettings {
  const defaults = createDefaultSettings();
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    if (!stored) return defaults;
    const saved = JSON.parse(stored) as Partial<KeepsakeSettings>;
    return {
      ...defaults,
      ...saved,
      personal: { ...defaults.personal, ...saved.personal },
      media: { ...defaults.media, ...saved.media },
      gifts: Array.isArray(saved.gifts) ? saved.gifts : defaults.gifts,
      bouquetFlowers: Array.isArray(saved.bouquetFlowers) ? saved.bouquetFlowers : defaults.bouquetFlowers,
      flowerMessages: Array.isArray(saved.flowerMessages) ? saved.flowerMessages : defaults.flowerMessages,
      letterNotes: Array.isArray(saved.letterNotes) ? saved.letterNotes : defaults.letterNotes,
      loveReasons: Array.isArray(saved.loveReasons) ? saved.loveReasons : defaults.loveReasons,
      alphabetWishes: Array.isArray(saved.alphabetWishes) ? saved.alphabetWishes : defaults.alphabetWishes,
      photoShowerMoments: Array.isArray(saved.photoShowerMoments) ? saved.photoShowerMoments : defaults.photoShowerMoments,
      songs: Array.isArray(saved.songs) && saved.songs.length
        ? saved.songs.map((song) => ({ ...song, spotifyUrl: song.spotifyUrl ?? '' }))
        : defaults.songs,
      calendarEntries: Array.isArray(saved.calendarEntries) ? saved.calendarEntries : defaults.calendarEntries,
      memoryMapStops: Array.isArray(saved.memoryMapStops) ? saved.memoryMapStops : defaults.memoryMapStops,
      reservedDesignAssets: { ...defaults.reservedDesignAssets, ...saved.reservedDesignAssets },
      characterLoveParts: Array.isArray(saved.characterLoveParts) ? saved.characterLoveParts : defaults.characterLoveParts,
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: KeepsakeSettings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

export function listLocalAssetKeys(value: unknown): string[] {
  const found = new Set<string>();
  const visit = (item: unknown) => {
    if (typeof item === 'string' && item.startsWith('local:')) found.add(item.slice('local:'.length));
    else if (Array.isArray(item)) item.forEach(visit);
    else if (item && typeof item === 'object') Object.values(item).forEach(visit);
  };
  visit(value);
  return [...found];
}
