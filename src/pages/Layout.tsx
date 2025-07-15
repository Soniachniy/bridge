export function ConnectWalletButton() {
  return (
    <button className="bg-[#97FCE4] text-[#0F1A20] px-4 py-2 rounded-md font-dmSans">
      Connect Wallet
    </button>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F1A20] justify-between">
      <header>
        <div className="flex justify-between items-center mx-20 my-4">
          <div className="flex items-center gap-2 ">
            <img
              src="/src/assets/logo-extended.svg"
              alt="logo"
              className="w-full h-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <ConnectWalletButton />
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
