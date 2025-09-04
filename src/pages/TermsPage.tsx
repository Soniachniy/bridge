import { LegalPage } from "../components/legal-page";

export const TermsPage = () => {
  const sections = [
    {
      title: "Eligibility",
      content: (
        <>
          You must be legally allowed to use blockchain-based financial services
          in your jurisdiction.
          <br />
          <br />
          You are solely responsible for complying with all local laws and
          regulations.
        </>
      ),
    },
    {
      title: "Service Description",
      content: (
        <>
          The Service helps you deposit tokens into your Hyperliquid account.
          <br />
          <br />
          We support multiple EVM networks and use Near Intents for token swaps.
          <br />
          <br />
          Once your funds arrive on Arbitrum, we request your signed permit and
          finalize the transfer.
        </>
      ),
    },
    {
      title: "Minimum Deposit Requirement",
      content: (
        <>
          You must deposit an amount that will convert into at least 5 USDC +
          service fee.
          <br />
          <br />
          The service fee is displayed before you confirm the transaction.
          <br />
          <br />
          Deposits below the required minimum may fail and will not be
          guaranteed for refunds.
        </>
      ),
    },
    {
      title: "Refund Policy",
      content: (
        <>
          If Near Intents fails or the deposit cannot be completed, funds are
          refunded to the refund address you provide.
          <br />
          <br />
          Do not use CEX deposit addresses as refund addresses. We cannot
          guarantee that a centralized exchange will accept or credit the
          refund.
          <br />
          <br />
          We are not responsible for failed refunds due to incorrect refund
          addresses or incompatible networks.
        </>
      ),
    },
    {
      title: "Non-Custodial Nature",
      content: (
        <>
          The Service is non-custodial.
          <br />
          <br />
          We never control your funds and do not have access to your private
          keys.
        </>
      ),
    },
    {
      title: "Risks & Disclaimers",
      content: (
        <>
          Blockchain transactions are irreversible.
          <br />
          <br />
          We are not responsible for:
          <br />
          <br />
          • Network delays or failures
          <br />
          • Gas price fluctuations
          <br />
          • Errors caused by third-party services like Near Intents
          <br />
          • Loss of funds due to incorrect addresses provided by you
          <br />
          <br />
          By using the Service, you acknowledge that you are using it at your
          own risk.
        </>
      ),
    },
    {
      title: "Limitation of Liability",
      content: (
        <>
          To the maximum extent permitted by law, we are not liable for any
          direct or indirect damages, including but not limited to:
          <br />
          <br />
          • Loss of funds
          <br />
          • Failed transactions
          <br />
          • Delays in deposits or refunds
          <br />• Third-party service issues
        </>
      ),
    },
    {
      title: "Updates to the Terms",
      content:
        "We may update these Terms from time to time. The latest version will always be available on our website.",
    },
  ];

  return (
    <LegalPage
      title="Terms of Use"
      lastUpdated={new Date().toLocaleDateString()}
      introduction='These Terms of Use ("Terms") govern your access to and use of our service (the "Service"), which allows you to deposit assets into the Hyperliquid blockchain via multiple EVM-compatible networks. By using the Service, you agree to these Terms.'
      sections={sections}
    />
  );
};
