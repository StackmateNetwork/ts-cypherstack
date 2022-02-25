import * as secp256k1 from '@noble/secp256k1';
import * as bip32 from "bip32";
import * as bip39 from "bip39";
import * as crypto from "crypto";
import * as hdkey from "hdkey";
import { handleError } from "./error";

export interface ExtendedKeys {
  xpub: string,
  xprv: string
}
export interface ECDSAKeys {
  pubkey: string,
  privkey: string
}
export enum MnemonicStrength {
  Low = 128,
  High = 256
}

export function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export function generateMnemonic(strength: MnemonicStrength): string | Error {
  try {
    const mnemonic = bip39.generateMnemonic(strength);
    return mnemonic;
  } catch (e) {
    return handleError(e);
  }
}

export async function mnemonicToRoot(mnemonic: string): Promise<string | Error> {
  try {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const master_key = bip32.fromSeed(seed);
    return master_key.toBase58();
  }
  catch (e) {
    return handleError(e)
  }
}

export function deriveParent128(root_xprv: string): ExtendedKeys | Error {
  try {
    const master_key = bip32.fromBase58(root_xprv);
    const parent_key = master_key.derivePath("m/128'/0'");
    const extended_keys: ExtendedKeys = {
      xpub: parent_key.neutered().toBase58(),
      xprv: parent_key.toBase58(),
    };
    return extended_keys;
  } catch (e) {
    return handleError(e);
  }
}

export function deriveHardenedStr(parent: string, derivation_scheme: string): ExtendedKeys | Error {
  try {
    if (!derivation_scheme.endsWith("/"))
      derivation_scheme += "/";
    derivation_scheme = derivation_scheme.replace("'", "h").replace("'", "h").replace("'", "h");
    derivation_scheme = derivation_scheme.replace("m/", "");

    // console.log(derivation_scheme);
    const parent_key = bip32.fromBase58(parent);
    if (derivation_scheme.split("h/").length < 3) return handleError({
      code: 400,
      message: "Derivation scheme must contain 3 sub paths."
    });

    // console.log(derivation_scheme.split("h/"),derivation_scheme.split("h/").length);
    const use_case = parseInt(derivation_scheme.split("h/")[0]);
    const index = parseInt(derivation_scheme.split("h/")[1]);
    const revoke = parseInt(derivation_scheme.split("h/")[2]);
    const child_key = parent_key.deriveHardened(use_case).deriveHardened(index).deriveHardened(revoke);
    const extended_keys: ExtendedKeys = {
      xpub: child_key.neutered().toBase58(),
      xprv: child_key.toBase58(),
    };
    return extended_keys;
  } catch (e) {
    return handleError(e);
  }
}

export function rotateUseCaseChild(usecase_parent: string, index: number, revoke: number): Error | ExtendedKeys {
  try {
    const parent_key = bip32.fromBase58(usecase_parent);

    const child_key = parent_key.deriveHardened(index).deriveHardened(revoke);
    const extended_keys: ExtendedKeys = {
      xpub: child_key.neutered().toBase58(),
      xprv: child_key.toBase58(),
    };
    return extended_keys;
  } catch (e) {
    return handleError(e);
  }
}

export async function extendedKeysToECDSA(extended_keys: ExtendedKeys): Promise<Error | ECDSAKeys> {
  try {
    const parent_key = bip32.fromBase58(extended_keys.xprv);

    const pubkey = await secp256k1.schnorr.getPublicKey(parent_key.privateKey.toString("hex"));
    const ecdsa_keys: ECDSAKeys = {
      privkey: parent_key.privateKey.toString("hex"),
      pubkey: Buffer.from(pubkey).toString('hex')
    };
    return ecdsa_keys;

  } catch (e) {
    return handleError(e);
  }
}

export function xpubToPubkey(xpub: string): Error | string {
  try {
    const parent_key = hdkey.fromExtendedKey(xpub);
    return parent_key.publicKey.toString('hex').substring(2);
  } catch (e) {
    return handleError(e);
  }
}

export function computeSharedSecret(ecdsa_keys: ECDSAKeys): string | Error {
  try {
    ecdsa_keys.pubkey = (ecdsa_keys.pubkey.length === 64)
      ? "02" + ecdsa_keys.pubkey
      : ecdsa_keys.pubkey;

    const type = "secp256k1";
    let curve = crypto.createECDH(type);
    curve.setPrivateKey(ecdsa_keys.privkey, "hex");

    const shared_secret = curve.computeSecret(crypto.ECDH.convertKey(
      ecdsa_keys.pubkey,
      type,
      "hex",
      "hex",
      "uncompressed").toString("hex"), "hex");

    return shared_secret.toString("hex");
  }
  catch (e) {
    return handleError(e);
  }
}

export async function schnorrSign(message: string, private_key: string): Promise<string | Error> {
  try {

    const signature = await secp256k1.schnorr.sign(crypto.createHash('sha256').update(message).digest('hex'), private_key);
    return Buffer.from(signature).toString('hex');
  }
  catch (e) {
    return handleError(e);
  }
}

export async function schnorrVerify(message: string, signature: string, public_key: string): Promise<boolean | Error> {
  try {

    const status = await secp256k1.schnorr.verify(signature, crypto.createHash('sha256').update(message).digest('hex'), public_key);
    return status;
  }
  catch (e) {
    return handleError(e);
  }
}

export function aesEncrypt(text: string, key_hex: string): string | Error {
  try {
    const algorithm = "aes-256-cbc";
    const key = Buffer.from(key_hex, "hex");
    const IV_LENGTH = 16;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const encrypted_text =
      iv.toString("hex") + ":" + encrypted.toString("hex");

    return encrypted_text;
  }
  catch (e) {
    return handleError(e);
  }
}

export function aesDecrypt(iv_text_crypt: string, key_hex: string): string | Error {
  try {
    const algorithm = "aes-256-cbc";
    const key = Buffer.from(key_hex, "hex");

    const text_parts = iv_text_crypt.split(":");
    const iv = Buffer.from(text_parts.shift(), "hex");
    const encrypted_text = Buffer.from(text_parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);

    let decrypted = decipher.update(encrypted_text);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }
  catch (e) {
    return handleError(e);
  }
}