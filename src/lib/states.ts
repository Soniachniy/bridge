import { createMachine } from "xstate";

export enum ProcessingStages {
  AssetSelection = "AssetSelection",
  WalletDeposit = "WalletDeposit",
  ManualDeposit = "ManualDeposit",
  AwaitingDeposit = "AwaitingDeposit",
  AwaitingManualDeposit = "AwaitingManualDeposit",
  Processing = "Processing",
  ErrorScreen = "ErrorScreen",
  SuccessScreen = "SuccessScreen",
  SwapErrorScreen = "SwapErrorScreen",
}

export const machine = createMachine({
  context: {},
  id: "bridgeForm",
  initial: "AssetSelection",
  states: {
    [ProcessingStages.AssetSelection]: {
      on: {
        create_transaction: {
          target: "WalletDeposit",
        },
        manual_deposit: {
          target: "ManualDeposit",
        },
        retry_processing: {
          target: "Processing",
        },
      },
    },
    [ProcessingStages.WalletDeposit]: {
      on: {
        start_processing: {
          target: "Processing",
        },
        back_to_asset_selection: {
          target: "AssetSelection",
        },
      },
    },
    [ProcessingStages.ManualDeposit]: {
      on: {
        start_processing: {
          target: "Processing",
        },
        back_to_asset_selection: {
          target: "AssetSelection",
        },
      },
    },

    [ProcessingStages.Processing]: {
      on: {
        success: {
          target: "SuccessScreen",
        },
        error: {
          target: "ErrorScreen",
        },
        back_to_asset_selection: {
          target: "AssetSelection",
        },
      },
    },

    [ProcessingStages.ErrorScreen]: {
      on: {
        retry: {
          target: "AssetSelection",
        },
        back_to_asset_selection: {
          target: "AssetSelection",
        },
      },
    },
    [ProcessingStages.SuccessScreen]: {
      on: {
        back_to_asset_selection: {
          target: "AssetSelection",
        },
      },
    },
    [ProcessingStages.SwapErrorScreen]: {
      on: {
        retry_swap: {
          target: "AssetSelection",
        },
        back_to_asset_selection: {
          target: "AssetSelection",
        },
      },
      description:
        "A refund screen is shown if the swap failed, displaying refund information.",
    },
  },
});
