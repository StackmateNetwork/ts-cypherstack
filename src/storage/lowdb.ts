import lodash from 'lodash';
import { JSONFile, Low } from 'lowdb';
import { join } from 'path';
import { handleError } from '../lib/error';
import * as types from "./types";
  
class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}
// Use JSON file for storage
const file = join(process.env.HOME, '.stackmate', 'db.json');
const adapter = new JSONFile<types.Data>(file);
const db = new LowWithLodash(adapter);

db.data ||= { idbs: [], posts: [] };

export async function readIDBSData(): Promise<types.IDBS | Error> {
  try {
    return await db.chain.get('idbs').value();
  }
  catch (e) {
    return handleError(e);
  }
}

export async function writeIDBSData(idbs: types.IDBS): Promise<boolean | Error> {
  try {
    const current = await db.chain.get('idbs').value();
    idbs.map((idb)=>{
      const exists = current.find(({identity})=>identity.pubkey === idb.identity.pubkey);
      console.log({exists});
      if(exists) return;
      else
      db.data.idbs.push(idb);
    });
    await db.chain.write()
    return true;
  }
  catch (e) {
    return handleError(e);
  }
}

export async function readPostsData(): Promise<types.Posts | Error> {
  try {
    return await db.chain.get('posts').value();
  }
  catch (e) {
    return handleError(e);
  }
}

export async function writePostsData(posts: types.Posts): Promise<boolean | Error> {
  try {
    const current = await db.chain.get('posts').value();
    posts.map((post)=>{
      const exists = current.find(({id})=>id === post.id);
      if(exists) return;
      else
      db.data.posts.push(post)
    });
    await db.write()
    return true;
  }
  catch (e) {
    return handleError(e);
  }
}

export async function removePostData(id: string): Promise<boolean | Error> {
  try {
    const current = await db.chain.get('posts').remove({id});
    await current.write();
    // console.log({status});
    return true;
  }
  catch (e) {
    console.error(e);
    return handleError(e);
  }
}
