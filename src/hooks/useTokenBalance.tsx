import { FormInterface } from "@/lib/validation";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import useNetwork from "@/hooks/useNetworkHandler";

export const useTokenBalance = () => {
  const { watch, setValue } = useFormContext<FormInterface>();
  const selectedToken = watch("selectedToken");
  const refundAddress = watch("refundAddress");
  const { getBalance } = useNetwork(null);

  const { isLoading } = useQuery({
    queryKey: [
      "token-balance",
      selectedToken?.assetId ?? "",
      refundAddress ?? "",
    ],
    queryFn: async () => {
      try {
        if (
          selectedToken &&
          selectedToken.balanceUpdatedAt === 0 &&
          refundAddress
        ) {
          const { balance, nearBalance } = await getBalance(
            selectedToken.assetId,
            selectedToken.contractAddress,
            selectedToken.blockchain
          );

          if (balance) {
            setValue("selectedToken", {
              ...selectedToken,
              balance: balance,
              balanceNear: nearBalance,
              balanceUpdatedAt: Date.now(),
            });
          }
        }
      } catch (e) {
        console.log(e, "error while getting balance");
      }
      return 0;
    },
    staleTime: 0,
  });
  return { isLoading };
};
