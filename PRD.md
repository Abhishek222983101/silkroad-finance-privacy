# 🚨 PROJECT SILKROAD: WAR ROOM MASTER ARCHITECTURE

**CURRENT STATUS:** 🔴 WAR ROOM (FINAL SPRINT)
**DEADLINE:** Feb 2nd, 9:30 AM IST
**OBJECTIVE:** DELIVER A FEATURE-COMPLETE RWA PRIVACY PROTOCOL ON SOLANA
**MODE:** HACKATHON BLUFF (PRIORITIZE UI/UX AND FLOW OVER BACKEND PERFECTION)

---

## SECTION 1: PROJECT IDENTITY AND VISION

**SilkRoad Finance** is the first **Stateless RWA (Real World Asset) Privacy Layer** on Solana.

* **The Problem:** "Radical Transparency." Institutional suppliers cannot factor invoices on-chain because public ledgers leak sensitive commercial data (client names, pricing margins, deal volume) to competitors. This metadata leakage is the single biggest blocker for institutional adoption of DeFi.
* **The Solution:** We use **ZK Compression (Light Protocol)** to tokenize Real World Assets as private, compressed state on Solana. This allows suppliers to access liquidity instantly while keeping their sensitive commercial data cryptographically concealed from the public eye.
* **The Differentiator:** We are **Stateless** (No backend database, relying entirely on RPCs) and **AI-Powered** (using Gemini for Risk Scoring).

---

## SECTION 2: SPONSOR STRATEGY (THE WINNING NARRATIVE)
*We are targeting specific tracks and bounties. All code implementation must align with these narratives.*

### 1. LIGHT PROTOCOL (TRACK: OPEN POOL)
* **Status:** CORE / REAL
* **Integration:** This is the heart of the project. We use Light Protocol's ZK Compression and Stateless.js SDK to mint private compressed assets (invoices). The invoice data is hashed locally, and only the validity proof is stored on-chain.

### 2. HELIUS (TRACK: PRIVACY INFRA)
* **Status:** CORE / REAL
* **Integration:** Helius is our Index of Truth. Since we are a stateless app, we rely entirely on Helius Compression RPCs to fetch Merkle proofs and state trees instantly. Without Helius, the UX would be impossible.

### 3. PRIVACY CASH (BOUNTY: PRIVATE LENDING)
* **Status:** STRATEGIC / UI BLUFF
* **Integration:** We pitch SilkRoad as a Two-Sided Privacy Market. Light Protocol protects the Borrower (Supplier), while Privacy Cash protects the Lender (Liquidity Provider).
* **Implementation Task:** Add a "Shielded Liquidity Pool" toggle in the UI. When checked, it simulates routing liquidity through a privacy-preserving architecture. We do not need to implement the full mixer backend for the hackathon, just the UI intent.

### 4. QUICKNODE (BOUNTY: PUBLIC BENEFIT)
* **Status:** FARMING / REAL
* **Integration:** We use QuickNode as our Institutional Failover.
* **Implementation Task:** In our connection logic, we implement a fallback system. If the primary Helius RPC fails, the system automatically switches to QuickNode to ensure 100% uptime.

### 5. GOOGLE GEMINI (FEATURE: AI RISK ENGINE)
* **Status:** FEATURE / REAL
* **Integration:** An AI Agent that acts as the first line of defense against fraud.
* **Implementation Task:** We send the uploaded Invoice PDF to Gemini 1.5 Flash. It extracts the metadata (Client, Amount) and assigns a Risk Score based on visual analysis.

---

## SECTION 3: THE PRODUCT FLOW (HACKATHON VS PRODUCTION)
*This section outlines the User Journey. It distinguishes between what we have built (Hackathon) and what the ideal system looks like (Production).*

### PHASE 1: ORIGINATION (THE ASSET LAYER)
**User Action:** Supplier connects wallet and uploads an Invoice PDF.
* **Hackathon Flow (Current):**
    1.  Frontend sends PDF to Gemini 1.5 Flash API.
    2.  Gemini returns JSON data: Client Name, Amount, Due Date, and a Risk Score (Low/Medium/High).
    3.  Frontend automatically fills the Minting Form with this data.
    4.  Frontend hashes the data (SHA256) locally.
    5.  App interacts with Light Protocol to mint a Compressed Account on Devnet.
* **Production Gap:** In a real app, we would encrypt the PDF with a symmetric key and upload it to IPFS, storing the encrypted key on-chain. For now, we just mint the ZK asset.

### PHASE 2: THE MARKETPLACE (THE LIQUIDITY LAYER)
**User Action:** Investor (Buyer) browses the marketplace and clicks Buy.
* **Hackathon Flow (Current):**
    1.  **Verification Bluff:** User clicks Buy. A Modal appears saying *"Verifying Accredited Investor Credentials..."*. A spinner runs for 3 seconds. It shows *"Success: Identity Verified via Civic"*. (This is a UI simulation to show we care about compliance).
    2.  **Privacy Bluff:** User sees a toggle for *"Enable Shielded Pool (Privacy Cash)"*. If toggled, UI shows *"Anonymizing Route..."*.
    3.  **Settlement:** User signs the transaction. SOL transfers to Supplier. Invoice Asset transfers to Buyer.
* **Production Gap:** Real life requires On-Chain DID (Civic/Reclaim) to block unverified wallets and an Atomic Pay-to-Reveal scheme to decrypt the data upon payment.

### PHASE 3: THE EXIT (THE ORACLE SIMULATION)
**User Action:** The Invoice is due. Nokia (the debtor) wires fiat currency to the bank account.
* **Hackathon Flow (Current):**
    1.  We build a secret Admin Page: `/admin-oracle`.
    2.  The Admin (us) sees a list of "Pending Settlements" (invoices that have been bought).
    3.  Admin clicks a button: **"Simulate Wire Transfer ($5,000)"**.
    4.  **Action:** The Frontend triggers a Toast Notification: *"Oracle Alert: Wire Detected. Asset Burned. USDC Released to Investor."*
* **Production Gap:** Real life requires a Chainlink or Circle Oracle integration that connects to a real bank API to detect wire transfers automatically.

---

## SECTION 4: IMPLEMENTATION ROADMAP (NEXT 10 HOURS)

**🔴 PRIORITY 1: AI RISK ENGINE (GEMINI)**
* **Task:** Create an API Route at `web/app/api/analyze/route.ts`.
* **Logic:** Accept a PDF or Image file. Send it to Google Gemini 1.5 Flash. Prompt it to return strictly JSON with client name, amount, and a fraud risk score.
* **UI:** Update the Minting Page to call this API when a file is uploaded and auto-fill the input fields.

**🔴 PRIORITY 2: THE ORACLE DASHBOARD (PHASE 3 FIX)**
* **Task:** Create a page at `web/app/admin/page.tsx`.
* **UI:** Make it look like a professional financial dashboard (Dark Mode). List dummy "Active Invoices".
* **Interaction:** Add a "Trigger Settlement" button. When clicked, show a series of professional success notifications (Toast) simulating the blockchain events.
* **Narrative:** This proves we have thought through the Fiat Exit loop.

**🔴 PRIORITY 3: THE BLUFF FEATURES (SPONSORS)**
* **Identity Modal:** Create a reusable `VerificationModal` component. Trigger it when the user attempts to Buy an invoice. It should simulate a check against a credential registry.
* **Privacy Toggle:** Add a "Shielded Mode" switch in the Liquidity Pool UI with a tooltip explaining it uses Privacy Cash architecture.
* **QuickNode Failover:** Update the `connection.ts` file to accept a QuickNode RPC URL as a backup if the primary fails.

---

## SECTION 5: THE DEATH THREATS (CONTEXT FOR README/PITCH)
*We must acknowledge the business risks that exist outside of our code. This shows maturity.*

1.  **Legal Recourse Gap:** We currently lack a Special Purpose Vehicle (SPV) legal structure. If the debtor defaults, the token holder has no way to sue. (Solution: Future Legal Framework).
2.  **Oracle Trust Assumption:** Our current Admin Dashboard relies on a manual trigger. If the Admin lies, funds are lost. (Solution: Decentralized Chainlink Oracles in V2).
3.  **Double Financing Fraud:** A supplier could mint the same invoice on Ethereum. (Solution: A Cross-Chain Global Hash Registry).
4.  **Liquidity Cold Start:** Suppliers need buyers, buyers need suppliers. (Solution: Bootstrapping with a Senior Tranche credit fund).

---

## SECTION 6: AGENT PROTOCOL (HOW TO WORK)

1.  **Context is King:** Before writing code, refer to the "Hackathon Flow" to understand why we are building it this way. We are prioritizing the demo video flow.
2.  **No Hallucinations:** Do not try to import non-existent SDKs for the "Bluff" features. Use standard React state (`useState`, `setTimeout`) to mock the behavior of Civic or Privacy Cash.
3.  **UI Feedback:** Every action (Mint, Buy, Verify, Oracle Trigger) needs immediate, professional Toast notifications to make the application feel responsive and real.

