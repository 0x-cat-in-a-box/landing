import { eth } from "state/eth"; // ETH state provider
import { ethers } from "ethers"; // Ethers
import { useEffect, useState } from "react"; // React
import { createContainer } from "unstated-next"; // State management
import {
  StandardMerkleTree
} from "@openzeppelin/merkle-tree"
import TreeJson from '../tree.json';

const whitelist = {
  "0x1552B1A051430290f1B5E31F156E3CD501f520C3": 1000,
  "0xe32d9D1F1484f57F8b5198f90bcdaBC914de0B5A": 1000,
  "0x858817FF833B5608656B22A1940eE97C7b26134c": 1000,
  "0x921b87310e4DC8827e91938C89eDa521CAd63c3a": 1000,
  "0x020bCdC76C86db34718f0357c35811b147CD866B": 1000,
  "0x93eb6ccF00Bfdb205ab79E824C4855d2ad196a77": 1000,
  "0x34A0D4402c039FFb469389e88c3b9F06176e954A": 1000,
};

function useToken() {
  // Collect global ETH state
  const {
    address,
    provider,
  }: {
    address: string | null;
    provider: ethers.providers.Web3Provider | null;
  } = eth.useContainer();

  // Local state
  const [dataLoading, setDataLoading] = useState<boolean>(true); // Data retrieval status
  const [numTokens, setNumTokens] = useState<number>(0); // Number of claimable tokens
  const [alreadyClaimed, setAlreadyClaimed] = useState<boolean>(false); // Claim status

  /**
   * Get contract
   * @returns {ethers.Contract} signer-initialized contract
   */
  const getContract = (): ethers.Contract => {
    return new ethers.Contract(
      // Contract address
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "",
      [
        // hasClaimed mapping
        "function hasClaimed(address) public view returns (bool)",
        // Claim function
        "function claim(address to, uint256 amount, bytes32[] calldata proof) external",
      ],
      // Get signer from authed provider
      provider?.getSigner()
    );
  };

  /**
   * Collects number of tokens claimable by a user from Merkle tree
   * @param {string} address to check
   * @returns {number} of tokens claimable
   */
  const getAirdropAmount = (address: string): number => {
    // If address is in airdrop. convert address to correct checksum
    address = ethers.utils.getAddress(address)
    
    if (address in whitelist) {
      // Return number of tokens available
      return (whitelist as any)[address];
    }

    // Else, return 0 tokens
    return 0;
  };

  /**
   * Collects claim status for an address
   * @param {string} address to check
   * @returns {Promise<boolean>} true if already claimed, false if available
   */
  const getClaimedStatus = async (address: string): Promise<boolean> => {
    // Collect token contract
    const token: ethers.Contract = getContract();
    // Return claimed status
    return await token.hasClaimed(address);
  };

  const claimAirdrop = async (): Promise<void> => {
    // If not authenticated throw
    if (!address) {
      throw new Error("Not Authenticated");
    }

    // Collect token contract
    const token: ethers.Contract = getContract();
    // Get properly formatted address
    const formattedAddress: string = ethers.utils.getAddress(address);
    // Get tokens for address
    const numTokens: string = ethers.utils
      .parseUnits((whitelist as any)[ethers.utils.getAddress(address)].toString(), 18)
      .toString();

      // Generate tree
    const tree = StandardMerkleTree.load(TreeJson as any);
    let proof: string[] = [];

    for (const [i, v] of (tree as any).entries()) {
      if (v[0] === formattedAddress) {
          // (3)
          proof = tree.getProof(i);
          console.log(proof)
      }
    }
    if(!proof) return;

    // Try to claim airdrop and refresh sync status
    try {
      const tx = await token.claim(formattedAddress, numTokens, proof);
      const receipt = await tx.wait(1);
      await syncStatus();
      return receipt?.transactionHash;
    } catch (e) {
      console.error(`Error when claiming tokens: ${e}`);
    }
  };

  /**
   * After authentication, update number of tokens to claim + claim status
   */
  const syncStatus = async (): Promise<void> => {
    // Toggle loading
    setDataLoading(true);

    // Force authentication
    if (address) {
      // Collect number of tokens for address
      const tokens = getAirdropAmount(address);
      setNumTokens(tokens);

      // Collect claimed status for address, if part of airdrop (tokens > 0)
      if (tokens > 0) {
        const claimed = await getClaimedStatus(address);
        setAlreadyClaimed(claimed);
      }
    }

    // Toggle loading
    setDataLoading(false);
  };

  // On load:
  useEffect(() => {
    syncStatus();
  }, [address]);

  return {
    dataLoading,
    numTokens,
    alreadyClaimed,
    claimAirdrop,
  };
}

// Create unstated-next container
export const token = createContainer(useToken);
