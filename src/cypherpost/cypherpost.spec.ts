import { expect } from "chai";
import "mocha";
import * as api from "./api";
import * as comps from "./composite";
import { Badge, BadgeType, CypherPosts, FilteredBadges, IDBS, Identity, PlainPosts, PostTypes, PreferencePost, PreferencePostUpdateType } from "./types/data";
import { ParentKeyChain } from "./types/keys";
import { DecryptionKey } from "./types/request";
import * as util from "./util";

const alice_mnemonic = "bamboo inside service afford planet lesson moon door ability now garage error develop escape metal banner comfort upper flee sign subway behind public foster";
const alice_username = "sm" + Math.random().toString(36).substring(2, 9);
const bob_mnemonic = "comfort banner lesson escape develop flee upper bamboo foster public behind sign planet afford";
const bob_username = "sm" + Math.random().toString(36).substring(2, 9);

const bob_petname = "bobbyboy";

let a_parent_keychain: ParentKeyChain;
let b_parent_keychain: ParentKeyChain;

let identities;
let badges;

describe("***cypherpost***", function () {
  before(async function () {
    a_parent_keychain = await util.createRootKeyChain(alice_mnemonic) as ParentKeyChain;
    b_parent_keychain = await util.createRootKeyChain(bob_mnemonic) as ParentKeyChain;
  });

  it("REGISTER two accounts on cypherpost - Alice & Bob", async function () {
    let response = await api.registerIdentity(a_parent_keychain.identity, alice_username) as boolean;
    expect(response).to.equal(true);

    response = await api.registerIdentity(b_parent_keychain.identity, bob_username) as boolean;
    expect(response).to.equal(true);
  });
  it("GET EXISTING IDENTITIES on cypherpost", async function () {
    const response = await api.getAllIdentities(a_parent_keychain.identity) as Identity[];
    identities = response;
    expect(response instanceof Array).to.equal(true);
  });
  it("GET EXISTING BADGES on cypherpost", async function () {
    const response = await api.getAllBadges(a_parent_keychain.identity) as Badge[];
    badges = response;
    expect(response instanceof Array).to.equal(true);
  });
  it("MERGES IDENTITIES w/ BADGES", async function () {
    const response = await util.mergeIdentitiesWithBadges(identities, badges) as IDBS;
    expect(response instanceof Array).to.equal(true);
  });
  it("TRUST Alice-->Bob", async function () {
    const response = await api.giveBadge(a_parent_keychain.identity, b_parent_keychain.identity.pubkey, BadgeType.Trusted);
    expect(response).to.equal(true);
  });
  it("GET Alice's BADGES on cypherpost", async function () {
    const response = await api.getMyBadges(a_parent_keychain.identity) as FilteredBadges;
    expect(response.given[0].reciever).to.equal(b_parent_keychain.identity.pubkey);
  });

  const preference_derivation_scheme = "m/1'/0'/0'";
  const alice_preferences: PreferencePost = {
    type: PostTypes.Preferences,
    petnames: [],
    last_derivation_paths: {
      musig: "NONE",
      xpub: "NONE",
      psbt: "NONE"
    }
  };
  
  it("CREATES A PREFERENCE POST as Alice", async function () {
    // derivation_scheme is set relative to e2ee root m/128'/0'
    alice_preferences.petnames.push({
      [b_parent_keychain.identity.pubkey]: bob_petname
    });
    const reference = "NONE";
    const primary_key = util.createPrimaryKey(a_parent_keychain.e2ee_root, preference_derivation_scheme) as string;
    const cypher_json = util.createCypherJSON(primary_key, alice_preferences) as string;
    const response = await api.createPost(a_parent_keychain.identity, cypher_json, preference_derivation_scheme, 0, reference) as string;
    expect(response.startsWith('s5')).to.equal(true);
  });
  it("GET POSTS BY Alice AND DECRYPT PREFERENCES", async function () {
    const response = await api.getMyPosts(a_parent_keychain.identity) as CypherPosts;
    expect(response.length).to.equal(1);
    const plain_posts = util.decryptMyCypherPosts(a_parent_keychain.e2ee_root, response) as PlainPosts;
    const preference_posts = plain_posts.filter((post) => post.plain_json['type'] === PostTypes.Preferences.toString());
    expect(preference_posts[0].plain_json['petnames'][0][b_parent_keychain.identity.pubkey]).to.equal(bob_petname);
    expect(preference_posts[0].plain_json['last_derivation_paths']['musig']).to.equal("NONE");

  });

  let musig_post_id;
  const musig_derivation_scheme = "m/2'/0'/0'";

  it("CREATES A MUSIG POST as Alice", async function () {
    // derivation_scheme is set relative to e2ee root m/128'/0'
    const plain_json = {
      type: PostTypes.MuSig,
      n: 2,
      m: 2
    };
    const reference = "NONE";
    const primary_key = util.createPrimaryKey(a_parent_keychain.e2ee_root, musig_derivation_scheme) as string;
    const cypher_json = util.createCypherJSON(primary_key, plain_json) as string;
    const response = await api.createPost(a_parent_keychain.identity, cypher_json, musig_derivation_scheme, 0, reference) as string;
    expect(response.startsWith('s5')).to.equal(true);
    musig_post_id = response;
  });
  it("SETS MUSIG POST VISIBILITY as Alice for Bob", async function () {
    const primary_key = util.createPrimaryKey(a_parent_keychain.e2ee_root, musig_derivation_scheme) as string;
    const decryption_keys = await util.createDecryptionKeys(a_parent_keychain.identity, primary_key, [b_parent_keychain.identity.pubkey]) as DecryptionKey[];
    const response = await api.setPostVisibility(a_parent_keychain.identity, musig_post_id, decryption_keys) as boolean;
    expect(response).to.equal(true);
  });
  it("GET POSTS FOR Bob AND DECRYPT MuSig Invite + Finds no XPUBS refefrenced.", async function () {
    const response = await api.getPostsForMe(b_parent_keychain.identity) as CypherPosts;
    expect(response.length).to.equal(1);

    const plain_posts = util.decryptCypherPostsFromOthers(b_parent_keychain.identity, response) as PlainPosts;
    const musig_posts = plain_posts.filter((post) => post.plain_json['type'] === PostTypes.MuSig);
    const xpub_posts = plain_posts.filter((post) => post.plain_json['type'] === PostTypes.XPub);

    expect(musig_posts[0].plain_json['n']).to.equal(2);
    expect(musig_posts[0].plain_json['m']).to.equal(2);
    expect(xpub_posts.length).to.equal(0);
  });

  const xpub_derivation_scheme = "m/3'/0'/0'";
  let a_xpub_post_id;
  let b_xpub_post_id;
  it("CREATES A XPUB POST as Alice referencing musig post", async function () {
    const plain_json = {
      type: PostTypes.XPub,
      xpub: "[ALICE/84h/0h/1h]xpubexmaplealice"
    };
    const reference = musig_post_id;
    // Reference type posts must encrypt with the same key as the parent.
    const primary_key = util.createPrimaryKey(a_parent_keychain.e2ee_root, xpub_derivation_scheme) as string;
    const cypher_json = util.createCypherJSON(primary_key, plain_json) as string;
    const response = await api.createPost(a_parent_keychain.identity, cypher_json, xpub_derivation_scheme, 0, reference) as string;
    expect(response.startsWith('s5')).to.equal(true);
    a_xpub_post_id = response;
  });
  it("SETS XPUB POST VISIBILITY as Alice for Bob", async function () {
    const primary_key = util.createPrimaryKey(a_parent_keychain.e2ee_root, xpub_derivation_scheme) as string;
    const decryption_keys = await util.createDecryptionKeys(a_parent_keychain.identity, primary_key, [b_parent_keychain.identity.pubkey]) as DecryptionKey[];
    const response = await api.setPostVisibility(a_parent_keychain.identity, a_xpub_post_id, decryption_keys) as boolean;
    expect(response).to.equal(true);
  });
  it("CREATES A XPUB POST as Bob referencing musig post", async function () {
    const plain_json = {
      type: PostTypes.XPub,
      xpub: "[BOB/84h/0h/1h]xpubexmaplebob"
    };
    const reference = musig_post_id;
    const primary_key = util.createPrimaryKey(b_parent_keychain.e2ee_root, xpub_derivation_scheme) as string;
    const cypher_json = util.createCypherJSON(primary_key, plain_json) as string;
    const response = await api.createPost(b_parent_keychain.identity, cypher_json, xpub_derivation_scheme, 0, reference) as string;
    expect(response.startsWith('s5')).to.equal(true);
    b_xpub_post_id = response;
  });
  it("SETS XPUB POST VISIBILITY as Bob for Alice", async function () {
    const primary_key = util.createPrimaryKey(b_parent_keychain.e2ee_root, xpub_derivation_scheme) as string;
    const decryption_keys = await util.createDecryptionKeys(b_parent_keychain.identity, primary_key, [a_parent_keychain.identity.pubkey]) as DecryptionKey[];
    const response = await api.setPostVisibility(b_parent_keychain.identity, b_xpub_post_id, decryption_keys) as boolean;
    expect(response).to.equal(true);
  });
  it("GET POSTS FOR Bob + Finds 1 XPUB referenced + Own XPUB == WALLET INITIALIZED.", async function () {
    const response = await api.getPostsForMe(b_parent_keychain.identity) as CypherPosts;
    expect(response.length).to.equal(2);

    const plain_posts = util.decryptCypherPostsFromOthers(b_parent_keychain.identity, response) as PlainPosts;
    const xpub_references = plain_posts.filter((post) => post.plain_json['type'] === PostTypes.XPub && post.reference === musig_post_id);
    expect(xpub_references.length).to.equal(1);
  });
  it("GET POSTS FOR Alice + Finds 1 XPUB referenced + Own XPUB == WALLET INITIALIZED.", async function () {
    const response = await api.getPostsForMe(a_parent_keychain.identity) as CypherPosts;
    expect(response.length).to.equal(1);

    const plain_posts = util.decryptCypherPostsFromOthers(a_parent_keychain.identity, response) as PlainPosts;
    const xpub_references = plain_posts.filter((post) => post.plain_json['type'] === PostTypes.XPub && post.reference === musig_post_id);

    expect(xpub_references.length).to.equal(1);
  });

  it("UPDATES PREFERENCES for Alice", async function () {
    let new_preferences = comps.updatePreferencesObject(alice_preferences,PreferencePostUpdateType.MuSigDS,musig_derivation_scheme);
    let response = await comps.updatePreferences(a_parent_keychain, new_preferences) as string;
    expect(response.startsWith('s5')).to.equal(true);

  });

  it("GET POSTS BY Alice AND DECRYPT PREFERENCES", async function () {
    const response = await api.getMyPosts(a_parent_keychain.identity) as CypherPosts;

    const plain_posts = util.decryptMyCypherPosts(a_parent_keychain.e2ee_root, response) as PlainPosts;
    const preference_posts = plain_posts.filter((post) => post.plain_json['type'] === PostTypes.Preferences);

    expect(preference_posts.length).to.equal(1);
    expect(preference_posts[0].plain_json['petnames'][0][b_parent_keychain.identity.pubkey]).to.equal(bob_petname);
    expect(preference_posts[0].plain_json['last_derivation_paths']['musig']).to.equal(musig_derivation_scheme);

  });

  it("DELETES MultiSig Invite (also removes all referenced posts)", async function () {
    const delete_response = await api.deletePost(a_parent_keychain.identity, musig_post_id) as boolean;
    expect(delete_response).to.equal(true);

    const my_posts_response = await api.getPostsForMe(a_parent_keychain.identity) as CypherPosts;
    expect(my_posts_response.length).to.equal(0);
  });
  it("GET POSTS FOR Bob + Finds NONE", async function () {
    const response = await api.getPostsForMe(b_parent_keychain.identity) as CypherPosts;
    expect(response.length).to.equal(0);
  });
  it("GET POSTS FOR Alice + Finds NONE", async function () {
    const response = await api.getPostsForMe(a_parent_keychain.identity) as CypherPosts;
    expect(response.length).to.equal(0);
  });
  it("DELETES Alice and Bob's accounts on cypherpost", async function () {
    let response = await api.deleteMyIdentity(a_parent_keychain.identity) as boolean;
    expect(response).to.equal(true);

    response = await api.deleteMyIdentity(b_parent_keychain.identity) as boolean;
    expect(response).to.equal(true);
  });
});
