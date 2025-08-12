import { createMachine } from "xstate";

export enum ProcessingStages {
  Initial = "Initial",
  AssetSelection = "AssetSelection",
  WalletConnection = "WalletConnection",
  DetailsReview = "DetailsReview",
  Processing = "Processing",
  UserPermit = "UserPermit",
  ErrorScreen = "ErrorScreen",
  ExecutingDeposit = "ExecutingDeposit",
  SignErrorScreen = "SignErrorScreen",
  SuccessScreen = "SuccessScreen",
  SwapErrorScreen = "SwapErrorScreen",
  ManualDepositErrorScreen = "ManualDepositErrorScreen",
}

export const machine = createMachine(
  {
    context: {},
    id: "bridgeForm",
    initial: "Initial",
    states: {
      [ProcessingStages.Initial]: {
        on: {
          select_asset: {
            target: "AssetSelection",
          },
        },
        description:
          "The form is at its starting point. No asset or blockchain is selected, and the user is not connected.",
      },
      [ProcessingStages.AssetSelection]: {
        on: {
          proceed: [
            {
              target: "WalletConnection",
              guard: {
                type: "isFormComplete",
              },
            },
            {
              target: "AssetSelection",
            },
          ],
        },
        description:
          "The user selects the asset and blockchain, and fills in the desired amount of tokens. Validation occurs to determine if the form is completely filled out.",
      },
      [ProcessingStages.WalletConnection]: {
        on: {
          connect_wallet: {
            target: "DetailsReview",
          },
          manual_deposit: {
            target: "DetailsReview",
          },
          back: {
            target: "AssetSelection",
          },
        },
        description:
          "The user connects their EVM wallet. If the chosen network is EVM, the wallet is automatically connected. For NEAR, Solana, or TON, a connect wallet option is shown. If the network is unsupported, manual deposit is the only option.",
      },
      [ProcessingStages.DetailsReview]: {
        on: {
          start_processing: {
            target: "Processing",
          },
        },
        description:
          "The user reviews all previously filled data. They may change the refund address if desired. The deposit address is shown if manual deposit was selected.",
      },
      [ProcessingStages.Processing]: {
        on: {
          success: {
            target: "UserPermit",
          },
          error: {
            target: "ErrorScreen",
          },
        },
        description:
          "An idle screen is displayed while an asynchronous request is made to process the transaction. Different titles are shown based on the backend status response.",
      },
      [ProcessingStages.UserPermit]: {
        on: {
          signed: {
            target: "ExecutingDeposit",
          },
          sign_error: {
            target: "SignErrorScreen",
          },
        },
        description:
          "Data from the server is presented that requires signing with the user's EVM wallet. The machine waits until the user performs the signing.",
      },
      [ProcessingStages.ErrorScreen]: {
        on: {
          retry: {
            target: "AssetSelection",
          },
        },
        description:
          "An error screen is displayed if there was an issue while swapping the assets.",
      },
      [ProcessingStages.ExecutingDeposit]: {
        on: {
          success: {
            target: "SuccessScreen",
          },
          swap_error: {
            target: "SwapErrorScreen",
          },
          manual_deposit_error: {
            target: "ManualDepositErrorScreen",
          },
        },
        description:
          "The deposit is executed. Upon completion, the success screen is displayed.",
      },
      [ProcessingStages.SignErrorScreen]: {
        on: {
          retry_sign: {
            target: "UserPermit",
          },
        },
        description:
          "The user is asked to sign again if there was an error while signing the permit.",
      },
      [ProcessingStages.SuccessScreen]: {
        type: "final",
        description:
          "The success screen is displayed after a successful deposit.",
      },
      [ProcessingStages.SwapErrorScreen]: {
        on: {
          retry_swap: {
            target: "AssetSelection",
          },
        },
        description:
          "A refund screen is shown if the swap failed, displaying refund information.",
      },
      [ProcessingStages.ManualDepositErrorScreen]: {
        on: {
          retry_deposit: {
            target: "WalletConnection",
          },
        },
        description:
          "An additional screen is shown if the user took the manual deposit option and deposited less than needed.",
      },
    },
  },
  {
    guards: {
      isFormComplete: function (_context: unknown, event: unknown) {
        // If caller provides validity flag, respect it; otherwise allow
        const ev = event as { valid?: boolean } | undefined;
        return Boolean(ev?.valid ?? true);
      },
    },
  }
);
