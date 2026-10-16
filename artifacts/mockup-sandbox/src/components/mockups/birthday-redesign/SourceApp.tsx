import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, AudioLines, Check, ChevronLeft, ChevronRight,
  CirclePlay, Heart, MapPin, Music2, Pause, Play, RotateCcw, Volume2,
  VolumeX, X,
} from 'lucide-react';
import {
  personal, surprises, bouquetFlowers, notePrompts, alphabetWishes,
  getPhotoShowerMessagePlaceholder, characterLoveParts,
  magazineCover, magazinePages, scrapbookPages, calendarEntries,
  getPhotoBoothPlaceholder, getMapMemoryPlaceholder, getMapPhotoPlaceholder,
} from './content';

type Stage = 'envelope' | 'greeting' | 'note' | 'present' | 'collection' | 'gift' | 'video' | 'final-envelope' | 'letter';
type OpeningSequence = 'envelope' | 'present' | 'final-envelope' | null;

function useLocalUrl(file: File | null) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!file) { setUrl(''); return; }
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);
  return url;
}

function useLocalUrls(files: (File | null)[]) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const nextUrls = files.map((file) => file ? URL.createObjectURL(file) : '');
    setUrls(nextUrls);
    return () => nextUrls.filter(Boolean).forEach((url) => URL.revokeObjectURL(url));
  }, [files]);
  return urls;
}

function FilePicker({ label, accept, onFile }: { label: string; accept: string; onFile: (file: File | null) => void }) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onFile(event.target.files?.[0] ?? null);
  return (
    <label className="file-picker">
      <span>{label}</span>
      <input type="file" accept={accept} onChange={handleChange} />
    </label>
  );
}

function MultiFilePicker({ label, accept, onFiles }: { label: string; accept: string; onFiles: (files: File[]) => void }) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFiles(Array.from(event.target.files ?? []));
    event.currentTarget.value = '';
  };
  return (
    <label className="file-picker">
      <span>{label}</span>
      <input type="file" accept={accept} multiple onChange={handleChange} />
    </label>
  );
}

function ActionButton({ children, onClick, quiet = false, disabled = false, className = '', 'aria-expanded': ariaExpanded, 'aria-controls': ariaControls }: {
  children: ReactNode; onClick: () => void; quiet?: boolean; disabled?: boolean; className?: string;
  'aria-expanded'?: boolean; 'aria-controls'?: string;
}) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`action-button ${quiet ? 'quiet' : ''} ${className}`}
    aria-expanded={ariaExpanded} aria-controls={ariaControls}>{children}</button>;
}

function Placeholder({ children }: { children: ReactNode }) {
  return <div className="placeholder-art"><span className="placeholder-mark">+</span><span>{children}</span></div>;
}

function App() {
  const [stage, setStage] = useState<Stage>('envelope');
  const [openingSequence, setOpeningSequence] = useState<OpeningSequence>(null);
  const [activeGift, setActiveGift] = useState(0);
  const [explored, setExplored] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoShowerFiles, setPhotoShowerFiles] = useState<File[]>([]);
  const [photoShowerCurrent, setPhotoShowerCurrent] = useState<number | null>(null);
  const [photoShowerRevealed, setPhotoShowerRevealed] = useState(0);
  const [photoShowerMessages, setPhotoShowerMessages] = useState<Record<number, string>>({});
  const [boothFiles, setBoothFiles] = useState<File[]>([]);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterMessage, setPosterMessage] = useState('');
  const [mapPhotoFiles, setMapPhotoFiles] = useState<(File | null)[]>(Array.from({ length: 5 }, () => null));
  const [mapMemories, setMapMemories] = useState<Record<number, string>>({});
  const [magazineCoverCopy, setMagazineCoverCopy] = useState({ heading: '', caption: '' });
  const [magazineCopy, setMagazineCopy] = useState<Record<number, { heading: string; caption: string }>>({});
  const [scrapbookCopy, setScrapbookCopy] = useState<Record<number, { caption: string; memory: string }>>({});
  const [calendarCopy, setCalendarCopy] = useState<Record<number, { date: string; event: string; memory: string }>>({});
  const [recordingFile, setRecordingFile] = useState<File | null>(null);
  const [soundtrackFile, setSoundtrackFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState<Record<number, string>>({});
  const [flowerText, setFlowerText] = useState<Record<number, string>>({});
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [loveLevel, setLoveLevel] = useState(0);
  const [characterPopped, setCharacterPopped] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [animationRunning, setAnimationRunning] = useState(false);
  const [animationRevealed, setAnimationRevealed] = useState(false);
  const [dessertOpen, setDessertOpen] = useState(false);
  const [dessertMessage, setDessertMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const photoUrl = useLocalUrl(photoFile);
  const photoShowerUrls = useLocalUrls(photoShowerFiles);
  const boothUrls = useLocalUrls(boothFiles);
  const posterUrl = useLocalUrl(posterFile);
  const mapPhotoUrls = useLocalUrls(mapPhotoFiles);
  const recordingUrl = useLocalUrl(recordingFile);
  const soundtrackUrl = useLocalUrl(soundtrackFile);
  const videoUrl = useLocalUrl(videoFile);
  const gift = surprises[activeGift];
  const allExplored = explored.length === surprises.length;

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted, soundtrackUrl]);

  useEffect(() => {
    if (!animationRunning) return;
    const timeout = window.setTimeout(() => {
      setAnimationRunning(false);
      setAnimationRevealed(true);
    }, 2100);
    return () => window.clearTimeout(timeout);
  }, [animationRunning]);

  useEffect(() => {
    if (!openingSequence) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nextStage: Stage = openingSequence === 'envelope' ? 'greeting' : openingSequence === 'present' ? 'collection' : 'letter';
    const timeout = window.setTimeout(() => {
      setOpeningSequence(null);
      setStage(nextStage);
    }, reducedMotion ? 0 : 760);
    return () => window.clearTimeout(timeout);
  }, [openingSequence]);

  const openGift = (index: number) => {
    setActiveGift(index);
    setPage(0);
    setSelectedNote(null);
    setSelectedPin(null);
    setLoveLevel(0);
    setCharacterPopped(false);
    setCardOpen(false);
    setAnimationRunning(false);
    setAnimationRevealed(false);
    setDessertOpen(false);
    setDessertMessage('');
    setPhotoShowerCurrent(null);
    setPhotoShowerRevealed(0);
    setExplored((current) => current.includes(surprises[index].id) ? current : [...current, surprises[index].id]);
    setStage('gift');
  };

  const changePage = (next: number, max: number) => setPage((current) => Math.max(0, Math.min(max - 1, current + next)));
  const revealNextPhoto = () => {
    if (photoShowerCurrent === null) {
      setPhotoShowerCurrent(0);
      setPhotoShowerRevealed(1);
    } else if (photoShowerCurrent + 1 < photoShowerFiles.length) {
      const nextPhoto = photoShowerCurrent + 1;
      setPhotoShowerCurrent(nextPhoto);
      setPhotoShowerRevealed((revealed) => Math.max(revealed, nextPhoto + 1));
    }
  };
  const startBirthdayAnimation = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimationRunning(false);
      setAnimationRevealed(true);
      return;
    }
    setAnimationRevealed(false);
    setAnimationRunning(true);
  };
  const skipBirthdayAnimation = () => {
    setAnimationRunning(false);
    setAnimationRevealed(true);
  };
  const skipOpeningSequence = () => {
    if (!openingSequence) return;
    const nextStage: Stage = openingSequence === 'envelope' ? 'greeting' : openingSequence === 'present' ? 'collection' : 'letter';
    setOpeningSequence(null);
    setStage(nextStage);
  };
  const toggleSoundtrack = async () => {
    const audio = audioRef.current;
    if (!audio || !soundtrackUrl) return;
    if (audio.paused) {
      try { await audio.play(); } catch { setIsPlaying(false); }
    } else audio.pause();
  };
  const replaySoundtrack = () => {
    if (audioRef.current && soundtrackUrl) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => setIsPlaying(false));
    }
  };
  const onBirthdayVideoPlay = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };
  const setGiftStage = (next: Stage) => {
    if (next === 'video') {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
    setStage(next);
  };

  const renderGift = () => {
    const countNotes = gift.id === 'letters' || gift.id === 'jar';
    if (gift.id === 'bouquet') return (
      <div className="gift-interaction">
        <p className="detail-intro">Choose a bloom. Add a little message for each one, if you like.</p>
        <div className="flower-grid">{bouquetFlowers.map((flower, index) =>
          <button key={flower} type="button" className={`flower-tile flower-${index % 6} ${selectedNote === index ? 'chosen' : ''}`}
            style={{ animationDelay: `${index * 52}ms` }}
            aria-label={`Flower ${index + 1}: ${flower}`} onClick={() => setSelectedNote(index)}>
          <span className="flower-head" aria-hidden="true" /><span>{flower}</span><small>{index + 1}</small>
          </button>,
        )}</div>
        {selectedNote !== null && <div className="message-reveal">
          <span className="eyebrow">BLOOM {selectedNote + 1} · {bouquetFlowers[selectedNote]}</span>
          <label className="text-label" htmlFor="flower-message">A note for this flower <span>(optional)</span></label>
          <textarea id="flower-message" value={flowerText[selectedNote] ?? ''} placeholder={gift.placeholder}
            onChange={(event) => setFlowerText((current) => ({ ...current, [selectedNote]: event.target.value }))} />
          <button className="text-button" type="button" onClick={() => setSelectedNote(null)}><X size={15} /> Close bloom</button>
        </div>}
      </div>
    );
    if (countNotes) return (
      <div className="gift-interaction">
        <p className="detail-intro">{gift.id === 'letters' ? 'Choose a little envelope to open a letter.' : 'Choose a folded note from the jar.'}</p>
        <div className={`note-grid ${gift.id === 'jar' ? 'jar-grid' : ''}`}>{notePrompts.map((prompt, index) =>
          <button type="button" key={index} onClick={() => setSelectedNote(index)} className={`note-tile ${selectedNote === index ? 'chosen' : ''}`}
            aria-label={`Open message ${index + 1}`}><span>{String(index + 1).padStart(2, '0')}</span><small>{selectedNote === index ? 'OPEN' : gift.id === 'jar' ? 'PICK' : 'OPEN'}</small></button>,
        )}</div>
        {selectedNote !== null && <div className="message-reveal">
          <span className="eyebrow">A NOTE FOR YOU · {String(selectedNote + 1).padStart(2, '0')}</span>
          <textarea aria-label={`Message ${selectedNote + 1}`} value={noteText[selectedNote] ?? ''} placeholder={notePrompts[selectedNote]}
            onChange={(event) => setNoteText((current) => ({ ...current, [selectedNote!]: event.target.value }))} />
          <button className="text-button" type="button" onClick={() => setSelectedNote(null)}><X size={15} /> Fold it away</button>
        </div>}
      </div>
    );
    if (gift.id === 'magazine') {
      const total = magazinePages.length + 1;
      const isCover = page === 0;
      const pageContent = magazinePages[Math.max(0, page - 1)];
      return <div className="turning-book book-magazine">
        <div className={`book-page magazine-page ${isCover ? 'magazine-cover-page' : ''}`}>
          <span className="eyebrow">{isCover ? 'BIRTHDAY ISSUE · 18' : `FEATURE · ${String(page).padStart(2, '0')}`}</span>
          <div className="magazine-photo placeholder-art"><span className="placeholder-mark">+</span><span>{isCover ? magazineCover.photo : pageContent.photo}</span></div>
          {isCover
            ? <div className="magazine-cover-copy">
              <label className="text-label" htmlFor="magazine-cover-heading">Cover heading</label>
              <input id="magazine-cover-heading" value={magazineCoverCopy.heading} placeholder={magazineCover.heading}
                onChange={(event) => setMagazineCoverCopy((current) => ({ ...current, heading: event.target.value }))} />
              <label className="text-label" htmlFor="magazine-cover-caption">Cover caption</label>
              <textarea id="magazine-cover-caption" value={magazineCoverCopy.caption} placeholder={magazineCover.caption}
                onChange={(event) => setMagazineCoverCopy((current) => ({ ...current, caption: event.target.value }))} />
            </div>
            : <div className="magazine-page-copy">
              <label className="text-label" htmlFor={`magazine-heading-${page}`}>Page heading</label>
              <input id={`magazine-heading-${page}`} value={magazineCopy[page]?.heading ?? ''} placeholder={pageContent.heading}
                onChange={(event) => setMagazineCopy((current) => ({ ...current, [page]: { heading: event.target.value, caption: current[page]?.caption ?? '' } }))} />
              <label className="text-label" htmlFor={`magazine-caption-${page}`}>Page caption</label>
              <textarea id={`magazine-caption-${page}`} value={magazineCopy[page]?.caption ?? ''} placeholder={pageContent.caption}
                onChange={(event) => setMagazineCopy((current) => ({ ...current, [page]: { heading: current[page]?.heading ?? '', caption: event.target.value } }))} />
            </div>}
          <span className="page-number">{String(page + 1).padStart(2, '0')} / {total}</span>
        </div>
        <div className="page-controls">
          <button type="button" aria-label="Previous magazine page" onClick={() => changePage(-1, total)} disabled={page === 0}><ChevronLeft /></button>
          <span>{isCover ? 'COVER' : `PAGE ${page}`} · {page + 1} / {total}</span>
          <button type="button" aria-label="Next magazine page" onClick={() => changePage(1, total)} disabled={page === total - 1}><ChevronRight /></button>
        </div>
      </div>;
    }
    if (gift.id === 'spotify-book' || gift.id === 'alphabet' || gift.id === 'calendar' || gift.id === 'scrapbook') {
      const total = gift.id === 'spotify-book' ? 3 : gift.id === 'alphabet' ? 26 : gift.id === 'calendar' ? calendarEntries.length : scrapbookPages.length;
      const title = gift.id === 'spotify-book' ? `SIDE ${page + 1} OF 3` :
        gift.id === 'alphabet' ? `LETTER ${alphabetWishes[page]}` :
        gift.id === 'calendar' ? `MEMORY ${page + 1} OF ${total}` : `SCRAPBOOK · ${page + 1}`;
      const body = gift.id === 'spotify-book'
        ? <div className="dedication">
          <p className="eyebrow">{personal.songDedication}</p>
          <h3>{personal.lyricLine}</h3>
          <span className="song-link">{personal.songLink}</span>
          <div className="song-actions"><FilePicker label="Choose song artwork" accept="image/*" onFile={setPhotoFile} />
            <button type="button" className="text-button" onClick={toggleSoundtrack}><CirclePlay size={16} /> {soundtrackUrl ? 'Play soundtrack' : 'Add a soundtrack first'}</button></div>
        </div>
        : gift.id === 'alphabet'
          ? <div className="alphabet-page"><span className="giant-letter">{alphabetWishes[page]}</span><p>[ADD YOUR WISH FOR {alphabetWishes[page]}]</p></div>
          : gift.id === 'scrapbook'
            ? <div className="scrapbook-page">
              <div className="scrapbook-photo placeholder-art"><span className="placeholder-mark">+</span><span>{scrapbookPages[page].photo}</span></div>
              <label className="text-label" htmlFor={`scrapbook-caption-${page}`}>Caption</label>
              <textarea id={`scrapbook-caption-${page}`} value={scrapbookCopy[page]?.caption ?? ''} placeholder={scrapbookPages[page].caption}
                onChange={(event) => setScrapbookCopy((current) => ({ ...current, [page]: { caption: event.target.value, memory: current[page]?.memory ?? '' } }))} />
              <label className="text-label" htmlFor={`scrapbook-memory-${page}`}>The memory</label>
              <textarea id={`scrapbook-memory-${page}`} value={scrapbookCopy[page]?.memory ?? ''} placeholder={scrapbookPages[page].memory}
                onChange={(event) => setScrapbookCopy((current) => ({ ...current, [page]: { caption: current[page]?.caption ?? '', memory: event.target.value } }))} />
            </div>
            : gift.id === 'calendar'
              ? <div className="calendar-entry">
                <div className="calendar-spine" aria-hidden="true"><span>{String(page + 1).padStart(2, '0')}</span></div>
                <div className="calendar-entry-fields">
                  <label className="text-label" htmlFor={`calendar-date-${page}`}>Date</label>
                  <input id={`calendar-date-${page}`} value={calendarCopy[page]?.date ?? ''} placeholder={calendarEntries[page].date}
                    onChange={(event) => setCalendarCopy((current) => ({ ...current, [page]: { date: event.target.value, event: current[page]?.event ?? '', memory: current[page]?.memory ?? '' } }))} />
                  <label className="text-label" htmlFor={`calendar-event-${page}`}>Event</label>
                  <input id={`calendar-event-${page}`} value={calendarCopy[page]?.event ?? ''} placeholder={calendarEntries[page].event}
                    onChange={(event) => setCalendarCopy((current) => ({ ...current, [page]: { date: current[page]?.date ?? '', event: event.target.value, memory: current[page]?.memory ?? '' } }))} />
                  <label className="text-label" htmlFor={`calendar-memory-${page}`}>Memory</label>
                  <textarea id={`calendar-memory-${page}`} value={calendarCopy[page]?.memory ?? ''} placeholder={calendarEntries[page].memory}
                    onChange={(event) => setCalendarCopy((current) => ({ ...current, [page]: { date: current[page]?.date ?? '', event: current[page]?.event ?? '', memory: event.target.value } }))} />
                </div>
              </div>
              : null;
      return <div className={`turning-book book-${gift.id}`}>
        <div className="book-page"><span className="eyebrow">{title}</span>{body}<span className="page-number">{String(page + 1).padStart(2, '0')} / {total}</span></div>
        <div className="page-controls">
          <button type="button" aria-label="Previous page" onClick={() => changePage(-1, total)} disabled={page === 0}><ChevronLeft /></button>
          <span>{page + 1} / {total}</span>
          <button type="button" aria-label="Next page" onClick={() => changePage(1, total)} disabled={page === total - 1}><ChevronRight /></button>
        </div>
      </div>;
    }
    if (gift.id === 'character') return <div className="character-stage">
      <div className={`character-card ${characterPopped ? 'popped' : ''}`} aria-label="A little illustrated character waiting to pop out">
        <svg className="love-character" viewBox="0 0 180 225" role="img" aria-label="A small illustrated character with a flower">
          <path d="M45 93 C31 43 57 16 91 19 C129 20 151 52 135 100 L126 111 L48 108Z" fill="#704251" />
          <ellipse cx="91" cy="75" rx="39" ry="45" fill="#f0c9a8" />
          <path d="M53 72 C48 35 69 19 94 20 C125 21 144 48 134 76 C121 62 112 49 110 39 C97 57 75 67 53 72Z" fill="#704251" />
          <path d="M77 82 Q82 87 87 82 M99 82 Q104 87 109 82" fill="none" stroke="#5d3b47" strokeWidth="3" strokeLinecap="round" />
          <path d="M87 98 Q95 105 103 98" fill="none" stroke="#a95f68" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M72 121 Q90 108 111 121 L132 183 Q92 203 49 183Z" fill="#b97883" />
          <path d="M66 130 Q45 151 40 166 M117 130 Q139 150 145 166" fill="none" stroke="#f0c9a8" strokeWidth="11" strokeLinecap="round" />
          <path d="M69 187 L64 211 M111 187 L118 211" fill="none" stroke="#704251" strokeWidth="12" strokeLinecap="round" />
          <path d="M56 45 Q40 28 31 17 M31 17 L26 8 M31 17 L41 10" fill="none" stroke="#83958a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="8" r="5" fill="#d99b83" /><circle cx="43" cy="9" r="5" fill="#d99b83" /><circle cx="34" cy="1" r="5" fill="#d99b83" /><circle cx="34" cy="10" r="3" fill="#b68b52" />
        </svg>
      </div>
      <div className="character-message-parts" aria-live="polite">
        {characterLoveParts.slice(0, loveLevel).map((part, index) => <p key={part} className="love-line"><span>{String(index + 1).padStart(2, '0')}</span>{part}</p>)}
        {loveLevel === 0 && <p className="love-line">A little character has a lot to say.</p>}
      </div>
      <ActionButton onClick={() => {
        if (!characterPopped) setCharacterPopped(true);
        else if (loveLevel < characterLoveParts.length) setLoveLevel((level) => level + 1);
        else setLoveLevel(0);
      }}>
        <Heart size={16} /> {!characterPopped ? 'Pop out the character' : loveLevel < characterLoveParts.length ? 'Reveal the next part' : 'Read from the beginning'}
      </ActionButton>
    </div>;
    if (gift.id === 'map') {
      const pin = selectedPin;
      return <div className="memory-map">
        <div className="map-paper"><span className="map-route route-one" /><span className="map-route route-two" />
          {[0, 1, 2, 3, 4].map((pinIndex) => <button key={pinIndex} type="button" className={`map-pin pin-${pinIndex} ${selectedPin === pinIndex ? 'selected' : ''}`}
            onClick={() => setSelectedPin(pinIndex)} aria-label={`Open memory pin ${pinIndex + 1}`}><MapPin size={22} /></button>)}
          <span className="map-caption">OUR LITTLE WORLD</span>
        </div>
        {pin !== null && <div className="message-reveal map-reveal">
          <span className="eyebrow">MEMORY PIN {pin + 1}</span>
          <label className="text-label" htmlFor={`map-memory-${pin}`}>Your memory</label>
          <textarea id={`map-memory-${pin}`} value={mapMemories[pin] ?? ''} placeholder={getMapMemoryPlaceholder(pin)}
            onChange={(event) => setMapMemories((current) => ({ ...current, [pin]: event.target.value }))} />
          <div className="map-photo-slot">
            {mapPhotoUrls[pin] ? <img src={mapPhotoUrls[pin]} alt={`Local preview for memory pin ${pin + 1}`} /> : <Placeholder>{getMapPhotoPlaceholder(pin)}</Placeholder>}
            <FilePicker label={mapPhotoUrls[pin] ? 'Replace optional photo' : 'Add optional local photo'} accept="image/*"
              onFile={(file) => setMapPhotoFiles((current) => current.map((existing, index) => index === pin ? file : existing))} />
          </div>
        </div>}
      </div>;
    }
    if (gift.id === 'card') return <div className="card-scene">
      <button type="button" className={`pop-card ${cardOpen ? 'open' : ''}`} onClick={() => setCardOpen((open) => !open)} aria-expanded={cardOpen}>
        <span className="card-cover"><Placeholder>{gift.placeholder}</Placeholder><span className="card-title">FOR YOU</span></span>
        <span className="card-inside">{cardOpen ? '[ADD YOUR CARD MESSAGE]' : 'Tap to open'}</span>
      </button>
    </div>;
    if (gift.id === 'photo-shower') return <div className="photo-shower">
      <p className="detail-intro">Choose a handful of photos, then pull the string to reveal them one by one.</p>
      <MultiFilePicker label={photoShowerFiles.length ? `Choose more photos (${photoShowerFiles.length} selected)` : 'Choose multiple photos'}
        accept="image/*" onFiles={(files) => setPhotoShowerFiles((current) => [...current, ...files])} />
      <div className="shower-reveal">
        {photoShowerCurrent !== null && photoShowerUrls[photoShowerCurrent]
          ? <div className="shower-photo-card scene-enter">
            <span className="eyebrow">A MOMENT FOR YOU · {String(photoShowerCurrent + 1).padStart(2, '0')}</span>
            <img src={photoShowerUrls[photoShowerCurrent]} alt={`Birthday photo ${photoShowerCurrent + 1} preview`} />
            <label className="text-label" htmlFor="shower-message">A little note for this photo</label>
            <textarea id="shower-message" maxLength={140} value={photoShowerMessages[photoShowerCurrent] ?? ''}
              placeholder={getPhotoShowerMessagePlaceholder(photoShowerCurrent)}
              onChange={(event) => setPhotoShowerMessages((current) => ({ ...current, [photoShowerCurrent]: event.target.value }))} />
            <div className="shower-photo-controls">
              <button type="button" aria-label="Previous revealed photo" onClick={() => setPhotoShowerCurrent((current) => Math.max(0, (current ?? 0) - 1))} disabled={photoShowerCurrent === 0}><ChevronLeft /></button>
              <span>{photoShowerCurrent + 1} / {photoShowerRevealed}</span>
              <button type="button" aria-label="Next revealed photo" onClick={() => setPhotoShowerCurrent((current) => Math.min(photoShowerRevealed - 1, (current ?? 0) + 1))} disabled={photoShowerCurrent >= photoShowerRevealed - 1}><ChevronRight /></button>
            </div>
          </div>
          : <div className="shower-empty"><Placeholder>{gift.placeholder}</Placeholder><span>Each pull reveals one photo and its own note.</span></div>}
      </div>
      <div className="pull-string-area">
        <span className="string-knot" aria-hidden="true" />
        <span className="pull-cord" aria-hidden="true" />
        <button type="button" className="pull-string-button" disabled={photoShowerFiles.length === 0 || photoShowerRevealed >= photoShowerFiles.length}
          onClick={revealNextPhoto} aria-label="Pull the string to reveal the next photo">
          <span className="pull-handle" aria-hidden="true" />{photoShowerRevealed === 0 ? 'Pull the string to reveal a photo' : photoShowerRevealed >= photoShowerFiles.length ? 'All selected photos are revealed' : 'Pull again for the next photo'}
        </button>
      </div>
    </div>;
    if (gift.id === 'booth') {
      const frameCount = Math.max(4, boothUrls.length);
      return <div className="photo-gift photo-booth">
        <p className="detail-intro">Choose several photos to fill this little strip.</p>
        <div className="photo-strip" aria-label="Photo booth strip preview">
          {Array.from({ length: frameCount }, (_, index) => <div className="photo-strip-frame" key={index}>
            {boothUrls[index] ? <img src={boothUrls[index]} alt={`Photo booth frame ${index + 1} local preview`} /> : <Placeholder>{getPhotoBoothPlaceholder(index)}</Placeholder>}
          </div>)}
          <span className="photo-strip-footer">A MOMENT TO KEEP</span>
        </div>
        <MultiFilePicker label={boothFiles.length ? `Choose more booth photos (${boothFiles.length} selected)` : 'Choose multiple booth photos'}
          accept="image/*" onFiles={(files) => setBoothFiles((current) => [...current, ...files])} />
      </div>;
    }
    if (gift.id === 'animation-a' || gift.id === 'animation-b') {
      const second = gift.id === 'animation-b';
      return <div className={`birthday-animation ${second ? 'animation-b' : 'animation-a'} ${animationRunning ? 'playing' : ''} ${animationRevealed ? 'revealed' : ''}`}>
        <p className="detail-intro">{second ? 'A flower unfolds first, then a little cake lights up.' : 'A little cake rises into a bloom-filled birthday wish.'}</p>
        <div className="birthday-animation-art" aria-hidden="true">
          <svg className="birthday-cake-svg" viewBox="0 0 180 150">
            <ellipse cx="90" cy="132" rx="68" ry="10" fill="#d9bba5" />
            <path d="M38 75 L142 75 L132 122 Q90 136 48 122Z" fill="#e6b995" stroke="#9d6570" strokeWidth="2" />
            <path d="M38 75 Q50 65 61 75 Q73 84 84 74 Q96 65 108 75 Q121 84 132 74 Q139 70 142 75 L139 91 Q126 98 114 91 Q100 84 89 93 Q75 101 62 92 Q49 85 41 93Z" fill="#fff0d9" stroke="#9d6570" strokeWidth="2" />
            <path d="M52 104 Q65 111 78 104 M99 105 Q112 111 126 103" fill="none" stroke="#c57e77" strokeWidth="4" strokeLinecap="round" />
            <path d="M90 69 L90 43" stroke="#8a5260" strokeWidth="4" strokeLinecap="round" />
            <path d="M90 40 C83 34 89 28 91 22 C98 31 100 37 90 40Z" fill="#cf8a57" />
            <path d="M74 67 Q90 57 106 67" fill="none" stroke="#d39a72" strokeWidth="3" />
          </svg>
          <svg className="birthday-flower-svg" viewBox="0 0 120 170">
            <path d="M60 79 C63 108 51 126 47 155" fill="none" stroke="#718875" strokeWidth="5" strokeLinecap="round" />
            <path d="M55 115 Q32 99 27 112 Q37 130 53 125 M52 136 Q73 116 82 128 Q75 143 50 145" fill="#91a38c" stroke="#718875" strokeWidth="2" />
            <g className="flower-petals" transform="translate(60 55)">
              <ellipse cy="-18" rx="10" ry="19" fill="#bd7780" /><ellipse cy="-18" rx="10" ry="19" transform="rotate(72)" fill="#d49087" />
              <ellipse cy="-18" rx="10" ry="19" transform="rotate(144)" fill="#c87582" /><ellipse cy="-18" rx="10" ry="19" transform="rotate(216)" fill="#dfa18f" />
              <ellipse cy="-18" rx="10" ry="19" transform="rotate(288)" fill="#bd7780" /><circle r="9" fill="#d7ae69" />
            </g>
          </svg>
          {!second && <span className="animation-spark spark-one" />}
          {!second && <span className="animation-spark spark-two" />}
          {second && <span className="animation-ribbon" />}
          <h2 className="birthday-animation-words">Happy Birthday</h2>
        </div>
        <div className="animation-actions">
          {!animationRevealed && !animationRunning && <ActionButton onClick={startBirthdayAnimation}><Play size={16} /> Play animation</ActionButton>}
          {animationRunning && <ActionButton quiet onClick={skipBirthdayAnimation}>Skip animation <ArrowRight size={16} /></ActionButton>}
          {animationRevealed && <ActionButton onClick={startBirthdayAnimation}><RotateCcw size={15} /> Replay animation</ActionButton>}
        </div>
        {animationRevealed && <textarea className="animation-note" aria-label="Optional personal birthday note" placeholder={gift.placeholder} />}
      </div>;
    }
    if (gift.id === 'poem') return <div className="poem-paper"><span className="eyebrow">A SMALL POEM FOR YOU</span><div className="poem-copy">{gift.placeholder}<br /><br />[ADD YOUR POEM LINES HERE]</div></div>;
    if (gift.id === 'poster') return <div className="poster-gift">
      <div className="poster-art">
        <div className="poster-photo-window">{posterUrl ? <img src={posterUrl} alt="Your local birthday poster photo preview" /> : <Placeholder>{personal.posterPhotoPlaceholder}</Placeholder>}</div>
        <span>HAPPY</span><strong>18</strong><span>{personal.herName}</span>
        <textarea aria-label="Birthday poster message" value={posterMessage} placeholder={personal.posterMessagePlaceholder}
          onChange={(event) => setPosterMessage(event.target.value)} />
      </div>
      <FilePicker label={posterUrl ? 'Choose a different poster photo' : 'Choose a local poster photo'} accept="image/*" onFile={setPosterFile} />
    </div>;
    if (gift.id === 'cheesecake' || gift.id === 'kunafa') {
      const cheesecake = gift.id === 'cheesecake';
      return <div className={`dessert-art ${gift.id} ${dessertOpen ? 'dessert-open' : ''}`}>
        <p className="detail-intro">{cheesecake ? 'A little slice, served just for you.' : 'A sweet little chocolate, wrapped for your birthday.'}</p>
        <div className="dessert-illustration" aria-hidden="true">
          {cheesecake
            ? <svg viewBox="0 0 360 250" className="cheesecake-svg">
              <ellipse cx="184" cy="199" rx="142" ry="24" fill="#decbb7" />
              <ellipse cx="184" cy="191" rx="139" ry="23" fill="#fbf3e6" stroke="#ba927f" strokeWidth="3" />
              <path d="M88 160 L194 92 L270 159 L269 176 Q185 194 89 176Z" fill="#e5b57d" stroke="#8f5b55" strokeWidth="3" />
              <path d="M88 160 L194 92 L270 159 Q187 177 88 160Z" fill="#f7e4b9" stroke="#8f5b55" strokeWidth="3" />
              <path d="M90 168 Q184 187 267 168 L267 178 Q181 197 90 179Z" fill="#b77d65" />
              <path d="M120 146 Q151 133 182 145 Q214 157 239 145" fill="none" stroke="#fff6df" strokeWidth="5" strokeLinecap="round" />
              <path d="M193 93 C180 76 188 63 200 59 C211 74 209 86 193 93Z" fill="#b95461" />
              <path d="M196 64 Q205 49 217 54 Q213 67 198 72" fill="#778c67" />
            </svg>
            : <svg viewBox="0 0 360 250" className="kunafa-svg">
              <path d="M65 71 Q180 47 294 71 L294 174 Q179 198 65 174Z" fill="#e7d6b7" stroke="#90684f" strokeWidth="3" />
              <path d="M76 83 Q180 64 283 83 L283 161 Q180 180 76 161Z" fill="#6d463f" stroke="#9c7254" strokeWidth="2" />
              <path d="M84 88 Q180 70 275 88 L275 103 Q180 85 84 103Z" fill="#d7a56a" />
              <path d="M84 105 Q180 88 275 105 L275 158 Q180 177 84 158Z" fill="#5b3834" />
              <path d="M183 92 L183 166" stroke="#d1ae7d" strokeWidth="3" strokeDasharray="4 5" />
              <path d="M105 113 Q140 104 173 113 M197 113 Q230 104 257 112" fill="none" stroke="#8fbd87" strokeWidth="8" strokeLinecap="round" />
              <path d="M92 123 Q180 110 267 123" fill="none" stroke="#bd8d64" strokeWidth="2" />
              <path d="M102 76 Q126 88 146 75 Q169 63 188 77 Q208 90 230 75 Q251 62 268 78" fill="none" stroke="#f0dfbe" strokeWidth="4" />
            </svg>}
        </div>
        <ActionButton onClick={() => setDessertOpen((open) => !open)} aria-expanded={dessertOpen} aria-controls="dessert-message">
          {dessertOpen ? 'Close your treat' : cheesecake ? 'Open your cheesecake' : 'Unwrap your kunafa chocolate'} <ArrowRight size={16} />
        </ActionButton>
        {dessertOpen && <div id="dessert-message" className="dessert-message scene-enter">
          <span className="eyebrow">{cheesecake ? 'A SLICE OF SOMETHING SWEET' : 'A LITTLE CHOCOLATE NOTE'}</span>
          <label className="text-label" htmlFor="dessert-note">Your birthday message</label>
          <textarea id="dessert-note" value={dessertMessage} placeholder={gift.placeholder} onChange={(event) => setDessertMessage(event.target.value)} />
        </div>}
      </div>;
    }
    return null;
  };

  return (
    <main className="journey-shell">
      <div className="paper-grain" aria-hidden="true" />
      <header className="journey-header">
        <button type="button" className="wordmark" onClick={() => { setOpeningSequence(null); setStage('envelope'); }} aria-label="Return to the beginning"><span className="mark">18</span><span>for {personal.herName}</span></button>
        <div className="journey-progress"><span>{stage === 'envelope' ? 'A birthday journey' : 'A birthday journey'}</span><div><i style={{ width: `${Math.max(8, Math.round((explored.length / surprises.length) * 72))}%` }} /></div></div>
        <button type="button" className="music-toggle" onClick={toggleSoundtrack} disabled={!soundtrackUrl} aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}>
          {isPlaying ? <Pause size={16} /> : <Music2 size={16} />} <span>{isPlaying ? 'Sound on' : 'Soundtrack'}</span>
        </button>
      </header>
      {soundtrackUrl && <audio ref={audioRef} src={soundtrackUrl} loop muted={isMuted} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />}

      <section className={`journey-content stage-${stage}`} aria-live="polite">
        {stage === 'envelope' && <div className={`opening-scene scene-enter ${openingSequence === 'envelope' ? 'is-opening' : ''}`}>
          <div className="kicker"><span /> A LETTER FOR YOUR 18TH <span /></div>
          <h1>Something made<br /><em>just for you.</em></h1>
          <p className="lead">{personal.introLine}</p>
          <button className={`envelope-button ${openingSequence === 'envelope' ? 'opening' : ''}`} type="button" onClick={() => !openingSequence && setOpeningSequence('envelope')} aria-label={`Open envelope addressed to ${personal.herName}`} aria-busy={openingSequence === 'envelope'}>
            <span className="envelope-paper">{personal.herName}</span><span className="envelope-flap" /><span className="seal">18</span>
          </button>
          {openingSequence === 'envelope' && <ActionButton quiet onClick={skipOpeningSequence}>Skip opening <ArrowRight size={16} /></ActionButton>}
          <p className="soft-prompt">A little envelope, with your name on it.</p>
        </div>}

        {stage === 'greeting' && <div className="greeting-scene scene-enter">
          <div className="photo-window">
            {photoUrl ? <img src={photoUrl} alt="Your selected photo preview" /> : <Placeholder>[ADD PHOTO]</Placeholder>}
            <span className="photo-note">ONE OF MY FAVORITES</span>
          </div>
          <div className="greeting-copy"><span className="eyebrow">TODAY IS ALL YOURS</span><h1>{personal.greeting}</h1>
            <p>{personal.herName}, I hope this feels a little like being wrapped up in a hug.</p>
            <FilePicker label="Choose your photo" accept="image/*" onFile={setPhotoFile} />
            <div className="recording-box"><div className="recording-copy"><AudioLines size={18} /><span><b>A voice note, if you want one</b><small>{personal.birthdayRecordingLabel}</small></span></div>
              <FilePicker label={recordingUrl ? 'Replace recording' : 'Choose recording'} accept="audio/*" onFile={setRecordingFile} />
              {recordingUrl && <audio controls src={recordingUrl} aria-label="Birthday recording preview" />}
            </div>
            <ActionButton onClick={() => setStage('note')}>Keep going <ArrowRight size={17} /></ActionButton>
          </div>
        </div>}

        {stage === 'note' && <div className="note-scene scene-enter">
          <span className="eyebrow">A NOTE FROM {personal.fromName.toUpperCase()}</span>
          <div className="note-sheet"><span className="note-rule">DEAR {personal.herName.toUpperCase()},</span>
            <p>{personal.madeByNote}</p><span className="note-signature">— {personal.fromName}</span></div>
          <ActionButton onClick={() => setStage('present')}>There’s one more thing <ArrowRight size={17} /></ActionButton>
        </div>}

        {stage === 'present' && <div className={`present-scene scene-enter ${openingSequence === 'present' ? 'present-opening' : ''}`}>
          <span className="eyebrow">I MADE YOU A LITTLE SOMETHING</span>
          <h1>Ready to see<br /><em>what’s inside?</em></h1>
          <span className="balloon balloon-one" aria-hidden="true" /><span className="balloon balloon-two" aria-hidden="true" /><span className="balloon balloon-three" aria-hidden="true" />
          <button className="present-button" type="button" aria-label="Unwrap your birthday present" aria-busy={openingSequence === 'present'} onClick={() => !openingSequence && setOpeningSequence('present')}>
            <span className="gift-box"><span className="gift-lid" /><span className="gift-body" /><span className="gift-ribbon" /><span className="gift-bow" /></span>
            <span className="unwrap-hint">{openingSequence === 'present' ? 'Opening your present…' : 'Tap to unwrap'}</span>
          </button>
          {openingSequence === 'present'
            ? <ActionButton quiet onClick={skipOpeningSequence}>Skip opening <ArrowRight size={17} /></ActionButton>
            : <ActionButton quiet onClick={() => setOpeningSequence('present')}>Open the collection <ArrowRight size={17} /></ActionButton>}
        </div>}

        {stage === 'collection' && <div className="collection-scene scene-enter">
          <div className="collection-heading"><div><span className="eyebrow">A COLLECTION MADE FOR {personal.herName.toUpperCase()}</span>
            <h1>Your birthday<br /><em>surprises.</em></h1></div><p>{personal.collectionIntro}</p></div>
          <div className="collection-meta"><span>{explored.length} explored</span><span className="meta-line" /><span>open in any order</span></div>
          <div className="surprise-grid">{surprises.map((item, index) => {
            const visited = explored.includes(item.id);
            return <button type="button" key={item.id} onClick={() => openGift(index)} className={`surprise-card card-art-${index % 6} ${visited ? 'visited' : ''}`}>
              <span className={`gift-art art-${item.art}`} aria-hidden="true"><span className="art-symbol">{['01','02','03','04','05','06'][index % 6]}</span><span className="art-lines" /></span>
              <span className="surprise-info"><small>{String(index + 1).padStart(2, '0')} {visited && <span className="visited-label"><Check size={12} /> EXPLORED</span>}</small><b>{item.title}</b><span>{item.subtitle}</span></span>
              <ArrowRight className="card-arrow" size={17} />
            </button>;
          })}</div>
          <div className="collection-footer"><span>{allExplored ? 'Every little surprise has been opened.' : `${surprises.length - explored.length} surprises still waiting`}</span>
            <ActionButton onClick={() => setGiftStage('video')} disabled={!allExplored}>{allExplored ? 'Go to your birthday video' : 'Open every surprise to continue'} <ArrowRight size={17} /></ActionButton>
          </div>
        </div>}

        {stage === 'gift' && <div className="gift-detail scene-enter">
          <button type="button" className="back-link" onClick={() => setStage('collection')}><ArrowLeft size={16} /> Back to all surprises</button>
          <div className="gift-detail-head"><span className="eyebrow">A LITTLE SOMETHING FOR YOU</span><h1>{gift.title}</h1><p>{gift.subtitle}</p></div>
          <div className="gift-detail-body">{renderGift()}</div>
          <div className="gift-detail-footer"><span><Check size={14} /> Explored</span><button type="button" className="text-button" onClick={() => setStage('collection')}>Return to collection <ArrowRight size={15} /></button></div>
        </div>}

        {stage === 'video' && <div className="video-scene scene-enter">
          <span className="eyebrow">A LITTLE SOMETHING TO WATCH</span><h1>One last little<br /><em>birthday wish.</em></h1>
          <div className={`video-frame ${videoUrl ? '' : 'video-empty-frame'}`}>
            <video controls playsInline src={videoUrl || undefined} onPlay={onBirthdayVideoPlay} aria-label="Birthday video">
              <track kind="captions" />
            </video>
            {!videoUrl && <div className="video-empty"><CirclePlay size={35} /><span>{personal.videoLabel}</span><small>Choose a video to preview it here.</small></div>}
          </div>
          <p className="video-caption">{personal.videoCaption}</p>
          <FilePicker label={videoUrl ? 'Choose a different video' : 'Choose your birthday video'} accept="video/*" onFile={setVideoFile} />
          <div className="video-continue"><span>Soundtrack pauses while your video plays.</span><ActionButton onClick={() => setGiftStage('final-envelope')}>Continue to your final gift <ArrowRight size={17} /></ActionButton></div>
        </div>}

        {stage === 'final-envelope' && <div className={`final-envelope scene-enter ${openingSequence === 'final-envelope' ? 'is-opening' : ''}`}>
          <span className="eyebrow">ONE LAST LETTER</span><h1>Keep this one<br /><em>close.</em></h1>
          <button className={`envelope-button final ${openingSequence === 'final-envelope' ? 'opening' : ''}`} type="button" onClick={() => !openingSequence && setOpeningSequence('final-envelope')} aria-label="Open your final birthday letter" aria-busy={openingSequence === 'final-envelope'}>
            <span className="envelope-paper">{personal.herName}</span><span className="envelope-flap" /><span className="seal"><Heart size={17} /></span>
          </button>
          {openingSequence === 'final-envelope'
            ? <ActionButton quiet onClick={skipOpeningSequence}>Skip opening <ArrowRight size={17} /></ActionButton>
            : <ActionButton onClick={() => setOpeningSequence('final-envelope')}>Open your letter <ArrowRight size={17} /></ActionButton>}
        </div>}

        {stage === 'letter' && <div className="letter-scene scene-enter">
          <span className="eyebrow">FOR YOUR 18TH BIRTHDAY</span><h1>{personal.finalLetterTitle}</h1>
          <article className="final-letter"><p className="letter-dear">My dear {personal.herName},</p><p>{personal.finalLetter}</p><p className="letter-signoff">{personal.signOff}<br /><span>{personal.fromName}</span></p></article>
          <button type="button" className="restart-link" onClick={() => { setOpeningSequence(null); setExplored([]); setStage('envelope'); }}>Begin the journey again <RotateCcw size={14} /></button>
        </div>}
      </section>

      {soundtrackUrl && <div className="soundtrack-dock" aria-label="Soundtrack controls">
        <div className="dock-label"><Music2 size={16} /><span>{personal.soundtrackLabel}</span></div>
        <div className="dock-actions"><button type="button" onClick={toggleSoundtrack} aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}>{isPlaying ? <Pause size={16} /> : <Play size={16} />}</button>
          <button type="button" onClick={() => setIsMuted((muted) => !muted)} aria-label={isMuted ? 'Unmute soundtrack' : 'Mute soundtrack'}>{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
          <button type="button" onClick={replaySoundtrack} aria-label="Replay soundtrack"><RotateCcw size={15} /></button></div>
        <FilePicker label="Replace" accept="audio/*" onFile={setSoundtrackFile} />
      </div>}
      {!soundtrackUrl && <div className="soundtrack-setup"><Music2 size={15} /><span>Optional soundtrack</span><FilePicker label="Choose audio" accept="audio/*" onFile={setSoundtrackFile} /></div>}
      <footer className="journey-footer"><span>A small birthday world, made by {personal.fromName}</span><span>FOR {personal.herName.toUpperCase()} · WITH LOVE</span></footer>
    </main>
  );
}

export default App;
