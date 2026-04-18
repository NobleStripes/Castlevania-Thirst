# Castlevania Thirst

Castlevania Thirst is a voting board for Netflix Castlevania and Castlevania: Nocturne characters, organized by faction and powered by one extremely serious question:

Who is the most catastrophic thirst trap in this franchise?

This repository exists because somebody looked at a gothic horror saga full of vampire politics, intergenerational trauma, church corruption, doomed love, immaculate cheekbones, and one profoundly dangerous supply of Belmont genetics, and decided that what the world needed was a ranked scoreboard.

That somebody was correct.

## What This Is

- A faction-sorted character board for the original show and Nocturne.
- A live vote counter with optional Firebase sync.
- A local fallback mode for when Firebase is not configured.
- A Castlevania Wiki-linked roster so every character entry has an actual reference.
- A shrine to terrible decisions, exquisite character design, and preventable emotional damage.

## The Tera Incident

This project would be dishonest if it did not address the event that helped spiritually validate its existence.

An animator associated with Castlevania: Nocturne made pinup Tera art.

Credit where it is due: the specific post this README is referring to is by rynplais:
https://x.com/rynplais/status/1712237713267568864?s=20

Additional evidence:
https://x.com/rynplais/status/1717930921704190190?s=20
https://x.com/rynplais/status/1708102647427846609?s=20

That was not a minor fandom moment. That was a systems event.

That was the kind of image drop that makes a normal person close the tab, stare into middle distance, and ask whether mankind was ever supposed to wield this much power.

So yes, this README is zeroing in on that.

Because once official-adjacent Tera pinup art enters the cultural bloodstream, you are no longer building a normal fan app. You are managing fallout.

And from that fallout rose a simple principle:

Tera Renard was never going to be treated like a background data row.

Neither were Lisa Tepes or Julia Belmont.

Hence the MILF badge.

## Current Priorities

This app currently focuses on:

- Original-series characters.
- Nocturne characters.
- Faction ordering instead of random roster sprawl.
- Character cards with direct Castlevania Wiki links.
- The correct level of reverence for beautiful, dangerous people making horrible life choices.

## Roster Logic

Characters are grouped by show, then ordered by faction.

Original-series examples:
- Belmont Allies
- Tepes Family
- Forgemasters
- Styrian Sisterhood
- Dracula's War Council

Nocturne examples:
- Belmont Clan
- Revolutionaries
- Renard Household
- Church
- Independent Vampires
- Bathory Court

This means the board does not read like a wiki dump. It reads like a curated gallery of faction-based bad decisions.

## The MILF Council

Some truths do not require debate.

The MILF badge currently applies to:
- Lisa Tepes
- Tera Renard
- Tera Renard (Vampire)
- Julia Belmont

This is not arbitrary.

This is governance.

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- Firebase
- Motion
- Lucide React
- Tailwind CSS

The code is modern.
The premise is deeply unserious.
The execution is more disciplined than the premise deserves.

## Getting Started

1. Clone the crypt:

```bash
git clone https://github.com/NobleStripes/Castlevania-Thirst.git
cd Castlevania-Thirst
```

2. Install dependencies:

```bash
npm install
```

3. Start the app:

```bash
npm run dev
```

4. Open the board:

```text
http://localhost:3000
```

## Firebase

Firebase is optional.

If the `VITE_FIREBASE_*` variables in [.env.example](.env.example) are empty, the app runs in local mode and stores vote state in the browser.

If Firebase is configured, the app can:
- load characters from Firestore
- sync votes in real time
- support sign-in based voting
- support admin sync and edits

## Scripts

- `npm run dev`: Start the Express + Vite development server.
- `npm run build`: Build the production client bundle.
- `npm run preview`: Preview the built app.
- `npm run lint`: Run TypeScript checks.
- `npm run clean`: Remove the `dist` folder.

## Data Notes

Seed character data lives in [src/data/initialCharacters.ts](src/data/initialCharacters.ts).

Each entry includes:
- name
- faction
- description
- wiki URL
- image URL
- optional badge
- series

This project no longer depends on Gemini, random generated blurbs, or mystery links that die on contact.

It is now a cleaner, better-documented machine for ranking beautiful disasters.

## Important Truths

- Dracula remains one of the most elegant problems ever animated.
- Carmilla still weaponizes posture better than most armies weaponize steel.
- Olrox has his own gravitational field.
- Mizrak is proof that church-affiliated characters can still be an issue.
- The existence of Tera pinup art means history forked and this repository lives on the cursed branch.

## License

Use the code if you want.

Just understand that this repository was built in full awareness that the Castlevania franchise keeps producing people who are too dangerous to be this hot, and yet here we all are.
