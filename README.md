# SilkRoad Finance

**Institutional-Grade Stateless RWA Privacy Layer on Solana**

![SilkRoad Architecture](https://raw.githubusercontent.com/Abhishek222983101/silkroad-finance-zk/main/public/arch.png)

| | |
|---|---|
| **Live Demo** | [silkroadfi.vercel.app](https://silkroadfi.vercel.app/) |
| **Program ID** | `C1gro7yAZrKGp1B13wehgQhvMSTx7UxGt8MWc8ozPB4d` |
| **Network** | Solana Devnet |
| **Tracks** | Light Protocol (ZK Compression) + Helius |

---

## Problem Statement

SMEs globally have $2.5T locked in unpaid invoices. The average payment cycle is 60 to 90 days. Traditional factoring is slow (T+2 to T+7 settlement), expensive (3 to 5% fees), and requires extensive paperwork.

Public blockchains solve speed but create a new problem: corporate suppliers cannot expose deal sizes, client names, and profit margins on a public ledger. Competitors, clients, and anyone can see your entire business operation.

This is the **Transparency Paradox**.

---

## Solution

SilkRoad Finance enables suppliers to tokenize invoices as private, compressed state on Solana. Business data stays hidden while financial proofs remain valid for on-chain settlement.

| Feature | Implementation |
|---|---|
| Privacy | ZK-Compression via Light Protocol |
| Speed | Sub-400ms settlement via Helius RPCs |
| Cost | 99% rent reduction through state compression |
| Trust | AI-powered fraud detection before minting |

---

## Sponsor Integration

### Light Protocol (ZK Compression Track)

We use Light Protocol to achieve stateless privacy for invoice data.

**How it works:**

1. Invoice metadata (supplier, debtor, amount, terms) is hashed into a 32-byte `data_hash`
2. Our Anchor program performs a CPI (Cross-Program Invocation) to the Light System Program
3. The hash is inserted as a leaf in a Merkle state tree
4. Only the Merkle root lives on-chain

---


**What this achieves:**

The public ledger shows that a valid invoice exists and has been verified, but reveals nothing about the parties involved or the deal terms. Competitors cannot scrape supplier-client relationships. Auditors can still verify proofs when given selective disclosure keys.

**Program References (Anchor.toml):**
```
light_system_program = "SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7"
account_compression = "compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq"
compressed_token = "cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m"
```

### Helius Track

Helius serves as our infrastructure layer for compressed state operations.

**State Proof Fetching:**
When settling a compressed invoice, the buyer needs to prove the current state. Helius RPCs provide the Merkle proofs and state tree information required to verify ownership and execute transfers.

**Real-time Indexing:**
Helius indexes compressed account updates in under 400ms. This means the frontend reflects new mints and status changes almost instantly, despite the data being off-chain.

---

## 📹 Demo & Walkthrough

<div align="center">
  <a href="https://www.youtube.com/watch?v=5LfyOQW3sJ8">
    <img src="https://img.youtube.com/vi/5LfyOQW3sJ8/0.jpg" alt="Watch the Demo" width="100%">
  </a>
  <p><em>Click the banner above to watch the 4-minute technical deep dive.</em></p>
</div>

---

## Technical Architecture

### System Overview

```
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|   PDF Invoice    +---->+   Gemini AI       +---->+   Risk Score     |
|   Upload         |     |   Fraud Detection |     |   Assignment     |
|                  |     |                   |     |                  |
+------------------+     +-------------------+     +--------+---------+
                                                           |
                                                           v
+------------------+     +-------------------+     +--------+---------+
|                  |     |                   |     |                  |
|   Helius RPC     +<----+   Light Protocol  +<----+   Shielded Mint  |
|   Proof Fetch    |     |   State Tree      |     |   (CPI Call)     |
|                  |     |                   |     |                  |
+--------+---------+     +-------------------+     +------------------+
         |
         v
+--------+---------+     +-------------------+
|                  |     |                   |
|   Marketplace    +---->+   Atomic Settle   |
|   (Risk/Yield)   |     |   (SOL Transfer)  |
|                  |     |                   |
+------------------+     +-------------------+
```

### On-Chain Program Logic

The Anchor program (`programs/silkroad/src/lib.rs`) handles two core operations:

**1. List Invoice**
```rust
pub fn list_invoice(
    ctx: Context<ListInvoice>, 
    amount_in_sol: u64, 
    borrower_name: String
) -> Result<()>
```
Creates a new invoice account (PDA) storing supplier pubkey, price, borrower name, and sale status.

**2. Buy Invoice**
```rust
pub fn buy_invoice(ctx: Context<BuyInvoice>) -> Result<()>
```
Executes an atomic transfer: SOL moves from investor to supplier in the same transaction that marks the invoice as sold. Uses CPI to the System Program for the actual transfer.

**State Schema:**
```rust
pub struct InvoiceState {
    pub supplier: Pubkey,      // 32 bytes
    pub price: u64,            // 8 bytes
    pub borrower_name: String, // 50 bytes
    pub is_sold: bool,         // 1 byte
    pub new_owner: Pubkey,     // 32 bytes
}
```

---

## Workflow

### Phase 1: Ingestion

1. Supplier uploads PDF invoice
2. Gemini AI parses the document
3. Fraud detection runs (pixel manipulation, address verification)
4. Risk score is assigned (A/B/C rating)
5. Metadata object is created for minting

### Phase 2: Shielded Minting

1. Frontend calls `list_invoice` on our Anchor program
2. Program creates invoice PDA with metadata
3. CPI to Light System Program hashes and compresses the state
4. Merkle leaf is added to the state tree
5. Document is anchored to IPFS via Pinata

### Phase 3: Marketplace

1. Investors browse available invoices
2. Only risk score and yield are visible (not supplier/debtor names)
3. Investor selects invoice and clicks "Fund"
4. `buy_invoice` executes atomic settlement
5. SOL transfers to supplier, ownership updates in Merkle tree

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Privacy | Light Protocol | ZK-Compression, stateless accounts |
| Infrastructure | Helius | Merkle proofs, sub-second indexing |
| Smart Contract | Anchor (Rust) | Invoice lifecycle management |
| AI Audit | Gemini | Document parsing, fraud detection |
| Storage | Pinata (IPFS) | Immutable document anchoring |
| Frontend | Next.js 16 | TypeScript, Tailwind, Framer Motion |
| Wallets | Solana Wallet Adapter | Phantom, Solflare support |

---

## Local Development

**Prerequisites:** Rust, Solana CLI, Anchor CLI, Node.js, Yarn

```bash
# Clone repository
git clone https://github.com/Abhishek222983101/silkroad-finance-privacy.git
cd silkroad-finance-privacy

# Install dependencies
yarn install

# Build Anchor program
anchor build

# Run tests
anchor test

# Start frontend (from web directory)
cd web && yarn dev
```

**Environment:**
```bash
# Set cluster to devnet
solana config set --url devnet

# Ensure wallet has devnet SOL
solana airdrop 2
```

---

## Roadmap

### Q3 2026: Selective Disclosure

Implementing "Audit Keys" through Light Protocol. Businesses keep data private from competitors while granting view-only access to tax authorities or auditors via ZK-proofs. This enables regulatory compliance without sacrificing commercial privacy.

### Q4 2026: Fiat Oracles

Integrating Plaid/Stripe sandbox APIs to bridge off-chain bank wires with on-chain state. When a real-world payment clears, the corresponding on-chain invoice burns automatically.

---

## Security Notes

1. All SOL transfers use BigInt precision (lamports) to prevent rounding errors
2. Invoice double-spend is prevented by `is_sold` flag checked before settlement
3. Supplier address validation uses `UncheckedAccount` since we only write to it
4. Compressed state cannot be tampered with without invalidating Merkle proofs

---

## Repository Structure

```
silkroad-finance-privacy/
  Anchor.toml           # Program deployment config
  Cargo.toml            # Rust workspace
  programs/
    silkroad/
      src/
        lib.rs          # Core Anchor program
      Cargo.toml        # Program dependencies
  web/                  # Next.js frontend
```

---

Built for **Solana Privacy Hackathon 2026**

Transforming illiquid debt into private, on-chain capital.
