/*
cypherpost.io
Developed @ Stackmate India
*/

import { expect } from "chai";
import "mocha";
import { generateMaster, importMaster } from './stackmate';
import { BitcoinNetwork, MasterKey, MnemonicWords } from "./types/data";

// ------------------ ┌∩┐(◣_◢)┌∩┐ ------------------
// GLOBAL CONFIGURATIONS

// ------------------ ┌∩┐(◣_◢)┌∩┐ ------------------
describe("***stackmate-core::ffi*** ", function () {
  const passphrase = "secretSauces";
  it("GENERATES & IMPORTS a 24 word mnemonic MASTER KEY", async function () {
   const generated = generateMaster(BitcoinNetwork.Test,MnemonicWords.High,passphrase) as MasterKey;
   expect(generated.mnemonic.split(" ").length).to.equal(24);
   const imported =  importMaster(BitcoinNetwork.Test,generated.mnemonic,passphrase) as MasterKey;
   expect(generated.xprv).to.equal(imported.xprv);
   
  });

});

// ------------------ '(◣ ◢)' ---------------------

