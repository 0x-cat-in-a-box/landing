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
const explorer = "https://basescan.org/";

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
  const [successMsg, setSuccessMsg] = useState("");

    /**
   * Claims airdrop with local button loading
   */
     const claimWithLoading = async () => {
      setButtonLoading(true); // Toggle
      const res = await claimAirdrop(); // Claim
      if(res && typeof res === "string") setSuccessMsg(res)
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
        ) : numTokens === 0 ? (
          // Not part of airdrop
          <div className={styles.card}>
            <h1>You cannot claim any cats :(</h1>
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
        {successMsg ? (
          <div style={{ textAlign: "center", margin: "0 auto" }}>
          <a target="_blank" href={`${explorer}${successMsg.startsWith("0x") ? `tx/${successMsg}` : `address/${address}#transactions`}`} style={{ textAlign: "center", margin: "0 auto", textDecoration: "underline", color: "#005dc2" }}>
            {successMsg.startsWith("0x") ? "View Transaction" : "View Address History"}
          </a>
          </div>
        ) : null}
      </div>

      <div style={{ position: "fixed", bottom: "-1rem", left: "50%", transform: "translate(-50%, 0%)" }}>
          <Image src="/catinbox1b.png" alt="Logo" width={500} height={250} priority />
        </div>
    </Layout>
  );
}
