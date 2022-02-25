/*
cypherpost.io
Developed @ Stackmate India
*/

import { expect } from "chai";
import "mocha";
import { handleError } from './error';

// ------------------ ┌∩┐(◣_◢)┌∩┐ ------------------
// GLOBAL CONFIGURATIONS
const e1 = {
 joe: "bloggs",
 can: "bark",
 and: "bite"
};
const e2 = {
 code: "430",
 message: e1
};
const e3 = {
 code: 420,
 message: "thisise3"
}
const e4 = new Error(JSON.stringify(e1));
const e5 = {
 code: 404,
 message: e4
};
const e6 = {
 code: 404,
 messages: e1
};
// ------------------ ┌∩┐(◣_◢)┌∩┐ ------------------
describe("***lib/error*** ", function () {

  it("501", async function () {
   const response = handleError(e1);
   // console.log({response})
   expect(response['name']).to.equal('501');
  });
  it("430", async function () {
   const response = handleError(e2);
   // console.log({response})
   expect(response['name']).to.equal("430");
  });
  it("420", async function () {
   const response = handleError(e3);
   // console.log({response})
   expect(response['name']).to.equal("420");
  });
  it("501", async function () {
   const response = handleError(e4);
   // console.log({response})
   expect(response['name']).to.equal("501");
  });
  it("404", async function () {
   const response = handleError(e5);
   // console.log({response})
   expect(response['name']).to.equal("404");
  });
  it("501", async function () {
   const response = handleError(e6);
   // console.log({response})
   expect(response['name']).to.equal("501");
  });
});

// ------------------ '(◣ ◢)' ---------------------

