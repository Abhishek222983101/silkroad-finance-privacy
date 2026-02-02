<div align="center">
  <img src="https://raw.githubusercontent.com/Abhishek222983101/silkroad-finance-zk/main/public/arch.png" alt="SilkRoad Architecture" width="100%" />
  
  <br />
  
  <h1>SilkRoad Finance</h1>
  <h3>The First Stateless RWA Privacy Layer on Solana</h3>

  <p>
    <strong>🏆 Targeting: Light Protocol Track (ZK Compression) & Helius Track</strong>
  </p>

  <p align="center">
    <a href="https://silkroad-finance-zk.vercel.app">
      <img src="https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
    <a href="https://www.youtube.com/watch?v=5LfyOQW3sJ8">
      <img src="https://img.shields.io/badge/Video_Pitch-YouTube-red?style=for-the-badge&logo=youtube" alt="Video Pitch" />
    </a>
    <a href="#-technical-architecture">
      <img src="https://img.shields.io/badge/Architecture-Deep_Dive-blue?style=for-the-badge&logo=solana" alt="Architecture" />
    </a>
  </p>
</div>

---

## 📖 Executive Summary

**SilkRoad Finance** is a decentralized invoice factoring protocol built to bridge the gap between traditional supply chain finance and Web3 liquidity, **without compromising privacy**.

In the current RWA landscape, suppliers face a "Transparency Paradox." To access on-chain liquidity, they must tokenize their invoices. However, doing so on a public ledger reveals their entire order book—client names, deal sizes, and margins—to competitors. This metadata leakage is the single biggest blocker for institutional adoption.

**SilkRoad solves this.** We utilize **Light Protocol's ZK Compression** to tokenize Real World Assets as private, compressed state on Solana. This allows suppliers to access liquidity instantly while keeping their sensitive commercial data cryptographically concealed from the public eye.

---

## 📹 Demo & Walkthrough

<div align="center">
  <a href="https://www.youtube.com/watch?v=5LfyOQW3sJ8">
    <img src="https://img.youtube.com/vi/5LfyOQW3sJ8/0.jpg" alt="Watch the Demo" width="100%">
  </a>
  <p><em>Click the banner above to watch the 4-minute technical deep dive.</em></p>
</div>

---

## 🛠 Problem & Solution

### 🔴 The Problem: The "Glass House" Effect
Institutional finance cannot function in a glass house. Current RWA protocols force a trade-off: **Privacy (Web2 Banks)** vs. **Liquidity (Web3 Markets)**.

* **Metadata Leakage:** If a supplier mints an invoice for "Tesla" worth "$500,000" on a public chain, their competitors can scrape the chain and underbid them the next day.
* **Cost Friction:** Managing thousands of invoices using standard Solana Token Accounts is expensive (~0.02 SOL per account in rent).
* **Manual Audits:** Verifying invoice PDFs is slow, manual, and prone to human error.

### 🟢 The Solution: AI-Powered ZK Privacy
SilkRoad introduces a **Stateless** marketplace architecture where assets are verified by AI and compressed by default.

* **🔒 Zero-Knowledge Privacy:** Invoice metadata is hashed locally (`SHA256`) with a salt. The chain only receives a validity proof, ensuring the raw data never leaves the client's device.
* **🤖 Automated Auditing:** We use **Google Gemini 1.5 Flash** to scan uploaded PDFs, extracting data and assigning a "Fraud Risk Score" before minting.
* **📉 100x Lower Costs:** By utilizing **Light Protocol's State Merkle Trees**, minting a private asset costs **~0.001 SOL** (Rent-Exempt).

---

## 🤖 AI-Powered Risk Engine

Before an invoice is minted, it passes through our **GenAI Audit Layer**.

1.  **PDF Extraction:** The supplier uploads an invoice PDF.
2.  **Gemini 1.5 Flash Analysis:** We pipe the text to Google's Gemini 1.5 Flash model to:
    * **Extract Metadata:** Automatically fills "Client Name", "Amount", and "Due Date" (No manual entry).
    * **Fraud Detection:** Analyzes the document for inconsistencies, pixel manipulation, or fake addresses.
    * **Risk Scoring:** Assigns a `Low`, `Medium`, or `High` risk score which is attached to the asset's metadata.

> *Note: This ensures that while the data remains private, the "Quality" of the asset is verified by a neutral AI agent.*

---

## 💸 The Lifecycle of a Private Invoice

This is how value moves through SilkRoad without leaking data:

1.  **The Supplier (Minting):**
    * Connects wallet and uploads invoice PDF.
    * **AI Action:** Gemini scans PDF → Returns Data + Risk Score.
    * **On-Chain:** Mints a **Compressed Account** via Light Protocol. The public sees a new leaf in the Merkle Tree, but cannot see "Tesla" or "$5k".

2.  **The Liquidity Provider (Buying):**
    * Views the marketplace. They see a "Risk Score" and "Yield" (verified by ZK proof) but not the raw data.
    * **Action:** Clicks "Buy" and provides USDC/SOL.
    * **Settlement:** The protocol executes an atomic swap. The LP receives the Compressed Asset; the Supplier receives the funds.

3.  **The Settlement (Exit):**
    * *Roadmap Feature:* When the Debtor (Tesla) pays the invoice via bank wire, a Fiat Oracle detects the payment.
    * The protocol "burns" the Compressed Asset and releases the stablecoin principal + yield to the LP.

---

## ⚡ Technical Architecture

SilkRoad leverages the cutting edge of Solana's privacy primitives. Unlike traditional dApps that rely on Rust programs for state management, SilkRoad pushes privacy to the edge.

### 1. ZK Compression Engine (Light Protocol)
We interact directly with the **Light System Program** to manage state.
* **Client-Side Hashing:** The frontend generates a deterministic hash of the invoice data (Client + Amount + Salt).
* **State Trees:** This hash is compressed into a leaf on Light Protocol's **State Merkle Tree**.
* **The Result:** The on-chain footprint is just a validity proof.

### 2. High-Performance RPC (Helius)
ZK Compression requires advanced RPC methods to fetch validity proofs and state roots.
* We utilize **Helius** to handle `rpc.getCompressedAccountProof` and `rpc.getStateTreeInfos`.
* This allows the application to remain **Stateless** (Serverless), as the RPC acts as the indexer for the compressed state.

### 3. Atomic Compliance Layer (Simulation)
The protocol includes a design for an **Atomic Compliance Layer**. Before settlement, the system validates the buyer's credentials (KYC/Accredited Status) to ensure regulatory compliance before the swap executes.

---

## 🛠 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Privacy Engine** | **Light Protocol** | `Stateless.js` SDK & ZK Compression |
| **AI Auditor** | **Gemini 1.5 Flash** | PDF Parsing & Fraud Detection |
| **RPC Provider** | **Helius** | Compression-enabled RPC nodes |
| **Frontend** | **Next.js 16** | React Framework with App Router |
| **Styling** | **Tailwind CSS** | Responsive UI components |
| **Blockchain** | **Solana Devnet** | Network layer |

---

## 🚀 How to Run Locally

Follow these steps to spin up the ZK Minting engine on your local machine.

### Prerequisites
* Node.js (v18+)
* Yarn
* A Helius API Key (Devnet)
* A Google Gemini API Key

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Abhishek222983101/silkroad-finance-zk.git
    cd silkroad-finance-zk
    ```

2.  **Install Dependencies**
    ```bash
    yarn install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root directory:
    ```bash
    # Get Helius Key: https://dev.helius.xyz/
    # Get Gemini Key: https://aistudio.google.com/
    
    NEXT_PUBLIC_HELIUS_RPC=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
    GEMINI_API_KEY=YOUR_GEMINI_KEY
    ```

4.  **Run the Application**
    ```bash
    yarn dev
    ```
    Open `http://localhost:3000` to start minting private assets.

---

## 🔮 Roadmap: Road to Mainnet

The current version is a fully functional **Devnet Prototype** demonstrating the core ZK primitives. The path to Mainnet involves:

1.  **Pay-to-Reveal Logic:** Implementing an atomic encryption scheme where the "Buy" transaction triggers the secure release of the PDF decryption key to the buyer.
2.  **Fiat Oracle Integration:** Automating the exit liquidity flow by listening for off-chain bank wires (e.g., from the Debtor) to burn the asset and release stablecoins.
3.  **On-Chain Identity:** Replacing the frontend compliance check with **Civic/Reclaim** Verifiable Credentials for strict institutional whitelisting.

---

<div align="center">
  <p>Built with 🖤 by Abhishek Tiwari</p>
  <p><strong>Solana Privacy Hackathon 2026</strong></p>
</div>
