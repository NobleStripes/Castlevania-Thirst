import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  Edit,
  ExternalLink,
  Flame,
  Heart,
  LogIn,
  LogOut,
  Plus,
  Save,
  ShieldAlert,
  Skull,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { INITIAL_CHARACTERS } from './data/initialCharacters';
import { auth, db, isFirebaseConfigured, logOut, signIn } from './firebase';
import { cn } from './lib/utils';
import type { Character, CharacterInput, Series } from './types';

const ADMIN_EMAIL = 'godianeby413@gmail.com';
const LOCAL_VOTES_KEY = 'castlevania-thirst-local-votes';

const fallbackCharacterId = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

const toLocalCharacters = (): Character[] =>
  INITIAL_CHARACTERS.map((character) => ({
    ...character,
    id: fallbackCharacterId(character.name),
  }));

const factionOrder = new Map<string, number>();
const characterOrder = new Map<string, number>();

INITIAL_CHARACTERS.forEach((character, index) => {
  const factionKey = `${character.series}:${character.faction}`;
  if (!factionOrder.has(factionKey)) {
    factionOrder.set(factionKey, factionOrder.size);
  }

  characterOrder.set(fallbackCharacterId(character.name), index);
});

const getProxiedUrl = (url: string) => {
  if (!url || url.startsWith('data:')) {
    return url;
  }

  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

function sortCharacters(items: Character[]) {
  return [...items].sort((a, b) => {
    const thirstDifference = b.thirstCount - a.thirstCount;
    if (thirstDifference !== 0) {
      return thirstDifference;
    }

    const aFactionRank = factionOrder.get(`${a.series}:${a.faction || 'Uncategorized'}`) ?? Number.MAX_SAFE_INTEGER;
    const bFactionRank = factionOrder.get(`${b.series}:${b.faction || 'Uncategorized'}`) ?? Number.MAX_SAFE_INTEGER;
    if (aFactionRank !== bFactionRank) {
      return aFactionRank - bFactionRank;
    }

    const aCharacterRank = characterOrder.get(a.id) ?? characterOrder.get(fallbackCharacterId(a.name)) ?? Number.MAX_SAFE_INTEGER;
    const bCharacterRank = characterOrder.get(b.id) ?? characterOrder.get(fallbackCharacterId(b.name)) ?? Number.MAX_SAFE_INTEGER;
    if (aCharacterRank !== bCharacterRank) {
      return aCharacterRank - bCharacterRank;
    }

    return a.name.localeCompare(b.name);
  });
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Series>('original');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Partial<Character> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      return;
    }

    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setCharacters(sortCharacters(toLocalCharacters()));
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'characters'), orderBy('thirstCount', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const nextCharacters = snapshot.docs.map((item) => {
          const data = item.data() as Omit<Character, 'id'>;
          return { id: item.id, ...data };
        });
        setCharacters(nextCharacters);
        setLoading(false);
      },
      (snapshotError) => {
        setError('Failed to load characters from Firestore.');
        setLoading(false);
        console.error(snapshotError);
      },
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      const localVotes = localStorage.getItem(LOCAL_VOTES_KEY);
      if (!localVotes) {
        setUserVotes(new Set());
        return;
      }

      try {
        const ids = JSON.parse(localVotes) as string[];
        setUserVotes(new Set(ids));
      } catch {
        setUserVotes(new Set());
      }
      return;
    }

    if (!user) {
      setUserVotes(new Set());
      return;
    }

    const q = query(collection(db, 'votes'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const ids = new Set<string>();
      snapshot.docs.forEach((item) => {
        const vote = item.data() as { characterId?: string };
        if (vote.characterId) {
          ids.add(vote.characterId);
        }
      });
      setUserVotes(ids);
    });

    return () => unsub();
  }, [user]);

  const visibleCharacters = useMemo(
    () => characters.filter((character) => character.series === activeTab),
    [characters, activeTab],
  );

  async function handleVote(characterId: string) {
    if (userVotes.has(characterId)) {
      return;
    }

    if (!isFirebaseConfigured || !db) {
      setCharacters((prev) =>
        sortCharacters(
          prev.map((character) =>
            character.id === characterId
              ? { ...character, thirstCount: character.thirstCount + 1 }
              : character,
          ),
        ),
      );
      const nextVotes = new Set(userVotes);
      nextVotes.add(characterId);
      setUserVotes(nextVotes);
      localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify([...nextVotes]));
      return;
    }

    if (!user) {
      await signIn();
      return;
    }

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'characters', characterId), { thirstCount: increment(1) });
      batch.set(doc(db, 'votes', `${user.uid}_${characterId}`), {
        userId: user.uid,
        characterId,
        timestamp: serverTimestamp(),
      });
      await batch.commit();
    } catch (voteError) {
      console.error(voteError);
      setError('Vote failed. Please retry.');
    }
  }

  async function seedDatabase() {
    if (!isAdmin || !db) {
      return;
    }

    try {
      const initialIds = new Set<string>();
      const batch = writeBatch(db);

      INITIAL_CHARACTERS.forEach((character) => {
        const id = fallbackCharacterId(character.name);
        initialIds.add(id);
        batch.set(
          doc(db, 'characters', id),
          {
            ...character,
            thirstCount: increment(0),
          },
          { merge: true },
        );
      });

      const snapshot = await getDocs(collection(db, 'characters'));
      snapshot.docs.forEach((entry) => {
        if (!initialIds.has(entry.id)) {
          batch.delete(entry.ref);
        }
      });

      await batch.commit();
    } catch (seedError) {
      console.error(seedError);
      setError('Failed to seed Firestore.');
    }
  }

  async function handleSaveCharacter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingCharacter) {
      return;
    }

    setIsSaving(true);
    setValidationError(null);

    try {
      if (editingCharacter.imageUrl && !editingCharacter.imageUrl.startsWith('data:')) {
        const response = await fetch(
          `/api/validate-image?url=${encodeURIComponent(editingCharacter.imageUrl)}`,
        );
        const payload = (await response.json()) as { valid: boolean; error?: string };
        if (!payload.valid) {
          setValidationError(payload.error ?? 'Invalid image URL');
          setIsSaving(false);
          return;
        }
      }

      const id =
        editingCharacter.id ||
        (editingCharacter.name ? fallbackCharacterId(editingCharacter.name) : `char-${Date.now()}`);

      const payload: CharacterInput = {
        name: editingCharacter.name || 'Unknown Character',
        faction: editingCharacter.faction || 'Independent',
        description: editingCharacter.description || '',
        wikiUrl:
          editingCharacter.wikiUrl ||
          `https://castlevania.fandom.com/wiki/Special:Search?query=${encodeURIComponent(
            editingCharacter.name || 'Castlevania',
          )}`,
        imageUrl: editingCharacter.imageUrl || '',
        objectPosition: editingCharacter.objectPosition || 'center',
        series: editingCharacter.series || activeTab,
        thirstCount: editingCharacter.thirstCount || 0,
      };

      if (isFirebaseConfigured && db && isAdmin) {
        await setDoc(doc(db, 'characters', id), payload, { merge: true });
      } else {
        const nextCharacter: Character = { id, ...payload };
        setCharacters((prev) => {
          const withoutCurrent = prev.filter((item) => item.id !== id);
          return sortCharacters([...withoutCurrent, nextCharacter]);
        });
      }

      setIsModalOpen(false);
      setEditingCharacter(null);
    } catch (saveError) {
      console.error(saveError);
      setError('Save failed. Please retry.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteCharacter(characterId: string) {
    if (isFirebaseConfigured && db && isAdmin) {
      await deleteDoc(doc(db, 'characters', characterId));
      return;
    }

    setCharacters((prev) => prev.filter((item) => item.id !== characterId));
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingCharacter((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e7e7e7] selection:bg-red-900 selection:text-white">
      <header className="sticky top-0 z-50 border-b border-red-900/30 bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-2">
              <Flame className="h-6 w-6 text-red-500" />
            </div>
            <h1 className="font-display text-2xl font-black uppercase tracking-tight text-red-500">
              Castlevania <span className="text-white">Thirst</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!isFirebaseConfigured && (
              <span className="hidden rounded-full border border-yellow-700/50 bg-yellow-950/30 px-3 py-1 text-xs text-yellow-300 sm:block">
                Local mode
              </span>
            )}

            {isFirebaseConfigured && user ? (
              <>
                <span className="hidden text-sm text-gray-300 sm:block">
                  {user.displayName || user.email || 'Hunter'}
                </span>
                <button
                  onClick={() => void logOut()}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-950/40 hover:text-red-400"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : isFirebaseConfigured ? (
              <button
                onClick={() => void signIn()}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-500"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <section className="mb-10 border-b border-white/10 pb-10 text-center">
          <h2 className="mb-4 text-4xl font-black uppercase tracking-tight md:text-6xl">
            Pick your favorite <span className="text-red-600">thirst trap</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-400">
            Vote across both Netflix series timelines. Rankings update instantly in cloud mode and stay local in fallback mode.
          </p>

          <div className="mx-auto mt-8 flex w-fit rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setActiveTab('original')}
              className={cn(
                'rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all',
                activeTab === 'original'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
              )}
            >
              Original
            </button>
            <button
              onClick={() => setActiveTab('nocturne')}
              className={cn(
                'rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all',
                activeTab === 'nocturne'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
              )}
            >
              Nocturne
            </button>
          </div>

          {(isAdmin || !isFirebaseConfigured) && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setEditingCharacter({
                    name: '',
                    description: '',
                    imageUrl: '',
                    thirstCount: 0,
                    series: activeTab,
                  });
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
                Add Character
              </button>

              {isAdmin && isFirebaseConfigured && (
                <button
                  onClick={() => void seedDatabase()}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-5 py-2 text-sm font-bold text-red-400 transition-colors hover:bg-red-500 hover:text-white"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Sync Catalog
                </button>
              )}
            </div>
          )}
        </section>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="h-11 w-11 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Loading crypt records</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
            <Skull className="mx-auto mb-3 h-10 w-10 text-red-500" />
            <p className="text-red-200">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {visibleCharacters.map((character, index) => (
                <motion.article
                  key={character.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {(isAdmin || !isFirebaseConfigured) && (
                      <div className="absolute right-3 top-3 z-10 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCharacter(character);
                            setIsModalOpen(true);
                          }}
                          className="rounded-full border border-white/20 bg-black/70 p-2 text-white transition-colors hover:bg-white hover:text-black"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => void handleDeleteCharacter(character.id)}
                          className="rounded-full border border-white/20 bg-black/70 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <div className="absolute left-3 top-3 z-10 rounded-full border border-white/15 bg-black/70 px-2 py-1 text-xs font-bold text-gray-200">
                      #{index + 1}
                    </div>

                    <img
                      src={getProxiedUrl(character.imageUrl)}
                      alt={character.name}
                      referrerPolicy="no-referrer"
                      style={{ objectPosition: character.objectPosition || 'center' }}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(event) => {
                        const image = event.currentTarget;
                        if (!image.src.includes('picsum.photos')) {
                          image.src = `https://picsum.photos/seed/${character.id}/400/600?blur=3`;
                        }
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#11111155] to-transparent" />

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-display text-xl font-black text-white">{character.name}</h3>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-300">
                        {character.faction}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-red-400">
                        <Heart className="h-3 w-3 fill-current" />
                        {character.thirstCount} thirst points
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <p className="text-sm italic leading-relaxed text-gray-300">"{character.description}"</p>
                    <a
                      href={character.wikiUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-300 transition-colors hover:text-red-200"
                    >
                      Castlevania Wiki
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    <button
                      onClick={() => void handleVote(character.id)}
                      disabled={userVotes.has(character.id)}
                      className={cn(
                        'inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all',
                        userVotes.has(character.id)
                          ? 'cursor-not-allowed border border-white/10 bg-white/5 text-gray-600'
                          : 'bg-red-600 text-white hover:bg-red-500',
                      )}
                    >
                      <Heart
                        className={cn(
                          'h-4 w-4',
                          userVotes.has(character.id) ? 'fill-gray-600' : 'fill-transparent',
                        )}
                      />
                      {userVotes.has(character.id) ? 'Voted' : 'Thirst'}
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90"
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#121212] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="font-display text-lg font-black uppercase tracking-wide text-white">
                  {editingCharacter?.id ? 'Edit Character' : 'New Character'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={(event) => void handleSaveCharacter(event)} className="space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Series</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingCharacter((prev) => ({
                            ...prev,
                            series: 'original',
                          }))
                        }
                        className={cn(
                          'flex-1 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-widest',
                          (editingCharacter?.series || activeTab) === 'original'
                            ? 'border-red-600 bg-red-600 text-white'
                            : 'border-white/15 bg-white/5 text-gray-400',
                        )}
                      >
                        Original
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingCharacter((prev) => ({
                            ...prev,
                            series: 'nocturne',
                          }))
                        }
                        className={cn(
                          'flex-1 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-widest',
                          (editingCharacter?.series || activeTab) === 'nocturne'
                            ? 'border-red-600 bg-red-600 text-white'
                            : 'border-white/15 bg-white/5 text-gray-400',
                        )}
                      >
                        Nocturne
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Name</label>
                    <input
                      required
                      value={editingCharacter?.name || ''}
                      onChange={(event) =>
                        setEditingCharacter((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-red-600"
                      placeholder="Character name"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
                    <textarea
                      required
                      rows={2}
                      value={editingCharacter?.description || ''}
                      onChange={(event) =>
                        setEditingCharacter((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-red-600"
                      placeholder="Short bio"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Faction</label>
                    <input
                      required
                      value={editingCharacter?.faction || ''}
                      onChange={(event) =>
                        setEditingCharacter((prev) => ({
                          ...prev,
                          faction: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-red-600"
                      placeholder="Belmont Clan"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Castlevania Wiki URL</label>
                    <input
                      type="url"
                      value={editingCharacter?.wikiUrl || ''}
                      onChange={(event) =>
                        setEditingCharacter((prev) => ({
                          ...prev,
                          wikiUrl: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-red-600"
                      placeholder="https://castlevania.fandom.com/wiki/..."
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Image URL</label>
                    <input
                      value={editingCharacter?.imageUrl || ''}
                      onChange={(event) =>
                        setEditingCharacter((prev) => ({
                          ...prev,
                          imageUrl: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition-colors focus:border-red-600"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 transition-colors hover:bg-white/10"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </button>
                    </div>
                  </div>
                </div>

                {validationError && (
                  <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs text-red-300">
                    {validationError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-3 text-sm font-bold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
                >
                  {isSaving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Character
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-16 border-t border-white/10 px-6 py-10 text-center text-xs text-gray-500">
        <p>Castlevania Thirst Counter • 2026</p>
        <p className="mt-2">Character details and reference links from Castlevania Wiki.</p>
      </footer>
    </div>
  );
}
