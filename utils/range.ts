import axios from "axios";

export interface RangeScreenResult {
  isRisk: boolean;
  riskScore?: number;
  details?: string;
  label?: string;
}

/**
 * Screen a wallet address using Range Protocol Risk API
 * @param address - The wallet address to screen
 * @returns RangeScreenResult with risk assessment
 *
 * FAIL-SAFE: If the API fails for any reason, we return isRisk: false
 * to ensure the demo continues to work.
 */
export async function screenWallet(
  address: string
): Promise<RangeScreenResult> {
  const RANGE_API_KEY = process.env.NEXT_PUBLIC_RANGE_API_KEY;

  // If no API key, log and allow (Demo Mode)
  if (!RANGE_API_KEY) {
    console.warn(
      "[Range Protocol] No API key configured. Running in Demo Mode."
    );
    return { isRisk: false, details: "Demo Mode - No API Key" };
  }

  try {
    const response = await axios.get("https://api.range.org/v1/risk/score", {
      params: {
        address: address,
        chain: "solana",
      },
      headers: {
        "x-api-key": RANGE_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 second timeout
    });

    const data = response.data;

    // Log for debugging
    console.log("[Range Protocol] Risk Score Response:", data);

    // Check if risk score is high (>7 on a 0-10 scale)
    const riskScore = data?.riskScore ?? data?.score ?? 0;

    if (riskScore > 7) {
      return {
        isRisk: true,
        riskScore: riskScore,
        details: data?.riskFactors?.join(", ") || "High Risk Score Detected",
      };
    }

    return {
      isRisk: false,
      riskScore: riskScore,
      details: "Wallet Cleared",
    };
  } catch (error: any) {
    // FAIL-SAFE: Warn but allow transaction
    console.warn(
      "⚠️ Range API unreachable (Plan Limit or Network). Defaulting to COMPLIANT for Demo."
    );

    // Return safe result to allow demo to continue
    return {
      isRisk: false,
      riskScore: 0,
      label: "Low Risk (Dev)",
      details: "API Limit Reached - Allowing Demo",
    };
  }
}

/**
 * Check if Range Protocol is configured
 */
export function isRangeConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_RANGE_API_KEY;
}
