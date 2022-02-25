export enum MnemonicWords {
  Low = 12,
  High = 24
}

export enum BitcoinNetwork {
  Main = "main",
  Test = "test"
}

export type MasterKey = {
  fingerprint: string,
  mnemonic: string,
  xprv: string
};
