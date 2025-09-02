import { cn } from "@/lib/utils";
import { EStrategy } from "@/pages/Form";
import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

export const Toggle = () => {
  const { watch, setValue } = useFormContext();
  const strategy = watch("strategy");

  return (
    <div className="flex flex-row gap-6 w-full select-none justify-around">
      <div
        className={cn(
          "text-center flex flex-col gap-4 cursor-pointer justify-center text-main_white text-xl font-semibold font-['Inter'] leading-normal text-gray_text relative",
          strategy === EStrategy.Wallet && "text-white"
        )}
        onClick={() => setValue("strategy", EStrategy.Wallet)}
      >
        <span className="mb-2">Send from Wallet</span>
        <AnimatePresence mode="wait">
          {strategy === EStrategy.Wallet && (
            <motion.div
              key="wallet-line"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-main_light select-none"
              initial={{ scaleX: 0, transformOrigin: "left" }}
              animate={{ scaleX: 1, transformOrigin: "right" }}
              exit={{ scaleX: 0, transformOrigin: "right" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </div>

      <div
        className={cn(
          "text-center flex flex-col gap-4 cursor-pointer justify-center text-main_white text-xl font-semibold font-['Inter'] leading-normal text-gray_text relative",
          strategy === EStrategy.Manual && "text-white"
        )}
        onClick={() => setValue("strategy", EStrategy.Manual)}
      >
        <span className="mb-2">Send Manually</span>
        <AnimatePresence mode="wait">
          {strategy === EStrategy.Manual && (
            <motion.div
              key="manual-line"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-main_light select-none"
              initial={{ scaleX: 0, transformOrigin: "right" }}
              animate={{ scaleX: 1, transformOrigin: "left" }}
              exit={{ scaleX: 0, transformOrigin: "left" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
