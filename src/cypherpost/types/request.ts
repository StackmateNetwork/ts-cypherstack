import { Badge, CypherPosts, FilteredBadges, Identity } from "./data";

export enum RequestMethod {
  Get = "GET",
  Post = "POST",
  Delete = "DELETE",
  Put = "PUT"
};

export type RequestHeaders = {
  "X-Client-Pubkey": string,
  "X-Client-Signature": string,
  "X-Nonce": string
};


export type RegisterUserRequest = {
  username: string
}

export type GiveTrustBadgeRequest = {
  trusting: string,
  nonce: number,
  signature: string
};

export type RevokeTrustBadgeRequest = {
  revoking: string
}

export type CreatePostRequest = {
  cypher_json: string,
  derivation_scheme: string,
  expiry: number,
  reference: string
};

export type DecryptionKey = {
  reciever: string,
  decryption_key: string
}
export type PostVisibilityRequest = {
  post_id: string,
  decryption_keys: DecryptionKey[]
}

export type RequestBody = RegisterUserRequest | GiveTrustBadgeRequest | RevokeTrustBadgeRequest | CreatePostRequest | PostVisibilityRequest | {};
export type Response = CypherPosts | Identity[] | Badge[] | FilteredBadges | string | boolean;