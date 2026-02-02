# 📂 Project Passport: SilkRoad Finance (Gen-AI Edition)

## 🎯 Core Identity
This is a **Web3-Native Invoice Factoring Platform** on Solana.
Currently, it functions as a **Gen-AI Invoice Scanner** that allows users to upload PDF invoices, extract data using Google Gemini 3.0, and "Mint" them as digital assets.

## 🏗️ The Current Architecture
1.  **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Shadcn UI.
2.  **AI Layer:**
    -   **Scanner:** `api/scan-invoice.ts` uses Gemini 3.0 Flash to extract JSON (Amount, Client, Date) from raw PDF bytes.
    -   **Auditor:** `api/audit-chat.ts` is a multi-agent system (Auditor/Analyst/Wolf) that "discusses" the risk score.
3.  **Blockchain Layer (Current):**
    -   Standard Anchor Program (Devnet).
    -   Currently mints a standard SPL token/NFT (To be replaced by Light Protocol).
4.  **Key Files:**
    -   `web/pages/index.tsx`: The main dashboard. Handles file upload -> AI Scan -> Mint Button.
    -   `web/utils/silkroad.json`: The IDL for the current Anchor program.
    -   `programs/silkroad/src/lib.rs`: The Rust smart contract.

## ⚡ The Mission (Current Session)
We are keeping the **Frontend** and **AI Layer** exactly as they are.
We are **ONLY** refactoring the **Blockchain Layer** to use **Light Protocol (ZK Compression)**.
-   **Goal:** The "Mint" button must now create a *Private Compressed Account* instead of a public token.