# Add personal content

1. Put your files in `artifacts/birthday-journey/public/assets/birthday/`.
2. Edit `src/content.ts`. Paths are relative to `public/`, with no `public/` prefix:
   `greetingPhoto: 'assets/birthday/photo.webp'`

Supported common formats: JPG/PNG/WebP images, MP3/OGG/WAV audio, MP4/WebM video.

## Where to edit

- `media`: greeting photo, voice note, soundtrack, video, card artwork.
- `flowerMessages`: replace the 18 message strings in order.
- `letterNotes`: replace each of the 18 messages; add an optional `photo` path.
- `photoShowerMoments`: exactly six photo/message pairs. After the sixth pull, the final letter appears.
- `songs`: each page has its own `title`, `dedication`, `lyric`, `photo`, and local `audio` path.
- `calendarEntries`: add only real memories as `{ date: 'YYYY-MM-DD', photo: 'assets/birthday/photo.jpg', message: '...' }`. Only configured dates are marked. The calendar covers October 2025–October 2026.
- `memoryMapStops`: five ordered photo/message pairs.
- `reservedDesignAssets`: optional finished artwork for the magazine, scrapbook, poster, or photo booth placeholders.
- `personal`: card/cake wishes, poem, final letter, and other text.

The gift pages have no upload controls; files stay in this project and are referenced from code. Replace bracketed `[ADD ...]` text with your own content. No dates, photos, songs, or personal memories are prefilled.
