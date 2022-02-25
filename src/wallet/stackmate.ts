const LINUX_PATH = "./bin/linux/libstackmate.so";
const MAC_PATH = "./bin/osx/libstackmate.dylib";
const WINDOWNS_PATH = "./bin/win32/libstackmate.dll";

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
  generate_master: [string, [string, string, string]],
  import_master: [string, [string, string, string]],
});

export function generateMaster(network: BitcoinNetwork,strength: MnemonicWords, passphrase: string): MasterKey | Error {
  try {
    const stringified = stackmate.generate_master(network.toString(),strength.toString(),passphrase);
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

export function importMaster(network: BitcoinNetwork,mnemonic: string, passphrase: string): MasterKey | Error {
  try {
    const stringified = stackmate.import_master(network.toString(), mnemonic, passphrase);
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
