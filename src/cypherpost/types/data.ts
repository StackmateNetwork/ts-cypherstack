export type Identity = {
  genesis : number;
  username: string;
  pubkey: string;
}

export enum BadgeType {
  Trusted="TRUST",
  Scammer="SCAMMER"
}

export type Badge = {
  genesis: number;
  giver: string;
  reciever: string;
  type: BadgeType;
  hash: string;
  nonce: string;
  signature: string;
}
export type FilteredBadges = {
  given: Badge[],
  recieved: Badge[]
};

export type IDB = {
  identity: Identity,
  badges: FilteredBadges
}

export type CypherPost = {
  id: string;
  reference: string;
  genesis: number;
  expiry: number;
  owner: string;
  cypher_json: string;
  derivation_scheme: string;
  decryption_key?: string;
}


export type PlainPost = {
  id: string;
  reference: string;
  genesis: number;
  expiry: number;
  owner: string;
  plain_json: string;
}

export type PlainPosts = PlainPost[];
export type CypherPosts = CypherPost[];
export type IDBS = IDB[];

export type Data = {
  posts: CypherPosts,
  idbs: IDBS
};


export enum PostTypes {
  Preferences = "PREFERENCES",
  MuSig = "MUSIG_GENESIS",
  PSBT = "PSBT",
  XPub = "XPUB"
}

export type LastDerivationPaths = {
  musig: string,
  xpub: string,
  psbt: string
}

export type PreferencePost = {
    type: PostTypes.Preferences,
    petnames: object[],
    last_derivation_paths: LastDerivationPaths
};

export enum PreferencePostUpdateType {
  Petnames,
  MuSigDS,
  XPubDS,
  PSBTDS
};

export type MuSigGenesisPost = {
  type: PostTypes.MuSig,
  n: number,
  m: number,
};
export type PSBTPost = {
  type: PostTypes.PSBT,
  psbt: string,
};
export type XPubPost = {
  type: PostTypes.XPub,
  xpub: string
};

export type PlainPostJSON = PreferencePost | MuSigGenesisPost | PSBTPost | XPubPost ;