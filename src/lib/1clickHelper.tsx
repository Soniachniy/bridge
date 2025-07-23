import ArbitrumIcon from "@/assets/networks/arbitrum.svg?react";
import BaseIcon from "@/assets/networks/base.svg?react";
import BscIcon from "@/assets/networks/bsc.svg?react";
import AuroraIcon from "@/assets/networks/aurora.png";

import EthereumIcon from "@/assets/networks/evm.svg?react";
import NearIcon from "@/assets/networks/near.svg?react";
import SolanaIcon from "@/assets/networks/solana.svg?react";
import TonIcon from "@/assets/networks/ton.svg?react";
import BeraIcon from "@/assets/networks/bera.png";
import BitcoinIcon from "@/assets/networks/bitcoin.png";
import DogeIcon from "@/assets/networks/doge.png";
import XrpIcon from "@/assets/networks/xrp.png";
import GnosisIcon from "@/assets/networks/gnosis.png";
import PolygonIcon from "@/assets/networks/polygon.png";
import TronIcon from "@/assets/networks/tron.png";
import ZecIcon from "@/assets/networks/zec.png";

import { Network } from "@/config";
import {
  GetExecutionStatusResponse,
  OneClickService,
  TokenResponse,
} from "@defuse-protocol/one-click-sdk-typescript";

export type OneClickSwapFormValues = {
  amountIn: string;
  amountOut: string;
  recipient: string;
  depositAddress: string;
};

export type OneClickSwapTransaction = {
  date: string;
  tokenDataIn: {
    defuseAssetId: string;
    icon: string;
    symbol: string;
    amount: string;
  };
  tokenDataOut: {
    defuseAssetId: string;
    icon: string;
    symbol: string;
    amount: string;
  };
  status: GetExecutionStatusResponse.status;
};

export const NetworkIconMap = {
  [Network.NEAR]: <NearIcon />,
  [Network.BASE]: <BaseIcon />,
  [Network.BNB]: <BscIcon />,
  [Network.TON]: <TonIcon />,
  [Network.SOLANA]: <SolanaIcon />,
  [Network.ARBITRUM]: <ArbitrumIcon />,
  [Network.ETHEREUM]: <EthereumIcon />,
  [Network.AURORA]: <img src={AuroraIcon} alt="Aurora" className="w-6 h-6" />,
  [Network.BERA]: <img src={BeraIcon} alt="Bera" className="w-6 h-6" />,
  [Network.BITCOIN]: (
    <img src={BitcoinIcon} alt="Bitcoin" className="w-6 h-6" />
  ),
  [Network.DOGE]: <img src={DogeIcon} alt="Doge" className="w-6 h-6" />,
  [Network.XRP]: <img src={XrpIcon} alt="XRP" className="w-6 h-6" />,
  [Network.GNOSIS]: <img src={GnosisIcon} alt="Gnosis" className="w-6 h-6" />,
  [Network.POLYGON]: (
    <img src={PolygonIcon} alt="Polygon" className="w-6 h-6" />
  ),
  [Network.TRON]: <img src={TronIcon} alt="Tron" className="w-6 h-6" />,
  [Network.ZEC]: <img src={ZecIcon} alt="ZEC" className="w-6 h-6" />,
};

export const CHAIN_TITLE: Record<TokenResponse.blockchain, string> = {
  [TokenResponse.blockchain.NEAR]: "Near",

  [TokenResponse.blockchain.ETH]: "Ethereum Mainnet",
  [TokenResponse.blockchain.BASE]: "Base",
  [TokenResponse.blockchain.ARB]: "Arbitrum One",
  [TokenResponse.blockchain.GNOSIS]: "Gnosis",
  [TokenResponse.blockchain.BERA]: "Berachain",
  [TokenResponse.blockchain.BSC]: "BNB Smart Chain Mainnet",
  [TokenResponse.blockchain.POL]: "Polygon Mainnet",

  [TokenResponse.blockchain.SOL]: "Solana",

  [TokenResponse.blockchain.BTC]: "Bitcoin",
  [TokenResponse.blockchain.TON]: "Ton",
  [TokenResponse.blockchain.DOGE]: "Dogecoin",
  [TokenResponse.blockchain.XRP]: "XRP",
  [TokenResponse.blockchain.ZEC]: "Zcash",

  [TokenResponse.blockchain.TRON]: "Tron",
  [TokenResponse.blockchain.SUI]: "SUI",
  [TokenResponse.blockchain.OP]: "OP",
  [TokenResponse.blockchain.AVAX]: "AVAX",
};

export const fetchTokens = async (): Promise<TokenResponse[]> => {
  try {
    return await OneClickService.getTokens();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getTokenIcon = (asset: TokenResponse) => {
  return (
    TOKEN_ICON_BY_DEFUSE_ASSET_ID[asset.assetId] ||
    TOKEN_BY_SYMBOL[asset.symbol]
  );
};

export const CHAIN_ICON: Record<TokenResponse.blockchain, string> = {
  [TokenResponse.blockchain.NEAR]: "src/assets/networks/near.svg",
  [TokenResponse.blockchain.ETH]: "src/assets/networks/evm.svg",
  [TokenResponse.blockchain.BASE]: "src/assets/networks/base.svg",
  [TokenResponse.blockchain.ARB]: "src/assets/networks/arbitrum.svg",
  [TokenResponse.blockchain.GNOSIS]: "src/assets/networks/gnosis.png",
  [TokenResponse.blockchain.BERA]: "src/assets/networks/bera.png",
  [TokenResponse.blockchain.BSC]: "src/assets/networks/bsc.svg",
  [TokenResponse.blockchain.POL]: "src/assets/networks/polygon.png",
  [TokenResponse.blockchain.SOL]: "src/assets/networks/solana.svg",
  [TokenResponse.blockchain.BTC]: "src/assets/networks/bitcoin.png",
  [TokenResponse.blockchain.TON]: "src/assets/networks/ton.svg",
  [TokenResponse.blockchain.DOGE]: "src/assets/networks/doge.png",
  [TokenResponse.blockchain.XRP]: "src/assets/networks/xrp.png",
  [TokenResponse.blockchain.ZEC]: "src/assets/networks/zec.png",
  [TokenResponse.blockchain.TRON]: "src/assets/networks/tron.png",
  [TokenResponse.blockchain.SUI]: "src/assets/networks/tron.png",
  [TokenResponse.blockchain.AVAX]: "src/assets/networks/tron.png",
  [TokenResponse.blockchain.OP]: "src/assets/networks/tron.png",
};

export const TOKEN_BY_SYMBOL: Record<string, string> = {
  USDC: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
  USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
  BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
};

export const TOKEN_ICON_BY_DEFUSE_ASSET_ID: Record<string, string> = {
  "nep245:v2_1.omni.hot.tg:1117_":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
  "nep245:v2_1.omni.hot.tg:1117_3tsdfyziyc7EJbP2aULWSKU4toBaAcN4FdTgfm5W1mC4ouR":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/28289.png",
  "nep141:eth.bridge.near":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  "nep141:bera.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/24647.png",
  "nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/825.png",
  "nep141:usdt.tether-token.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/825.png",
  "nep141:arb-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/825.png",
  "nep141:sol-c800a4bd850783ccb82c2b2c7e84175443606352.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/825.png",
  "nep141:bsc-0x55d398326f99059ff775485246999027b3197955.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/825.png",
  "nep141:tron-d28a265909efecdcee7c5028585214ea0b96f015.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/825.png",

  "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  "nep141:17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  "nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  "nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  "nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  "nep141:gnosis-0x2a22f9c3b484c3629090feed35f17ff8f88f76f0.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  "nep141:pol-0x3c499c542cef5e3811e1192ce70d8cc03d5c3359.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  "nep141:bsc-0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",

  "nep141:eth-0x6b175474e89094c44da98b954eedeac495271d0f.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/4943.png",
  "nep141:gnosis.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/4943.png",

  "nep141:btc.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/1.png",

  "nep141:eth.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png",
  "nep141:aurora":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png",
  "nep141:base.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png",
  "nep141:arb.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png",
  "nep141:gnosis-0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png",
  "nep141:sui.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
  "nep141:xrp.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/52.png",
  "nep141:sol.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/5426.png",
  "nep141:doge.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/74.png",
  "nep141:eth-0x514910771af9ca656af840dff83e8264ecf986ca.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/1975.png",
  "nep141:eth-0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/5994.png",
  "nep141:eth-0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/7083.png",
  "nep141:eth-0x6982508145454ce325ddbe47a25d4ec3d2311933.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/24478.png",
  "nep141:wrap.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/6535.png",
  "nep141:eth-0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/7278.png",
  "nep141:sol-c58e6539c2f2e097c251f8edf11f9c03e581f8d4.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/35336.png",
  "nep141:arb-0x912ce59144191c1204e64559fe8253a0e49e6548.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/11841.png",
  "nep141:sol-d600e625449a4d9380eaf5e3265e54c90d34e260.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/35347.png",
  "nep141:sol-b9c68f94ec8fd160137af8cdfe5e61cd68e2afba.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/28752.png",
  "nep141:zec.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/1437.png",
  "nep141:gnosis-0x9c58bacc331c9aa871afd802db6379a98e80cedb.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/1659.png",
  "nep141:base-0x532f27101965dd16442e59d40670faf5ebb142e4.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/29743.png",
  "nep141:eth-0xaaee1a9723aadb7afa2810263653a34ba2c21c7a.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/27659.png",
  "nep141:gnosis-0x4d18815d14fe5c3304e87b3fa18318baa5c23820.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/21585.png",
  "nep141:arb-0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/11857.png",

  "nep141:eth-0xa35923162c49cf95e6bf26623385eb431ad920d3.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/24911.png",
  "nep141:a35923162c49cf95e6bf26623385eb431ad920d3.factory.bridge.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/24911.png",
  "nep141:sol-df27d7abcc1c656d4ac3b1399bbfbba1994e6d8c.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/24911.png",

  "nep141:gnosis-0x177127622c4a00f3d409b75571e12cb3c8973d3c.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/19269.png",
  "nep141:sol-57d087fd8c460f612f8701f5499ad8b2eec5ab68.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/29870.png",

  "nep141:aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/14803.png",
  "nep141:eth-0xaaaaaa20d9e0e2461697782ef11675f668207961.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/14803.png",

  "nep141:token.sweat":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/21351.png",
  "nep141:token.v2.ref-finance.near":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='16 24 248 248' style='background: %23000'%3E%3Cpath d='M164,164v52h52Zm-45-45,20.4,20.4,20.6-20.6V81H119Zm0,18.39V216h41V137.19l-20.6,20.6ZM166.5,81H164v33.81l26.16-26.17A40.29,40.29,0,0,0,166.5,81ZM72,153.19V216h43V133.4l-11.6-11.61Zm0-18.38,31.4-31.4L115,115V81H72ZM207,121.5h0a40.29,40.29,0,0,0-7.64-23.66L164,133.19V162h2.5A40.5,40.5,0,0,0,207,121.5Z' fill='%23fff'/%3E%3Cpath d='M189 72l27 27V72h-27z' fill='%2300c08b'/%3E%3C/svg%3E%0A",
  "nep141:d9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/8567.png",
  "nep141:eth-0xd9c2d319cd7e6177336b0a9c93c21cb48d84fb54.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/8567.png",
  "nep141:blackdragon.tkn.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/29627.png",
  "nep141:token.burrow.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/20604.png",
  "nep141:token.0xshitzu.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/19354.png",
  "nep141:purge-558.meme-cooking.near":
    "data:image/png;base64,UklGRrIDAABXRUJQVlA4IKYDAAAwGACdASpgAGAAP7G6zmc8ryknvH94A5A2CWoAzkCCqaGFPaS9yv83xxkQvw+Konsv/3wkCUUQ1Oq2Qz9qOOkUY1hDSymYmVqiZagBtpTgBjSXnvmiIWVEkKtAewltk9gBFQ6x5KBAnSChG+08xYO4vyI2YizvPlNVV2Z5ypjEyb8YWAHmL/fHe4LBHR7y8u6lcrQ9v7tj92poQcgjyrtb8Ejwv0VtC51uD3geQjzhIi2RVOM2qzWb+DyZ6RPRrMkJKdLFKUDPMJNAAPJv5vhOy7BgcCIMMJ1XglA8W3PstAv/VFDmqQSf03x6lmEw7drRJkAkEZS1o1Zxi7vuxWme5dlaFsep8L93ni75ZuC1ac5zBIXVzqkwXj1Y5rAah85aVfbUVN0ZSqv5RroDzs1MpiZ33/eqXG+udld11eDn4vxkjCDziWOa0JwTTpXYpwRGIFwGCwka81dIvk1w8SM7BbS0ad83FcM32tBX9CfS1CIu3xkT8UFENC9BpdZiosh6aLBBNFZJRAEcFBF9cuV2vMxzzmDEDm8nzZ76nyZSVgD+r2CP6DwWqABDqUwX48V2tpjvD7BgGSwsCjKCTTzYdBuWTXOMwz53jD2M6kN6bUr4e6ICJgv4GygYwCTs4lWdn5LXyMaDEQiUGn2V3T/KTMlzGpd9sRQyguh6RuYArudcezBDrN8lbmTrFFe2eGR7qEdySQn/lJg5Z5gkphPICr1KkZSepuAeF21pT5jAcB6MS/0KU7N/ahGT3od/0TGzW+0GGpoVWmbaxupLdGFAHfHhvrLl8T3XyuxUkl8mkFv6JFvPVwomr4yv0GVgg7CcOxBHhJKMbRl7VqWORgeyfEzPpSiv87l6326/Txg/emIFICrtnOcXcr46GBT/jNdDgdlsMOHD6QiArvwtrUrcJTyv3gzyrO4MfSuwJTgeTYSDud8rH+Fyh2qDhKumJjVcI3kS5r1tTMi/9XF8y1uFGYLPkG/Ra/eYEGug5YFR+9hIlnHTmusGOyPdhCSnO4eXz3hDtGLTIpaqhaMmhopxRNdneBhSnPSIGgL1r4B1jG760bJqMCCcNNNNl6Hh6cuNQaoGnwlZ6vsXe26i89ALMz4TZk/R6MvVbGAP/6tdGIPdB7WQa8bBg3/CxmnfKnMGwjbk/iXNOSsmjGYkKWEmsY9RIrKaGTAibzrCnC32H3Y9HedSxq67ACnzFPVEbKP2O/2Z5p4S+ro6rLuHAdETfSIGcAAA",
  "nep141:sol-2cff5b540505a2aa6a4e600ccc6fdd6d3a585a5d.omft.near":
    "data:image/png;base64,UklGRrIDAABXRUJQVlA4IKYDAAAwGACdASpgAGAAP7G6zmc8ryknvH94A5A2CWoAzkCCqaGFPaS9yv83xxkQvw+Konsv/3wkCUUQ1Oq2Qz9qOOkUY1hDSymYmVqiZagBtpTgBjSXnvmiIWVEkKtAewltk9gBFQ6x5KBAnSChG+08xYO4vyI2YizvPlNVV2Z5ypjEyb8YWAHmL/fHe4LBHR7y8u6lcrQ9v7tj92poQcgjyrtb8Ejwv0VtC51uD3geQjzhIi2RVOM2qzWb+DyZ6RPRrMkJKdLFKUDPMJNAAPJv5vhOy7BgcCIMMJ1XglA8W3PstAv/VFDmqQSf03x6lmEw7drRJkAkEZS1o1Zxi7vuxWme5dlaFsep8L93ni75ZuC1ac5zBIXVzqkwXj1Y5rAah85aVfbUVN0ZSqv5RroDzs1MpiZ33/eqXG+udld11eDn4vxkjCDziWOa0JwTTpXYpwRGIFwGCwka81dIvk1w8SM7BbS0ad83FcM32tBX9CfS1CIu3xkT8UFENC9BpdZiosh6aLBBNFZJRAEcFBF9cuV2vMxzzmDEDm8nzZ76nyZSVgD+r2CP6DwWqABDqUwX48V2tpjvD7BgGSwsCjKCTTzYdBuWTXOMwz53jD2M6kN6bUr4e6ICJgv4GygYwCTs4lWdn5LXyMaDEQiUGn2V3T/KTMlzGpd9sRQyguh6RuYArudcezBDrN8lbmTrFFe2eGR7qEdySQn/lJg5Z5gkphPICr1KkZSepuAeF21pT5jAcB6MS/0KU7N/ahGT3od/0TGzW+0GGpoVWmbaxupLdGFAHfHhvrLl8T3XyuxUkl8mkFv6JFvPVwomr4yv0GVgg7CcOxBHhJKMbRl7VqWORgeyfEzPpSiv87l6326/Txg/emIFICrtnOcXcr46GBT/jNdDgdlsMOHD6QiArvwtrUrcJTyv3gzyrO4MfSuwJTgeTYSDud8rH+Fyh2qDhKumJjVcI3kS5r1tTMi/9XF8y1uFGYLPkG/Ra/eYEGug5YFR+9hIlnHTmusGOyPdhCSnO4eXz3hDtGLTIpaqhaMmhopxRNdneBhSnPSIGgL1r4B1jG760bJqMCCcNNNNl6Hh6cuNQaoGnwlZ6vsXe26i89ALMz4TZk/R6MvVbGAP/6tdGIPdB7WQa8bBg3/CxmnfKnMGwjbk/iXNOSsmjGYkKWEmsY9RIrKaGTAibzrCnC32H3Y9HedSxq67ACnzFPVEbKP2O/2Z5p4S+ro6rLuHAdETfSIGcAAA",

  "nep141:abg-966.meme-cooking.near":
    "data:image/png;base64,UklGRvQAAABXRUJQVlA4IOgAAADQCgCdASpgAGAAP9Hg622/tjKqKdRqO/A6CWcA1Er9hfpalM0KjtQ3QolBZ0DnFkdZsShp72kk1LVeIHWCpNrbxil8dJpNCM9b1CZa4mOf7XgxcsJKQUYldLsGu2kW8AD+59NNqUjGXZSNo958Qn3F8SUFLm4pjEffyYQfmDlTwNDx2xo5ikBuCess5ZsoPg8R5Ah37d1DNsfg8BvWhgVSLFDX+dLKBbuT9bzxz5Z4nil4PnUAbh5Iasayl/ia08ZjHQj0KhYntw4l4TrPWkp0njlSWPg2xwoZ564qYl13AGAjvunKR5AA",
  "nep141:noear-324.meme-cooking.near":
    "data:image/png;base64,UklGRngCAABXRUJQVlA4IGwCAABQEgCdASpgAGAAP83U22c/tCunsPycO/A5iWwAyRGrVKi/U7KnSqpEPDSRCDGcwAaoinEHq7dsJf0zolbSY81ZE7ONfKGLcStEMwiyGADz9rGhOo+63MUC/qPniOnANlHdRKDsejjCqUj0Up7z3zrQkfDbrgtTSW236t7K1sYpqNzqwWJRv3VW+1RDAagReGZSzxMHNfFqucIhoAD+6SiwWMdyfpdWWgixevAFIGXl/gL15AHcPU1/6t9inv65LQ1Q3X/Fr2+i1AyW6NmIlu1ZdBdg2YRRQscvLMBkj43Is/Xl8BthEhMn3i7bg9YekHrVGvVY0NxDRpAXz0JyK18tuaXRLp/pcjWxWz9We1fh6HXhC95EPRdSTjQWu+5SaraUI52YC9GQY9en1LpE4YcuVDL3rR3FSnr/0uS5pWdszjhuCciOFRuD0tNSnhLTbvCscTDUqlkc30f0jqN25O+JsFwloOsJRp2P60J/KUundPUzKUP2G7GxaOwUVlq/v5oSRxmZlVG6ZVy3043WHjTfnAlBPcTxREaQsTOjcg4S25EgudiBhWr3GYmttx0CKru7Lsfn80PhyqgWgEbIvLZjBftaj7wb9UodqeJ47OCM/DFrPR3/t2JAv7H+dIIvwKbUI/YSTiMg4V7rb9hNPZ06OZskoWd5RbYj7y16zqS3U8/O2DRclC5tdT66/iE6xofHOwAlNZP2wi5XdtmWUA6zV/qsS99+jAvNu2G4/u0dRGD3RU5mvY06KqOeoWEuaSrgEjn266CEWhJwNRrIqmovWEgYZn+7HSzyGzGeo94ZolZ/IDIuZ+fE8I0AAA==",

  "nep141:mpdao-token.near":
    "data:image/svg+xml,%3csvg width='96' height='96' viewBox='0 0 96 96' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='96' height='96' rx='48' fill='white'/%3e%3cpath d='M29.2241 28.7456C28.396 27.9423 27.0094 28.5289 27.0091 29.6825L27 66.6773C26.9997 67.8501 28.4257 68.4286 29.2426 67.5872L48.6529 47.5943L29.2241 28.7456Z' fill='%23231B51'/%3e%3cpath d='M66.7759 28.7456C67.604 27.9423 68.9906 28.5289 68.9909 29.6825L69 66.6773C69.0003 67.8501 67.5743 68.4286 66.7574 67.5872L47.3471 47.5943L66.7759 28.7456Z' fill='%23231B51'/%3e%3c/svg%3e",

  "nep141:gnear-229.meme-cooking.near":
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNiAzNiI+PHBhdGggZmlsbD0iIzNFNzIxRCIgZD0iTTEyLjQzNCAyOS44MzNjLjYyNi02LjcwOC00LjQxNy03LjU0Mi02LjQxNy02LjA4My0xLjA5Ny44LTEuMzUzIDIuMzIzLS40NzkgMS41MjEgMS41NDItMS40MTYgMi4wODMtLjM3NS45MTcuMzc1cy0xLjM3NSAyLjE0NS0uMDgzIDEuMTg4YzEuMjkyLS45NTggMS42NDYtLjMzNC42NDYuODk1LS42MDUuNzQ0LjA0MiAxLjQzOCAxLjE2Ny0uMDYyLjkzOC0xLjI1MSAzLjItMS4yOTQgMi42NjIgMi45OS0uMjIyIDEuNzU2IDEuNDUzLjYwOCAxLjU4Ny0uODI0em03Ljk0MS0yMS4wMjJjLS41ODMtMy41LTEuMTI1LTUuMjQ4LTQuNjI1LTUuODMycy02LjQxNyAxLjc1LTYuNDE3IDEuNzUuNTgzLTMuNSAyLjMzMy00LjY2N2MuNjg2LS40NTggMS4xNjcgMS43NSAxLjc1IDEuNzVzMS4xNjctMS43NSAyLjkxNy0xLjc1Yy41ODMgMCAuNTgzIDEuNzUgMS4xNjcgMS43NS41ODMgMCAyLjI0My0uNTc3IDIuMzMzIDAgLjEyNi44MTItLjE2NyAxLjcyOS4yOTIgMi4xMDRzMS41NTMtLjE0OCAxLjkwMS40ODljLjM0OS42MzYtLjYxIDEuNTUzLS41MjYgMS45N3MuNzE5LjU4My41MjYgMS4zNzUtLjY1LjgzMy0uNjkyIDEuNDE3Ljg4NSAxLjA4MS42OTIgMS42ODZjLS4xOTIuNjA2LS42NTEuNjg4LS44NTkgMS40NTktLjIwOC43NzEuNTQxLjY0OS4zMzMgMS40MzktLjIwOC43OS0uOTU4Ljk5MS0xLjIwOCAxLjc2Ni0uMjUuNzc0LjY2Ni45NDEuMjA4IDEuNjkxcy0xLjI5MS44NzUtMS4zMzMgMS4zMzMuMjA5LjgxOC4wNDIgMS41NTVjLS4xNjcuNzM2LTEuMTI2LjM2Mi0xLjIwOS45NDVzLjIwOS44NzUuMjA5IDEuNTgzLS43MDkuODM0LS42MjUgMS41NDIuNzUuMTY3IDEuMTY3IDEtLjI0OSAxLjU4My4yMDkgMi4wODMgMS4wODMtLjY2NyAxLjcwOC0uMjVjLjYyNS40MTcuNjc3IDEuMjUgMS4zNTkgMS4zNzVzLjg5MS0xLjI5MiAxLjM5MS0xLjI1IDEuNjI1LjcwOSAyLjIwOC40MTcuNTQxLTEuNDU5IDEtMS45NTkgMS4wNDItLjA0MSAxLjQ1OC0uNTgzLS4xNDUtMS4xNzUtLjA2Mi0xLjk2Ny44NTQtMS4yNDEuODEyLTEuODY2LS42NjctLjYyNS0uOTE3LTEuMjkyLjQ1OC0xLjI1LjIwOC0xLjg3NS0xLjMzMi0uODMzLTEuMjkxLTEuNDU4LjQ1OS0xLjMzMy4yNS0yLjA0Mi0xLjA4NC0xLjE2Ni0xLjA0Mi0xLjcwNy40OTktMS4yNS41ODMtMS42NDYtLjc0OS0uODEyLS42NjYtMS40NzkuNjI0LS42MjEuODMyLTEuMjIzYy4yMDgtLjYwMi0uNzQ5LS45MDEtLjI0OS0xLjY3MnMuNzUxLS4yNyAxLjE2Ny0uNjg4Yy40MTYtLjQxNy0uMDAxLTEuMzM0LjQxNi0xLjU0Mi40MTctLjIwOCAxLjI1LS4wNDIgMS42NjctLjMzM3MuNDE3LS43MDguODc1LS44NzVjLjQ1OC0uMTY3IDEuMDQyLjU0MiAxLjQxNy41NDJzMS4wNDEtLjcwOCAxLjU0MS0uNTQyYy41LjE2NyAxLjU4NCAxLjMzMy45MTcgMS42ODhzLTUuNzUxLjYwNS01Ljc5MiAyLjkzOCAyLjc5MyAxMi45MTcgMS45NTkgMTUuNTgzLTQuMjkxIDguMzM0LTguMjUgNy4yNWMtMy45NTktMS4wODQtOC42NjctMy41MDEtNy41NDItNy4yMDkgMS4xMjUtMy43MDkgNC43NDktMTEuMjk2IDUuNDU4LTE0Ljc3M3oiLz48cGF0aCBmaWxsPSIjNzdCMjU1IiBkPSJNMjEgNy44OTdjMCAzLjk3OC0yLjM4MiA4LjE0NC01LjgzMyA3LjU2Ni01LjMyMy0uODktNS42MDYtMi41ODctNi40MTctMS41NDYtMi45MTcgMy43NDMtNC42NDQtLjQ4NS01LjMwNy0xLjE4NkMzLjI3NiAxMi41NTUgMCAxMS41OSAwIDkuNzQ0YzAtMS4xOTcgMS43NS0yLjQxOCAyLjkxNy0xLjIzMSAxLjcyMi0uMDQzIDguMTY3LTYuMTU2IDEyLjI1LTYuMTU2QzE5LjI1IDIuMzU2IDIxIDUuNDM1IDIxIDcuODk3eiIvPjxwYXRoIGZpbGw9IiMyOTJGMzMiIGQ9Ik0xNC41ODMgNy4wNjJjMCAuNjQ0LS41MjMgMS4xNjctMS4xNjcgMS4xNjdzLTEuMTY3LS41MjMtMS4xNjctMS4xNjcuNTIzLTEuMTY3IDEuMTY3LTEuMTY3Yy42NDUuMDAxIDEuMTY3LjUyMyAxLjE2NyAxLjE2N3oiLz48cGF0aCBmaWxsPSIjM0U3MjFEIiBkPSJNMi45MTcgMTAuMjcxYzAgLjQ4My0uMzkyLjI5Mi0uODc1LjI5MnMtLjg3NS4xOTEtLjg3NS0uMjkyLjM5Mi0uODc1Ljg3NS0uODc1Ljg3NS4zOTIuODc1Ljg3NXoiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTEuMDgzIDExLjE0NGMwIC42NDUtLjM5Mi41ODMtLjg3NS41ODNzLS44NzUuMDYxLS44NzUtLjU4M2MwLS42NDQuMzkyLTIuMzMzLjg3NS0yLjMzM3MuODc1IDEuNjg5Ljg3NSAyLjMzM3ptLTIuMzMzLjU4M2MwIC42NDUtLjM5Mi41ODMtLjg3NS41ODMtLjQ4My4wMDEtLjg3NS4wNjItLjg3NS0uNTgzIDAtLjY0NC4zOTItMi4zMzMuODc1LTIuMzMzcy44NzUgMS42ODkuODc1IDIuMzMzeiIvPjxwYXRoIGZpbGw9IiMzRTcyMUQiIGQ9Ik0xMS4wMDEgMTEuMTUyYy0zLjA5NS40NDItNi4yMTUgMS4yMjQtNy41NTggMS41NzkuMTY3LjE3Ny40MDMuNTc5LjcwOSAxLjAyMSAxLjQ3Mi0uMzggNC4yNTMtMS4wNTEgNy4wMTUtMS40NDQuMzE5LS4wNDYuNTQtLjM0Mi40OTUtLjY2MS0uMDQ3LS4zMi0uMzQ0LS41NDItLjY2MS0uNDk1eiIvPjxwYXRoIGZpbGw9IiM3N0IyNTUiIGQ9Ik0yMC45NDYgOC45MzdjMCA0LjM3NS0xLjcxNCA4LjIwMS0yLjk0NiAxMS4xNy0xLjMzMyAzLjIxMi0xIDkgNCA5czYuNTExLTMuMTkxIDctNWMxLjM1OC01LjAyMS0yLTgtMi0xMyAwLTkgOC03IDgtNnMtNi45MzQgMS4zNzQtMyA5UzM2IDM2IDIyIDM2IDggMjcuMTA3IDEwIDIzLjEwN2MxLjQxNi0yLjgzMiA0LTcuMTA3LjUtOS4wNDUtMi4yODItMS4yNjMgMTAuNDQ2LTUuMTI1IDEwLjQ0Ni01LjEyNXoiLz48cGF0aCBmaWxsPSIjM0U3MjFEIiBkPSJNMTEuMzM1IDcuNzcxYy0uMjU2IDAtLjUxMi0uMDk4LS43MDctLjI5My0uMzkxLS4zOTEtLjM5MS0xLjAyMyAwLTEuNDE0LjA4My0uMDgzIDIuMDgxLTIuMDQzIDUuMzc0LTIuMDQzLjU1MiAwIDEgLjQ0OCAxIDFzLS40NDggMS0xIDFjLTIuNDM1IDAtMy45NDUgMS40NDItMy45NiAxLjQ1Ny0uMTk1LjE5NS0uNDUxLjI5My0uNzA3LjI5M3oiLz48cGF0aCBmaWxsPSIjNUM5MTNCIiBkPSJNMTAuNzA4IDI1LjMzM2MuNjI3LTYuNzA4LTUuNDE3LTcuNTQyLTcuNDE3LTYuMDgzLTEuMDk3LjgtMS4zNTMgMi4zMjMtLjQ3OSAxLjUyMSAxLjU0Mi0xLjQxNiAyLjA4My0uMzc1LjkxNy4zNzUtMS4xNjcuNzUtMS4zNzUgMi4xNDYtLjA4MyAxLjE4OHMxLjY0Ni0uMzM0LjY0Ni44OTVjLS42MDUuNzQ0LjA0MiAxLjQzOCAxLjE2Ny0uMDYyLjkzOC0xLjI1MSA0LjItMS4yOTQgMy42NjIgMi45OS0uMjIyIDEuNzU2IDEuNDU0LjYwOCAxLjU4Ny0uODI0eiIvPjwvc3ZnPg==",

  "nep141:score.aidols.near":
    "data:image/jpeg;base64,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",

  "nep141:tron.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",

  "nep141:2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near":
    "https://ref-new-1.s3.amazonaws.com/token/cfb0a2419d661ded9c978030a7fd6843.svg",

  "nep141:853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/6952.png",

  "nep141:base-0x98d0baa52b2d063e780de12f615f963fe8537553.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/35763.png",

  "nep141:bsc.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",

  "nep141:pol.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/28321.png",

  "nep141:eth-0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/32994.png",
  "nep141:base-0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf.omft.near":
    "https://s2.coinmarketcap.com/static/img/coins/128x128/32994.png",
};

export function translateNetwork(network?: string): Network {
  switch (network) {
    case "arb":
      return Network.ARBITRUM;
    case "eth":
      return Network.ETHEREUM;
    case "near":
      return Network.NEAR;
    case "zec":
      return Network.ZEC;
    case "btc":
      return Network.BITCOIN;
    case "sol":
      return Network.SOLANA;
    case "doge":
      return Network.DOGE;
    case "xrp":
      return Network.XRP;
    case "gnosis":
      return Network.GNOSIS;
    case "bera":
      return Network.BERA;
    case "base":
      return Network.BASE;
    case "tron":
      return Network.TRON;
    case "ton":
      return Network.TON;
  }
  return Network.ARBITRUM;
}

export function getNetworkIcon(network: string): React.ReactNode | null {
  const networkType = translateNetwork(network);
  if (!networkType) return null;
  return NetworkIconMap[networkType];
}
