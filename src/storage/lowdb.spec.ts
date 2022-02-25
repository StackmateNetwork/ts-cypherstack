
import { expect } from "chai";
import "mocha";
import * as db from "./lowdb";
import { Posts } from "./types";

const new_posts = [
  {
    owner: 'de3ff430ea23cc691c7682edd095b566ad3aafc6a2d0f49acf96344f22834509',
    id: 's5p9eSsoBVnrrn3VxcQHAWdk',
    genesis: 1644741546125,
    expiry: 1647333543741,
    reference: undefined,
    cypher_json: '781bb3a292a3c08782f3a5a25f5fab6c:ef65a4786477f8e5c60e7d92a681814201df426042089f86c33d79086bf2a7436f64e5b06fbb8e2492abfe175589c26ddc0330dbc96137b084f3fcba46e0b2794a390754bd8382ca7830f6b88b97c4befd103b9137238bfd3d3e0393fa40d000a25da4d0cca513a193b39cffaec0aa54b35fa5c889a629a512c8790dc27e4cde2cd718b1408d0a0ab43e744113da06e405af6c373be1ac1e9e7cd26adddfca7a88a7e0ef77ac2740f78f1fbd6dd8c8f57497daf57319a7be467c95dbafe4e0e85ed4548ecf96cd8003b25700bcb5d1034981519ed0e10b86061f5fb1caa1e894',
    derivation_scheme: 'm/3h/1h/0h',
    decryption_key: '47dd806a1148c57d264321740fbe071d:7e5ecf3ed9526b0d510267b41393e7ad6e94b52df0d5ab2508483600216b3b457d605f11a0f289a32679861db65739897852637ff0244b61f98014b78d4f73d1da81177a46a744f86669bc3190df62f6'
  },
  {
    owner: 'b56c22ab67028a302065174d4739ed01cc3bb3632563997b9dcac7ce26d81cad',
    id: 's5p5DiAHsqwcGWvgCoTHUTwt',
    genesis: 1644318773908,
    expiry: 1644923572463,
    reference: undefined,
    cypher_json: '96c8553e644d9d8e08732c5d325e7716:ad18eedc6a41fd7e11826a282816ddc352ba509a78bd0dad3441e45df670fa29a37ff82cb47d74e9f3078b5672a9ce0739caf8733857baebde348fb94145ed7e2ff023ff2d8c7f7fcc6b8cc379909a625268a1bc5f32ec2c4e43a1cb9eae1c2e86778412ccc34daad71685ed850cb97fc4babb8265afc0a25baaa18c2e69bca3a600373ad64e834b63f3aea97b690420ce61f5f99a4d92d159bd826f98999fd91c9adcdf67706d2b965f940d76b1a62db351875d961af701d586978c9bfb83fca1734f523f09c3d8e4cae2b7c42a6725',
    derivation_scheme: 'm/3h/1h/0h',
    decryption_key: '165fa9269b6cd7eda04a560d8d2af081:91e70f936d6f5ad73e181257dd3c3f350e2e41b61dafecb14467eddd5f5dd6bdcf7b310dff577dcaff0c398b82cadf41af7c5db7b987b3037e935eaff6c0552dc7af79fa6a7a3572bb73ce1fa0335352'
  },
  {
    owner: 'd3ea6a9065b98ba8708c84387fc6d3a0f24dc320d5a0e83a29d55afcbdf323e7',
    id: 's5p5Nj3vtvSnJMTr7PTSTCkc',
    genesis: 1643479582934,
    expiry: 0,
    reference: undefined,
    cypher_json: 'f528b7c828e66beb458423214cd89273:7fc002d2d3eb121a07f02ca24183620f527b11721af9273abe426599295f4e0f30528372693f2fb0237d4f93f75681d3380bf9fda8fbad7e2518fc06bda69dad730bf50894735eb093756cbc7ff6d4aea41f4d38651292e42782e95ab1a588b94f70ff1e3bb0d3ce075e7e15ee0bf6c0713cf38e8f22f2d2201e2c2e339d50d2e83dd7bfb62fdc92027397ee33c86d0f73d2a7db58c816014ad07ca4cb55af058b4b54603d08010c7d86529326e4af23adbbf782d8de3d84f3c25794b333d2619ebdcc0bab13bd0d1d2adfdd86c51d8c',
    derivation_scheme: 'm/3h/1h/0h',
    decryption_key: 'c1e7689e797d21db02cd5e1b222696cd:fade66e0d1ae065623d8a5441f56dc57ea68263dcdbf6c505a39de89697a811b7abcdf93030a19220ce01d827e72c527b5957c547b9a56a718c49ef643c95aad014b1d173b0b0a0fa44972d5e421ca4a'
  },
  {
    owner: 'd3ea6a9065b98ba8708c84387fc6d3a0f24dc320d5a0e83a29d55afcbdf323e7',
    id: 's5p9fH92MAFMbyZBg2rLjpFM',
    genesis: 1643479572426,
    expiry: 0,
    reference: undefined,
    cypher_json: '751c49e019367664198b9ad3f9492f55:e6d590ea2e90b68e064e50495589748f12a7762803a3265f45c40cc392c6ad447de6ba071f388f0729eeec093558c4b1dd6eaa7d2715d1e0b978b6667b8835f6297d98ab34138e4929f4a306fdf8520462ea7746f064fbbc354f21e1379c34a80a9e00e9f673e22db864c99b433802797429333ec61bb80a183d4a0ebc3690371357c05ec0eb689807eafcb791df453bfbcd4ab650e4e113cbed02a1f597f547a5488b59bbdf30b0d13bbab8f6908457844bd78c456816567005f6f6b511e8a6719b2e8970bc53d93b0a4a674a6a565e',
    derivation_scheme: 'm/3h/1h/0h',
    decryption_key: '1348978ccabdf6c73812a2f7a8cd82b0:5609b298f3b447332808b3cbb97dfd1b0f120990e2104f4a558d9913230b98b4222c532949b3d9052ccfa9fd2b90535eaa27999aeb2493d5271a65f953fa4cdcbac2b75e9583ca44545645795b8abcbd'
  }];
const posts_update = [
  {
    owner: 'c5993b9c41023d43f3dca4de4e66f9ccde8d00ec4ce3f8f0af337cbbb43ebeed',
    id: 's5p58hT6pqvDMhjq1mr8JMMC',
    genesis: 1643466976937,
    expiry: 0,
    reference: undefined,
    cypher_json: '1621adc2bfd5d26a29f05897775504f1:d5bacd066470299fca746b9e370b17d9ef09e452e13b322ab580b4f2a0a1c821a65f04c9a4db30963b4a252c2102bd3dfb9c3df7985d5b1870a20924ebca5746ddd81cf0925efd58c0d3236510a0b23416b093dd8b7aede72d28132973529409ed4d461e053de88273d7e1c6a05560b07a34607af01e3194b8d13801befd74c0e859f83ac5571c5a1443b1a3af72f53341735ad88a917eca452e03b83a175116893750d4bf9db12937b9e13212d49b7bbf1f7d251938c51fbce79ad8574cef83c6e826c2d78c645baaa7d07ec6745de7',
    derivation_scheme: 'm/3h/1h/0h',
    decryption_key: 'f73dd9848024d2cd51562c94ce1ecbc3:95bc8fc0532c61c53b66cb0f69e95280dea837ab082e67839de5e5ce860a93d601ddf1ae3538d06a6ffbb7ebe104dad1c67dda0f5e314911463a865da30a0bc1e04c5bfd9e81e22ef9e7230eb0680330'
  },
  {
    owner: 'c5993b9c41023d43f3dca4de4e66f9ccde8d00ec4ce3f8f0af337cbbb43ebeed',
    id: 's5p9PdFrGKKnWp6CgMmVmNFJ',
    genesis: 1643466974912,
    expiry: 0,
    reference: undefined,
    cypher_json: '68ebd6aa04530cbb5631ab1b7076c148:e7f7fb695469fe751b73dbe622317bd41124bf221bb2b59a63db6108a1d50ab80e5491072b44e2118fb2affacfad38481c5dc16bbcfe1d4151f385db3e958ac07b7742aecac253b7e24c0fa87a6c5ec76034ea3266d368a811be02b35c576eab8c66555cf43f8134e9a3f173bd09c078fe41ce0a9a8587c2507823b083ece5416a6b301626653eaf46f02ce47ec49426ccc49d09161c33a59a55e044cce6423847c793865caa9dc29337529e39b60210674aa396796dc469623c83ad2f2f613ffdd3a8dc6a10b6bdde40e2683dd08f5a',
    derivation_scheme: 'm/3h/1h/0h',
    decryption_key: 'a7d2c3ecfc52d8ba36fbab61c7f33d3b:b4bddb6e07ab28d53e56e7e58c9f8cee345814e7842d01679fce8368d09282f7b45264ebd6b23de96da8383207ba4c0ea449488477776d8cd6e231f50b08e2fb430519db27ba7cfe31804b359c6c354d'
  }
];

describe("***lib/lowdb***", function () {

  it("CREATE new posts", async function () {
    const response = await db.writePostsData(new_posts);
    expect(response).to.equal(true);
  });
  it("READS posts", async function () {
    const response = await db.readPostsData() as Posts;
    expect(response.length).to.equal(4);
  });
  it("UPDATES posts", async function () {
    const response = await db.writePostsData(posts_update);
    expect(response).to.equal(true);
  });
  it("READS updated posts", async function () {
    const response = await db.readPostsData() as Posts;
    expect(response.length).to.equal(6);
  });
  it("HANDLES a DUPLICATE UPDATE", async function () {
    const response = await db.writePostsData(posts_update);
    console.log({response});
    const read_response = await db.readPostsData() as Posts;
    expect(read_response.length).to.equal(6);
  });
  it("DELETES a record", async function () {
    const response = await db.removePostData(new_posts[0].id);
    expect(response).to.equal(true);
    const read_response = await db.readPostsData() as Posts;
    expect(read_response.length).to.equal(5);
  });

});