import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
  ISupportedWallet,
  HotWalletModule,
  LobstrModule,
  AlbedoModule,
  xBullModule,
  FreighterModule,
  HanaModule,
  RabetModule,
  KleverModule,
} from "@creit.tech/stellar-wallets-kit";

interface StellarContextValue {
  kit: StellarWalletsKit | null;
  selectedWallet: ISupportedWallet | null;
  publicKey: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
}

const StellarContext = createContext<StellarContextValue | null>(null);

export const useStellar = () => {
  const context = useContext(StellarContext);
  if (!context) {
    throw new Error("useStellar must be used within a StellarProvider");
  }
  return context;
};

export const StellarProvider = ({ children }: PropsWithChildren) => {
  const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<ISupportedWallet | null>(
    null
  );
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const stellarKit = new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      selectedWalletId: "",
      modules: [
        new HotWalletModule(),
        new LobstrModule(),
        new AlbedoModule(),
        new FreighterModule(),
        new HanaModule(),
        new RabetModule(),
        new KleverModule(),
        new xBullModule(),
      ],
    });

    setKit(stellarKit);
  }, []);

  const connect = async () => {
    if (!kit) throw new Error("Stellar kit not initialized");

    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const publicKeyResult = await kit.getAddress();
          setSelectedWallet(option);
          setPublicKey(publicKeyResult.address);
          setIsConnected(true);
        },
      });
    } catch (error) {
      console.error("Failed to connect to Stellar wallet:", error);
      throw error;
    }
  };

  const disconnect = async () => {
    if (!kit) return;

    try {
      setSelectedWallet(null);
      setPublicKey(null);
      setIsConnected(false);
      kit.setWallet("");
    } catch (error) {
      console.error("Failed to disconnect from Stellar wallet:", error);
      throw error;
    }
  };

  const signTransaction = async (xdr: string) => {
    if (!kit || !isConnected) {
      throw new Error("Wallet not connected");
    }

    try {
      const { signedTxXdr } = await kit.signTransaction(xdr);
      return signedTxXdr;
    } catch (error) {
      console.error("Failed to sign transaction:", error);
      throw error;
    }
  };

  const value: StellarContextValue = {
    kit,
    selectedWallet,
    publicKey,
    isConnected,
    connect,
    disconnect,
    signTransaction,
  };

  return (
    <StellarContext.Provider value={value}>{children}</StellarContext.Provider>
  );
};

export * from "./stellar-utils";
