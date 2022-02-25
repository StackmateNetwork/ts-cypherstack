import { ECDSAKeys, schnorrSign } from "../lib/crypto";
import { BadgeType } from "./types/data";
import { RequestBody, RequestHeaders, RequestMethod, Response } from "./types/request";
const axios = require('axios');

export function createRequestHeaders(
  identity_parent: ECDSAKeys,
  nonce: number,
  signature: string
): RequestHeaders {
  return {
    "X-Client-Pubkey": identity_parent['pubkey'],
    "X-Nonce": nonce.toString(),
    "X-Client-Signature": signature,
  };
}

export async function createRequestSignature(
  method: RequestMethod,
  resource: string,
  body: RequestBody,
  identity_parent: ECDSAKeys,
  nonce: number
): Promise<string | Error> {
  const request_message = `${method.toString()} ${resource} ${JSON.stringify(body)} ${nonce}`;
  // console.log({ request_message })
  return schnorrSign(request_message, identity_parent.privkey);
};

export async function createBadgeSignature(
  identity_parent: ECDSAKeys,
  reciever_pubkey: string,
  type: BadgeType,
  nonce: number
): Promise<string | Error> {
  const badge_message = `${identity_parent.pubkey}:${reciever_pubkey}:${type.toString()}:${nonce}`;
  // console.log({ badge_message })
  return schnorrSign(badge_message, identity_parent.privkey);
}

export async function request(
  method: RequestMethod,
  url: string,
  headers: RequestHeaders,
  body: RequestBody
): Promise<Response | Error> {
  const options = {
    url,
    method: method.toString(),
    headers,
    data: body,
    json: true
  };
  try {
    const response = await axios(options);
    return response.data;
  }
  catch (e) {
    if (e.response) {
      const err = new Error(e.response.data.error);
      err.name = e.response.status.toString();
      return err;
    }
    else {
      console.error({ e })
      return new Error("BAD NEWS!");
    }
  }
}
