import { TonApiClient } from "@ton-api/client";

export const tonClient = new TonApiClient({
  baseUrl: "https://tonapi.io",
  baseApiParams: {
    headers: {
      Authorization: `Bearer AGJ6LLDZTHT774IAAAACH7HUVRAYFMQL4SK3FC3ET2FRNLGHFGOOV7U5V4K6BFOGJ6OPLUQ`,
      "Content-type": "application/json",
    },
  },
});
