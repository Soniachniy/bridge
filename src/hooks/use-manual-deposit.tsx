import { useEffect } from "react";
import { EStrategy } from "@/pages/Form";
import { getDepositStatus } from "@/lib/1clickHelper";

export default function useManualDeposit(
  strategy: EStrategy,
  navigate: (path: string) => void,
  depositAddress?: string
) {
  useEffect(() => {
    const executeManualDeposit = async () => {
      if (strategy === EStrategy.DEPOSIT && depositAddress) {
        const depositStatus = await getDepositStatus(depositAddress, 20);
        if (depositStatus.status) {
          navigate(`/${depositAddress}`);
        }
      }
    };
    executeManualDeposit();
  }, [strategy, depositAddress]);
}
