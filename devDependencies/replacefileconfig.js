const replace = require('replace-in-file');
var clc = require("cli-color");
const path = require('path');




function getPath(){
    /*__dirname gives the path all the way to /devDependencies, so use path.join to go back one step*/
    return`${path.join(`${__dirname}`,'..')}`;

}
/*This 'data' object will be given to a parser, which creates a 'options' object for each file.
  it then feeds each of these 'option' objects to the 'replace-in-file' npm package thus replacing
  all of the texts in files*/

const imageFiles = {
        files: [
                    "cro_cashback_calc_200_200.png",   
                    "cro_cashback_calc_bch_200_200.png",
                    "cro_cashback_calc_doge_200_200.png",
                    "cro_cashback_calculator_giphy.png",
                    "favicon.ico"
                ],
                appendPath: "/build/images/",
                inFile: `${getPath()}`+ "/build/index.html" 
           
}


const cssFiles = {
        files: [
                "styles.css"
            ],
            appendPath: "/build/css/",
            inFile: `${getPath()}`+  "/build/index.html"
}




const jsFiles = {
        files: [
            "bundle.js"
        ],
        appendPath: "/build/js/",
        inFile: `${getPath()}`+ "/build/index.html"
    
}




async function parseToOpt(obj){
    let opts = [];
    let appendPath = obj.appendPath;
    let inFile = obj.inFile;

    for(let file of obj.files){
        let opt = {
                files: inFile,
                from: `${file}`,
                to: appendPath+`${file}`
                }
        opts.push(opt);
    }
    
     return opts;

}

async function useReplace(opt){
    try {
        let response = await replace(opt);
        console.log(`${opt.from} -> ${opt.to} ${response[0].hasChanged == true ? clc.green("OK") : clc.red("FAIL")}`);
        console.log()
    } catch (error) {
        console.log(error);
    }
    console.log();
}

async function replaceThese(...objs){
    let parsedArr = []
    for(let obj of objs){
        let done = await parseToOpt(obj);
        parsedArr.push(done);
    }
    /*bruh who writes this shit*/
    for(let parsedObj of parsedArr){
        for(let arrobj of parsedObj){
                await useReplace(arrobj); 
        }
    }   
}


async function main(){
    replaceThese(imageFiles,cssFiles,jsFiles);
}

main();