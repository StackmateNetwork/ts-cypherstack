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

export type ChildKey=  {
  fingerprint: String,
  hardened_path: String,
  xprv: String,
  xpub: String
}

export enum PurposePath{
  SegwitNative  = "84",
  SegwitP2SH = "49",
  Legacy = "44"
}