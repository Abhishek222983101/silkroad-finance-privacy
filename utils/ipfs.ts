import axios from "axios";

/**
 * Upload a file to Pinata IPFS
 * @param file - The file to upload
 * @returns The IPFS CID (Content Identifier) hash
 */
export async function uploadToIPFS(file: File): Promise<string> {
  const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!PINATA_JWT) {
    throw new Error(
      "Missing NEXT_PUBLIC_PINATA_JWT environment variable. Please add your Pinata JWT token to .env.local"
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  // Optional: Add metadata for the file
  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      app: "SilkRoad",
      type: "invoice",
      uploadedAt: new Date().toISOString(),
    },
  });
  formData.append("pinataMetadata", metadata);

  // Optional: Pin options
  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append("pinataOptions", options);

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "multipart/form-data",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    // Return the IPFS hash (CID)
    return response.data.IpfsHash;
  } catch (error: any) {
    console.error("IPFS Upload Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to upload to IPFS"
    );
  }
}

/**
 * Get the public gateway URL for an IPFS CID
 * @param cid - The IPFS Content Identifier
 * @returns The full gateway URL
 */
export function getIPFSGatewayUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
