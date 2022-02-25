/*
cypherpost.io
Developed @ Stackmate India
*/

import { expect } from "chai";
import "mocha";
import { deriveHardened, generateMaster, importMaster } from './stackmate';
import { BitcoinNetwork, ChildKey, MasterKey, MnemonicWords, PurposePath } from "./types/data";

// ------------------ ┌∩┐(◣_◢)┌∩┐ ------------------
// GLOBAL CONFIGURATIONS

// ------------------ ┌∩┐(◣_◢)┌∩┐ ------------------
describe("***stackmate-core::ffi*** ", function () {
  const passphrase = "secretSauces";
  let master: MasterKey;
  it("GENERATES & IMPORTS a 24 word mnemonic MASTER KEY", async function () {
    const generated = generateMaster(BitcoinNetwork.Test, MnemonicWords.High, passphrase) as MasterKey;
    expect(generated.mnemonic.split(" ").length).to.equal(24);
    const imported = importMaster(BitcoinNetwork.Test, generated.mnemonic, passphrase) as MasterKey;
    expect(generated.xprv).to.equal(imported.xprv);
    master = imported;
  });
  it("DERIVES CHILD KEYS @ Harnded Path", async function () {
    const child = deriveHardened(master.xprv, PurposePath.SegwitNative, 0) as ChildKey;
    expect(child.fingerprint).to.equal(master.fingerprint);
  });
});

// ------------------ '(◣ ◢)' ---------------------

