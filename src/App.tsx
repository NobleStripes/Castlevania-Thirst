import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  setDoc, 
  deleteDoc,
  serverTimestamp, 
  increment,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth, signIn, logOut } from './firebase';
import { cn } from './lib/utils';
import { Heart, LogIn, LogOut, ShieldAlert, Zap, Flame, Skull, Plus, Edit, Trash2, X, Upload, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/** Represents a votable character stored in Firestore. */
interface Character {
  id: string;
  name: string;
  /** Total number of votes this character has received. */
  thirstCount: number;
  imageUrl: string;
  description: string;
  /** CSS object-position value for image focal point (e.g. 'top', 'center'). Defaults to 'center'. */
  objectPosition?: string;
  /** Which Netflix series the character appears in — used for the tab filter. */
  series: 'original' | 'nocturne';
}

/**
 * Routes character image requests through the server-side proxy to bypass
 * hotlinking restrictions on external image hosts (e.g. Wikia).
 * Base64 data URLs (uploaded images) are returned as-is.
 */
const getProxiedUrl = (url: string) => {
  if (!url || url.startsWith('data:')) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

/**
 * Canonical list of characters used to seed or reset the Firestore database.
 * The document ID for each character is derived from its name (lowercase, hyphenated).
 * thirstCount is always initialised to 0 here; the real count lives in Firestore.
 *
 * Note: descriptions are intentionally written in the voice of an over-invested
 * Castlevania fan. The irreverence and internet slang are deliberate — do not
 * "fix" them to be more formal.
 */
const INITIAL_CHARACTERS: Omit<Character, 'id'>[] = [
  {
    name: 'Alucard',
    description: 'The dhampir son of Dracula. Elegance, sadness, and perfect hair.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/2/21/Alucard_(animated_series)_-_01.jpg/revision/latest?cb=20250816201900',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Trevor Belmont',
    description: 'The monster hunter with a whip, a bad attitude, and a surprising amount of heart.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/a/a6/Trevor_in_S4_trailer.png/revision/latest?cb=20210430192304',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Sypha Belnades',
    description: 'The Speaker magician who burns everything down with style.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/7/73/Sypha_in_S4_trailer.png/revision/latest?cb=20210430191616',
    objectPosition: 'center',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Vlad Dracula Tepes',
    description: 'The King of Vampires. A tragic figure driven by grief and a desire to end the world.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/5/5d/Dracula_(animated_series)_-_03.png/revision/latest?cb=20180919024511',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Carmilla',
    description: 'The vampire queen of Styria. Ambition, power, and a sharp tongue.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/9/90/Carmilla_talking_through_a_communication_mirror.png/revision/latest?cb=20210501215743',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Lenore',
    description: 'The diplomat sister. Soft, manipulative, and deeply dangerous.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/1/19/Lenore_-_01.png/revision/latest?cb=20200307050716',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Striga',
    // "absolute unit" — internet slang for someone impressively large and powerful. Entirely accurate.
    description: 'The warrior sister. An absolute unit in Day Armor.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/f/fb/Striga_-_01.jpg/revision/latest?cb=20200307113743',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Isaac',
    // "philosophical murder" is an intentional oxymoron — Isaac spends the series debating
    // the nature of humanity while methodically slaughtering people. Both things are true.
    description: 'The forgemaster on a journey of self-discovery and philosophical murder.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/3/3d/Isaac1jpg.png/revision/latest?cb=20181026190553',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Hector',
    // Hector's canonical power is raising dead animals as night creature companions.
    // "a few pets" is technically accurate and intentionally wholesome-sounding.
    description: 'The forgemaster who just wanted to be loved (and maybe a few pets).',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/b/b9/Hector_(animated_series)_-_01.jpg/revision/latest?cb=20180806085342',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Saint Germain',
    description: 'The eccentric traveler of the Infinite Corridor. Always searching for his lost love.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/e/e0/Saint_Germain_(animated_series)_-_02.png/revision/latest?cb=20210423210134',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Godbrand',
    // Intentional comedic reduction of a recurring antagonist to his three most prominent traits.
    description: 'The Viking vampire. He likes boats, blood, and being incredibly loud.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/6/65/Godbrand_-_02.jpg/revision/latest?cb=20180909111559',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Lisa Tepes',
    description: 'The woman who humanized Dracula. A doctor of science and kindness.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/d/d3/Lisa%27s_faceshot.png/revision/latest?cb=20181226040928',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Morana',
    description: 'The strategist of the Styrian Council of Sisters. Calm, collected, and deeply devoted to Striga.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/d/d8/Morana_-_01.jpg/revision/latest?cb=20200307114231',
    thirstCount: 0,
    series: 'original'
  },
  {
    name: 'Richter Belmont',
    description: 'The young Belmont descendant. Magic, whips, and a legacy to uphold.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/b/b0/Richter_Belmont_-_Nocturne_-_05.jpg/revision/latest?cb=20230928115344',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Maria Renard',
    description: 'The revolutionary Speaker. Animal spirits and fierce determination.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/6/67/Maria_Renard_%28animated_series%29_-_01.png/revision/latest?cb=20230928202720',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Olrox',
    description: 'The Aztec vampire. Sophisticated, powerful, and enigmatic.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/0/07/Olrox_%28Nocturne%29.png/revision/latest?cb=20230929005944',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Erzsebet Báthory (Human Form)',
    description: 'The elegant aristocrat. A beauty that hides a primordial darkness.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/8/89/Erzsebet_B%C3%A1thory_-_05.png/revision/latest?cb=20260123161109',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Erzsebet Báthory (Sekhmet)',
    description: 'The Vampire Messiah. The goddess of war and blood incarnate.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/0/0d/Erzsebet_B%C3%A1thory_-_01.png/revision/latest?cb=20231002142228',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Annette',
    description: 'The revolutionary from the Caribbean. Earth magic and a spirit of freedom.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/5/58/Annette_%28animated_series%29_-_01.png/revision/latest?cb=20230928210924',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Drolta Tzuentes (Vampire)',
    description: 'The high priestess of Erzsebet. Style, cruelty, and pink fire.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/e/eb/Horror_Beyond_Nightmares_-_Nocturne_-_30.png/revision/latest?cb=20230929132946',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Tera (Human)',
    // Tera went viral immediately after Nocturne dropped — the fandom consensus was
    // instant and loud. "MILF" is the exact language the fandom used, reproduced here
    // deliberately. This is not a bug; it is a primary data point.
    description: 'The Speaker mother who literally broke the internet. Powerful, protective, and the ultimate MILF.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/b/bf/Tera_%28animated_series%29_-_01.png/revision/latest?cb=20230928204734',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Tera (Vampire)',
    description: 'The tragic sacrifice. Even in her dark transformation, she remains a fan favorite.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/f/fe/Vampier_Tera.png/revision/latest?cb=20250125152046',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Abbot Emmanuel',
    // Structured as a deliberate callback to Tera's entry — one is MILF, one is DILF,
    // both are men of deep faith and poor life choices. The comedy is the symmetry.
    description: 'The conflicted man of faith. A complex, powerful DILF.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/7/7a/Abbot_-_01.png/revision/latest?cb=20230929134245',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Mizrak (Human)',
    description: 'The Knight of the Order of St. John. Loyal, skilled, and undeniably handsome.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/4/46/Mizrak_-_01.png/revision/latest?cb=20230928203556',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Edouard (Human)',
    description: 'The revolutionary singer with the voice of an angel. A soul that shines through his music.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/e/ef/Edouard_-_01.png/revision/latest?cb=20230930120334',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Edouard (Night Creature)',
    description: 'The tragic transformation. Even as a Night Creature, his voice remains a beacon of hope.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/3/38/Edouard_-_02.png/revision/latest?cb=20230930182553',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Julia Belmont',
    description: 'The mother of Richter. A powerful Belmont who fought to the end.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/f/f0/Julia_Belmont.png/revision/latest?cb=20230929004249',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Juste Belmont',
    description: 'The legendary Belmont of the past. Even in his older years, he carries the weight of his legacy.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/8/8a/Juste_Belmont_%28animated_series%29_-_01.png/revision/latest?cb=20231001030823',
    thirstCount: 0,
    series: 'nocturne'
  },
  {
    name: 'Alucard (Nocturne)',
    // Callbacks to the original Alucard entry ("perfect hair"). The vanity is the joke.
    description: 'The legendary dhampir returns. Older, wiser, and still incredibly handsome.',
    imageUrl: 'https://static.wikia.nocookie.net/castlevania/images/3/3a/Alucard_%28animated_series%29_-_04.png/revision/latest?cb=20231003170421',
    thirstCount: 0,
    series: 'nocturne'
  }
];

export default function App() {
  const [user] = useAuthState(auth);
  const [characters, setCharacters] = useState<Character[]>([]); // All characters from Firestore, sorted by thirstCount desc
  const [activeTab, setActiveTab] = useState<'original' | 'nocturne'>('original'); // Currently visible series tab
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set()); // Character IDs the current user has already voted for
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the admin add/edit modal
  const [editingCharacter, setEditingCharacter] = useState<Partial<Character> | null>(null); // Character being created or edited
  const [isSaving, setIsSaving] = useState(false); // Prevents double-submit while saving a character
  const [validationError, setValidationError] = useState<string | null>(null); // Image validation error shown in the modal

  // Admin access is restricted to a single hardcoded email address.
  const isAdmin = user?.email === 'godianeby413@gmail.com';

  // Subscribe to real-time character updates from Firestore.
  // The query orders by thirstCount so the grid always reflects live rankings.
  useEffect(() => {
    const q = query(collection(db, 'characters'), orderBy('thirstCount', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const charData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Character[];
      setCharacters(charData);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setError("Failed to load characters. Check console for details.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Track which characters the current user has already voted for.
  // Vote documents use the composite key `{userId}_{characterId}`, so we can
  // filter the entire votes collection client-side without an extra index.
  // Clears votes when the user signs out.
  useEffect(() => {
    if (!user) {
      setUserVotes(new Set());
      return;
    }

    const q = query(collection(db, 'votes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const votes = new Set<string>();
      snapshot.docs.forEach(doc => {
        const [voterId, charId] = doc.id.split('_');
        if (voterId === user.uid) {
          votes.add(charId);
        }
      });
      setUserVotes(votes);
    });

    return () => unsubscribe();
  }, [user]);

  /**
   * Records a vote for the given character.
   * Uses a Firestore batch write to atomically:
   *   1. Increment the character's thirstCount
   *   2. Create a vote document at `votes/{userId}_{characterId}` (acts as a unique constraint)
   * Prompts sign-in if the user is not authenticated.
   */
  const handleVote = async (characterId: string) => {
    if (!user) {
      signIn();
      return;
    }

    if (userVotes.has(characterId)) return;

    try {
      const batch = writeBatch(db);
      const charRef = doc(db, 'characters', characterId);
      batch.update(charRef, { thirstCount: increment(1) });
      const voteRef = doc(db, 'votes', `${user.uid}_${characterId}`);
      batch.set(voteRef, {
        userId: user.uid,
        characterId,
        timestamp: serverTimestamp()
      });
      await batch.commit();
    } catch (err) {
      console.error("Voting Error:", err);
    }
  };

  /**
   * Admin-only: syncs INITIAL_CHARACTERS into Firestore.
   * Uses merge:true so existing thirstCounts are preserved.
   * Characters that exist in Firestore but are absent from INITIAL_CHARACTERS are deleted,
   * keeping the database in sync with the canonical list.
   */
  const seedDatabase = async () => {
    if (!isAdmin) return;
    try {
      const batch = writeBatch(db);
      
      // 1. Add/Update characters from INITIAL_CHARACTERS
      const initialCharIds = new Set<string>();
      INITIAL_CHARACTERS.forEach(char => {
        const charId = char.name.toLowerCase().replace(/\s+/g, '-');
        initialCharIds.add(charId);
        const charRef = doc(db, 'characters', charId);
        batch.set(charRef, {
          name: char.name,
          imageUrl: char.imageUrl,
          description: char.description,
          series: char.series,
          thirstCount: increment(0) 
        }, { merge: true });
      });

      // 2. Remove characters from Firestore that are NOT in INITIAL_CHARACTERS
      // We need to fetch current characters first
      const snapshot = await getDocs(collection(db, 'characters'));
      snapshot.docs.forEach(doc => {
        if (!initialCharIds.has(doc.id)) {
          batch.delete(doc.ref);
        }
      });

      await batch.commit();
    } catch (err) {
      console.error("Seeding Error:", err);
    }
  };

  /**
   * Admin-only: saves (create or update) a character to Firestore.
   * Validates the image URL via the server before writing, unless it is a
   * locally-uploaded base64 data URL (which requires no remote check).
   * The document ID is derived from the character name when creating a new record.
   */
  const handleSaveCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingCharacter) return;
    setIsSaving(true);
    setValidationError(null);

    try {
      // Server-side Image Validation
      if (editingCharacter.imageUrl && !editingCharacter.imageUrl.startsWith('data:')) {
        const validateRes = await fetch(`/api/validate-image?url=${encodeURIComponent(editingCharacter.imageUrl)}`);
        const validation = await validateRes.json();
        
        if (!validation.valid) {
          setValidationError(`Image Error: ${validation.error || 'Invalid image URL'}`);
          setIsSaving(false);
          return;
        }
      }

      const charId = editingCharacter.id || editingCharacter.name?.toLowerCase().replace(/\s+/g, '-') || `char-${Date.now()}`;
      const charRef = doc(db, 'characters', charId);
      
      const data = {
        name: editingCharacter.name,
        description: editingCharacter.description,
        imageUrl: editingCharacter.imageUrl,
        series: editingCharacter.series || activeTab,
        thirstCount: editingCharacter.thirstCount || 0,
        objectPosition: editingCharacter.objectPosition || 'center'
      };

      await setDoc(charRef, data, { merge: true });
      setIsModalOpen(false);
      setEditingCharacter(null);
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save character.");
    } finally {
      setIsSaving(false);
    }
  };

  /** Admin-only: permanently removes a character document from Firestore. */
  const handleDeleteCharacter = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'characters', id));
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  /**
   * Converts a locally selected image file into a base64 data URL and stores it
   * in editingCharacter.imageUrl. Data URLs bypass the proxy and validation
   * endpoints since the image is already client-side.
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingCharacter(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans selection:bg-red-900 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-red-900/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-950/50 rounded-lg border border-red-500/30">
            <Flame className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-2xl font-display font-black tracking-tighter uppercase italic text-red-500">
            Castlevania <span className="text-white">Thirst</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase tracking-widest">Voter</span>
                <span className="text-sm font-medium">{user.displayName || 'Hunter'}</span>
              </div>
              <button 
                onClick={logOut}
                className="p-2 hover:bg-red-950/30 rounded-full transition-colors text-gray-400 hover:text-red-500"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={signIn}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-red-900/20"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Vote
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <section className="mb-12 text-center py-12 border-b border-white/5">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-4 tracking-tight uppercase"
          >
            Who is the best <span className="text-red-600">thirst trap?</span>
          </motion.h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Cast your vote for the most alluring, dangerous, and stylish characters from the Netflix Castlevania series. 
            One vote per character. Choose wisely, hunter.
          </p>

          {/* Tab Switcher */}
          <div className="mt-12 flex items-center justify-center gap-2 p-1 bg-white/5 rounded-2xl w-fit mx-auto border border-white/10">
            <button
              onClick={() => setActiveTab('original')}
              className={cn(
                "px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest",
                activeTab === 'original' 
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/40" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              Original Series
            </button>
            <button
              onClick={() => setActiveTab('nocturne')}
              className={cn(
                "px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest",
                activeTab === 'nocturne' 
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/40" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              Nocturne
            </button>
          </div>
          
          {isAdmin && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button 
                onClick={() => {
                  setEditingCharacter({ name: '', description: '', imageUrl: '', thirstCount: 0 });
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-all rounded-lg font-bold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Character
              </button>
              <button 
                onClick={seedDatabase}
                className="px-6 py-3 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg flex items-center gap-2"
              >
                <ShieldAlert className="w-5 h-5" />
                {characters.length === 0 ? "Seed Initial Characters" : "Update Character Data"}
              </button>
            </div>
          )}
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            {/* Thematic flavour text instead of a generic "Loading..." */}
            <p className="text-gray-500 animate-pulse uppercase tracking-widest text-sm">Loading the crypt...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-900/50 p-8 rounded-2xl text-center">
            <Skull className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {characters
                .filter(char => char.series === activeTab)
                .map((char, index) => (
                <motion.div
                  key={char.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-[#121212] rounded-2xl overflow-hidden border border-white/5 hover:border-red-600/50 transition-all duration-500 shadow-2xl"
                >
                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingCharacter(char);
                          setIsModalOpen(true);
                        }}
                        className="p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCharacter(char.id)}
                        className="p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Rank Badge */}
                  <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-gray-300">
                    #{index + 1}
                  </div>

                  {/* Image Container */}
                  <div className="aspect-[2/3] overflow-hidden relative">
                    <img 
                      src={getProxiedUrl(char.imageUrl)} 
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      style={{ objectPosition: char.objectPosition || 'center' }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                      // If the proxied image fails to load, fall back to a
                      // seeded placeholder from Picsum so the card still renders.
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('blur=5')) {
                          target.src = `https://picsum.photos/seed/${char.id}/400/600?blur=5`;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-90" />
                    
                    {/* Vote Count Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h3 className="text-2xl font-display font-black text-white group-hover:text-red-500 transition-colors tracking-tight">{char.name}</h3>
                        <p className="text-xs text-red-500 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current" />
                          {char.thirstCount} Thirst Points
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-display uppercase tracking-[0.2em] text-red-500 font-black">Bio</span>
                        <div className="h-px flex-grow bg-gradient-to-r from-red-900/50 to-transparent" />
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed font-serif italic border-l-2 border-red-900/30 pl-3 py-1">
                        "{char.description}"
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleVote(char.id)}
                      disabled={userVotes.has(char.id)}
                      className={cn(
                        "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-auto",
                        userVotes.has(char.id) 
                          ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                          : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 active:scale-95"
                      )}
                    >
                      <Heart className={cn("w-5 h-5", userVotes.has(char.id) ? "fill-gray-600" : "fill-transparent group-hover:fill-white")} />
                      {/* "Thirst" is the comedic punchline — the primary action is named after the slang the whole app satirises. */}
                      {userVotes.has(char.id) ? "Voted" : "Thirst"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  {editingCharacter?.id ? 'Edit Character' : 'New Character'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCharacter} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Series</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCharacter(prev => ({ ...prev, series: 'original' }))}
                      className={cn(
                        "flex-1 py-2 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all",
                        (editingCharacter?.series || activeTab) === 'original' 
                          ? "bg-red-600 border-red-600 text-white" 
                          : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                      )}
                    >
                      Original
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCharacter(prev => ({ ...prev, series: 'nocturne' }))}
                      className={cn(
                        "flex-1 py-2 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all",
                        (editingCharacter?.series || activeTab) === 'nocturne' 
                          ? "bg-red-600 border-red-600 text-white" 
                          : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                      )}
                    >
                      Nocturne
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Name</label>
                  <input 
                    required
                    type="text" 
                    value={editingCharacter?.name || ''}
                    onChange={e => setEditingCharacter(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                    placeholder="Alucard..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={editingCharacter?.description || ''}
                    onChange={e => setEditingCharacter(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 transition-colors resize-none"
                    placeholder="Brief description of their thirstiness..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Portrait</label>
                  
                  {validationError && (
                    <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-500 text-xs font-medium animate-shake">
                      {validationError}
                    </div>
                  )}

                  <div className="flex items-center gap-6">
                    <div className="w-24 h-32 bg-white/5 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                      {editingCharacter?.imageUrl ? (
                        <img src={editingCharacter.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Upload className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        value={editingCharacter?.imageUrl || ''}
                        onChange={e => setEditingCharacter(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-600 transition-colors"
                        placeholder="Image URL..."
                      />
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <button type="button" className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors">
                          Upload Custom Portrait
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save Character
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-white/5 text-center text-gray-600 text-sm">
        {/* "Night Creatures Anonymous" — a deliberate AA meeting reference for the undead. */}
        <p className="mb-2">© 2026 Night Creatures Anonymous</p>
        {/* Parody of the iconic Dracula quote from the original 1989 Castlevania game:
            "What is a man? A miserable little pile of secrets!" — the one word swap is the whole joke. */}
        <p className="italic">"What is a man? A miserable little pile of thirst."</p>
      </footer>
    </div>
  );
}
