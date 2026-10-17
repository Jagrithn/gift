/**
 * PERSONALIZE THIS FILE.
 * Put media in public/assets/birthday/ and enter paths relative to public/,
 * for example: "assets/birthday/photo-01.jpg". Empty media paths show a placeholder.
 * No names, memories, dates, lyrics, or photos are invented here.
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
  cardWish: '[ADD YOUR BIRTHDAY CARD WISH]',
  cakeWish: '[ADD YOUR BIRTHDAY CAKE WISH]',
  poem: '[ADD YOUR POEM]',
  photoShowerFinalLetter: '[ADD A SHORT FINAL LETTER]',
} as const;

export const media = {
  greetingPhoto: '',
  birthdayRecording: '',
  soundtrack: '',
  birthdayVideo: '',
  birthdayCardPhoto: '',
} as const;

export const surprises = [
  { id: 'photo-shower', art: 'photo' },
  { id: 'magazine', art: 'magazine' },
  { id: 'bouquet', art: 'bouquet' },
  { id: 'letters', art: 'letters' },
  { id: 'jar', art: 'jar' },
  { id: 'poem', art: 'poem' },
  { id: 'spotify-book', art: 'music' },
  { id: 'card', art: 'card' },
  { id: 'alphabet', art: 'alphabet' },
  { id: 'scrapbook', art: 'scrapbook' },
  { id: 'poster', art: 'poster' },
  { id: 'booth', art: 'booth' },
  { id: 'calendar', art: 'calendar' },
  { id: 'character', art: 'character' },
  { id: 'map', art: 'map' },
  { id: 'cake', art: 'cake' },
] as const;

export const bouquetFlowers = [
  'Rose', 'Tulip', 'Daisy', 'Peony', 'Ranunculus', 'Anemone',
  'Cosmos', 'Camellia', 'Iris', 'Poppy', 'Carnation', 'Gardenia',
  'Dahlia', 'Freesia', 'Lilac', 'Sweet pea', 'Magnolia', 'Forget-me-not',
];
export const flowerMessages = Array.from({ length: 18 }, (_, index) => `[ADD FLOWER MESSAGE ${index + 1}]`);
export const letterNotes = Array.from({ length: 18 }, (_, index) => ({
  photo: '',
  message: `[ADD LETTER MESSAGE ${index + 1}]`,
}));
export const loveReasons = Array.from({ length: 18 }, (_, index) => `[ADD REASON ${index + 1}]`);
export const alphabetWishes = Array.from({ length: 26 }, (_, index) => {
  const letter = String.fromCharCode(65 + index);
  return { letter, wish: `[ADD WISH FOR ${letter}]` };
});
export const photoShowerMoments = Array.from({ length: 6 }, (_, index) => ({
  photo: '',
  message: `[ADD PHOTO MESSAGE ${index + 1}]`,
}));
export const songs = Array.from({ length: 3 }, (_, index) => ({
  title: `[ADD SONG TITLE ${index + 1}]`,
  dedication: `[ADD DEDICATION ${index + 1}]`,
  lyric: `[ADD SELECTED LYRIC EXCERPT ${index + 1}]`,
  photo: '',
  audio: '',
}));
export const calendarEntries: { date: string; photo: string; message: string }[] = [];
export const memoryMapStops = Array.from({ length: 5 }, (_, index) => ({
  photo: '',
  message: `[ADD MEMORY ${index + 1}]`,
}));
export const reservedDesignAssets = {
  magazine: '',
  scrapbook: '',
  poster: '',
  photoBooth: '',
};
export const characterLoveParts = [
  '[ADD LOVE NOTE 1]',
  '[ADD LOVE NOTE 2]',
  '[ADD LOVE NOTE 3]',
  '[ADD LOVE NOTE 4]',
  '[ADD LOVE NOTE 5]',
];
