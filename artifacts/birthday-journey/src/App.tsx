import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, AudioLines, ChevronLeft, ChevronRight,
  CirclePlay, Heart, MapPin, Music2, Pause, Play, RotateCcw, Volume2, VolumeX,
} from 'lucide-react';
import {
  personal, media, surprises, bouquetFlowers, flowerMessages, letterNotes,
  loveReasons, alphabetWishes, photoShowerMoments, songs, calendarEntries,
  memoryMapStops, reservedDesignAssets, characterLoveParts,
} from './content';

type Stage = 'envelope' | 'greeting' | 'note' | 'present' | 'collection' | 'gift' | 'video' | 'final-envelope' | 'letter';
type OpeningSequence = 'envelope' | 'present' | 'final-envelope' | null;

const assetUrl = (path: string) => path ? `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}` : '';

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
  const [photoShowerCurrent, setPhotoShowerCurrent] = useState<number | null>(null);
  const [photoShowerRevealed, setPhotoShowerRevealed] = useState(0);
  const [photoShowerDone, setPhotoShowerDone] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songIsPlaying, setSongIsPlaying] = useState(false);
  const [songStatus, setSongStatus] = useState('');
  const [page, setPage] = useState(0);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(0);
  const [loveLevel, setLoveLevel] = useState(0);
  const [characterPopped, setCharacterPopped] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [jarOpen, setJarOpen] = useState(false);
  const [dispensedLetter, setDispensedLetter] = useState<number | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [candlesBlownOut, setCandlesBlownOut] = useState(false);
  const [cakeCut, setCakeCut] = useState(false);
  const soundtrackRef = useRef<HTMLAudioElement>(null);
  const songRef = useRef<HTMLAudioElement>(null);
  const greetingPhotoUrl = assetUrl(media.greetingPhoto);
  const recordingUrl = assetUrl(media.birthdayRecording);
  const soundtrackUrl = assetUrl(media.soundtrack);
  const videoUrl = assetUrl(media.birthdayVideo);
  const cardPhotoUrl = assetUrl(media.birthdayCardPhoto);
  const gift = surprises[activeGift];
  const currentSong = songs[page % songs.length];
  const currentSongAudio = assetUrl(currentSong?.audio ?? '');
  const allExplored = explored.length === surprises.length;

  useEffect(() => {
    if (soundtrackRef.current) soundtrackRef.current.muted = isMuted;
  }, [isMuted, soundtrackUrl]);

  useEffect(() => {
    if (stage !== 'gift' || gift.id !== 'photo-shower' || photoShowerRevealed < photoShowerMoments.length) return;
    const timeout = window.setTimeout(() => {
      setPhotoShowerCurrent(null);
      setPhotoShowerDone(true);
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
    return () => window.clearTimeout(timeout);
  }, [stage, gift.id, photoShowerRevealed]);

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

  useEffect(() => {
    if (stage === 'gift' && gift.id === 'spotify-book') return;
    songRef.current?.pause();
    setSongIsPlaying(false);
  }, [stage, gift.id]);

  const openGift = (index: number) => {
    setActiveGift(index);
    setPage(0);
    setSelectedNote(null);
    setSelectedPin(null);
    setSelectedDate('');
    setCalendarMonth(0);
    setLoveLevel(0);
    setCharacterPopped(false);
    setCardOpen(false);
    setJarOpen(false);
    setDispensedLetter(null);
    setLetterOpen(false);
    setCandlesBlownOut(false);
    setCakeCut(false);
    setPhotoShowerCurrent(null);
    setPhotoShowerRevealed(0);
    setPhotoShowerDone(false);
    setExplored((current) => current.includes(surprises[index].id) ? current : [...current, surprises[index].id]);
    setStage('gift');
  };

  const changePage = (next: number, max: number) => {
    if (gift.id === 'spotify-book') {
      songRef.current?.pause();
      setSongIsPlaying(false);
      setSongStatus('');
    }
    setPage((current) => Math.max(0, Math.min(max - 1, current + next)));
  };

  const revealNextPhoto = () => {
    if (photoShowerDone || photoShowerRevealed >= photoShowerMoments.length) return;
    setPhotoShowerCurrent(photoShowerRevealed);
    setPhotoShowerRevealed((revealed) => revealed + 1);
  };

  const replayPhotoShower = () => {
    setPhotoShowerCurrent(null);
    setPhotoShowerRevealed(0);
    setPhotoShowerDone(false);
  };

  const dispenseLetter = () => {
    setDispensedLetter((current) => current === null ? 0 : (current + 1) % letterNotes.length);
    setLetterOpen(false);
  };

  const skipOpeningSequence = () => {
    if (!openingSequence) return;
    const nextStage: Stage = openingSequence === 'envelope' ? 'greeting' : openingSequence === 'present' ? 'collection' : 'letter';
    setOpeningSequence(null);
    setStage(nextStage);
  };
  const toggleSoundtrack = async () => {
    const audio = soundtrackRef.current;
    if (!audio || !soundtrackUrl) return;
    if (audio.paused) {
      try { await audio.play(); } catch { setIsPlaying(false); }
    } else audio.pause();
  };
  const replaySoundtrack = () => {
    if (soundtrackRef.current && soundtrackUrl) {
      soundtrackRef.current.currentTime = 0;
      void soundtrackRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  const toggleSong = async () => {
    if (!currentSongAudio) {
      setSongStatus('Add this track’s audio path in content.ts.');
      return;
    }
    const audio = songRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setSongStatus('');
      } catch {
        setSongIsPlaying(false);
        setSongStatus('This audio file could not be played.');
      }
    } else {
      audio.pause();
    }
  };

  const onBirthdayVideoPlay = () => {
    soundtrackRef.current?.pause();
    setIsPlaying(false);
  };
  const setGiftStage = (next: Stage) => {
    if (next === 'video') {
      soundtrackRef.current?.pause();
      setIsPlaying(false);
    }
    setStage(next);
  };

  const renderGift = () => {
    const image = (path: string, label: string, prompt = 'Add image path in content.ts') =>
      path ? <img src={assetUrl(path)} alt={label} /> : <Placeholder>{prompt}</Placeholder>;

    if (gift.id === 'bouquet') return <div className="gift-interaction bouquet-scene">
      <div className="bouquet-arrangement">
        <div className="bouquet-stems" aria-hidden="true" />
        <div className="bouquet-wrap" aria-hidden="true" />
        <div className="bouquet-flowers">
          {bouquetFlowers.map((flower, index) => <button key={flower}
            className={`bouquet-bloom bloom-${index % 6} ${selectedNote === index ? 'chosen' : ''}`}
            type="button" aria-label={`Reveal a flower message`} onClick={() => setSelectedNote(index)}>
            <span className="flower-head" aria-hidden="true" />
          </button>)}
        </div>
      </div>
      {selectedNote !== null && <div className="message-reveal scene-enter" aria-live="polite">
        <p>{flowerMessages[selectedNote]}</p>
      </div>}
    </div>;

    if (gift.id === 'letters') return <div className="letter-dispenser-scene">
      <div className={`letter-dispenser ${dispensedLetter !== null ? 'has-letter' : ''}`}>
        <div className="dispenser-top" /><div className="dispenser-slot" />
        <div className="dispenser-front" />
        {dispensedLetter !== null && <span className="ejected-letter" aria-hidden="true">✉</span>}
      </div>
      <ActionButton onClick={dispenseLetter}><Heart size={16} /> {dispensedLetter === null ? 'Dispense a letter' : 'Dispense another'}</ActionButton>
      {dispensedLetter !== null && <div className={`physical-letter ${letterOpen ? 'letter-open' : ''}`}>
        <button type="button" className="letter-paper" onClick={() => setLetterOpen((open) => !open)}
          aria-label={letterOpen ? 'Close letter' : 'Open letter'} aria-expanded={letterOpen}>
          {letterOpen && letterNotes[dispensedLetter].photo
            ? image(letterNotes[dispensedLetter].photo, 'A memory inside the letter')
            : letterOpen ? <span className="letter-photo-placeholder">A little memory</span> : <span className="letter-seal">♥</span>}
        </button>
        {letterOpen && <p className="letter-message scene-enter">{letterNotes[dispensedLetter].message}</p>}
      </div>}
    </div>;

    if (gift.id === 'jar') return <div className="love-jar-scene">
      <button className={`love-jar ${jarOpen ? 'jar-open' : ''}`} type="button" onClick={() => setJarOpen((open) => !open)}
        aria-label={jarOpen ? 'Close the love jar' : 'Open the love jar'} aria-expanded={jarOpen}>
        <span className="jar-lid" /><span className="jar-neck" />
        <span className="jar-glass">{loveReasons.map((_, index) => <i key={index} className={`jar-chit chit-${index % 6}`} />)}</span>
        <span className="jar-glint" />
      </button>
      {jarOpen && <div className="jar-reasons scene-enter">
        {loveReasons.map((reason, index) => <button key={index} type="button" aria-label="Pick a love note"
          className={`jar-reason ${selectedNote === index ? 'selected' : ''}`} onClick={() => setSelectedNote(index)} />)}
      </div>}
      {selectedNote !== null && jarOpen && <p className="message-reveal scene-enter">{loveReasons[selectedNote]}</p>}
    </div>;

    if (gift.id === 'photo-shower') {
      const moment = photoShowerCurrent === null ? null : photoShowerMoments[photoShowerCurrent];
      return <div className="photo-shower">
        {photoShowerDone
          ? <div className="shower-final-letter scene-enter">
            <p>{personal.photoShowerFinalLetter}</p>
            <ActionButton onClick={replayPhotoShower}><RotateCcw size={15} /> Replay</ActionButton>
          </div>
          : <><div className="shower-reveal" aria-live="polite">
            {moment ? <div className="shower-photo-card scene-enter">
              <div className="shower-photo">{image(moment.photo, 'A personal photo from the birthday collection')}</div>
              <p>{moment.message}</p>
              {photoShowerRevealed > 1 && <div className="shower-photo-controls">
                <button type="button" aria-label="Previous revealed photo" onClick={() => setPhotoShowerCurrent((current) => Math.max(0, (current ?? 0) - 1))} disabled={photoShowerCurrent === 0}><ChevronLeft /></button>
                <button type="button" aria-label="Next revealed photo" onClick={() => setPhotoShowerCurrent((current) => Math.min(photoShowerRevealed - 1, (current ?? 0) + 1))} disabled={photoShowerCurrent === null || photoShowerCurrent >= photoShowerRevealed - 1}><ChevronRight /></button>
              </div>}
            </div> : <div className="shower-idle"><span className="shower-cloud" aria-hidden="true">✦</span><span>Pull to begin</span></div>}
          </div>
          <div className="pull-string-area">
            <span className="string-knot" aria-hidden="true" /><span className="pull-cord" aria-hidden="true" />
            <button type="button" className="pull-string-button" disabled={photoShowerRevealed >= photoShowerMoments.length}
              onClick={revealNextPhoto} aria-label="Pull the string to reveal a photo">
              <span className="pull-handle" aria-hidden="true" />{photoShowerRevealed === 0 ? 'Pull the string' : 'Pull again'}
            </button>
          </div></>}
      </div>;
    }

    if (gift.id === 'alphabet' || gift.id === 'spotify-book') {
      const alphabet = gift.id === 'alphabet';
      const total = alphabetWishes.length;
      const wish = alphabetWishes[page];
      const song = songs[page % songs.length];
      return <div className={`turning-book book-${gift.id}`}>
        <div className="book-page scene-enter">
          {alphabet
            ? <div className="alphabet-page"><span className="giant-letter">{wish.letter}</span><p>{wish.wish}</p></div>
            : <div className="songbook-page">
              <div className="songbook-photo">{image(song.photo, 'Song page photograph')}</div>
              <h3>{song.title}</h3><p className="song-dedication">{song.dedication}</p>
              <blockquote>{song.lyric}</blockquote>
              <audio ref={songRef} src={currentSongAudio || undefined}
                onPlay={() => setSongIsPlaying(true)} onPause={() => setSongIsPlaying(false)} onEnded={() => setSongIsPlaying(false)} />
              <ActionButton onClick={toggleSong}><span>{songIsPlaying ? <Pause size={16} /> : <Play size={16} />}</span>{songIsPlaying ? 'Pause' : 'Play this song'}</ActionButton>
              {songStatus && <p className="song-status" role="status">{songStatus}</p>}
            </div>}
        </div>
        <div className="page-controls">
          <button type="button" aria-label="Previous page" onClick={() => changePage(-1, alphabet ? total : songs.length)} disabled={page === 0}><ChevronLeft /></button>
          <button type="button" aria-label="Next page" onClick={() => changePage(1, alphabet ? total : songs.length)} disabled={page === (alphabet ? total : songs.length) - 1}><ChevronRight /></button>
        </div>
      </div>;
    }

    if (gift.id === 'calendar') {
      const shown = new Date(2025, 9 + calendarMonth, 1);
      const monthKey = `${shown.getFullYear()}-${String(shown.getMonth() + 1).padStart(2, '0')}`;
      const days = new Date(shown.getFullYear(), shown.getMonth() + 1, 0).getDate();
      const entries = calendarEntries.filter((entry) => entry.date.startsWith(monthKey));
      const selected = calendarEntries.find((entry) => entry.date === selectedDate);
      return <div className="calendar-scene">
        <div className="calendar-sheet">
          <header className="calendar-month">
            <button type="button" aria-label="Previous month" onClick={() => { setCalendarMonth((month) => Math.max(0, month - 1)); setSelectedDate(''); }} disabled={calendarMonth === 0}><ChevronLeft /></button>
            <h3>{shown.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</h3>
            <button type="button" aria-label="Next month" onClick={() => { setCalendarMonth((month) => Math.min(12, month + 1)); setSelectedDate(''); }} disabled={calendarMonth === 12}><ChevronRight /></button>
          </header>
          <div className="calendar-grid">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span className="calendar-weekday" key={`${day}-${index}`}>{day}</span>)}
            {Array.from({ length: new Date(shown.getFullYear(), shown.getMonth(), 1).getDay() }, (_, index) => <span key={`blank-${index}`} />)}
            {Array.from({ length: days }, (_, index) => {
              const day = index + 1;
              const date = `${monthKey}-${String(day).padStart(2, '0')}`;
              const marked = entries.some((entry) => entry.date === date);
              return <button key={date} type="button" disabled={!marked} className={selectedDate === date ? 'selected' : marked ? 'marked' : ''}
                onClick={() => setSelectedDate(date)} aria-label={marked ? `Open memory from ${date}` : undefined}>{day}</button>;
            })}
          </div>
        </div>
        {selected && <div className="calendar-memory scene-enter">
          {selected.photo && image(selected.photo, 'A calendar memory')}
          <p>{selected.message}</p>
        </div>}
      </div>;
    }

    if (gift.id === 'map') {
      const stop = selectedPin === null ? null : memoryMapStops[selectedPin];
      return <div className="memory-map">
        <div className="map-paper"><span className="map-route route-one" /><span className="map-route route-two" />
          {memoryMapStops.map((_, index) => <button key={index} type="button" className={`map-pin pin-${index} ${selectedPin === index ? 'selected' : ''}`}
            onClick={() => setSelectedPin(index)} aria-label="Open a memory stop"><MapPin size={22} /></button>)}
        </div>
        <div className="map-route-controls">
          <button type="button" className="text-button" onClick={() => setSelectedPin((pin) => pin === null ? 0 : (pin + 1) % memoryMapStops.length)}>
            {selectedPin === null ? 'Follow the route' : 'Next memory'} <ArrowRight size={15} />
          </button>
        </div>
        {stop && <div className="message-reveal map-reveal scene-enter">
          <div className="map-photo-slot">{image(stop.photo, 'A photo from this memory')}</div>
          <p>{stop.message}</p>
        </div>}
      </div>;
    }

    if (gift.id === 'card') return <div className="card-scene">
      <button type="button" className={`pop-card ${cardOpen ? 'open' : ''}`} onClick={() => setCardOpen((open) => !open)}
        aria-label={cardOpen ? 'Close birthday card' : 'Open birthday card'} aria-expanded={cardOpen}>
        <span className="card-cover">
          {cardPhotoUrl ? <img src={cardPhotoUrl} alt="Birthday card artwork" /> : <span className="card-cake-art" aria-hidden="true"><i /><i /><i /></span>}
          <span className="card-emboss" aria-hidden="true">♥</span>
        </span>
        <span className="card-inside">{cardOpen ? personal.cardWish : 'Open'}</span>
      </button>
    </div>;

    if (gift.id === 'cake') return <div className={`birthday-cake-scene ${cakeCut ? 'cake-cut' : ''}`}>
      <div className="birthday-cake" aria-label="Layered birthday cake with eighteen candles">
        <div className="cake-candles">{Array.from({ length: 18 }, (_, index) => <span className="cake-candle" key={index}><i className={candlesBlownOut ? 'flame out' : 'flame'} /></span>)}</div>
        <div className="cake-top"><span className="cake-berry" /><span className="cake-berry" /><span className="cake-berry" /></div>
        <div className="cake-layer cake-layer-top" /><div className="cake-icing" />
        <div className="cake-layer cake-layer-bottom" /><div className="cake-plate" />
      </div>
      {!cakeCut ? <div className="cake-actions">
        <ActionButton onClick={() => setCandlesBlownOut(true)} disabled={candlesBlownOut}>Blow out the candles</ActionButton>
        <ActionButton quiet onClick={() => setCakeCut(true)}>Cut the cake</ActionButton>
      </div> : <div className="cake-wish scene-enter"><p>{personal.cakeWish}</p><ActionButton quiet onClick={() => { setCakeCut(false); setCandlesBlownOut(false); }}>Replay</ActionButton></div>}
    </div>;

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
        {characterLoveParts.slice(0, loveLevel).map((part) => <p className="love-line" key={part}>{part}</p>)}
        {loveLevel === 0 && <p className="love-line">A little character has a lot to say.</p>}
      </div>
      <ActionButton onClick={() => {
        if (!characterPopped) setCharacterPopped(true);
        else if (loveLevel < characterLoveParts.length) setLoveLevel((level) => level + 1);
        else { setCharacterPopped(false); setLoveLevel(0); }
      }}>
        <Heart size={16} /> {!characterPopped ? 'Pop out the character' : loveLevel < characterLoveParts.length ? 'Reveal the next part' : 'Replay'}
      </ActionButton>
    </div>;

    if (gift.id === 'poem') return <div className="poem-paper"><div className="poem-copy">{personal.poem}</div></div>;

    if (gift.id === 'magazine' || gift.id === 'scrapbook' || gift.id === 'poster' || gift.id === 'booth') {
      const key = gift.id === 'booth' ? 'photoBooth' : gift.id;
      const artPath = reservedDesignAssets[key as keyof typeof reservedDesignAssets];
      return <div className={`reserved-design reserved-${gift.id}`}>
        {image(artPath, 'Personal birthday artwork', 'Your design will appear here')}
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
      {soundtrackUrl && <audio ref={soundtrackRef} src={soundtrackUrl} loop muted={isMuted} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />}

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
            {greetingPhotoUrl ? <img src={greetingPhotoUrl} alt="Birthday greeting photo" /> : <Placeholder>Add photo path in content.ts</Placeholder>}
            <span className="photo-note">ONE OF MY FAVORITES</span>
          </div>
          <div className="greeting-copy"><span className="eyebrow">TODAY IS ALL YOURS</span><h1>{personal.greeting}</h1>
            <p>{personal.herName}, I hope this feels a little like being wrapped up in a hug.</p>
            <div className="recording-box"><div className="recording-copy"><AudioLines size={18} /><span><b>A voice note, if you want one</b><small>{personal.birthdayRecordingLabel}</small></span></div>
              {recordingUrl ? <audio controls src={recordingUrl} aria-label="Birthday recording" /> : <small>Add recording path in content.ts</small>}
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
            return <button type="button" key={item.id} onClick={() => openGift(index)} aria-label="Open a birthday surprise"
              data-testid={`surprise-${item.id}`} className={`surprise-card card-art-${index % 6} ${visited ? 'visited' : ''}`}>
              <span className={`gift-art art-${item.art}`} aria-hidden="true"><span className="art-lines" /></span>
            </button>;
          })}</div>
          <div className="collection-footer"><span>{allExplored ? 'Every little surprise has been opened.' : `${surprises.length - explored.length} surprises still waiting`}</span>
            <ActionButton onClick={() => setGiftStage('video')} disabled={!allExplored}>{allExplored ? 'Go to your birthday video' : 'Open every surprise to continue'} <ArrowRight size={17} /></ActionButton>
          </div>
        </div>}

        {stage === 'gift' && <div className="gift-detail scene-enter">
          <button type="button" className="back-link" onClick={() => setStage('collection')}><ArrowLeft size={16} /> Back to all surprises</button>
          <div className="gift-detail-body">{renderGift()}</div>
          <div className="gift-detail-footer"><button type="button" className="text-button" onClick={() => setStage('collection')}>Return to collection <ArrowRight size={15} /></button></div>
        </div>}

        {stage === 'video' && <div className="video-scene scene-enter">
          <span className="eyebrow">A LITTLE SOMETHING TO WATCH</span><h1>One last little<br /><em>birthday wish.</em></h1>
          <div className={`video-frame ${videoUrl ? '' : 'video-empty-frame'}`}>
            <video controls playsInline src={videoUrl || undefined} onPlay={onBirthdayVideoPlay} aria-label="Birthday video">
              <track kind="captions" />
            </video>
            {!videoUrl && <div className="video-empty"><CirclePlay size={35} /><span>Add video path in content.ts</span></div>}
          </div>
          <p className="video-caption">{personal.videoCaption}</p>
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
        <div className="dock-label"><Music2 size={16} /><span>Soundtrack</span></div>
        <div className="dock-actions"><button type="button" onClick={toggleSoundtrack} aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}>{isPlaying ? <Pause size={16} /> : <Play size={16} />}</button>
          <button type="button" onClick={() => setIsMuted((muted) => !muted)} aria-label={isMuted ? 'Unmute soundtrack' : 'Mute soundtrack'}>{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
          <button type="button" onClick={replaySoundtrack} aria-label="Replay soundtrack"><RotateCcw size={15} /></button></div>
      </div>}
      {!soundtrackUrl && <div className="soundtrack-setup"><Music2 size={15} /><span>Add soundtrack path in content.ts</span></div>}
      <footer className="journey-footer"><span>A small birthday world, made by {personal.fromName}</span><span>FOR {personal.herName.toUpperCase()} · WITH LOVE</span></footer>
    </main>
  );
}

export default App;
