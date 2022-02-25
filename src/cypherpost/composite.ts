import { handleError } from "../lib/error";
import * as api from "./api";
import { PreferencePost, PreferencePostUpdateType } from "./types/data";
import { ParentKeyChain } from "./types/keys";
import * as util from "./util";



export async function updatePreferences(parent_keychain: ParentKeyChain, preference: PreferencePost): Promise<string | Error> {
  try {
    const preference_derivation_scheme = "m/1'/0'/0'";
    const my_posts = await api.getMyPosts(parent_keychain.identity);
    if (my_posts instanceof Error) return my_posts;
    const preference_cypherposts = my_posts.filter(post => post.derivation_scheme === preference_derivation_scheme);
    if (preference_cypherposts.length === 0) return new Error("No preference posts found");
    let preference_cypherposts_ids = [];
    preference_cypherposts.filter((post) => {preference_cypherposts_ids .push(post.id)})

    await preference_cypherposts_ids.map(async (id) => {
      const status = await api.deletePost(parent_keychain.identity, id);
      if (status instanceof Error) return status;
    });

    const primary_key = util.createPrimaryKey(parent_keychain.e2ee_root, preference_derivation_scheme);
    if (primary_key instanceof Error) return primary_key;

    const cypher_json = util.createCypherJSON(primary_key, preference);
    if (cypher_json instanceof Error) return cypher_json;

    const new_preference_post_id = await api.createPost(parent_keychain.identity, cypher_json, preference_derivation_scheme, 0, "NONE");
    return new_preference_post_id;
  }
  catch (e) {
    return handleError(e);
  }
}

export function updatePreferencesObject(preference: PreferencePost, update_type: PreferencePostUpdateType, preference_update: string | object[]): PreferencePost {
  switch (update_type) {
    case PreferencePostUpdateType.Petnames:
      preference.petnames.push(preference_update as object[]);
      break;
    case PreferencePostUpdateType.MuSigDS:
      preference.last_derivation_paths.musig = preference_update as string;
      break;
    case PreferencePostUpdateType.XPubDS:
      preference.last_derivation_paths.xpub = preference_update as string;
      break;
    case PreferencePostUpdateType.PSBTDS:
      preference.last_derivation_paths.psbt = preference_update as string;
      break;
    default:
      break;
  }
  return preference;
}