Hey, this is me from the past:


This project has a dependency to :

var CSV = require('csv-string');

This is doing all of the CSV parsing magic.
It's bundled to node_modules so it can be run locally in the browser.

To make a production bundle use command:
browserify index.js -o bundle.js
This will bundle all of your code and the code of dependencies described in package.json to a single file called bundle.js

Another step you should do is run:
uglifyjs bundle.js > bruh2.js 

This makes the code smaller by removing whitespaces