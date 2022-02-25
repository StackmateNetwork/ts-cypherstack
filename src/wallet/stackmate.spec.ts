/*
cypherpost.io
Developed @ Stackmate India
*/

import { expect } from "chai";
import "mocha";
import { compilePolicy, createExtendedKeyString, createMultiPolicyString, deriveHardened, generateMaster, importMaster } from './stackmate';
import { BitcoinNetwork, ChildKey, MasterKey, MnemonicWords, PurposePath, ScriptType, WalletPolicy } from "./types/data";

// ------------------ ┌∩┐(◣_◢)┌∩┐ ------------------
// GLOBAL CONFIGURATIONS

// ------------------ ┌∩┐(◣_◢)┌∩┐ ------------------
describe("***stackmate-core::ffi*** ", function () {
  const passphrase = "secretSauces";
  let alice_master: MasterKey;
  let alice_child: ChildKey;
  let bob_master: MasterKey;
  let bob_child: ChildKey;

  it("GENERATES & IMPORTS a 24 word mnemonic MASTER KEY", async function () {
    const generated = generateMaster(BitcoinNetwork.Test, MnemonicWords.High, passphrase) as MasterKey;
    expect(generated.mnemonic.split(" ").length).to.equal(24);
    const imported = importMaster(BitcoinNetwork.Test, generated.mnemonic, passphrase) as MasterKey;
    expect(generated.xprv).to.equal(imported.xprv);
    alice_master = imported;
    bob_master = generateMaster(BitcoinNetwork.Test, MnemonicWords.High, passphrase) as MasterKey;
  });
  it("DERIVES CHILD KEYS @ Harnded Path", async function () {
    alice_child = deriveHardened(alice_master.xprv, PurposePath.SegwitNative, 0) as ChildKey;
    expect(alice_child.fingerprint).to.equal(alice_master.fingerprint);

    bob_child = deriveHardened(bob_master.xprv, PurposePath.SegwitNative, 0) as ChildKey;
    expect(bob_child.fingerprint).to.equal(bob_master.fingerprint);
  });
  it("COMPILES a Multi-Sig POLICY", async function () {
    const alice_xkey = createExtendedKeyString(alice_child);
    const bob_xkey = createExtendedKeyString(bob_child);

    const policy_string = createMultiPolicyString(2, [alice_xkey, bob_xkey]);
    const policy = compilePolicy(policy_string, ScriptType.SegwitScript) as WalletPolicy;
    expect(policy).to.has.property("policy");
    expect(policy).to.has.property("descriptor");
    expect(policy.policy.startsWith('thresh')).to.equal(true);
    expect(policy.descriptor.startsWith('wsh')).to.equal(true);
  });
});

// ------------------ '(◣ ◢)' ---------------------

