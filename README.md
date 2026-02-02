<div align="center">
<img src="https://raw.githubusercontent.com/Abhishek222983101/silkroad-finance-zk/main/public/arch.png" alt="SilkRoad Architecture" width="100%" />
<br />
<h1>SilkRoad Finance</h1>
<h3>The First Stateless RWA Privacy Layer on Solana</h3>
<p>
<strong>🏆 Targeting: Light Protocol Track (ZK Compression) & Helius Track</strong>
</p>
<p align="center">
<a href="https://www.google.com/search?q=https://silkroad-finance-privacy.vercel.app">
<img src="https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel" alt="Live Demo" />
</a>
<a href="https://github.com/Abhishek222983101/silkroad-finance-privacy">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Source_Code-GitHub-181717%3Fstyle%3Dfor-the-badge%26logo%3Dgithub" alt="GitHub" />
</a>
<a href="#-technical-architecture">
<img src="https://img.shields.io/badge/Architecture-Deep_Dive-blue?style=for-the-badge&logo=solana" alt="Architecture" />
</a>
</p>
</div>
📖 Executive Summary
SilkRoad Finance is a decentralized invoice factoring protocol built to bridge the gap between traditional supply chain finance and Web3 liquidity, without compromising corporate privacy.
In the current RWA landscape, suppliers face a "Transparency Paradox." To access on-chain liquidity, they must tokenize their invoices. However, doing so on a public ledger reveals their entire order book—client names, deal sizes, and margins—to competitors. This metadata leakage is the single biggest blocker for institutional adoption.
SilkRoad solves this. We utilize Light Protocol's ZK Compression to tokenize Real World Assets as private, compressed state on Solana. This allows suppliers to access liquidity instantly while keeping their sensitive commercial data cryptographically concealed from the public eye.
🛠 Problem & Solution
🔴 The Problem: The "Glass House" Effect
Institutional finance cannot function in a glass house. Current RWA protocols force a trade-off: Privacy (Web2 Banks) vs. Liquidity (Web3 Markets).
 * Metadata Leakage: If a supplier mints an invoice for a major client publicly, competitors can underbid them by analyzing their on-chain trade volume.
 * Cost Friction: Managing high-volume invoice micro-debt using standard Solana Token Accounts is expensive (~0.02 SOL per account).
 * Validation Lag: Verifying invoice authenticity is typically a slow, manual process prone to fraud.
🟢 The Solution: Privacy-First RWA Engine
SilkRoad introduces a Stateless marketplace architecture where assets are shielded by default.
 * 🔒 ZK-Compressed Privacy: Invoice metadata is hashed into the data_hash of a Light Protocol compressed account. The chain only stores a Merkle Root, ensuring raw business data stays off-chain.
 * ⚡ Helius-Powered Velocity: We utilize Helius RPCs to handle sub-second indexing and state-proof fetching, enabling a "Web2-speed" marketplace on Devnet.
 * 🛡️ Compliant Settlement: Every transaction is gated by a compliance layer that validates the "Risk Score" and buyer credentials before executing the SOL settlement.
⚡ Technical Deep Dive (Sponsor Implementation)
SilkRoad leverages the cutting edge of Solana's privacy primitives to push state management to the edge.
1. ZK Compression Engine (Light Protocol) - Primary Track
We interact directly with the Light System Program to manage shielded RWA state.
 * The "Hash" Implementation: To link the physical asset to the blockchain, we derive a unique invoice_id from the audited document. This is hashed into the data_hash field of the CompressedAccountData struct.
 * Merkle Integrity: This data_hash, along with the owner and lamports, forms a leaf in the sparse binary Merkle tree. Only the State Root and Validity Proof are stored on-chain.
 * Statelessness: The raw data is stored in the Solana ledger as calldata and indexed off-chain, making the protocol rent-exempt and private.
2. High-Performance Infrastructure (Helius) - Primary Track
ZK Compression requires advanced RPC methods to fetch validity proofs and state roots.
 * Proof Fetching: We utilize Helius to handle rpc.getCompressedAccountProof and rpc.getStateTreeInfos.
 * Sub-Second Indexing: Helius acts as our "Index of Truth," ensuring the Marketplace UI reflects fresh mints and funding status updates in <400ms.
3. Hardened Settlement Logic
To ensure institutional reliability, we implemented a custom settlement engine in web/pages/index.tsx:
 * BigInt Precision: All SOL transfers use BigInt and Math.floor to prevent u64 codec overflows.
 * Confirmed Commitment: We fetch a fresh blockhash with confirmed status immediately before the wallet.sendTransaction call to prevent transaction staleness.
🛠 Tech Stack
| Component | Technology | Description |
|---|---|---|
| Privacy Engine | Light Protocol | Stateless.js SDK & ZK Compression |
| RPC Provider | Helius | High-performance Compression RPC nodes |
| Audit Engine | Gemini AI | PDF Fraud Detection & Data Extraction |
| Storage | Pinata (IPFS) | Immutable Decentralized Document Anchoring |
| Frontend | Next.js 16 | React Framework with App Router |
| Blockchain | Solana Devnet | High-speed Settlement Layer |
🚀 How to Run Locally
Prerequisites
 * Node.js (v18+) & Yarn
 * A Helius API Key (Devnet)
 * A Google Gemini API Key
Installation
 * Clone the Repository
   git clone [https://github.com/Abhishek222983101/silkroad-finance-privacy.git](https://github.com/Abhishek222983101/silkroad-finance-privacy.git)
cd silkroad-finance-privacy

 * Install Dependencies
   yarn install

 * Configure Environment
   Create a .env.local file:
   NEXT_PUBLIC_HELIUS_RPC=[https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY](https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY)
GEMINI_API_KEY=YOUR_GEMINI_KEY
NEXT_PUBLIC_PINATA_JWT=YOUR_PINATA_JWT

 * Run the Application
   yarn dev

🔮 Roadmap: Road to Mainnet
 * Selective Disclosure (Phase 3): Implementing "Audit Keys" using Light Protocol, allowing businesses to reveal private data only to verified tax authorities while remaining shielded from the public.
 * RWA Liquidity Pools: Moving from P2P buying to automated "Risk Tranches" where investors can provide liquidity to pools that fund invoices based on AI-verified risk scores.
 * Helius LaserStream: Integrating real-time transaction streaming to enable dynamic interest rate adjustments based on market sentiment and payment history.
<div align="center">
<p>Built with 🖤 for the <strong>Solana Privacy Hackathon 2026</strong></p>
<p><em>Transforming the world's illiquid debt into private, on-chain capital.</em></p>
</div>
