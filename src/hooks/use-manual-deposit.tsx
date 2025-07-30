import { useEffect } from "react";
import { EStrategy } from "@/pages/Form";
import { getDepositStatus } from "@/lib/1clickHelper";
import {
  execute,
  getPermitData,
  PermitDataResponse,
} from "@/providers/proxy-provider";
import { sliceHex } from "viem";

export default function useManualDeposit(
  strategy: EStrategy,
  signData: (data: PermitDataResponse) => Promise<`0x${string}` | undefined>,
  depositAddress?: string
) {
  useEffect(() => {
    const executeManualDeposit = async () => {
      if (strategy === EStrategy.DEPOSIT && depositAddress) {
        const depositStatus = await getDepositStatus(depositAddress);
        if (depositStatus.status) {
          const permitData = await getPermitData(depositAddress);
          console.log(permitData, "permitData");
          const signature = await signData(permitData);
          console.log(signature, "signData");
          if (signature) {
            const r = sliceHex(signature, 0, 32);
            const s = sliceHex(signature, 32, 64);
            const vByte = sliceHex(signature, 64, 65);
            const v = parseInt(vByte, 16);

            const proccess = await execute(depositAddress, {
              v: v,
              r: r,
              s: s,
            });
            console.log(proccess, "proccess");
          }
        }
      }
    };
    executeManualDeposit();
  }, [strategy, depositAddress]);
}
