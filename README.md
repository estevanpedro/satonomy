# Satonomy - Effortless Bitcoin Asset Management

Visually create UTXOs and PSBTs. Add custom scripts and automate transactions for Bitcoin, Runes and Ordinals. Use non-custodial wallets like XVerse, Unisat, Magic Eden, OKX and more.

- Demo: [satonomy.io](satonomy.io)
- Docs: [gitbook.com](satonomy.io)
- Twitter: [@satonomy](https://x.com/satonomy)

![Satonomy Dashboard - PSBT Creation](public/satonomy.png)

## Main Tech

Using NextJS App Route with Typescript, server-side functions to hide envs, client-server requests wallet management, connection with L2 using particle-network and btc-connectkit

- `bitcoinjs-lib` [(check psbt code)](https://github.com/satonomy/utxo-builder/blob/main/app/services/psbtService.ts)
- `@particle-network/btc-connectkit` [(bitcoin wallet provider)](https://github.com/satonomy/utxo-builder/blob/main/app/providers/ConnectProvider.tsx)
- `runelib` [(runestone)](https://github.com/satonomy/utxo-builder/blob/main/app/services/runesService.ts#L8)
- `mempool` [(utxo fetch)](https://github.com/satonomy/utxo-builder/blob/main/app/services/utxoServices.ts#L47)
- `unisat` [(runes balance fetch)](https://github.com/satonomy/utxo-builder/blob/main/app/services/utxoServices.ts#L64)
- `magiceden` [(runes utxo fetch)](https://github.com/satonomy/utxo-builder/blob/main/app/services/utxoServices.ts#L64)

### Current features

- `transfer` (btc)
- `split` (btc)
- `merge` (btc)
- `utxo visualizer` (ordinals, runes and bitcoin)

### Income features

- `transfer`, `split` and `merge` (runes, ordinals, atomical and others utxo assets)
- `bitcoin scripts` (custom pre-built redeemScripts, multi-sig, time locks, etc)
- `utxo optimizer` (earn free money by removing unnecessary satoshis locked in runes and ordinals. ex: NFT with 10k satoshis -> NFT with 546 satoshis. Earn 9.5k just by optimizing UTXOs)

## How to start the project

First, add .envs and run the development server:

```bash
npm i
# or
yarn install
```

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Tutorial

1. Connect your Wallet
   ![Wallet connection](public/wallets.png)

2. Add a new input
   ![Select Inputs](public/select.png)

3. Select the best UTXO
   ![Wallet connection](public/choose.png)

4. Add outputs and split (or multi-transfer)
   ![Wallet connection](public/split.png)

- Test live on bitcoin: [satonomy.io](satonomy.io)
- Follow us: [@satonomy](https://x.com/satonomy)
