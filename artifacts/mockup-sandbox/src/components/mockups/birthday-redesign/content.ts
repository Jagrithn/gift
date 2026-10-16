/**
 * PERSONALIZATION GUIDE
 * Replace bracketed copy and media references below with your own.
 * Photo/audio/video files are selected locally in the page; nothing uploads.
 * For Photo shower, choose multiple local photos; edit each photo's short message
 * directly below its preview. Photo booth intentionally keeps a separate picker.
 * Poster, photo booth, and map photos are chosen locally; object URLs are revoked.
 * Replace magazinePages, scrapbookPages, calendarEntries, and characterLoveParts
 * below to personalize each separate page and memory.
 * Gifts use visible [ADD ...] prompts so unfinished personal assets stay obvious.
 */
export const personal = {
  herName: '[HER NAME]',
  fromName: '[YOUR NAME]',
  greeting: 'Hi, birthday girl! Happy 18th birthday!',
  introLine: 'A little world I made, just for you.',
  madeByNote: '[WRITE YOUR MADE-BY-ME NOTE HERE]',
  collectionIntro: 'Open these in any order. I made every one with you in mind.',
  birthdayRecordingLabel: '[OPTIONAL BIRTHDAY RECORDING]',
  videoCaption: '[ADD A TEXT ALTERNATIVE OR CAPTION FOR YOUR BIRTHDAY VIDEO]',
  finalLetterTitle: 'For my favorite person',
  finalLetter: '[WRITE YOUR FINAL BIRTHDAY LETTER HERE]',
  signOff: 'All my love,',
  soundtrackLabel: '[ADD YOUR SOUNDTRACK]',
  videoLabel: '[ADD YOUR BIRTHDAY VIDEO]',
  songDedication: '[SONG DEDICATION]',
  lyricLine: '[ADD A LYRIC LINE YOU LOVE]',
  songLink: '[ADD A SONG LINK]',
  posterPhotoPlaceholder: '[ADD POSTER PHOTO]',
  posterMessagePlaceholder: '[ADD YOUR BIRTHDAY POSTER MESSAGE]',
} as const;

export const surprises = [
  { id: 'photo-shower', title: 'Photo shower', subtitle: 'Pull the string to reveal favorite moments', art: 'photo', placeholder: '[ADD PHOTO SHOWER PHOTOS]' },
  { id: 'magazine', title: 'Birthday magazine', subtitle: 'Issue 18 · made for you', art: 'magazine', placeholder: '[ADD MAGAZINE PAGE CONTENT]' },
  { id: 'bouquet', title: 'A bouquet for you', subtitle: 'Eighteen little blooms', art: 'bouquet', placeholder: '[ADD FLOWER MESSAGES]' },
  { id: 'letters', title: 'The letter box', subtitle: 'Eighteen letters, one at a time', art: 'letters', placeholder: '[ADD 18 LETTERS]' },
  { id: 'jar', title: 'The love jar', subtitle: 'Eighteen things I adore', art: 'jar', placeholder: '[ADD 18 LOVE NOTES]' },
  { id: 'poem', title: 'A poem page', subtitle: 'A few words, all yours', art: 'poem', placeholder: '[ADD YOUR POEM]' },
  { id: 'animation-a', title: 'Birthday animation A', subtitle: 'A little cake-and-flower birthday reveal', art: 'animation', placeholder: '[ADD A PERSONAL FINISHING NOTE]' },
  { id: 'animation-b', title: 'Birthday animation B', subtitle: 'A second, different birthday reveal', art: 'animation-alt', placeholder: '[ADD A PERSONAL FINISHING NOTE]' },
  { id: 'spotify-book', title: 'DIY Spotify book', subtitle: 'Our soundtrack, page by page', art: 'music', placeholder: '[ADD SONG ARTWORK]' },
  { id: 'card', title: 'A 3D-style card', subtitle: 'Open it and let it unfold', art: 'card', placeholder: '[ADD 3D-STYLE CARD ART]' },
  { id: 'alphabet', title: 'The A-to-Z book', subtitle: 'Twenty-six wishes for you', art: 'alphabet', placeholder: '[ADD A–Z WISHES]' },
  { id: 'scrapbook', title: 'Our scrapbook', subtitle: 'Little pieces of us', art: 'scrapbook', placeholder: '[ADD SCRAPBOOK PAGES]' },
  { id: 'poster', title: 'A birthday poster', subtitle: 'Made to be kept', art: 'poster', placeholder: '[ADD POSTER ART]' },
  { id: 'booth', title: 'Photo booth', subtitle: 'A strip of silly snapshots', art: 'booth', placeholder: '[ADD PHOTO BOOTH PHOTOS]' },
  { id: 'calendar', title: 'Our days together', subtitle: 'An event calendar & memories book', art: 'calendar', placeholder: '[ADD EVENT DATES & MEMORIES]' },
  { id: 'character', title: 'A pop-out character card', subtitle: 'A very big, unfolding feeling', art: 'character', placeholder: '[ADD CHARACTER ART IF PERSONALIZING THE BUILT-IN ILLUSTRATION]' },
  { id: 'map', title: 'A map of memories', subtitle: 'Tap a pin to visit a moment', art: 'map', placeholder: '[ADD MEMORY LOCATIONS]' },
  { id: 'cheesecake', title: 'Digital cheesecake', subtitle: 'A slice made just for today', art: 'cake', placeholder: '[ADD CHEESECAKE MESSAGE]' },
  { id: 'kunafa', title: 'Digital kunafa chocolate', subtitle: 'A sweet little ending to the collection', art: 'chocolate', placeholder: '[ADD KUNAFA CHOCOLATE MESSAGE]' },
] as const;

export const bouquetFlowers = [
  'Rose', 'Tulip', 'Daisy', 'Peony', 'Ranunculus', 'Anemone',
  'Cosmos', 'Camellia', 'Iris', 'Poppy', 'Carnation', 'Gardenia',
  'Dahlia', 'Freesia', 'Lilac', 'Sweet pea', 'Magnolia', 'Forget-me-not',
];

export const notePrompts = Array.from({ length: 18 }, (_, index) => `[ADD MESSAGE ${index + 1}]`);
export const alphabetWishes = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
export const getPhotoShowerMessagePlaceholder = (index: number) => `[ADD A SHORT MESSAGE FOR PHOTO ${index + 1}]`;
export const characterLoveParts = [
  '[ADD LOVE NOTE 1]',
  '[ADD LOVE NOTE 2]',
  '[ADD LOVE NOTE 3]',
  '[ADD LOVE NOTE 4]',
  '[ADD LOVE NOTE 5]',
];
export const magazineCover = {
  photo: '[ADD MAGAZINE COVER PHOTO]',
  heading: '[ADD COVER HEADING]',
  caption: '[ADD COVER CAPTION]',
};
export const magazinePages = Array.from({ length: 5 }, (_, index) => ({
  photo: `[ADD MAGAZINE PAGE ${index + 1} PHOTO]`,
  heading: `[ADD MAGAZINE PAGE ${index + 1} HEADING]`,
  caption: `[ADD MAGAZINE PAGE ${index + 1} CAPTION]`,
}));
export const scrapbookPages = Array.from({ length: 5 }, (_, index) => ({
  photo: `[ADD SCRAPBOOK PAGE ${index + 1} PHOTO]`,
  caption: `[ADD SCRAPBOOK PAGE ${index + 1} CAPTION]`,
  memory: `[ADD SCRAPBOOK PAGE ${index + 1} MEMORY]`,
}));
export const calendarEntries = Array.from({ length: 6 }, (_, index) => ({
  date: `[ADD DATE ${index + 1}]`,
  event: `[ADD EVENT ${index + 1}]`,
  memory: `[ADD MEMORY ${index + 1}]`,
}));
export const getPhotoBoothPlaceholder = (index: number) => `[ADD PHOTO BOOTH FRAME ${index + 1}]`;
export const getMapMemoryPlaceholder = (index: number) => `[ADD A MEMORY FOR PIN ${index + 1}]`;
export const getMapPhotoPlaceholder = (index: number) => `[ADD OPTIONAL PHOTO FOR PIN ${index + 1}]`;
