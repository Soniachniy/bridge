import { useNavigate } from "react-router-dom";
import ConnectWalletDialog from "@/components/connect-wallet-dialog";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-[#0F1A20] justify-between">
      <header>
        <div className="flex justify-between items-center mx-20 my-4">
          <div
            className="flex items-center gap-2"
            onClick={() => navigate("/")}
          >
            <img
              src="/logo-extended.svg"
              alt="logo"
              className="w-full h-full cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <ConnectWalletDialog />
          </div>
        </div>
      </header>
      {children}
      <footer>
        <div className="flex justify-between items-center mx-26 my-10">
          <span className="text-white text-sm underline font-light">
            Privacy Policy
          </span>
          <span className="text-white text-sm underline font-light">
            Terms of Service
          </span>
        </div>
      </footer>
    </div>
  );
}
