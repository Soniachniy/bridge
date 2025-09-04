import { LegalPage } from "../components/legal-page";

export const PrivacyPolicyPage = () => {
  const sections = [
    {
      title: "Information We Do Not Collect",
      content: (
        <>
          We do not collect, store, or process any personal data such as your
          name, email, phone number, or identification documents.
          <br />
          <br />
          We do not store private keys or have any control over your wallet.
        </>
      ),
    },
    {
      title: "Information We Use Temporarily",
      content: (
        <>
          While using the Service, we temporarily process:
          <br />
          <br />
          EVM wallet address — required to send and receive funds.
          <br />
          Refund address — provided by you in case the transaction fails.
          <br />
          Transaction data — such as amounts, network, and destination, needed
          to complete the deposit.
          <br />
          <br />
          This data is temporarily stored in database. It is only used to
          facilitate the transaction flow.
        </>
      ),
    },
    {
      title: "Third-Party Services",
      content: (
        <>
          For cross-chain swaps, we integrate with Near Intents.
          <br />
          <br />
          If Near Intents fails to complete the swap, funds are refunded to the
          refund address you provide.
          <br />
          <br />
          Do not use centralized exchange (CEX) deposit addresses as refund
          addresses. We cannot guarantee that a CEX will accept or credit your
          refund.
        </>
      ),
    },
    {
      title: "Non-Custodial Service",
      content: (
        <>
          We are a non-custodial platform.
          <br />
          <br />
          You always maintain control over your assets.
          <br />
          <br />
          We never have access to your private keys.
        </>
      ),
    },
    {
      title: "Security",
      content: (
        <>
          Transactions are signed directly by you through your connected wallet.
          <br />
          <br />
          We use industry-standard security measures to ensure secure
          communication but cannot guarantee the security of third-party
          services.
        </>
      ),
    },
    {
      title: "Updates to This Policy",
      content:
        "We may update this Privacy Policy from time to time. The latest version will always be available on our website.",
    },
  ];

  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated={new Date().toLocaleDateString()}
      introduction='This Privacy Policy explains how we handle information when you use our service (the "Service") that helps users deposit funds into the Hyperliquid blockchain via multiple EVM-compatible networks.'
      sections={sections}
    />
  );
};
