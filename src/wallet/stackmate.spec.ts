/*
cypherpost.io
Developed @ Stackmate India
*/

import { expect } from "chai";
import "mocha";
import { generateMaster } from './stackmate';
import { BitcoinNetwork, MasterKey, MnemonicWords } from "./types/data";

// ------------------ ┌∩┐(◣_◢)┌∩┐ ------------------
// GLOBAL CONFIGURATIONS

// ------------------ ┌∩┐(◣_◢)┌∩┐ ------------------
describe("***stackmate-core::ffi*** ", function () {

  it("GENERATES a 24 word mnemonic MASTER KEY", async function () {
   const response = generateMaster(MnemonicWords.High,BitcoinNetwork.Test,"secretSauces") as MasterKey;
   console.log(response)
   expect(response.mnemonic.split(" ").length).to.equal(24);
  });

});

// ------------------ '(◣ ◢)' ---------------------

