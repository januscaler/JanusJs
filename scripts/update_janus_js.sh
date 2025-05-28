#!/bin/bash
mkdir js
git clone https://github.com/meetecho/janus-gateway.git 
cd janus-gateway/npm 
npm i 
npm run rollup -- --o ./janus.js --f es
cd ..
cp -r npm/* ../js/
cd ..
rm -rf janus-gateway
