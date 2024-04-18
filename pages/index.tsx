import Image from "next/image"; // Images
import { eth } from "state/eth"; // State container
import Layout from "components/Layout"; // Layout wrapper
import { useRouter } from "next/router"; // Routing
import styles from "styles/pages/Home.module.scss"; // Page styles
import { token } from "state/token";
import { useState } from "react";

// Setup project details
const tokenName: string = process.env.NEXT_PUBLIC_TOKEN_NAME ?? "Token Name";
const heading: string = process.env.NEXT_PUBLIC_HEADING ?? "Some heading";
const description: string =
  process.env.NEXT_PUBLIC_DESCRIPTION ?? "Some description";

export default function Home() {
  // Routing
  const { push } = useRouter();
  // Authentication status
  const { address, unlock } = eth.useContainer();
  const {
    dataLoading,
    numTokens,
    alreadyClaimed,
    claimAirdrop,
  }: {
    dataLoading: boolean;
    numTokens: number;
    alreadyClaimed: boolean;
    claimAirdrop: Function;
  } = token.useContainer();
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

    /**
   * Claims airdrop with local button loading
   */
     const claimWithLoading = async () => {
      setButtonLoading(true); // Toggle
      await claimAirdrop(); // Claim
      setButtonLoading(false); // Toggle
    };

  return (
    <Layout>
      <div className={styles.home}>
        {/* Project logo */}
        <div>
          <Image src="/title.png" alt="Logo" width={1810} height={706} priority />
        </div>
        
        {/* Claim button */}
        {!address ? (
          // If not authenticated, disabled
          <button onClick={unlock}>Connect Wallet</button>
        ) : dataLoading ? (
          // Loading details about address
          <div className={styles.card}>
            <h1>Looking for your cats...</h1>
          </div>
        ) : numTokens == 0 ? (
          // Not part of airdrop
          <div className={styles.card}>
            <h1>You do not have any cats available :(</h1>
            <p>Unfortunately, your address does not qualify for the airdrop.</p>
          </div>
        ) : alreadyClaimed ? (
          // Already claimed airdrop
          <div className={styles.card}>
            <h1>You already claimed {numTokens} cats!</h1>
          </div>
        ) :(
          <div className="flex gap-2">
            <button onClick={claimWithLoading} disabled={buttonLoading}>{buttonLoading ? "Claiming" : "Claim"}</button>
            <button onClick={() => push("/#")}>Buy</button>
          </div>
        )}

      </div>

      <div style={{ position: "fixed", bottom: "-1rem", left: "50%", transform: "translate(-50%, 0%)" }}>
          <Image src="/catinbox1b.png" alt="Logo" width={500} height={250} priority />
        </div>
    </Layout>
  );
}
