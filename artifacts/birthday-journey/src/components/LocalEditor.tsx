import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { ArrowDown, ArrowUp, Check, ImagePlus, RotateCcw, X } from 'lucide-react';
import {
  getArtForKind, getGiftLabel, giftKinds,
  type GiftCard, type GiftKind, type KeepsakeSettings,
} from '../lib/keepsake-settings';
import './local-editor.css';

type EditorTab = 'story' | 'collection' | 'content';

interface LocalEditorProps {
  settings: KeepsakeSettings;
  onChange: Dispatch<SetStateAction<KeepsakeSettings>>;
  assetUrl: (path: string) => string;
  storeAsset: (key: string, file: File) => Promise<void>;
  onPreview: () => void;
  onReset: () => void;
  saveFailed: boolean;
}

function Field({ label, value, onChange, multiline = false, hint }: {
  label: string; value: string; onChange: (value: string) => void; multiline?: boolean; hint?: string;
}) {
  return <label className={`editor-field ${multiline ? 'multiline' : ''}`}>
    <span>{label}</span>
    {multiline
      ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} />
      : <input value={value} onChange={(event) => onChange(event.target.value)} />}
    {hint && <small>{hint}</small>}
  </label>;
}

function AssetField({ label, value, accept = 'image/*', preview, onChange, onChoose }: {
  label: string; value: string; accept?: string; preview: string; onChange: (path: string) => void; onChoose: (file: File) => void;
}) {
  return <div className="editor-asset-field">
    <div className="editor-asset-row">
      <span>{label}</span>
      <label className="editor-file-button">
        <ImagePlus size={15} /> {value ? 'Replace file' : 'Choose file'}
        <input type="file" accept={accept} onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onChoose(file);
          event.currentTarget.value = '';
        }} />
      </label>
    </div>
    {preview && accept === 'image/*' && <img className="editor-asset-preview" src={preview} alt={`${label} preview`} />}
    {preview && accept === 'audio/*' && <audio className="editor-media-preview" controls src={preview} />}
    {preview && accept === 'video/*' && <video className="editor-media-preview" controls playsInline src={preview} />}
    {value
      ? <button type="button" className="editor-clear-file" onClick={() => onChange('')}>Remove selected file</button>
      : <small className="editor-hint">The file stays in this browser; it isn’t uploaded.</small>}
  </div>;
}

function Group({ title, note, children, open = false }: {
  title: string; note?: string; children: ReactNode; open?: boolean;
}) {
  return <details className="editor-group" open={open}>
    <summary><span>{title}</span>{note && <small>{note}</small>}</summary>
    <div className="editor-group-body">{children}</div>
  </details>;
}

export function LocalEditor({ settings, onChange, assetUrl, storeAsset, onPreview, onReset, saveFailed }: LocalEditorProps) {
  const [tab, setTab] = useState<EditorTab>('story');
  const [error, setError] = useState('');
  const updatePersonal = (key: string, value: string) => onChange((current) => ({
    ...current, personal: { ...current.personal, [key]: value },
  }));
  const updateGift = (id: string, changes: Partial<GiftCard>) => onChange((current) => ({
    ...current, gifts: current.gifts.map((gift) => gift.id === id ? { ...gift, ...changes } : gift),
  }));
  const upload = (key: string, file: File, apply: (path: string) => void) => {
    setError('');
    void storeAsset(key, file)
      .then(() => apply(`local:${key}`))
      .catch(() => setError('That file could not be saved in this browser. Try a smaller file or another browser.'));
  };
  const changeGiftKind = (gift: GiftCard, kind: GiftKind) => {
    const label = getGiftLabel(kind);
    updateGift(gift.id, { kind, art: getArtForKind(kind), placeholder: label.placeholder });
  };
  const moveGift = (index: number, direction: -1 | 1) => {
    const next = [...settings.gifts];
    const destination = index + direction;
    if (destination < 0 || destination >= next.length) return;
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange({ ...settings, gifts: next });
  };
  const addCustomGift = () => {
    const id = `custom-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.floor(Math.random() * 10000)}`}`;
    onChange({
      ...settings,
      gifts: [...settings.gifts, {
        id, kind: 'custom', art: 'custom', title: 'A new little gift',
        subtitle: 'Made just for you', enabled: true, placeholder: 'Add your message',
        message: '', image: '',
      }],
    });
  };
  const updateFlower = (index: number, key: 'name' | 'message', value: string) => {
    if (key === 'name') {
      const bouquetFlowers = [...settings.bouquetFlowers];
      bouquetFlowers[index] = value;
      onChange({ ...settings, bouquetFlowers });
    } else {
      const flowerMessages = [...settings.flowerMessages];
      flowerMessages[index] = value;
      onChange({ ...settings, flowerMessages });
    }
  };

  return <section className="local-editor" aria-label="Keepsake editor">
    <header className="local-editor-heading">
      <div>
        <span className="eyebrow">YOUR EDITING SPACE</span>
        <h1>Make it <em>yours.</em></h1>
        <p>Change the story, gifts, photos, and messages. Updates save automatically on this browser.</p>
      </div>
      <div className="editor-header-actions">
        <span className={`editor-save-state ${saveFailed ? 'has-error' : ''}`}>
          {saveFailed ? <X size={14} /> : <Check size={14} />}
          {saveFailed ? 'Could not save' : 'Saved on this browser'}
        </span>
        <button type="button" className="editor-preview-button" onClick={onPreview}>Preview keepsake</button>
      </div>
    </header>

    <div className="editor-local-warning">
      <span className="editor-lock-mark" aria-hidden="true">i</span>
      <span>Local only: this page has no sign-in. Edits and media stay in this browser and aren’t shared; other visitors edit their own browser copy.</span>
    </div>

    <nav className="editor-tabs" aria-label="Editor sections">
      <button type="button" className={tab === 'story' ? 'active' : ''} onClick={() => setTab('story')}>Your story</button>
      <button type="button" className={tab === 'collection' ? 'active' : ''} onClick={() => setTab('collection')}>Gift collection <span>{settings.gifts.length}</span></button>
      <button type="button" className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>Gift messages & media</button>
    </nav>

    {error && <p className="editor-error" role="alert">{error}</p>}

    {tab === 'story' && <section className="editor-section">
      <div className="editor-section-title"><span className="eyebrow">THE JOURNEY</span><h2>Words she’ll see</h2></div>
      <div className="editor-fields-grid">
        <Field label="Her name" value={settings.personal.herName} onChange={(value) => updatePersonal('herName', value)} />
        <Field label="Your name" value={settings.personal.fromName} onChange={(value) => updatePersonal('fromName', value)} />
        <Field label="Greeting headline" value={settings.personal.greeting} onChange={(value) => updatePersonal('greeting', value)} />
        <Field label="Opening line" value={settings.personal.introLine} onChange={(value) => updatePersonal('introLine', value)} />
        <Field label="Collection introduction" value={settings.personal.collectionIntro} onChange={(value) => updatePersonal('collectionIntro', value)} />
        <Field label="Voice-note label" value={settings.personal.birthdayRecordingLabel} onChange={(value) => updatePersonal('birthdayRecordingLabel', value)} />
        <Field label="The note you made" value={settings.personal.madeByNote} onChange={(value) => updatePersonal('madeByNote', value)} multiline />
        <Field label="Final letter heading" value={settings.personal.finalLetterTitle} onChange={(value) => updatePersonal('finalLetterTitle', value)} />
        <Field label="Final birthday letter" value={settings.personal.finalLetter} onChange={(value) => updatePersonal('finalLetter', value)} multiline />
        <Field label="Sign-off" value={settings.personal.signOff} onChange={(value) => updatePersonal('signOff', value)} />
        <Field label="Birthday card wish" value={settings.personal.cardWish} onChange={(value) => updatePersonal('cardWish', value)} multiline />
        <Field label="Cake wish" value={settings.personal.cakeWish} onChange={(value) => updatePersonal('cakeWish', value)} multiline />
        <Field label="Poem" value={settings.personal.poem} onChange={(value) => updatePersonal('poem', value)} multiline />
        <Field label="Photo-shower ending letter" value={settings.personal.photoShowerFinalLetter} onChange={(value) => updatePersonal('photoShowerFinalLetter', value)} multiline />
        <Field label="Video caption / text alternative" value={settings.personal.videoCaption} onChange={(value) => updatePersonal('videoCaption', value)} multiline />
      </div>
      <Group title="Journey photos and sound" note="Choose or replace the media used in the opening and finale." open>
        <div className="editor-asset-grid">
          {([
            ['greetingPhoto', 'Greeting photo', 'image/*'],
            ['birthdayCardPhoto', 'Birthday card artwork', 'image/*'],
            ['birthdayRecording', 'Voice recording', 'audio/*'],
            ['soundtrack', 'Background soundtrack', 'audio/*'],
            ['birthdayVideo', 'Birthday video', 'video/*'],
          ] as const).map(([key, label, accept]) => <AssetField key={key} label={label}
            value={settings.media[key] ?? ''} accept={accept}
            preview={assetUrl(settings.media[key] ?? '')}
            onChange={(path) => onChange({ ...settings, media: { ...settings.media, [key]: path } })}
            onChoose={(file) => upload(`journey/${key}`, file, (path) => onChange((current) => ({
              ...current, media: { ...current.media, [key]: path },
            })))} />)}
        </div>
      </Group>
    </section>}

    {tab === 'collection' && <section className="editor-section">
      <div className="editor-section-title editor-collection-title">
        <div><span className="eyebrow">YOUR GIFT BOX</span><h2>Choose what’s inside</h2></div>
        <button type="button" className="editor-add-button" onClick={addCustomGift}>＋ Add a gift</button>
      </div>
      <p className="editor-section-intro">Rename, reorder, hide, or replace a gift. New custom gifts can have their own message and photo.</p>
      <div className="editor-gift-list">
        {settings.gifts.map((gift, index) => <article key={gift.id} className={`editor-gift-card ${gift.enabled ? '' : 'is-hidden'}`}>
          <div className="editor-gift-card-top">
            <span className="editor-gift-count">{String(index + 1).padStart(2, '0')}</span>
            <label className="editor-visibility"><input type="checkbox" checked={gift.enabled}
              onChange={(event) => updateGift(gift.id, { enabled: event.target.checked })} /> Show in collection</label>
            <div className="editor-move-buttons">
              <button type="button" aria-label={`Move ${gift.title} up`} disabled={index === 0} onClick={() => moveGift(index, -1)}><ArrowUp size={15} /></button>
              <button type="button" aria-label={`Move ${gift.title} down`} disabled={index === settings.gifts.length - 1} onClick={() => moveGift(index, 1)}><ArrowDown size={15} /></button>
            </div>
          </div>
          <div className="editor-fields-grid">
            <Field label="Gift title" value={gift.title} onChange={(title) => updateGift(gift.id, { title })} />
            <Field label="Short description" value={gift.subtitle} onChange={(subtitle) => updateGift(gift.id, { subtitle })} />
            <label className="editor-field">
              <span>Gift experience</span>
              <select value={gift.kind} onChange={(event) => changeGiftKind(gift, event.target.value as GiftKind)}>
                {giftKinds.map((kind) => <option key={kind} value={kind}>{getGiftLabel(kind).title}</option>)}
              </select>
              <small>Choose a different built-in interaction or a custom message-and-photo gift.</small>
            </label>
          </div>
          {gift.kind === 'custom' && <div className="editor-custom-gift">
            <Field label="Your custom gift message" value={gift.message} onChange={(message) => updateGift(gift.id, { message })} multiline />
            <AssetField label="Photo for this gift" value={gift.image} preview={assetUrl(gift.image)}
              onChange={(image) => updateGift(gift.id, { image })}
              onChoose={(file) => upload(`custom/${gift.id}`, file, (image) => updateGift(gift.id, { image }))} />
          </div>}
          <button type="button" className="editor-remove-gift" onClick={() => {
            if (window.confirm(`Remove “${gift.title}” from the gift collection on this browser?`)) {
              onChange({ ...settings, gifts: settings.gifts.filter((item) => item.id !== gift.id) });
            }
          }}>Remove gift</button>
        </article>)}
      </div>
      {settings.gifts.length === 0 && <div className="editor-empty">Your collection is empty. Add a gift to bring it back.</div>}
      <button type="button" className="editor-reset-button" onClick={onReset}><RotateCcw size={14} /> Reset this browser’s edits</button>
    </section>}

    {tab === 'content' && <section className="editor-section">
      <div className="editor-section-title"><span className="eyebrow">THE DETAILS</span><h2>Messages and keepsakes</h2></div>
      <p className="editor-section-intro">Everything below is editable. Personal photos, notes, dates, and songs stay yours to supply—nothing is filled in with invented memories.</p>

      <Group title="Bouquet · 18 blooms" note="Flower names and their matching notes." open>
        <div className="editor-repeat-list">
          {settings.bouquetFlowers.map((flower, index) => <div className="editor-repeat-card" key={`flower-${index}`}>
            <strong>Bloom {String(index + 1).padStart(2, '0')}</strong>
            <Field label="Flower name" value={flower} onChange={(value) => updateFlower(index, 'name', value)} />
            <Field label="Message for this flower" value={settings.flowerMessages[index] ?? ''} multiline
              onChange={(value) => updateFlower(index, 'message', value)} />
          </div>)}
        </div>
      </Group>

      <Group title="Letter box · 18 letters" note="Each letter can have its own photo and message.">
        <div className="editor-repeat-list">
          {settings.letterNotes.map((note, index) => <div className="editor-repeat-card" key={`letter-${index}`}>
            <strong>Letter {String(index + 1).padStart(2, '0')}</strong>
            <Field label="Letter message" value={note.message} multiline onChange={(message) => {
              const letterNotes = [...settings.letterNotes]; letterNotes[index] = { ...note, message };
              onChange({ ...settings, letterNotes });
            }} />
            <AssetField label="Photo inside this letter" value={note.photo} preview={assetUrl(note.photo)}
              onChange={(photo) => {
                const letterNotes = [...settings.letterNotes]; letterNotes[index] = { ...note, photo };
                onChange({ ...settings, letterNotes });
              }}
              onChoose={(file) => upload(`letter/${index}`, file, (photo) => onChange((current) => {
                const letterNotes = [...current.letterNotes];
                letterNotes[index] = { ...letterNotes[index], photo };
                return { ...current, letterNotes };
              }))} />
          </div>)}
        </div>
      </Group>

      <Group title="Love jar · 18 reasons">
        <div className="editor-repeat-list">
          {settings.loveReasons.map((reason, index) => <Field key={`reason-${index}`}
            label={`Reason ${String(index + 1).padStart(2, '0')}`} value={reason} multiline
            onChange={(value) => { const loveReasons = [...settings.loveReasons]; loveReasons[index] = value; onChange({ ...settings, loveReasons }); }} />)}
        </div>
      </Group>

      <Group title="A-to-Z book · 26 wishes">
        <div className="editor-repeat-list">
          {settings.alphabetWishes.map((wish, index) => <Field key={`wish-${wish.letter}`}
            label={`Wish for ${wish.letter}`} value={wish.wish} multiline
            onChange={(value) => { const alphabetWishes = [...settings.alphabetWishes]; alphabetWishes[index] = { ...wish, wish: value }; onChange({ ...settings, alphabetWishes }); }} />)}
        </div>
      </Group>

      <Group title="Photo shower · six moments" note="A photo and note for each pull.">
        <div className="editor-repeat-list">
          {settings.photoShowerMoments.map((moment, index) => <div className="editor-repeat-card" key={`moment-${index}`}>
            <strong>Photo {String(index + 1).padStart(2, '0')}</strong>
            <AssetField label="Photo" value={moment.photo} preview={assetUrl(moment.photo)}
              onChange={(photo) => { const photoShowerMoments = [...settings.photoShowerMoments]; photoShowerMoments[index] = { ...moment, photo }; onChange({ ...settings, photoShowerMoments }); }}
              onChoose={(file) => upload(`photo-shower/${index}`, file, (photo) => onChange((current) => {
                const photoShowerMoments = [...current.photoShowerMoments];
                photoShowerMoments[index] = { ...photoShowerMoments[index], photo };
                return { ...current, photoShowerMoments };
              }))} />
            <Field label="Message for this photo" value={moment.message} multiline
              onChange={(message) => { const photoShowerMoments = [...settings.photoShowerMoments]; photoShowerMoments[index] = { ...moment, message }; onChange({ ...settings, photoShowerMoments }); }} />
          </div>)}
        </div>
      </Group>

      <Group title="Songbook" note="Add and remove song pages; only your selected lyric excerpt is shown.">
        <div className="editor-repeat-list">
          {settings.songs.map((song, index) => <div className="editor-repeat-card" key={`song-${index}`}>
            <div className="editor-repeat-heading"><strong>Song {String(index + 1).padStart(2, '0')}</strong>
              {settings.songs.length > 1 && <button type="button" className="editor-remove-gift" onClick={() => onChange({ ...settings, songs: settings.songs.filter((_, songIndex) => songIndex !== index) })}>Remove song</button>}
            </div>
            <Field label="Song title" value={song.title} onChange={(title) => { const songs = [...settings.songs]; songs[index] = { ...song, title }; onChange({ ...settings, songs }); }} />
            <Field label="Dedication" value={song.dedication} multiline onChange={(dedication) => { const songs = [...settings.songs]; songs[index] = { ...song, dedication }; onChange({ ...settings, songs }); }} />
            <Field label="Selected lyric excerpt" value={song.lyric} multiline onChange={(lyric) => { const songs = [...settings.songs]; songs[index] = { ...song, lyric }; onChange({ ...settings, songs }); }} />
            <Field label="Spotify track link" value={song.spotifyUrl} hint="Opens Spotify in a new tab; the songbook does not stream from Spotify."
              onChange={(spotifyUrl) => { const songs = [...settings.songs]; songs[index] = { ...song, spotifyUrl }; onChange({ ...settings, songs }); }} />
            <AssetField label="Photo for this song" value={song.photo} preview={assetUrl(song.photo)}
              onChange={(photo) => { const songs = [...settings.songs]; songs[index] = { ...song, photo }; onChange({ ...settings, songs }); }}
              onChoose={(file) => upload(`song/${index}/photo`, file, (photo) => onChange((current) => {
                const songs = [...current.songs]; songs[index] = { ...songs[index], photo };
                return { ...current, songs };
              }))} />
            <AssetField label="Local song audio" value={song.audio} accept="audio/*" preview={assetUrl(song.audio)}
              onChange={(audio) => { const songs = [...settings.songs]; songs[index] = { ...song, audio }; onChange({ ...settings, songs }); }}
              onChoose={(file) => upload(`song/${index}/audio`, file, (audio) => onChange((current) => {
                const songs = [...current.songs]; songs[index] = { ...songs[index], audio };
                return { ...current, songs };
              }))} />
          </div>)}
        </div>
        <button type="button" className="editor-add-button" onClick={() => onChange({ ...settings, songs: [...settings.songs, { title: '[ADD SONG TITLE]', dedication: '[ADD DEDICATION]', lyric: '[ADD SELECTED LYRIC EXCERPT]', spotifyUrl: '', photo: '', audio: '' }] })}>＋ Add song page</button>
      </Group>

      <Group title="Memory calendar" note="Add only dates and memories you want to share.">
        <div className="editor-repeat-list">
          {settings.calendarEntries.map((entry, index) => <div className="editor-repeat-card" key={`date-${index}`}>
            <div className="editor-repeat-heading"><strong>Memory date {index + 1}</strong><button type="button" className="editor-remove-gift" onClick={() => onChange({ ...settings, calendarEntries: settings.calendarEntries.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></div>
            <label className="editor-field"><span>Date</span><input type="date" min="2025-10-01" max="2026-10-31"
              value={/^\d{4}-\d{2}-\d{2}$/.test(entry.date) ? entry.date : ''}
              onChange={(event) => { const calendarEntries = [...settings.calendarEntries]; calendarEntries[index] = { ...entry, date: event.target.value }; onChange({ ...settings, calendarEntries }); }} /></label>
            <small className="editor-hint">The calendar covers October 2025 through October 2026.</small>
            <Field label="Memory" value={entry.message} multiline onChange={(message) => { const calendarEntries = [...settings.calendarEntries]; calendarEntries[index] = { ...entry, message }; onChange({ ...settings, calendarEntries }); }} />
            <AssetField label="Memory photo" value={entry.photo} preview={assetUrl(entry.photo)}
              onChange={(photo) => { const calendarEntries = [...settings.calendarEntries]; calendarEntries[index] = { ...entry, photo }; onChange({ ...settings, calendarEntries }); }}
              onChoose={(file) => upload(`calendar/${index}`, file, (photo) => onChange((current) => {
                const calendarEntries = [...current.calendarEntries]; calendarEntries[index] = { ...calendarEntries[index], photo };
                return { ...current, calendarEntries };
              }))} />
          </div>)}
        </div>
        <button type="button" className="editor-add-button" onClick={() => onChange({ ...settings, calendarEntries: [...settings.calendarEntries, { date: '', photo: '', message: '' }] })}>＋ Add a date</button>
      </Group>

      <Group title="Memory map · five stops" note="Edit a message and optional photo for each pin.">
        <div className="editor-repeat-list">
          {settings.memoryMapStops.map((stop, index) => <div className="editor-repeat-card" key={`stop-${index}`}>
            <strong>Memory stop {String(index + 1).padStart(2, '0')}</strong>
            <Field label="Memory" value={stop.message} multiline onChange={(message) => { const memoryMapStops = [...settings.memoryMapStops]; memoryMapStops[index] = { ...stop, message }; onChange({ ...settings, memoryMapStops }); }} />
            <AssetField label="Photo for this stop" value={stop.photo} preview={assetUrl(stop.photo)}
              onChange={(photo) => { const memoryMapStops = [...settings.memoryMapStops]; memoryMapStops[index] = { ...stop, photo }; onChange({ ...settings, memoryMapStops }); }}
              onChoose={(file) => upload(`map/${index}`, file, (photo) => onChange((current) => {
                const memoryMapStops = [...current.memoryMapStops]; memoryMapStops[index] = { ...memoryMapStops[index], photo };
                return { ...current, memoryMapStops };
              }))} />
          </div>)}
        </div>
      </Group>

      <Group title="Pop-out love card · five messages">
        <div className="editor-repeat-list">
          {settings.characterLoveParts.map((part, index) => <Field key={`character-${index}`}
            label={`Part ${index + 1}`} value={part} multiline
            onChange={(value) => { const characterLoveParts = [...settings.characterLoveParts]; characterLoveParts[index] = value; onChange({ ...settings, characterLoveParts }); }} />)}
        </div>
      </Group>

      <Group title="Reserved artwork spaces" note="Use these for your magazine, scrapbook, poster, and photo booth designs.">
        <div className="editor-asset-grid">
          {([
            ['magazine', 'Magazine artwork'],
            ['scrapbook', 'Scrapbook artwork'],
            ['poster', 'Poster artwork'],
            ['photoBooth', 'Photo booth artwork'],
          ] as const).map(([key, label]) => <AssetField key={key} label={label}
            value={settings.reservedDesignAssets[key]} preview={assetUrl(settings.reservedDesignAssets[key])}
            onChange={(path) => onChange({ ...settings, reservedDesignAssets: { ...settings.reservedDesignAssets, [key]: path } })}
            onChoose={(file) => upload(`artwork/${key}`, file, (path) => onChange((current) => ({
              ...current, reservedDesignAssets: { ...current.reservedDesignAssets, [key]: path },
            })))} />)}
        </div>
      </Group>
    </section>}

    <footer className="local-editor-footer">
      <span>Local edits are saved automatically on this browser.</span>
      <button type="button" className="editor-preview-button" onClick={onPreview}>Preview the birthday journey</button>
    </footer>
  </section>;
}
