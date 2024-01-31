clear

cd runtime

npm run build

cd ../demo

rm -rf dist

mkdir dist

node ../compiler/bin/index.js -e app.json -o dist

cd ../

rm -rf smallappandroid/app/src/main/assets*.*

cp -r runtime/dist/* smallappandroid/app/src/main/assets

cp -r demo/dist/* smallappandroid/app/src/main/assets