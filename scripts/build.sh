#!/usr/bin/env bash
mkdir -p build/{css,html,img,vendor,js/vendor}

# | ./node_modules/.bin/uglifyjs 
./node_modules/.bin/browserify -t reactify src/js/client.jsx > build/js/client-bundle.js
cp -rp src/css/* build/css/
cp -rp src/html/* build/html/
cp -rp src/img/* build/img/
cp -rp src/vendor/* build/vendor/
cp -rp src/js/vendor/* build/js/vendor