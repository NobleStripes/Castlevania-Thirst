# Castlevania Thirst

This repository is a cathedral of bad decisions built on top of React, TypeScript, and emotionally compromised Castlevania opinions.

Castlevania Thirst is a faction-sorted character voting board for Netflix Castlevania and Castlevania: Nocturne.

It exists to answer one scientifically unanswerable but spiritually mandatory question:

Who is the most catastrophically hot liability in this universe?

Not strongest.
Not pure of heart.
Not likely to make healthy choices.

Hot.
Dangerous.
Rated by the public.

## Why This Exists

Because eventually the human mind stops seeking peace and starts building ranking systems.

Because Dracula, Carmilla, Olrox, and half the supporting cast are visual war crimes against concentration.

Because someone had to formalize the thirst with data models, faction ordering, and cloud sync.

This app is what happens when hornyposting gets CI/CD aspirations.

## What This Is

- A character board split by show and faction.
- A live vote system for ranking dangerous levels of screen presence.
- Local fallback storage when Firebase is not configured.
- Optional Firebase sync for real-time public chaos.
- Character cards with Castlevania Wiki links.
- A dedicated MILF badge system, because governance matters.

## The Tera Incident (Canonical Lore)

There was a before.
There was an after.
There was no recovery period.

An animator from Castlevania: Nocturne, Ryan Plaisance (@rynplais), posted Tera Renard swimsuit art and casually moved on with their day:
https://x.com/rynplais/status/1712237713267568864?s=20

Human civilization, however, did not move on.

Downstream effects likely included:
- opening this repository
- defining a TypeScript model for thirst rankings
- adding a badge field with institutional consequences
- creating an app where Tera is no longer a side note but a constitutional priority

This was not fan content.
This was a timeline fracture event.

## Mission Statement

This project attempts to remain:

- funny
- accurate
- structurally sound
- honest about the fact this franchise mass-produces elegant disasters

It does not pretend Dracula is just a villain.
It does not pretend Carmilla is just strategic.
It absolutely does not pretend Olrox fits inside normal categories.

## Roster Logic

Characters are grouped by show, then by faction, because this is a tribunal, not a junk drawer.

Original-series factions:
- Belmont Allies
- Țepeș Family
- Forgemasters
- Styrian Sisterhood
- Dracula's War Council

Nocturne factions:
- Belmont Clan
- Revolutionaries
- Renard Household
- Church
- Independent Vampires
- Báthory Court

## MILF Council (Legally Binding)

Some institutions run on law.
Some run on tradition.
This one runs on overwhelming aura.

Current council members:
- Lisa Țepeș
- Tera Renard
- Tera Renard (Vampire)
- Julia Belmont

The badge is not decorative.
It is a constitutional instrument.

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- Firebase
- Motion
- Lucide React
- Tailwind CSS

The software is stable.
The premise is feral.

## Getting Started

1. Clone the crypt.

```bash
git clone https://github.com/NobleStripes/Castlevania-Thirst.git
cd Castlevania-Thirst
```

2. Install dependencies.

```bash
npm install
```

3. Start the ritual.

```bash
npm run dev
```

4. Open the board.

```text
http://localhost:3000
```

Vote responsibly, by which I mean not at all.

## Firebase

Firebase is optional.

If `VITE_FIREBASE_*` values in [.env.example](.env.example) are unset, the app runs in local mode and stores votes in-browser.

If Firebase is configured, the app can:
- load characters from Firestore
- sync votes in real time
- support sign-in voting
- support admin sync and edits

Local mode is private descent.
Cloud mode is synchronized public collapse.

## Scripts

- `npm run dev`: Run the Express + Vite development server.
- `npm run build`: Build the production client.
- `npm run preview`: Preview the production build.
- `npm run lint`: Run TypeScript checks.
- `npm run clean`: Remove the `dist` folder.

## Data Notes

Seed data lives in [src/data/initialCharacters.ts](src/data/initialCharacters.ts).

Each character entry includes:
- name
- faction
- description
- wiki URL
- image URL
- optional badge
- series

This project no longer relies on random generated blurbs or mystery links.

It is now a disciplined registry of vampires, hunters, revolutionaries, church-affiliated complications, and high-risk charisma.

## Non-Negotiable Truths

- Dracula is still a monument to emotionally devastating design.
- Carmilla enters every room pre-victorious.
- Isaac could philosophize you to death while dressed better than everyone present.
- Olrox is not a man so much as a jeweled incident report.
- Mizrak confirms the church was also contributing to the global instability index.
- Tera survived Erzsebet-level trauma, arrived in Machecoul needing sanctuary, and still chose the local abbot as her emotional investment strategy.
- Emmanuel preached holy vows by day, broke celibacy by night, then picked Church reputation over fatherhood and settled into premium sperm-donor deadbeat form.
- Together, they made Maria Renard and ran the "your father is dead" cover story until Emmanuel detonated the truth mid-argument in front of her.

## License

Use the code.
Fork the code.
Deploy the code.

Just understand the inheritance.

This is not only a repository.
It is a ledger.
It is a ranking engine.
It is public evidence that Castlevania keeps manufacturing people too powerful to be this attractive and humanity keeps logging in anyway.
