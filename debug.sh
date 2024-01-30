clear

cd runtime

npm run build

cd ../demo

mkdir dist

node --inspect ../compiler/bin/index.js -e app.json -o dist