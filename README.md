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

Let the record reflect that there was a before and an after.

Before: Castlevania: Nocturne was an animated streaming series with critical acclaim, a compelling magic system, and a strong supporting cast including a warm, capable vampire hunter mother named Tera Renard.

After: an animator who worked on Castlevania: Nocturne posted a Tera in black swimsuit pinup art to the internet and then just kept living their life as if nothing had happened.

The perpetrator is Ryan Plaisance (@rynplais) and this README is citing the post like a legal exhibit:
https://x.com/rynplais/status/1712237713267568864?s=20

This was not a normal fan art moment.
This was not a "nice to see the community engaging with the characters" moment.
This was not even a "bold creative choice" moment.

This was an act of psychological warfare conducted with full production knowledge of the character model.

This was a professional who looked at the finished Tera Renard and thought: "I have seen inside this design. I know things. I will now transfer those things into the public domain. Directly. In swimsuit form."

And then they did it.

And then the internet saw it.

And then nobody was normal anymore.

The specific chain of events that followed is not fully documentable, but the downstream effects included:
- at least one person opening a code editor
- making a TypeScript type for a Castlevania thirst ranking system
- giving that type a `badge` field
- using that badge field to formally designate Tera Renard as a member of a council

That council exists because of that post.
This entire app exists because of that post.
The MILF badge infrastructure, the faction ordering, the wiki links, the Firebase integration — all of it:

Downstream consequences of one animator posting one pinup and going to sleep unbothered.

If you are looking for someone to blame, the citation is above.
If you are looking for someone to thank, the citation is also above.

From that swimsuit rose a permanent design principle:

Tera Renard was never again going to be treated like a background entry in a neutral database.

Neither were Lisa Tepes or Julia Belmont.

Hence the MILF badge.
Hence the council.
Hence the consequences.
Hence this entire repository.

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
