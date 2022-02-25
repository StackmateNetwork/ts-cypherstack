/**
 * sushi
 * arrange super clinic creek twenty joke gossip order type century photo ahead
 */
import { ECDSAKeys } from '../lib/crypto';
import { handleError } from '../lib/error';
import { createBadgeSignature, createRequestHeaders, createRequestSignature, request } from './requestHandler';
import { Badge, BadgeType, CypherPosts, FilteredBadges, Identity } from "./types/data";
import { CreatePostRequest, DecryptionKey, GiveTrustBadgeRequest, PostVisibilityRequest, RegisterUserRequest, RequestBody, RequestMethod, RevokeTrustBadgeRequest } from "./types/request";

const VERSION_PREFIX = "/api/v2";
const api_url = `https://cypherpost.io`;

export async function registerIdentity(identity_parent:ECDSAKeys, username:string): Promise<boolean | Error> {
  const nonce = Date.now();
  const resource = VERSION_PREFIX + "/identity";
  const url = api_url + resource;
  const method = RequestMethod.Post;
  const body: RegisterUserRequest = {
    username
  };

  const signature = await createRequestSignature(method, resource, body, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);
  
  const headers = createRequestHeaders(identity_parent, nonce, signature);

  const response = await request(method, url, headers, body);
  if (response instanceof Error) return response;

  return response['status'];
}
export async function getAllIdentities(identity_parent:ECDSAKeys): Promise<Identity[] | Error> {
  // const existing = store.getIdentities();
  // console.log({ existing })
  // const genesis_filter = (existing.length > 0)
  //   ? existing.pop().genesis
  //   : 0;

  const genesis_filter = 0;
  const nonce = Date.now();
  const resource = VERSION_PREFIX + "/identity/all?genesis_filter=" + genesis_filter;
  const url = api_url + resource;
  const method = RequestMethod.Get;
  const body: RequestBody = {};

  const signature = await createRequestSignature(method, resource, body, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);

  const headers = createRequestHeaders(identity_parent, nonce, signature);

  const response = await request(method, url, headers, body);
  if (response instanceof Error) return response;

  return response['identities'];

}
export async function deleteMyIdentity(identity_parent:ECDSAKeys): Promise<boolean | Error> {
  const nonce = Date.now();
  const resource = VERSION_PREFIX + "/identity";
  const url = api_url + resource;
  const method = RequestMethod.Delete;
  const body: RequestBody = {};

  const signature = await createRequestSignature(method, resource, body, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);

  const headers = createRequestHeaders(identity_parent, nonce, signature);

  const response = await request(method, url, headers, body);
  if (response instanceof Error) return response;

  return response['status'];

}
export async function getAllBadges(identity_parent:ECDSAKeys): Promise<Badge[] | Error> {
  // const existing = store.getAllBadges();
  // const genesis_filter = (existing.length > 0)
  //   ? existing.pop().genesis
  //   : 0;
  const genesis_filter = 0;
  const nonce = Date.now();
  const resource = VERSION_PREFIX + "/badges/all?genesis_filter=" + genesis_filter;
  const url = api_url + resource;
  const method = RequestMethod.Get;
  const body: RequestBody = {};

  const signature = await createRequestSignature(method, resource, body, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);

  const headers = createRequestHeaders(identity_parent, nonce, signature);

  const response = await request(method, url, headers, body);
  if (response instanceof Error) return response;

  return response['badges'];
}
export async function getMyBadges(identity_parent:ECDSAKeys): Promise<FilteredBadges | Error> {

  // const existing = store.getMyBadges();
  // const genesis_filter = (existing.length > 0)
  //   ? existing.pop().genesis
  // : 0;
  const genesis_filter = 0;

  const nonce = Date.now();
  const resource = VERSION_PREFIX + "/badges/self?genesis_filter=" + genesis_filter;
  const url = api_url + resource;
  const method = RequestMethod.Get;
  const body: RequestBody = {};

  const signature = await createRequestSignature(method, resource, body, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);

  const headers = createRequestHeaders(identity_parent, nonce, signature);

  const response = await request(method, url, headers, body);
  if (response instanceof Error) return response;

  return response as FilteredBadges;
}
export async function giveBadge(identity_parent:ECDSAKeys, reciever:string, badge_type:BadgeType): Promise<boolean | Error> {
  let nonce = Date.now();
  const badge_signature = await createBadgeSignature(identity_parent, reciever, badge_type, nonce);
  if(badge_signature instanceof Error) return handleError(badge_signature);
  
  const resource = VERSION_PREFIX + "/badges/" + badge_type.toLowerCase();
  const url = api_url + resource;
  const method = RequestMethod.Post;

  const body: GiveTrustBadgeRequest = {
    trusting: reciever,
    nonce,
    signature: badge_signature
  };

  // console.log({ body });
  nonce = Date.now();
  const signature = await createRequestSignature(method, resource, body, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);

  const headers = createRequestHeaders(identity_parent, nonce, signature);

  const response = await request(method, url, headers, body);
  if (response instanceof Error) return response;

  return response['status'];
}
export async function revokeBadge(identity_parent: ECDSAKeys, reciever:string, badge_type:BadgeType): Promise<boolean | Error> {
  let nonce = Date.now();
  const resource = VERSION_PREFIX + "/badges/" + badge_type.toLowerCase() + "/revoke";
  const url = api_url + resource;
  const method = RequestMethod.Post;

  const body: RevokeTrustBadgeRequest = {
    revoking: reciever,
  };

  // console.log({ body });
  nonce = Date.now();
  const signature = await createRequestSignature(method, resource, body, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);

  const headers = createRequestHeaders(identity_parent, nonce, signature);

  const response = await request(method, url, headers, body);
  if (response instanceof Error) return response;

  return response['status'];
}
export async function createPost(identity_parent: ECDSAKeys, cypher_json:string, derivation_scheme:string, expiry:number, reference:string): Promise<string | Error> {
  const nonce = Date.now();
  const resource = VERSION_PREFIX + "/posts";
  const url = api_url + resource;
  const method = RequestMethod.Put;
  const body: CreatePostRequest = {
    cypher_json,
    derivation_scheme,
    expiry,
    reference
  };

  const signature = await createRequestSignature(method, resource, body, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);

  const headers = createRequestHeaders(identity_parent, nonce, signature);

  // console.log({headers,body,signature});
  const response = await request(method, url, headers, body);
  if (response instanceof Error) return response;

  return response['id'];
}
export async function setPostVisibility(identity_parent: ECDSAKeys, post_id:string, decryption_keys: DecryptionKey[]): Promise<boolean | Error> {
  const nonce = Date.now();
  const resource = VERSION_PREFIX + "/posts/keys";
  const url = api_url + resource;
  const method = RequestMethod.Put;
  const body: PostVisibilityRequest = {
    post_id,
    decryption_keys
  };

  const signature = await createRequestSignature(method, resource, body, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);

  const headers = createRequestHeaders(identity_parent, nonce, signature);

  const response = await request(method, url, headers, body);
  if (response instanceof Error) return response;

  return response['status'];
}
export async function getMyPosts(identity_parent:ECDSAKeys): Promise<CypherPosts | Error> {
  // const existing = store.getMyTrades();
  // const genesis_filter = (existing.length > 0)
  //   ? existing.pop().genesis
  //   : 0;
  const genesis_filter = 0;

  const nonce = Date.now();
  const resource = VERSION_PREFIX + "/posts/self?genesis_filter=" + genesis_filter;
  const url = api_url + resource;
  const method = RequestMethod.Get;
  const body: RequestBody = {};

  const signature = await createRequestSignature(method, resource, body, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);

  const headers = createRequestHeaders(identity_parent, nonce, signature);

  const response = await request(method, url, headers, body);
  if (response instanceof Error) return response;

  return response['posts'] as CypherPosts;
}
export async function getPostsForMe(identity_parent:ECDSAKeys): Promise<CypherPosts | Error> {
  // const existing = store.getOthersTrades();
  // const genesis_filter = (existing.length > 0)
  //   ? existing.pop().genesis
  //   : 0;
  const genesis_filter = 0;

  const nonce = Date.now();
  const resource = VERSION_PREFIX + "/posts/others?genesis_filter=" + genesis_filter;
  const url = api_url + resource;
  const method = RequestMethod.Get;
  const body: RequestBody = {};

  const signature = await createRequestSignature(method, resource, body, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);

  const headers = createRequestHeaders(identity_parent, nonce, signature);

  const response = await request(method, url, headers, body);
  if (response instanceof Error) return response;

  return response['posts'] as CypherPosts;
}
export async function deletePost(identity_parent:ECDSAKeys, post_id: string): Promise<boolean | Error> {
  const nonce = Date.now();
  const resource = VERSION_PREFIX + "/posts/" + post_id;
  const url = api_url + resource;
  const method = RequestMethod.Delete;

  const signature = await createRequestSignature(method, resource, {}, identity_parent, nonce);
  if(signature instanceof Error) return handleError(signature);

  const headers = createRequestHeaders(identity_parent, nonce, signature);

  const response = await request(method, url, headers, {});
  if (response instanceof Error) return response;

  return response['status'];
}
