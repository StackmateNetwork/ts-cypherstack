
import { assert, expect } from "chai";
import "mocha";
import * as crypto from "./crypto";

describe("***lib/crypto***", function () {
  
  it("GENERATES SHA256 hash", async function () {
    const text = "stackmate";
    const expected_hash = "615f3e587b4038c7b7dd86d39abbae326fc9ef1a7b0daa12354aa090960c9352";
    const response = await crypto.sha256(text);
    expect(response).to.equal(expected_hash);
  });
  
  it("GENERATES MNEMONIC seed words", async function () {
    const response = await crypto.generateMnemonic(crypto.MnemonicStrength.High) as string;
    expect(response.split(" ").length === 24).to.equal(true);
  });
  
  const mnemonic = "coin radio design certain trap excite kitchen huge ridge maple spike dice imitate ancient muffin pen trophy draw custom base boat fluid uncle crack";
  const root = "xprv9s21ZrQH143K3KDZnwpxLVB18nWwtptjvQGTSgsEdZhH6eipmDv6T9x2uP3JwjnSi6ycXiKvuDfKjeBmwm8o3WZsTKyS1u2EhiydhiwAiCk";
  
  it("CONVERTS MNEMONIC seed words TO a ROOT xprv", async function () {
    const response = await crypto.mnemonicToRoot(mnemonic) as string;
    expect(response).to.equal(root);
  });
  
  const id_path = "m/128h/0h/0h";
  const id_usecase_parent = "xprv9ym1fn2sRJ6Am4z3cJkM4NoxFsaeNdSyFQvE5CqzqqterM5nZdKUStQghQWBupjAgJZEgAWCSQWuFgqbvdGwg22tiUp8rsupd4fTrtYMEWS";

  it("CONVERTS ROOT xprv TO a DERIVED CHILD", async function () {
    const response = await crypto.deriveHardenedStr(root,id_path) as crypto.ExtendedKeys;
    expect(response.xprv).to.equal(id_usecase_parent);
  });

  const rotated_id = "xprvA3cxaH6eq55gSbqVkMtnFHvwczCC87vzQXAegVkbECfckttKMvcagd9PdddEi8CJyNQoRzL27Q21bwQpxFAw8hR8bAWVrJ5fPdCxbpQcgdE";
  // in practice we never rotate id keys. Only keys used to encrypt messages are rotated.
  it("ROTATES use case PARENT keys", async function () {
    const response = await crypto.rotateUseCaseChild(id_usecase_parent,1,0) as crypto.ExtendedKeys;
    expect(response.xprv).to.equal(rotated_id);
  });
  
  const id_parent_extended_keys = {
    xpub: 'xpub6CkN5HZmFfeTyZ4WiLHMRWkgouR8n6ApcdqpsbFcQBRdj9Qw7AdizgjAYg1VxCymbau2ab5mouGXwW3xop4wRwdpjVQHRz9aLbTgqsyAhDb',
    xprv: 'xprv9ym1fn2sRJ6Am4z3cJkM4NoxFsaeNdSyFQvE5CqzqqterM5nZdKUStQghQWBupjAgJZEgAWCSQWuFgqbvdGwg22tiUp8rsupd4fTrtYMEWS'
  }
  
  const id_parent_ecdsa_keys = {
    privkey: '48197c4530c42e0b6aa4a214cafdd88e4149091c9e1098190b79b65747a41e4f',
    pubkey: '86a4b6e8b4c544111a6736d4f4195027d23495d947f87aa448c088da477c1b5f'
  }
  
  it("CONVERTS ExtendedKeys TO ECDSAKeys", async function () {
    const response = await crypto.extendedKeysToECDSA(id_parent_extended_keys) as crypto.ECDSAKeys;
    expect(response.pubkey).to.equal(id_parent_ecdsa_keys.pubkey);
  });
  
  it("CONVERTS an XPUB TO an ECDSA Pubkey", function () {
    const response = crypto.xpubToPubkey(id_parent_extended_keys.xpub) as string;
    expect(response).to.equal(id_parent_ecdsa_keys.pubkey);
  });

  
  const alice_pair = {
    privkey: "3c842fc0e15f2f1395922d432aafa60c35e09ad97c363a37b637f03e7adcb1a7",
    pubkey: "dfbbf1979269802015da7dba4143ff5935ea502ef3a7276cc650be0d84a9c882",
  };;
  
  const bob_pair =  {
    privkey: "d5f984d2ab332345dbf7ddff9f47852125721b2025329e6981c4130671e237d0",
    pubkey: "3946267e8f3eeeea651b0ea865b52d1f9d1c12e851b0f98a3303c15a26cf235d",
  };

  const alice_bob_pair = {
    privkey: alice_pair.privkey,
    pubkey: bob_pair.pubkey
  };
  
  const bob_alice_pair = {
    privkey: bob_pair.privkey,
    pubkey: alice_pair.pubkey
  }
  
  it("COMPUTES a SHARED SECRET between 2 parties", function () {
    const alice_client_computed = crypto.computeSharedSecret(alice_bob_pair) as string;
    const bob_client_computed = crypto.computeSharedSecret(bob_alice_pair) as string;
    
    expect(alice_client_computed).to.equal(bob_client_computed);
  });

  const message = "I, Alice, am the creator of this message";

  it("SIGNS & VERIFIES a message", async function(){
    const signature = await crypto.schnorrSign(message,alice_pair.privkey) as string;
    const verification = await crypto.schnorrVerify(message,signature,alice_pair.pubkey) as boolean;
    assert(verification);
  });

  const key = "49ab8cb9ba741c6083343688544861872e3b73b3d094b09e36550cf62d06ef1e";

  it("ENCRYPTS & DECRYPTS a message", function(){
    const cipher_text = crypto.aesEncrypt(message, key) as string;
    const plain_text = crypto.aesDecrypt(cipher_text,key) as string;
    expect(plain_text).to.equal(message);
  });
  
  
});