# stackmate-cli

Stackmate meets cypherpost at the command-line, to facilitate networked multi signature contracts.

## Setup
```
npm install node-gyp -g
npm i
```

## Test
No integration tests are written yet. 

Navigate into folders with *.spec.ts files and run the following:

```
mocha -r ts-node/register *.spec.ts --exit
```

Cypherpost servers are currently situated in Canada hence responses from them are slow when testing from Asia/Pacific reigon.
cypherpost.spec.ts will therefore require a timeout with mocha.

```
mocha -r ts-node/register cypherpost*.spec.ts --timeout 10000 --exit
```
