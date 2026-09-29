# 🎲 Backlog Picker — Decky Loader Plugin

Can't decide what to play from your massive Steam backlog? Let **Backlog Picker** choose for you!

## Features

- 🎲 **One-tap random pick** from your Steam library
- 🎮 **Launch directly** from the pick screen — no need to leave Gaming Mode
- 🔄 **Reroll** if you don't like the pick
- 🚫 **Blacklist games** you never want picked again
- 🔧 **Smart filters:**
  - Installed games only (so it's always ready to play)
  - Never played (0 hours)
  - Max/min playtime sliders

## Installation (Development)

### Prerequisites
- [Decky Loader](https://decky.xyz/) installed on your Steam Deck
- Node.js 18+ and pnpm
- Python 3.11+

### Steps

1. **Clone this repo** onto your Steam Deck (Desktop Mode) or development machine:
   ```bash
   git clone https://github.com/yourusername/decky-backlog-picker
   cd decky-backlog-picker
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Build the frontend:**
   ```bash
   pnpm build
   ```

4. **Deploy to your Steam Deck** using Decky CLI:
   ```bash
   # Install Decky CLI if you haven't
   npm install -g @decky/cli

   # Deploy (replace IP with your Deck's IP, password is 'deck' by default)
   decky plugin deploy -i <STEAM_DECK_IP>
   ```

   Or manually copy the folder to:
   ```
   /home/deck/homebrew/plugins/decky-backlog-picker/
   ```
   Then restart Decky from its settings.

## How It Works

### Backend (Python)
- Reads your installed games from Steam's `appmanifest_*.acf` files
- Gets playtime data from `localconfig.vdf` (local, no API key needed!)
- Stores your blacklist in Decky's plugin settings directory

### Frontend (TypeScript/React)
- Renders in the Decky sidebar panel
- Shows the picked game's Steam artwork
- Communicates with the backend via Decky's IPC bridge

## File Structure

```
decky-backlog-picker/
├── src/
│   └── index.tsx          # Main UI (React + TypeScript)
├── main.py                # Game library reader + randomizer (Python) — Decky Loader requires this at plugin root
├── plugin.json            # Plugin metadata
├── package.json
└── tsconfig.json
```

## Contributing / Submitting to the Decky Store

To submit to the official Decky Plugin Store:
1. Fork [decky-plugin-database](https://github.com/SteamDeckHomebrew/decky-plugin-database)
2. Add your plugin entry
3. Open a Pull Request

See [Decky's submission guidelines](https://deckbrew.xyz/en/plugin-dev/store-submission) for full requirements.

## License

MIT
