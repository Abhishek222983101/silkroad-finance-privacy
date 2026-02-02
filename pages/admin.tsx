import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "motion/react";
import {
  Zap,
  Activity,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Globe,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Icons } from "@/components/ui/icons";

// --- MOCK SETTLEMENT DATA ---
interface Settlement {
  id: string;
  debtor: string;
  invoiceId: string;
  amount: number;
  currency: string;
  dueDate: string;
  investor: string;
  status: "PENDING" | "PAID";
}

const initialSettlements: Settlement[] = [
  {
    id: "SET-001",
    debtor: "Nokia Corporation",
    invoiceId: "INV-2024-8847",
    amount: 125000,
    currency: "USD",
    dueDate: "2024-02-15",
    investor: "0x7a3...f9c2",
    status: "PENDING",
  },
  {
    id: "SET-002",
    debtor: "Tesla Inc.",
    invoiceId: "INV-2024-7721",
    amount: 89500,
    currency: "USD",
    dueDate: "2024-02-10",
    investor: "0x4b1...a8e3",
    status: "PENDING",
  },
  {
    id: "SET-003",
    debtor: "Siemens AG",
    invoiceId: "INV-2024-6632",
    amount: 67200,
    currency: "USD",
    dueDate: "2024-02-08",
    investor: "0x9c2...b4d1",
    status: "PAID",
  },
  {
    id: "SET-004",
    debtor: "Samsung Electronics",
    invoiceId: "INV-2024-5519",
    amount: 234800,
    currency: "USD",
    dueDate: "2024-02-20",
    investor: "0x2e7...c5f8",
    status: "PENDING",
  },
  {
    id: "SET-005",
    debtor: "Microsoft Corp",
    invoiceId: "INV-2024-4401",
    amount: 156000,
    currency: "USD",
    dueDate: "2024-02-12",
    investor: "0x6d4...e9a7",
    status: "PENDING",
  },
];

// --- STATUS PILL COMPONENT ---
const StatusPill = ({ status }: { status: "PENDING" | "PAID" }) => {
  if (status === "PAID") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        PAID
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
      <Clock className="w-3 h-3 mr-1" />
      PENDING
    </span>
  );
};

// --- MAIN ADMIN DASHBOARD ---
export default function AdminDashboard() {
  const [settlements, setSettlements] =
    useState<Settlement[]>(initialSettlements);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  // Calculate stats
  const totalPending = settlements
    .filter((s) => s.status === "PENDING")
    .reduce((acc, s) => acc + s.amount, 0);
  const totalSettled = settlements
    .filter((s) => s.status === "PAID")
    .reduce((acc, s) => acc + s.amount, 0);
  const pendingCount = settlements.filter((s) => s.status === "PENDING").length;

  // --- GOD MODE: SIMULATE CIRCLE SETTLEMENT ---
  const simulateSettlement = async (settlementId: string) => {
    setIsSimulating(settlementId);

    // Step 1: Show loading toast
    const toastId = toast.loading("Connecting to Circle API...", {
      style: {
        background: "#0A0C0A",
        color: "#fff",
        border: "1px solid rgba(0, 229, 0, 0.3)",
      },
    });

    // Step 2: Wait 2 seconds (Simulate Bank Delay)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3: Toast 1 - Wire Received
    toast.success("Oracle Alert: Wire Received via Circle API...", {
      id: toastId,
      icon: "🏦",
      duration: 2000,
      style: {
        background: "#0A0C0A",
        color: "#fff",
        border: "1px solid rgba(0, 229, 0, 0.5)",
      },
    });

    // Step 4: Wait another 1.5 seconds
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Step 5: Toast 2 - Settling on Solana
    toast.loading("Settling Loan on Solana...", {
      id: toastId,
      style: {
        background: "#0A0C0A",
        color: "#fff",
        border: "1px solid rgba(0, 229, 0, 0.3)",
      },
    });

    // Step 6: Wait 1 second for chain confirmation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 7: Update the status to PAID
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === settlementId ? { ...s, status: "PAID" as const } : s
      )
    );

    // Step 8: Final success toast
    toast.success("Settlement Complete! USDC Released to Investor.", {
      id: toastId,
      icon: "✅",
      duration: 4000,
      style: {
        background: "#0A0C0A",
        color: "#00E500",
        border: "1px solid rgba(0, 229, 0, 0.5)",
        fontWeight: "bold",
      },
    });

    setIsSimulating(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#00E500]/10 border border-[#00E500]/30 rounded-xl flex items-center justify-center">
              <Icons.logo className="h-5 w-5 text-[#00E500]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Oracle Command Center
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                SilkRoad Finance // Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">
                Circle API Connected
              </span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#00E500]/10 border border-[#00E500]/30 rounded-full">
              <Globe className="w-3 h-3 text-[#00E500]" />
              <span className="text-xs text-[#00E500] font-medium">
                Solana Devnet
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#0A0C0A] to-[#111] border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Pending Settlements
              </span>
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-white">{pendingCount}</p>
            <p className="text-xs text-yellow-400 mt-1">
              Awaiting Wire Transfer
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#0A0C0A] to-[#111] border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Pending Volume
              </span>
              <DollarSign className="w-4 h-4 text-[#00E500]" />
            </div>
            <p className="text-2xl font-bold text-white">
              ${totalPending.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">USD Equivalent</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#0A0C0A] to-[#111] border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Settled Volume
              </span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-400">
              ${totalSettled.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Completed This Month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#0A0C0A] to-[#111] border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Oracle Status
              </span>
              <Shield className="w-4 h-4 text-[#00E500]" />
            </div>
            <p className="text-2xl font-bold text-[#00E500]">Active</p>
            <p className="text-xs text-gray-500 mt-1">Circle + Solana Bridge</p>
          </motion.div>
        </div>

        {/* SETTLEMENTS TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0A0C0A] border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-[#00E500]" />
              <h2 className="text-lg font-bold text-white">
                Active Settlements
              </h2>
            </div>
            <span className="text-xs text-gray-500">
              Real-time Oracle Monitoring
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debtor
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice ID
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investor
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((settlement, index) => (
                  <motion.tr
                    key={settlement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold text-white">
                          {settlement.debtor.charAt(0)}
                        </div>
                        <span className="font-medium text-white">
                          {settlement.debtor}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-400">
                        {settlement.invoiceId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white">
                        ${settlement.amount.toLocaleString()}
                      </span>
                      <span className="text-gray-500 text-xs ml-1">
                        {settlement.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {settlement.dueDate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-[#00E500]">
                        {settlement.investor}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={settlement.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {settlement.status === "PENDING" ? (
                        <button
                          onClick={() => simulateSettlement(settlement.id)}
                          disabled={isSimulating !== null}
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            isSimulating === settlement.id
                              ? "bg-[#00E500]/10 text-[#00E500]/70 border border-[#00E500]/20 cursor-wait"
                              : "bg-transparent text-[#00E500] border border-[#00E500]/40 hover:bg-[#00E500]/10 hover:border-[#00E500]/60"
                          }`}
                        >
                          {isSimulating === settlement.id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 mr-1.5" />
                              Settle
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-gray-600 text-sm">Completed</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FOOTER NOTE */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600">
            This is a simulated Oracle Dashboard for demonstration purposes.
            <br />
            In production, Circle API would automatically detect wire transfers
            and trigger on-chain settlements.
          </p>
        </div>
      </main>
    </div>
  );
}
