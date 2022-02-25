import { aesDecrypt, aesEncrypt, computeSharedSecret, deriveHardenedStr, deriveParent128, ECDSAKeys, extendedKeysToECDSA, mnemonicToRoot, schnorrVerify, sha256 } from "../lib/crypto";
import { handleError } from "../lib/error";
import { Badge, CypherPost, IDBS, Identity, PlainPost } from "./types/data";
import { ParentKeyChain } from "./types/keys";
import { DecryptionKey } from "./types/request";

export function verifyBadges(badges: Badge[]): boolean | string[] {
  const bad_badges = badges.filter((badge) => {
    const message = `${badge.giver}:${badge.reciever}:${badge.type}:${badge.nonce}`;
    const verify = schnorrVerify(message, badge.signature, badge.giver);
    if (!verify) {
      console.error("BADGE SIGNATURE FAILED:");
      console.error({ badge });
      return badge;
    };
  });
  if (bad_badges.length > 0) return bad_badges.map((badge) => badge.hash);
  return true;
}

export function mergeIdentitiesWithBadges(identities: Identity[], badges: Badge[]): IDBS {
  return identities.map((identity) => {
    const recieved = badges.filter(badge => badge.reciever === identity.pubkey);
    const given = badges.filter(badge => badge.giver === identity.pubkey);
    return { identity, badges: { given, recieved } };
  });
}

export function decryptCypherPostsFromOthers(identity_parent: ECDSAKeys, posts_from_others: CypherPost[]): PlainPost[] | Error {
  let plain_json_posts = [];
  posts_from_others.map((post) => {
    const shared_ecdsa_pair = {
      privkey: identity_parent.privkey,
      pubkey: post.owner
    };
    const shared_secret = computeSharedSecret(shared_ecdsa_pair);
    if (shared_secret instanceof Error) return handleError(shared_secret);

    const primary_key = aesDecrypt(post.decryption_key, shared_secret);
    if (primary_key instanceof Error) return handleError(primary_key);

    let plain_json;

    try {
      const plain_json_string = aesDecrypt(post.cypher_json, primary_key);
      if (plain_json_string instanceof Error) return plain_json_string;
      plain_json = JSON.parse(plain_json_string);
    }
    catch (e) {
      return handleError({
        code: 401,
        message: "Failed to decrypt and parse cypher_json"
      })
    }
    plain_json_posts.push({
      id: post.id,
      genesis: post.genesis,
      owner: post.owner,
      reference: post.reference,
      expiry: post.expiry,
      plain_json: plain_json
    });
  });
  return plain_json_posts;
}

export function decryptMyCypherPosts(e2ee_parent: string, my_posts: CypherPost[]): PlainPost[] | Error {
  try {
    let plain_json_posts = [];
    my_posts.map((post) => {
      const primary_key_pair = deriveHardenedStr(e2ee_parent, post.derivation_scheme);
      if (primary_key_pair instanceof Error) return handleError(primary_key_pair);

      const decryption_key = sha256(primary_key_pair.xprv);
      // console.log({ ds: post.derivation_scheme, key: decryption_key })

      let plain_json;

      try {
        const plain_json_string = aesDecrypt(post.cypher_json, decryption_key);
        if (plain_json_string instanceof Error) return plain_json_string;
        plain_json = JSON.parse(plain_json_string);
      }
      catch (e) {
        return handleError({
          code: 401,
          message: "Failed to decrypt and parse cypher_json"
        })
      }
      plain_json_posts.push({
        id: post.id,
        genesis: post.genesis,
        owner: post.owner,
        reference: post.reference,
        expiry: post.expiry,
        plain_json: plain_json
      });

    });
    return plain_json_posts;
  }
  catch (e) {
    return handleError(e);
  }

}

export async function createRootKeyChain(mnemonic: string): Promise<ParentKeyChain | Error> {
  try {
    const seed_root = await mnemonicToRoot(mnemonic);
    if (seed_root instanceof Error) return handleError(seed_root);
    const e2ee_root = deriveParent128(seed_root);
    if (e2ee_root instanceof Error) return handleError(e2ee_root);
    const identity_parent = deriveHardenedStr(seed_root, "m/128h/0h/0h");
    if (identity_parent instanceof Error) return handleError(identity_parent);
    const identity_ecdsa = await extendedKeysToECDSA(identity_parent);
    if (identity_ecdsa instanceof Error) return handleError(identity_ecdsa);

    const keys: ParentKeyChain = {
      e2ee_root: e2ee_root.xprv,
      identity: identity_ecdsa
    };

    return keys;
  }
  catch (e) {
    console.error({ e });
    return e;
  }
}


export function createPrimaryKey(e2ee_root: string, derivation_scheme: string): string | Error {
  const xkeys = deriveHardenedStr(e2ee_root, derivation_scheme);
  if (xkeys instanceof Error) {
    return xkeys;
  }
  return sha256(xkeys.xprv);
}

export function createCypherJSON(primary_key: string, plain_json: object): string | Error {
  try {
    const cypher_json = aesEncrypt(JSON.stringify(plain_json), primary_key);
    if (cypher_json instanceof Error) return handleError(cypher_json);

    return cypher_json;
  }
  catch (e) {
    console.error({ e });
    return e;
  }
};

export async function rotatePath(derivation_scheme: string): Promise<string | Error> {
  if (!derivation_scheme.startsWith("m/")) {
    return new Error("Derivation scheme must start with m/");
  }
  if (!derivation_scheme.endsWith("/")) derivation_scheme += "/";
  derivation_scheme = derivation_scheme.replace("'", "h").replace("'", "h").replace("'", "h");
  derivation_scheme = derivation_scheme.replace("m/", "");

  if (derivation_scheme.split("h/").length < 3) return new Error("Derivation scheme must contain 3 sub paths.");

  const use_case = parseInt(derivation_scheme.split("h/")[0]);
  const index = parseInt(derivation_scheme.split("h/")[1]);
  const revoke = parseInt(derivation_scheme.split("h/")[2]);

  return `m/${use_case}h/${index + 1}h/${revoke}h`;
}

export async function createDecryptionKeys(identity_parent: ECDSAKeys, primary_key: string, pubkeys: string[]): Promise<DecryptionKey[] | Error> {
  let decryption_keys = [];
  pubkeys.map((pubkey) => {
    const shared_ecdsa_pair = {
      privkey: identity_parent.privkey,
      pubkey
    };
    const shared_secret = computeSharedSecret(shared_ecdsa_pair);
    if (shared_secret instanceof Error) return handleError(shared_secret);

    const decryption_key = {
      reciever: pubkey,
      decryption_key: aesEncrypt(primary_key, shared_secret)
    };
    decryption_keys.push(decryption_key);
  });
  return decryption_keys;
}

export function sortObjectByProperty(obj, sortedBy, isNumericSort, reverse) {
  sortedBy = sortedBy || 1; // by default first key
  isNumericSort = isNumericSort || false; // by default text sort
  reverse = reverse || false; // by default no reverse

  var reversed = (reverse) ? -1 : 1;

  var sortable = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      sortable.push([key, obj[key]]);
    }
  }
  if (isNumericSort)
    sortable.sort(function (a, b) {
      return reversed * (a[1][sortedBy] - b[1][sortedBy]);
    });
  else
    sortable.sort(function (a, b) {
      var x = a[1][sortedBy].toLowerCase(),
        y = b[1][sortedBy].toLowerCase();
      return x < y ? reversed * -1 : x > y ? reversed : 0;
    });
  return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

export function readablePubkey(pubkey:string):string{
  return pubkey.substring(0,3)+"..."+pubkey.substring(pubkey.length-3,pubkey.length);
}