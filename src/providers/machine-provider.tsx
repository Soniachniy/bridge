import { PropsWithChildren } from "react";
import { createActorContext } from "@xstate/react";
import { machine } from "@/lib/states";

export const BridgeFormMachineContext = createActorContext(machine);

export const BridgeFormMachineProvider = ({ children }: PropsWithChildren) => {
  return (
    <BridgeFormMachineContext.Provider>
      {children}
    </BridgeFormMachineContext.Provider>
  );
};
