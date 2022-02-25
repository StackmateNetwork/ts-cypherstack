const LINUX_PATH = "./stackmate-core/bin/libstackmate.so";
const MAC_PATH = "./stackmate-core/bin/libstackmate.dylib";
const WINDOWNS_PATH = "./stackmate-core/bin/libstackmate.dll";

import { handleError } from "../lib/error";
import { BitcoinNetwork, MasterKey, MnemonicWords } from "./types/data";

const ffi = require("ffi-napi")
const string = "string";

const platform = process.platform
let libStackmateLocation = null

if (platform === "linux") {
  libStackmateLocation = LINUX_PATH;
}
else if (platform === "darwin") {
  libStackmateLocation = MAC_PATH
}
else if (platform === "win32") {
  libStackmateLocation = WINDOWNS_PATH
}
else {
  throw new Error("unsupported plateform for mathlibLoc")
}

export const stackmate = ffi.Library(libStackmateLocation, {
  generate_master: [string, [string, string, string]]
});


export function generateMaster(strength: MnemonicWords, network: BitcoinNetwork, passphrase: string): MasterKey | Error {
  try {
    const stringified = stackmate.generate_master(strength.toString(), network.toString(), passphrase);
    const json = JSON.parse(stringified);

    if (json.hasOwnProperty("kind")) {
      return handleError(json);
    }
    else {
      return {
        fingerprint: json.fingerprint,
        mnemonic: json.mnemonic,
        xprv: json.xprv
      }
    }
  }
  catch (e) {
    return handleError(e);
  }

}