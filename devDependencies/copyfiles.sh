pwd
GREEN='\033[1;32m'
NC='\033[0m' # No Color


printf "Build ${GREEN} started ${NC}"
echo 
echo cleaning build/ folder
rm -R build

echo creating build/ folder
mkdir -m 0777 build 

echo copying images
cp -R images build/images
chmod 0777 build/images


echo copying node_modules
cp -R node_modules build/node_modules

echo copy css
cp -R styles build/styles
chmod 0777 build/styles

echo copy index.html
cp index.html build/

echo copy /js/
cp -R js build/

echo [changing rights] index.js
chmod 0777 build/js/index.js

echo starting to bundle:
browserify build/js/index.js -o build/js/bundle.js


echo [starting to minify files]
echo minify bundle.js
minify build/js/bundle.js > build/js/bundle.min.js

echo minify styles
minify build/styles/styles.css > build/styles/styles.min.css


echo minify index.html
minify build/index.html > build/index.min.html


echo removing unwanted files
echo remove build/js/index.js
rm build/js/index.js

echo remove build/index.html
rm build/index.html


echo rename minified files
mv build/js/bundle.min.js build/js/bundle.js
mv build/index.min.html build/index.html
mv build/styles/styles.min.css build/styles/styles.css


echo remove node_modules
rm -R build/node_modules

echo [Build ended]



