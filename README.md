# Castlevania Thirst

This repository is what happens when a gothic apocalypse, a vampire succession crisis, several generations of catastrophically attractive people, and a complete collapse of normal judgment all converge into one web app.

Castlevania Thirst is a voting board for Netflix Castlevania and Castlevania: Nocturne characters, organized by faction and dedicated to the only question that has ever truly mattered:

Who is the most ruinously hot problem in this franchise?

Not strongest.
Not smartest.
Not morally upright.

Hot.
A problem.
Preferably both.

## Why This Exists

Because at some point the human brain stops being a machine for reason and becomes a haunted cathedral full of bad decisions.

Because somebody had to look at Belmonts, vampires, speakers, forgemasters, bishops, revolutionaries, immortal aristocrats, and whatever exactly Olrox has going on, and say:

"This should be ranked publicly."

Because the thirst was already there.
The app merely gave it architecture.

## What This Is

- A faction-sorted roster for the original show and Nocturne.
- A live vote board for ranking the franchise's most dangerous visual liabilities.
- A local fallback mode for offline thirst management.
- Optional Firebase sync for cloud-grade dehydration.
- Character cards with Castlevania Wiki links for factual support when your judgment has clearly abandoned you.
- A formal badge system for the MILF council, because some truths require infrastructure.

## The Tera Incident

We need to speak plainly.

This project would be a lie if it did not acknowledge the event that pushed it from "funny idea" into "historically necessary software artifact."

An animator associated with Castlevania: Nocturne made a Tera in black swimsuit pinup art.

Credit where it is due: the specific post this README is referring to is by rynplais:
https://x.com/rynplais/status/1712237713267568864?s=20

That was not a normal fandom moment.
That was not "nice fan reception."
That was not "some people enjoyed the art."

That was an atmospheric disturbance.
A spiritual sinkhole.
A measurable collapse in public hydration.

That was the kind of image drop that makes a person close every tab they have open, stand up, pace once around the room, and realize that civilization is weaker than anyone previously believed.

Once official-adjacent Tera pinup art enters the bloodstream of the community, you are no longer making a novelty app.
You are documenting an event site.
You are preserving evidence.
You are building the digital equivalent of yellow police tape around a crater.

And from that crater rose a permanent design principle:

Tera Renard was never again going to be treated like a background entry in a neutral database.

Neither were Lisa Tepes or Julia Belmont.

Hence the MILF badge.
Hence the council.
Hence the consequences.

## The Mission

This app is trying to do three things at once:

- stay funny
- stay accurate
- stay honest about the fact that this franchise keeps manufacturing beautiful disasters at an industrial rate

It is not trying to pretend that Dracula is just a villain.
It is not trying to pretend Carmilla is just a strategist.
It is not trying to pretend Olrox is operating inside normal human categories.
It is especially not trying to pretend that the community remained mentally stable after Tera pinup art entered the chat.

## Roster Logic

The board is split by show, then ordered by faction, because random character soup is for lesser systems.

Original-series factions include:
- Belmont Allies
- Tepes Family
- Forgemasters
- Styrian Sisterhood
- Dracula's War Council

Nocturne factions include:
- Belmont Clan
- Revolutionaries
- Renard Household
- Church
- Independent Vampires
- Báthory Court

This means the board reads less like a spreadsheet and more like an organized museum of extremely attractive bad omens.

## The MILF Council

Some institutions are built on law.
Some are built on tradition.
This one is built on undeniable screen presence.

The MILF badge currently applies to:
- Lisa Tepes
- Tera Renard
- Tera Renard (Vampire)
- Julia Belmont

This is not random.
This is not temporary.
This is governance by overwhelming evidence.

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- Firebase
- Motion
- Lucide React
- Tailwind CSS

So yes, the software is modern.
The premise is deranged.
The implementation is cleaner than the emotional state that inspired it.

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

3. Start the ritual:

```bash
npm run dev
```

4. Open the board:

```text
http://localhost:3000
```

Then begin voting like your conscience was never a factor.

## Firebase

Firebase is optional.

If the `VITE_FIREBASE_*` variables in [.env.example](.env.example) are empty, the app runs in local mode and stores votes in the browser.

If Firebase is configured, the app can:
- load characters from Firestore
- sync votes in real time
- support sign-in based voting
- support admin sync and edits

In other words, local mode is a private spiral.
Cloud mode is a coordinated public event.

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

This project no longer depends on Gemini, random generated blurbs, or mystery links that die on impact.

It is now a more disciplined machine for cataloging elegant monsters, doomed heroes, church-affiliated issues, and the occasional milf-tagged force of nature.

## Important Truths

- Dracula remains one of the most beautifully catastrophic men ever animated.
- Carmilla stands like she already won and the rest of the room simply hasn't processed it yet.
- Isaac has the energy of a man who could kill you, forgive you, and outdress you in the same afternoon.
- Olrox is less a character than a controlled detonation in jewelry.
- Mizrak proves the church was also contributing to the problem set.
- The existence of Tera pinup art means history branched, and this repository lives on the cursed but artistically superior timeline.

## License

Use the code if you want.

But understand what you are inheriting.

This is not merely a repo.
It is a ledger.
A ranking engine.
A witness statement.
A digital monument to the fact that the Castlevania franchise keeps producing people who are way too dangerous to be this hot, and yet humanity continues to press forward anyway.
