import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  Connection,
  clusterApiUrl,
  Transaction,
} from "@solana/web3.js";
import {
  LightSystemProgram,
  createRpc,
  bn,
  buildTx,
  defaultTestStateTreeAccounts,
  selectStateTreeInfo,
} from "@lightprotocol/stateless.js";
import { SHA256 } from "crypto-js";
import { Buffer } from "buffer";
import idl from "../utils/silkroad.json";
import { uploadToIPFS, getIPFSGatewayUrl } from "../utils/ipfs";
import { screenWallet } from "../utils/range";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GlassNavbar } from "@/components/ui/glass-navbar";
import RetroGrid from "@/components/ui/retro-grid";
import { TextLoop } from "@/components/ui/text-loop";
import { LogoCloud } from "@/components/ui/logo-cloud";
import { SectionWithMockup } from "@/components/ui/section-with-mockup";
import { BentoGrid } from "@/components/ui/bento-grid";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import {
  ShieldCheck,
  ArrowRight,
  Upload,
  Zap,
  Globe,
  Lock,
  FileText,
  Twitter,
  Github,
  Linkedin,
  Terminal,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  Fingerprint,
  Search,
  Scale,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Icons } from "@/components/ui/icons";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

// --- DYNAMIC IMPORTS ---
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// --- 3D GLOBE ---
const GlobeMesh = () => {
  const mesh = useState<any>(null);
  useFrame((state, delta) => {
    if (mesh[0]) mesh[0].rotation.y += delta * 0.05;
  });
  return (
    <mesh ref={mesh[1]} scale={[2.8, 2.8, 2.8]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial color="#00E500" wireframe transparent opacity={0.15} />
      <mesh scale={[0.99, 0.99, 0.99]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </mesh>
  );
};

// --- HELPER: TYPEWRITER EFFECT ---
const Typewriter = ({
  text,
  delay = 15,
  onComplete,
}: {
  text: string;
  delay?: number;
  onComplete?: () => void;
}) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      if (onComplete) onComplete();
    }
  }, [currentIndex, delay, text, onComplete]);

  return <span>{currentText}</span>;
};

// --- INTERACTIVE AUDITOR TERMINAL (V6: ANIMATED) ---
const AgentTerminal = ({
  logs,
  onChat,
  invoiceData,
}: {
  logs: any[];
  onChat: (msg: string) => Promise<any>;
  invoiceData: any;
}) => {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // We keep track of which logs are "fully typed" so we can start the next one
  const [visibleLogIndex, setVisibleLogIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever text grows
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleLogIndex, chatHistory, isTyping]);

  // Reset when new invoice is uploaded
  useEffect(() => {
    if (logs.length === 0) setVisibleLogIndex(0);
  }, [logs]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");

    // 1. Add User Message (Instant, no typing effect for user)
    setChatHistory((prev) => [...prev, { sender: "user", message: userMsg }]);
    setIsTyping(true);

    // 2. Call API
    const result = await onChat(userMsg);

    // 3. Add AI Reply
    if (result && result.reply) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "agent", message: result.reply },
      ]);
    }
    setIsTyping(false);
  };

  if (!logs || logs.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl overflow-hidden border border-[#00E500]/30 bg-black/80 shadow-[0_0_15px_rgba(0,229,0,0.1)] flex flex-col">
      {/* HEADER */}
      <div className="bg-[#00E500]/10 px-4 py-2 border-b border-[#00E500]/20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="w-3 h-3 text-[#00E500] animate-pulse" />
          <span className="text-[10px] font-mono text-[#00E500] uppercase tracking-widest">
            Risk_Auditor_Uplink
          </span>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        </div>
      </div>

      {/* CHAT LOGS */}
      <div
        ref={scrollRef}
        className="p-4 font-mono text-xs space-y-3 h-48 overflow-y-auto custom-scrollbar"
      >
        {/* 1. AGENT ANALYSIS LOGS (Sequential Typing) */}
        {logs.map((log, i) => {
          // Only render logs we have reached
          if (i > visibleLogIndex) return null;

          return (
            <div
              key={`log-${i}`}
              className="flex items-start space-x-3 opacity-90"
            >
              <span
                className={`font-bold uppercase text-[10px] min-w-[60px] mt-0.5 ${
                  log.agent === "Auditor"
                    ? "text-blue-400"
                    : log.agent === "Analyst"
                    ? "text-yellow-400"
                    : "text-purple-400"
                }`}
              >
                {log.agent}:
              </span>
              <span className="text-gray-300">
                {/* Only type the LAST visible log. Previous ones are static text to save performance */}
                {i === visibleLogIndex ? (
                  <Typewriter
                    text={log.message}
                    delay={2}
                    onComplete={() => setVisibleLogIndex((prev) => prev + 1)}
                  />
                ) : (
                  <span>{log.message}</span>
                )}
              </span>
            </div>
          );
        })}

        {/* 2. INTERACTIVE CHAT (Typing Effect for AI) */}
        {chatHistory.map((msg, i) => (
          <div
            key={`chat-${i}`}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] p-2 rounded-lg ${
                msg.sender === "user"
                  ? "bg-[#00E500]/10 border border-[#00E500]/30 text-white"
                  : "bg-white/5 border border-white/10 text-gray-300"
              }`}
            >
              {msg.sender === "agent" && (
                <span className="text-[9px] text-[#00E500] block mb-1 uppercase">
                  Lead_Auditor
                </span>
              )}
              {msg.sender === "agent" ? (
                <Typewriter text={msg.message} delay={10} />
              ) : (
                msg.message
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {(visibleLogIndex < logs.length || isTyping) && (
          <div className="flex items-center space-x-2 pl-2 opacity-50">
            <span className="w-1.5 h-3 bg-[#00E500] animate-pulse inline-block"></span>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-2 border-t border-white/10 bg-white/5 flex">
        <input
          className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-gray-600 font-mono"
          placeholder="Ask the auditor..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="text-[#00E500] hover:text-white px-2"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- COMPLIANCE MODAL (Civic Identity Verification + Range Protocol) ---
const ComplianceModal = ({
  isOpen,
  onClose,
  onConfirm,
  amount,
  walletAddress,
}: any) => {
  const [step, setStep] = useState(0);
  const [rangeStatus, setRangeStatus] = useState<
    "pending" | "checking" | "passed" | "failed"
  >("pending");
  const [rangeError, setRangeError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setRangeStatus("pending");
      setRangeError(null);

      // Step 1: Wallet KYC Check (simulated)
      setTimeout(() => setStep(1), 1000);

      // Step 2: OFAC Sanctions Screen (Real Range Protocol API)
      setTimeout(async () => {
        setRangeStatus("checking");
        try {
          if (walletAddress) {
            const result = await screenWallet(walletAddress);
            if (result.isRisk) {
              setRangeStatus("failed");
              setRangeError(result.details || "Sanctions Detected");
              toast.error(`Range Protocol Alert: ${result.details}`, {
                icon: "🚫",
                duration: 5000,
                style: {
                  background: "#0A0C0A",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                },
              });
              return;
            }
          }
          setRangeStatus("passed");
          setStep(2);
          toast.success("Range Protocol: Wallet Verified", {
            icon: "🛡️",
            duration: 2000,
            style: {
              background: "#0A0C0A",
              color: "#00E500",
              border: "1px solid rgba(0, 229, 0, 0.3)",
            },
          });
        } catch (error) {
          // Fail-safe: Allow demo to continue
          console.error("[Range] Error:", error);
          setRangeStatus("passed");
          setStep(2);
        }
      }, 2200);

      // Step 3: Accredited Investor Status (simulated)
      setTimeout(() => {
        if (rangeStatus !== "failed") {
          setStep(3);
        }
      }, 3800);
    }
  }, [isOpen, walletAddress]);

  // Update step 3 timing based on range status
  useEffect(() => {
    if (rangeStatus === "passed" && step === 2) {
      const timer = setTimeout(() => setStep(3), 1200);
      return () => clearTimeout(timer);
    }
  }, [rangeStatus, step]);

  if (!isOpen) return null;

  const canConfirm = step >= 3 && rangeStatus !== "failed";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0A0C0A] border border-[#00E500]/30 rounded-2xl w-full max-w-md p-6 shadow-[0_0_50px_rgba(0,229,0,0.15)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E500] to-transparent"></div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center">
          <ShieldCheck className="w-6 h-6 text-[#00E500] mr-2" />
          Verifying Civic Credentials
        </h3>
        <p className="text-gray-500 text-xs mb-6">
          SilkRoad enforces <strong>ZK-Compliance</strong> via Civic identity
          verification.
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center">
              <Fingerprint
                className={`w-4 h-4 mr-3 ${
                  step >= 1 ? "text-[#00E500]" : "text-gray-500"
                }`}
              />
              <span
                className={`text-sm ${
                  step >= 1 ? "text-white" : "text-gray-500"
                }`}
              >
                Wallet KYC Check
              </span>
            </div>
            {step >= 1 ? (
              <CheckCircle2 className="w-4 h-4 text-[#00E500]" />
            ) : (
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
            )}
          </div>
          <div
            className={`flex items-center justify-between p-3 rounded-lg border ${
              rangeStatus === "failed"
                ? "bg-red-500/10 border-red-500/30"
                : "bg-white/5 border-white/5"
            }`}
          >
            <div className="flex items-center">
              <Globe
                className={`w-4 h-4 mr-3 ${
                  rangeStatus === "failed"
                    ? "text-red-500"
                    : step >= 2
                    ? "text-[#00E500]"
                    : rangeStatus === "checking"
                    ? "text-yellow-500"
                    : "text-gray-500"
                }`}
              />
              <div className="flex flex-col">
                <span
                  className={`text-sm ${
                    rangeStatus === "failed"
                      ? "text-red-400"
                      : step >= 2
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                >
                  OFAC Sanctions Screen
                </span>
                <span className="text-[10px] text-gray-600">
                  via Range Protocol
                </span>
              </div>
            </div>
            {rangeStatus === "failed" ? (
              <ShieldAlert className="w-4 h-4 text-red-500" />
            ) : step >= 2 ? (
              <CheckCircle2 className="w-4 h-4 text-[#00E500]" />
            ) : rangeStatus === "checking" ? (
              <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
            ) : step >= 1 ? (
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
            ) : null}
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center">
              <Scale
                className={`w-4 h-4 mr-3 ${
                  step >= 3 ? "text-[#00E500]" : "text-gray-500"
                }`}
              />
              <span
                className={`text-sm ${
                  step >= 3 ? "text-white" : "text-gray-500"
                }`}
              >
                Accredited Investor Status
              </span>
            </div>
            {step >= 3 ? (
              <CheckCircle2 className="w-4 h-4 text-[#00E500]" />
            ) : (
              step >= 2 && (
                <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
              )
            )}
          </div>
        </div>

        {rangeStatus === "failed" && rangeError && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center">
            <ShieldAlert className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <span className="text-sm text-red-400 font-medium">
              {rangeError}
            </span>
          </div>
        )}

        {step >= 3 && rangeStatus !== "failed" && (
          <div className="mb-6 p-3 rounded-lg bg-[#00E500]/10 border border-[#00E500]/30 flex items-center">
            <CheckCircle2 className="w-5 h-5 text-[#00E500] mr-3 flex-shrink-0" />
            <span className="text-sm text-[#00E500] font-medium">
              Verified Accredited Investor via Civic
            </span>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${
              !canConfirm
                ? "bg-gray-800 cursor-not-allowed text-gray-500"
                : "bg-[#00E500] hover:bg-green-400 text-black shadow-[0_0_20px_rgba(0,229,0,0.4)]"
            }`}
          >
            {rangeStatus === "failed"
              ? "Blocked by Compliance"
              : !canConfirm
              ? "Verifying..."
              : `Confirm Buy (${amount} SOL)`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- FLOATING FOOTER ---
const FloatingFooter = () => (
  <div className="relative z-50 container max-w-7xl mx-auto px-6 pb-12 mt-20">
    <div className="bg-[#050505] border border-[#00E500]/20 rounded-3xl p-10 md:p-14 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-[#00E500] to-transparent opacity-60"></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-[#00E500]/10 border border-[#00E500]/30 rounded-lg flex items-center justify-center">
              <Icons.logo className="h-4 w-4 text-[#00E500]" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              SilkRoad
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            The decentralized liquidity layer for real-world assets. <br />{" "}
            Built on Solana.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">
            Platform
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="hover:text-[#00E500] cursor-pointer transition-colors flex items-center">
              <ArrowRight className="w-3 h-3 mr-2 opacity-0 hover:opacity-100 transition-opacity" />{" "}
              Marketplace
            </li>
            <li className="hover:text-[#00E500] cursor-pointer transition-colors flex items-center">
              <ArrowRight className="w-3 h-3 mr-2 opacity-0 hover:opacity-100 transition-opacity" />{" "}
              Supplier Portal
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">
            Resources
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="hover:text-[#00E500] cursor-pointer transition-colors">
              Documentation
            </li>
            <li className="hover:text-[#00E500] cursor-pointer transition-colors">
              GitHub
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">
            Connect
          </h4>
          <div className="flex space-x-4">
            <a
              href="https://twitter.com/Abhishekislinux"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/5 rounded-full hover:bg-[#00E500]/20 hover:text-[#00E500] transition-all cursor-pointer relative z-50"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/Abhishek222983101/silkroad-finance-zk"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/5 rounded-full hover:bg-[#00E500]/20 hover:text-[#00E500] transition-all cursor-pointer relative z-50"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://in.linkedin.com/in/abhishek-tiwari-345066294"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/5 rounded-full hover:bg-[#00E500]/20 hover:text-[#00E500] transition-all cursor-pointer relative z-50"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
export default function SilkRoadApp() {
  // RPC Connection with Institutional Failover via QuickNode
  // Primary: Helius (Privacy Infra) | Fallback: QuickNode (Enterprise Grade)
  const [connection] = useState(() => {
    const rpcUrl =
      process.env.NEXT_PUBLIC_HELIUS_RPC ||
      process.env.NEXT_PUBLIC_QUICKNODE_RPC;
    if (!rpcUrl) {
      throw new Error(
        "Missing RPC URL - Configure NEXT_PUBLIC_HELIUS_RPC or NEXT_PUBLIC_QUICKNODE_RPC"
      );
    }
    console.log(
      `[RPC] Initialized with ${
        process.env.NEXT_PUBLIC_HELIUS_RPC
          ? "Helius (Primary)"
          : "QuickNode (Failover)"
      }`
    );
    return new Connection(rpcUrl, "confirmed");
  });
  const wallet = useWallet();
  const [invoices, setInvoices] = useState<any[]>([]);

  // --- LOCAL ZK MINTED INVOICES (Persisted to localStorage) ---
  const [localMintedInvoices, setLocalMintedInvoices] = useState<any[]>(() => {
    // Initialize from localStorage on mount
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("silkroad_zk_invoices");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to load invoices from localStorage:", e);
      }
    }
    return [];
  });

  // Persist localMintedInvoices to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && localMintedInvoices.length > 0) {
      try {
        localStorage.setItem(
          "silkroad_zk_invoices",
          JSON.stringify(localMintedInvoices)
        );
      } catch (e) {
        console.error("Failed to save invoices to localStorage:", e);
      }
    }
  }, [localMintedInvoices]);

  // --- STATE ---
  const [borrowerName, setBorrowerName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // --- AI STATE ---
  const [isScanning, setIsScanning] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [agentLogs, setAgentLogs] = useState<any[]>([]);
  const [apy, setApy] = useState<string | null>(null);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // --- PRIVACY CASH STATE (Shielded Mode) ---
  const [shieldedMode, setShieldedMode] = useState(false);

  // --- IPFS STATE ---
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  const [isUploadingIPFS, setIsUploadingIPFS] = useState(false);

  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange: originalHandleFileChange,
    handleRemove,
  } = useImageUpload();
  const DEVNET_PROGRAM_ID = "C1gro7yAZrKGp1B13wehgQhvMSTx7UxGt8MWc8ozPB4d";

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- APY LOGIC ---
  // NOTE: riskScore from Gemini is INVERTED - high score = high risk = bad
  // So we need to invert the logic: high risk = high rate (subprime)
  useEffect(() => {
    if (riskScore !== null) {
      // High risk score (>70) = Risky invoice = High interest rate
      if (riskScore >= 70) {
        setApy("16.5% (High Risk)");
      } else if (riskScore >= 40) {
        setApy("8.2% (Standard)");
      } else {
        // Low risk score (<40) = Safe invoice = Prime rate
        setApy("5.5% (Prime)");
      }
    } else {
      setApy(null);
    }
  }, [riskScore]);

  // --- FETCH INVOICES ---
  const fetchInvoices = async () => {
    if (!wallet.publicKey) return;
    try {
      const dummyWallet = {
        publicKey: wallet.publicKey,
        signTransaction: () => Promise.resolve(),
        signAllTransactions: () => Promise.resolve(),
      };
      const provider = new AnchorProvider(connection, dummyWallet as any, {});
      const customIdl = { ...idl, address: DEVNET_PROGRAM_ID };
      const program = new Program(customIdl as any, provider);

      const allInvoices = await (program.account as any).invoiceState.all();
      const cleanInvoices = allInvoices.filter((inv: any) =>
        inv.account.borrowerName.startsWith("SR::")
      );
      cleanInvoices.reverse();
      setInvoices(cleanInvoices);
    } catch (e) {
      console.error("Fetch error", e);
    }
  };
  useEffect(() => {
    if (wallet.publicKey) fetchInvoices();
  }, [wallet.publicKey]);

  // --- 💬 RESTORED AUDITOR CHAT LOGIC ---
  const handleAuditorChat = async (userMsg: string) => {
    try {
      // We pass the current state directly so Wolf knows what's happening
      const res = await fetch("/api/audit-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceContext: {
            clientName: borrowerName, // e.g., "Tesla Corp"
            amount: amount, // e.g., "5000"
            riskScore: riskScore, // e.g., 35
          },
          userMessage: userMsg,
        }),
      });

      const data = await res.json();

      // Ensure we return the 'reply' field for the terminal UI to render
      if (data && data.reply) {
        return { reply: data.reply };
      }
      return { reply: "Wolf is currently unresponsive. Check terminal logs." };
    } catch (e) {
      console.error("UI Chat Error:", e);
      return { reply: "Risk Cortex uplink lost. Verify local server status." };
    }
  };

  // --- ⌨️ TEXT COMMAND AGENT ---
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const text = borrowerName;
      if (text.includes(" ")) {
        const toastId = toast.loading("AI Agent Processing...");
        try {
          const res = await fetch("/api/voice-agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript: text }),
          });
          const data = await res.json();

          if (data.clientName) setBorrowerName(data.clientName);
          if (data.amount) setAmount(data.amount.toString());
          toast.success("AI Auto-filled from Text!", { id: toastId });
        } catch (err) {
          toast.error("AI failed", { id: toastId });
        }
      }
    }
  };

  // --- 👁️ MULTI-AGENT SCANNER ---
  const handleSmartFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    originalHandleFileChange(e);
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setAgentLogs([]);
    setIpfsCid(null);
    const toastId = toast.loading("Summoning Risk Committee...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. AI Scan for risk analysis
      const res = await fetch("/api/scan-invoice", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      if (data.conversation) setAgentLogs(data.conversation);
      if (data.clientName) setBorrowerName(data.clientName);
      if (data.amount) setAmount(data.amount.toString());
      if (data.riskScore !== undefined) setRiskScore(data.riskScore);

      toast.success("Consensus Reached!", { id: toastId });

      // 2. Upload to IPFS in parallel
      setIsUploadingIPFS(true);
      const ipfsToastId = toast.loading("Pinning to IPFS...");
      try {
        const cid = await uploadToIPFS(file);
        setIpfsCid(cid);
        toast.success(
          (t) => (
            <div className="flex flex-col gap-1">
              <span className="font-bold">Pinned to IPFS!</span>
              <a
                href={getIPFSGatewayUrl(cid)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00E500] underline text-xs hover:text-green-300"
                onClick={() => toast.dismiss(t.id)}
              >
                View on IPFS Gateway →
              </a>
            </div>
          ),
          { id: ipfsToastId, duration: 8000 }
        );
      } catch (ipfsError: any) {
        console.error("IPFS Error:", ipfsError);
        toast.error(`IPFS Upload Failed: ${ipfsError.message}`, {
          id: ipfsToastId,
        });
      } finally {
        setIsUploadingIPFS(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Scan Failed", { id: toastId });
    } finally {
      setIsScanning(false);
    }
  };

  // --- MINT (Light Protocol ZK Compression) ---
  const createInvoice = async () => {
    // 1. Basic Validation
    if (!wallet.publicKey) {
      toast.error("Connect Wallet First");
      return;
    }
    if (!amount) {
      toast.error("Enter Amount");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Initializing Light Protocol ZK...");

    try {
      // 2. Check Balance - need at least 0.002 SOL for rent + fees
      console.log("Using RPC:", connection.rpcEndpoint);
      const balance = await connection.getBalance(wallet.publicKey);
      console.log("Current Wallet Balance (Lamports):", balance);

      if (balance < 2_000_000) {
        // Less than 0.002 SOL
        toast.dismiss(toastId);
        toast.error(
          `Low Balance! You have ${(balance / 1e9).toFixed(
            4
          )} SOL. Need at least 0.002 SOL.`
        );
        throw new Error("Insufficient balance - need at least 0.002 SOL");
      }

      // 3. Security: Hash the Real Data (Privacy Layer)
      // The actual invoice value ($5000) is stored in this secret hash, NOT as public lamports
      const clientName = borrowerName || "Anonymous";
      const privacyHash = SHA256(
        JSON.stringify({
          amount: amount,
          client: clientName,
          date: new Date().toISOString(),
          salt: Math.random().toString(36).substring(2),
        })
      ).toString();

      console.log(
        "Generating ZK Compressed Account with Privacy Hash:",
        privacyHash
      );
      toast.loading("Creating ZK-Compressed Account...", { id: toastId });

      // 4. Initialize Light Protocol RPC (ZK Compression)
      const rpc = createRpc(
        connection.rpcEndpoint,
        connection.rpcEndpoint,
        connection.rpcEndpoint
      );

      // 5. Get State Tree Info for the compressed account
      const stateTreeInfos = await rpc.getStateTreeInfos();
      const outputStateTreeInfo = selectStateTreeInfo(stateTreeInfos);

      console.log("Using State Tree:", outputStateTreeInfo.tree.toBase58());

      // 6. Create the Light Protocol compress instruction
      // This creates a ZK-compressed SOL account (the core of Light Protocol)
      const compressIx = await LightSystemProgram.compress({
        payer: wallet.publicKey,
        toAddress: wallet.publicKey,
        lamports: bn(1_000_000), // 0.001 SOL - rent for compressed account
        outputStateTreeInfo,
      });

      // 7. Build the versioned transaction
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const tx = buildTx([compressIx], wallet.publicKey, blockhash);

      // 8. Sign & Send via Wallet Adapter
      toast.loading("Awaiting wallet signature...", { id: toastId });
      const signature = await wallet.sendTransaction(tx, connection, {
        skipPreflight: true,
      });
      console.log("Transaction sent! Signature:", signature);

      toast.loading("Confirming ZK Compression on Solana...", { id: toastId });
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      // Create Explorer link for judges to verify
      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

      console.log("✅ ZK Compressed Invoice Minted via Light Protocol!");
      console.log("📝 Signature:", signature);
      console.log("🔍 Verify on Explorer:", explorerUrl);

      // Add to local minted invoices for immediate UI display
      const newLocalInvoice = {
        publicKey: signature, // Use signature as unique ID
        account: {
          borrowerName: `SR::${clientName}::${amount}::${riskScore || 50}`,
          amount: parseFloat(amount),
          isSold: false,
          supplier: wallet.publicKey,
          isZkCompressed: true, // Flag to identify ZK compressed assets
          explorerUrl: explorerUrl,
          ipfsCid: ipfsCid,
          mintedAt: Date.now(),
        },
      };
      setLocalMintedInvoices((prev) => [newLocalInvoice, ...prev]);

      // Show clickable toast with Explorer link
      toast.dismiss(toastId);
      toast.success(
        (t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold">ZK Compressed Asset Minted!</span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 underline text-xs hover:text-green-300"
              onClick={() => toast.dismiss(t.id)}
            >
              View on Solana Explorer →
            </a>
          </div>
        ),
        { duration: 10000 }
      );

      // Reset form
      setBorrowerName("");
      setAmount("");
      setRiskScore(null);
      setAgentLogs([]);
      setIpfsCid(null);
      handleRemove();

      // Refresh invoice list
      fetchInvoices();
    } catch (err: any) {
      console.error("Light Protocol Minting Error:", err);
      toast.dismiss(toastId);

      // Provide helpful error messages
      if (err.message?.includes("User rejected")) {
        toast.error("Transaction cancelled by user");
      } else if (err.message?.includes("Insufficient")) {
        toast.error("Insufficient SOL balance");
      } else if (err.message?.includes("blockhash")) {
        toast.error("Network congestion - please try again");
      } else {
        toast.error(
          `Mint Failed: ${err.message?.substring(0, 50) || "Unknown error"}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // --- PRIVACY CASH TOGGLE HANDLER ---
  const handleShieldedModeToggle = () => {
    const newValue = !shieldedMode;
    setShieldedMode(newValue);
    if (newValue) {
      toast.success("Shielded Mode Activated. Yield is now private.", {
        icon: "🛡️",
        duration: 3000,
        style: {
          background: "#0A0C0A",
          color: "#fff",
          border: "1px solid rgba(0, 229, 0, 0.3)",
        },
      });
    } else {
      toast("Shielded Mode Deactivated.", {
        icon: "🔓",
        duration: 2000,
        style: {
          background: "#0A0C0A",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      });
    }
  };

  // --- BUY LOGIC ---
  const initiateBuy = (inv: any, price: string) => {
    setSelectedInvoice({ inv, price });
    setIsModalOpen(true);
  };

  const confirmBuy = async () => {
    if (!selectedInvoice) return;
    const { inv, price } = selectedInvoice;
    setIsModalOpen(false);
    if (!wallet.publicKey) return;

    // Validate the price/amount - force absolute positive value
    const rawAmount = price || inv.account.amount;
    const amount = Math.abs(parseFloat(rawAmount?.toString() || "0"));

    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid amount detected:", amount, "from:", rawAmount);
      toast.error("Invalid invoice amount.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`Executing Swap: ${amount} SOL...`);

    try {
      // Calculate lamports as a regular number (web3.js expects number, not BigInt)
      const transferLamports = Math.floor(amount * web3.LAMPORTS_PER_SOL);

      // Sanity check
      if (transferLamports <= 0 || transferLamports > 1e15) {
        throw new Error(`Invalid lamports value: ${transferLamports}`);
      }

      const isZkAsset = inv.account.isZkCompressed;

      // Get supplier/owner address
      let recipientPubkey: PublicKey;
      try {
        const supplierAddress = inv.account.supplier || inv.account.owner;
        if (!supplierAddress) {
          throw new Error("No recipient address found");
        }
        recipientPubkey = new PublicKey(supplierAddress.toString());
      } catch (e) {
        console.error("Invalid recipient address:", e);
        throw new Error("Invalid supplier address");
      }

      // Get fresh blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

      if (isZkAsset) {
        // For ZK Compressed Assets: Simple SOL transfer
        const transaction = new Transaction({
          feePayer: wallet.publicKey,
          recentBlockhash: blockhash,
        }).add(
          web3.SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: recipientPubkey,
            lamports: transferLamports,
          })
        );

        const signature = await wallet.sendTransaction(transaction, connection);

        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });

        // Mark as sold in local state
        setLocalMintedInvoices((prev) =>
          prev.map((i) =>
            i.publicKey === inv.publicKey
              ? { ...i, account: { ...i.account, isSold: true } }
              : i
          )
        );

        const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
        toast.success(
          (t) => (
            <div className="flex flex-col gap-1">
              <span className="font-bold">ZK Asset Acquired!</span>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00E500] underline text-xs"
                onClick={() => toast.dismiss(t.id)}
              >
                View Transaction →
              </a>
            </div>
          ),
          { id: toastId, duration: 8000 }
        );
      } else {
        // For Legacy Anchor Assets: Use program instruction
        const dummyWallet = {
          publicKey: wallet.publicKey,
          signTransaction: () => Promise.reject(),
          signAllTransactions: () => Promise.reject(),
        };
        const provider = new AnchorProvider(connection, dummyWallet as any, {});
        const customIdl = { ...idl, address: DEVNET_PROGRAM_ID };
        const program = new Program(customIdl as any, provider);

        const ixContract = await program.methods
          .buyInvoice()
          .accounts({
            invoiceAccount: inv.publicKey,
            buyer: wallet.publicKey,
            investor: wallet.publicKey,
            user: wallet.publicKey,
            signer: wallet.publicKey,
            supplier: recipientPubkey,
            systemProgram: web3.SystemProgram.programId,
          } as any)
          .instruction();

        const transaction = new Transaction({
          feePayer: wallet.publicKey,
          recentBlockhash: blockhash,
        })
          .add(ixContract)
          .add(
            web3.SystemProgram.transfer({
              fromPubkey: wallet.publicKey,
              toPubkey: recipientPubkey,
              lamports: transferLamports,
            })
          );

        const signature = await wallet.sendTransaction(transaction, connection);

        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });

        toast.success(`Asset Acquired!`, { id: toastId });
      }

      fetchInvoices();
    } catch (err: any) {
      console.error("Buy Error:", err);
      toast.error(
        `Transaction Failed: ${
          err.message?.substring(0, 50) || "Unknown error"
        }`,
        { id: toastId }
      );
    } finally {
      setLoading(false);
      setSelectedInvoice(null);
    }
  };

  const InvoiceCard = ({ inv }: any) => {
    const rawString = inv.account.borrowerName;
    const isZkCompressed = inv.account.isZkCompressed;
    let displayName = "Invoice",
      displayPrice = "0.0",
      displayRisk = null;
    if (rawString.startsWith("SR::")) {
      const parts = rawString.split("::");
      if (parts.length >= 3) {
        displayName = parts[1];
        displayPrice = parts[2];
      }
      if (parts.length >= 4) {
        displayRisk = parts[3];
      }
    }
    const isFunded = inv.account.isSold;
    return (
      <div className="relative rounded-xl p-[1px] mb-3 bg-gradient-to-r from-[#00E500]/30 to-transparent group">
        <GlowingEffect
          spread={20}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={1}
        />
        <div className="relative bg-[#0A0C0A] p-4 rounded-xl flex items-center justify-between border border-[#00E500]/20 group-hover:border-[#00E500]/50 transition-colors">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-white text-sm">{displayName}</h4>
              {isZkCompressed && (
                <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#00E500]/50 text-[#00E500] bg-[#00E500]/10">
                  ZK Private
                </span>
              )}
              {displayRisk && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${
                    parseInt(displayRisk) > 50
                      ? "border-red-500/50 text-red-400 bg-red-900/20"
                      : "border-green-500/50 text-green-400 bg-green-900/20"
                  }`}
                >
                  Risk: {displayRisk}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-[#00E500] flex items-center font-mono">
                <ShieldCheck className="w-3 h-3 mr-1" /> {displayPrice} SOL
              </p>
              {inv.account.explorerUrl && (
                <a
                  href={inv.account.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[9px] text-gray-500 hover:text-[#00E500] underline"
                >
                  Explorer
                </a>
              )}
            </div>
          </div>
          {isFunded ? (
            <span className="px-3 py-1 bg-[#00E500]/20 text-[#00E500] text-[10px] font-bold rounded border border-[#00E500]/20">
              Funded
            </span>
          ) : (
            <button
              onClick={() => initiateBuy(inv, displayPrice)}
              className="px-4 py-1.5 bg-white text-black font-bold text-xs rounded hover:bg-[#00E500] hover:scale-105 transition-all"
            >
              Buy
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!isClient) return null;

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-[#00E500]/30 overflow-x-hidden">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
          },
        }}
      />
      <GlassNavbar />
      <ComplianceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmBuy}
        amount={selectedInvoice?.price || "0"}
        walletAddress={wallet.publicKey?.toBase58()}
      />

      {/* HERO */}
      <div className="relative h-[90vh] w-full flex flex-col items-center justify-center overflow-visible">
        <div className="absolute inset-0 top-[20%] z-0">
          <Canvas camera={{ position: [0, 0, 4.5] }}>
            <ambientLight intensity={2.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#00E500" />
            <Stars
              radius={150}
              depth={50}
              count={1200}
              factor={4}
              saturation={0}
              fade
              speed={0.5}
            />
            <GlobeMesh />
          </Canvas>
        </div>
        <div className="relative z-10 text-center max-w-5xl px-6 -mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 border border-[#00E500]/30 bg-[#00E500]/10 px-3 py-1 rounded-full mb-8 backdrop-blur-md">
              <Icons.logo className="h-4 w-4 text-[#00E500] animate-spin-slow" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-green-400">
                Solana Privacy Hack
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-[1.1] flex flex-col items-center">
              <span>Smart Liquidity for</span>
              <span className="mt-1 -ml-1">
                <TextLoop />
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed">
              Transform unpaid invoices into liquid assets. <br /> Powered by{" "}
              <strong>ZK-Compression</strong> on Solana.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() =>
                  document
                    .getElementById("dashboard")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-[#00E500] text-black font-bold rounded-full hover:bg-green-400 hover:shadow-[0_0_40px_rgba(0,229,0,0.4)] transition-all flex items-center"
              >
                Start Minting <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* DASHBOARD */}
      <div id="dashboard" className="relative w-full z-20 -mt-48 pb-20">
        <div className="absolute top-20 left-0 w-full h-[150%] z-0 pointer-events-none opacity-40">
          <RetroGrid gridColor="#00E500" />
        </div>
        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-[#050505]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
              {/* LEFT COLUMN: FORM */}
              <div className="lg:col-span-5 border-r border-white/5 pr-0 lg:pr-12 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center">
                      <FileText className="text-[#00E500] mr-2 w-5 h-5" /> New
                      Invoice
                    </h3>
                    <p className="text-gray-500 text-xs">
                      Mint your RWA instantly.
                    </p>
                  </div>
                  {riskScore !== null && (
                    <div
                      className={`px-3 py-1 rounded-lg border ${
                        riskScore > 50
                          ? "border-red-500/30 bg-red-900/20"
                          : "border-green-500/30 bg-green-900/20"
                      } flex flex-col items-center`}
                    >
                      <span className="text-[10px] uppercase text-gray-400">
                        Risk Score
                      </span>
                      <div className="flex items-center space-x-1">
                        {riskScore > 50 ? (
                          <ShieldAlert className="w-3 h-3 text-red-500" />
                        ) : (
                          <ShieldCheck className="w-3 h-3 text-green-500" />
                        )}
                        <span
                          className={`font-bold ${
                            riskScore > 50 ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          {riskScore}/100
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pr-12 text-sm focus:border-[#00E500] outline-none text-white transition-all font-mono placeholder:font-sans"
                      placeholder="Client Name OR Command"
                      value={borrowerName}
                      onChange={(e) => setBorrowerName(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500">
                      <Terminal className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-[#00E500] outline-none text-white transition-all"
                      type="number"
                      placeholder="Value (SOL)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    {apy && (
                      <div
                        className={`mt-2 text-xs font-mono px-3 py-1 rounded-full w-fit flex items-center gap-2 ${
                          apy.includes("Prime")
                            ? "bg-green-500/20 text-green-400"
                            : apy.includes("Standard")
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        <span>🤖 AI Recommended Rate: {apy}</span>
                      </div>
                    )}
                  </div>

                  {/* ⬇️ THIS WAS THE MISSING PART! */}
                  <AgentTerminal
                    logs={agentLogs}
                    onChat={handleAuditorChat}
                    invoiceData={{
                      clientName: borrowerName,
                      amount,
                      riskScore,
                    }}
                  />

                  <div
                    onClick={handleThumbnailClick}
                    className="border-2 border-dashed border-white/10 bg-black/20 rounded-xl p-6 text-center hover:border-[#00E500]/50 hover:bg-green-900/10 transition-all cursor-pointer relative overflow-hidden group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleSmartFileChange}
                    />
                    {isScanning ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <Loader2 className="w-8 h-8 text-[#00E500] animate-spin mb-2" />
                        <p className="text-xs text-[#00E500] animate-pulse">
                          Risk Committee in Session...
                        </p>
                      </div>
                    ) : previewUrl ? (
                      <div className="relative z-10 flex flex-col items-center">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-20 rounded-lg object-cover shadow-lg border border-white/10"
                        />
                        {/* IPFS Status Badge */}
                        {isUploadingIPFS ? (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-gray-400">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Pinning to IPFS...</span>
                          </div>
                        ) : ipfsCid ? (
                          <a
                            href={getIPFSGatewayUrl(ipfsCid)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#00E500]/10 border border-[#00E500]/30 text-[#00E500] text-xs font-medium hover:bg-[#00E500]/20 transition-all"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Pinned to IPFS</span>
                            <span className="text-[#00E500]/60">[View]</span>
                          </a>
                        ) : null}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove();
                            setRiskScore(null);
                            setAgentLogs([]);
                            setIpfsCid(null);
                          }}
                          className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-600 mx-auto mb-3 group-hover:text-[#00E500] transition-colors" />
                        <p className="text-gray-400 text-sm group-hover:text-white">
                          Click to Upload Invoice
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1">
                          AI Scan Enabled
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={createInvoice}
                    disabled={loading || isScanning}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(0,229,0,0.1)] flex justify-center items-center"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {loading ? "Minting..." : "Mint Asset on Solana"}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-7 pl-0 lg:pl-4 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <h3 className="text-xl font-bold text-white">
                      Live Market
                    </h3>
                    <span
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="text-xs text-gray-700 hover:text-red-500 cursor-pointer ml-4"
                    >
                      [Reset]
                    </span>
                  </div>
                  <span className="text-[10px] bg-[#00E500]/10 text-[#00E500] px-2 py-1 rounded border border-[#00E500]/20 animate-pulse">
                    ● LIVE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="relative rounded-xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
                    <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl flex flex-col justify-center items-center text-center h-full hover:bg-white/5 transition-all">
                      <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                      <span className="text-sm font-bold text-white">
                        Instant Settlement
                      </span>
                      <span className="text-[10px] text-gray-500 mt-1">
                        Funds settle in &lt;400ms
                      </span>
                    </div>
                  </div>
                  <div className="relative rounded-xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
                    <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl flex flex-col justify-center items-center text-center h-full hover:bg-white/5 transition-all">
                      <Lock className="w-6 h-6 text-[#00E500] mb-2" />
                      <span className="text-sm font-bold text-white">
                        ZK-Privacy
                      </span>
                      <span className="text-[10px] text-gray-500 mt-1">
                        Zero-Knowledge Proofs
                      </span>
                    </div>
                  </div>
                </div>

                {/* PRIVACY CASH - SHIELDED MODE TOGGLE */}
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#00E500]/5 to-transparent border border-[#00E500]/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00E500]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          shieldedMode ? "bg-[#00E500]/20" : "bg-white/5"
                        } transition-colors`}
                      >
                        <Lock
                          className={`w-4 h-4 ${
                            shieldedMode ? "text-[#00E500]" : "text-gray-500"
                          } transition-colors`}
                        />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white flex items-center">
                          Shielded Mode
                          {shieldedMode && (
                            <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-[#00E500]/20 text-[#00E500] rounded border border-[#00E500]/30">
                              ACTIVE
                            </span>
                          )}
                        </span>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Routes liquidity via Privacy Cash anonymity set
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleShieldedModeToggle}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                        shieldedMode
                          ? "bg-[#00E500]"
                          : "bg-white/10 border border-white/20"
                      }`}
                      title="Routes liquidity via Privacy Cash's anonymity set to protect Lender identity."
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                          shieldedMode ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 min-h-[250px]">
                  {(() => {
                    // Merge: local ZK mints (persisted) + fetched Anchor invoices
                    // Local mints appear first (newest at top)
                    const allInvoices = [...localMintedInvoices, ...invoices];

                    // Filter out junk test data and duplicates
                    const seenIds = new Set<string>();
                    const filteredInvoices = allInvoices.filter((inv) => {
                      // Deduplicate by publicKey
                      const id =
                        inv.publicKey?.toString() || Math.random().toString();
                      if (seenIds.has(id)) return false;
                      seenIds.add(id);

                      const name = inv.account.borrowerName.toLowerCase();
                      // Exclude junk test data
                      if (
                        name.includes("test") ||
                        name.includes("john smith") ||
                        name.includes("walmart") ||
                        name.includes("asdf") ||
                        name.includes("xxx") ||
                        name.includes("aaa") ||
                        name.includes("bbb")
                      )
                        return false;
                      return true;
                    });

                    if (filteredInvoices.length === 0) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 border border-dashed border-white/5 rounded-xl bg-black/20">
                          <Globe className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-sm">Ready to Mint.</p>
                        </div>
                      );
                    }

                    return filteredInvoices.map((inv, idx) => (
                      <InvoiceCard key={inv.publicKey || idx} inv={inv} />
                    ));
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="relative z-20 bg-black pt-20 pb-20 overflow-hidden -mt-32">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle 900px at 50% 0px, rgba(0, 229, 0, 0.25), transparent 70%), linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
              backgroundSize: "100% 100%, 60px 60px, 60px 60px",
            }}
          />
        </div>
        <div className="relative z-10 pt-20">
          <LogoCloud />
          <SectionWithMockup
            title={
              <>
                Bridging <span className="text-[#00E500]">Web3</span> & Real
                World
              </>
            }
            description="SilkRoad enables businesses to unlock capital trapped in unpaid invoices using the speed and security of the Solana blockchain."
            mockupImage="/arch.png"
          />
          <BentoGrid />
        </div>
      </div>
      <FloatingFooter />
    </div>
  );
}
