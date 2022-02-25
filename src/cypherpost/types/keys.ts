import { ECDSAKeys } from "../../lib/crypto"

export type ParentKeyChain = {
  e2ee_root: string, 
  identity: ECDSAKeys,
}

// For all usecases other than ID, use deriveHardenedStr with e2ee_root and a 3 path derivation string.