const fs = require('fs');
var CSV = require('csv-string');
//var libdom = require('lib-dom.d.ts');
const reader = new FileReader();
const EUR_DEPOSIT = "EUR Deposit";
const SPOTIFY = "Spotify";
const NETFLIX = "Netflix"
const TRANSACTION_DESCRIPTION = "Transaction Description";

//let arr = [];
let cashbackPercentage = 3;

// TODO create a command to run a command 'browserify index.js -o bundle.js' to bundle up all dependencies

async function getSpendRows(dirtyRows){
    /*From each row in excel, gets row number 9[8because starts with 0] and adds to a list*/
   return new Promise((resolve,reject)=>{
       let arr = [];
       dirtyRows.forEach(val=>{
           if(val !== null){
            arr.push(val[8])
           }
       })
       resolve(arr);

    });


}

async function getSelectedCard(){
    let cardTypes = document.getElementsByName("cardtype");
    let selectedCardType;
    cardTypes.forEach(e=>{
        if(e.checked){
            selectedCardType = e.defaultValue;
        }
    })

    return selectedCardType;
}
async function calculateCashBackPercentage(fromNumber){
    let selectedCard = await getSelectedCard();
    console.log("Using cardtype:", selectedCard);

    let totalWithCashBack = (((100-selectedCard) /100) * fromNumber);
    let cashback = fromNumber - totalWithCashBack;
    return cashback.toFixed(8);
}
async function parseMinusFromFront(values){
    let minusesRemoved = [];
    values.forEach(e=>{
        stringWithRemovedMinus = e.replace("-", "");
        minusesRemoved.push(stringWithRemovedMinus);
    })
    return minusesRemoved;
}

async function parseNegativeValuesOnly(spendRows){
    let negativeNumbers = [];
    spendRows.forEach(val=>{
        if(val.charAt(0) === '-'){
            negativeNumbers.push(val);
            //console.log("bingo")
        }
    })
    return negativeNumbers;
}
async function addAllTogether(values){
    let total = 0;
    values.forEach(val => {
        total = total + parseFloat(val);
    })
    return total;
}

async function getVisitedPlaces(resu){
    return new Promise((resolve,reject)=>{
        let arr = [];
        resu.forEach(val=>{
            if(val !== null){
             arr.push(val[1])
            }
        })
        resolve(arr);
 
     });
}

async function checkIfExists(checkFor,list){
    return new Promise((resolve,reject)=>{

        if(list.length == 0 ){
            list.push({key:checkFor, amount:1})
            resolve(list);
        }


        for(let counted of list){
            console.log("countedkey", counted.key, counted['key'])
            if(counted['key'] == checkFor){
                counted.amount = counted.amount + 1;
                return resolve(list)
                
            }
        
        }
        list.push({key: checkFor, amount:1})
        return resolve(list);
    })
}
async function getHowManyTimesVisited(visitedPlaces){
    let obj = [];
    // check if it exists in another place
    // if it does, increase counter
    // if it does not, add it   


      
        for(let place of visitedPlaces){
                
            obj = await checkIfExists(place,obj);
            console.log("obj len", obj.length);


        }


    console.log("kek")
    return obj;

}

async function getAllTxWithCertainKey(visitedPlacesObj, key){
    let arr = [];
    for(let obj of visitedPlacesObj){
        if(obj.key == key){
            arr.push(obj)
        }
    }

    return arr;

}
async function addDepositsToDom(totalDepositTimesObj){
    let totaldepositElem = document.getElementById("totaldeposittimes");
    if(totalDepositTimesObj[0]){
        totaldepositElem.innerHTML = totalDepositTimesObj[0].amount;

    }else{

    }
}
async function addToDom(element,amount){
    let elem = document.getElementById(element);
    elem.innerHTML = amount;
}
async function addTotalPlacesVisitedDom(obj){
    await addToDom("totalplacesvisited", obj.length);
}
async function getMostVisited(arr){
    let unwantedSorted = []
    let sortedArray = arr.sort((a,b)=>{a.amount > b.amount ? 1 : -1} )
    unwantedSorted = sortedArray.filter((e)=>{return e != EUR_DEPOSIT && e != TRANSACTION_DESCRIPTION})
    
    if(unwantedSorted.length != 0){
        return unwantedSorted[0];
    }
    return "";
  
}

async function calculatePlaces(resu){
    let visitedPlacesMultiple = await getVisitedPlaces(resu);
    let visitedPlacesObj = await getHowManyTimesVisited(visitedPlacesMultiple);
    let totalDepositTimes = await getAllTxWithCertainKey(visitedPlacesObj,EUR_DEPOSIT); // TODO USD ?
    let mostVisited = await getMostVisited(visitedPlacesMultiple);
    
    /*Add to DOM*/ 
    let totalPlacesVisited = await addTotalPlacesVisitedDom(resu);
    await addDepositsToDom(totalDepositTimes);
    addToDom("mostvisited",mostVisited)


}

async function getAllTxWhichContainName(visitedPlacesObj, key){
    let arr = [];
    for(let obj of visitedPlacesObj){
        if(obj[1].includes(key)){
            arr.push(obj)
        }
    }

    return arr;

}

async function getTotalSpendFromObjects(objects){
    
    totalSpendRows = await new Promise((resolve,reject)=>{
        let totalSpendRows = [];

        for(let obj of objects){
            amountWithMinusRemoved = obj[8].replace("-", "");
            totalSpendRows.push(amountWithMinusRemoved);
        }
        resolve(totalSpendRows);
    })

    let sum = await addAllTogether(totalSpendRows);
    return sum;
    
}
async function getSpotify(minusObjects){
    let allSpotifyTxObjects = await getAllTxWhichContainName(minusObjects,SPOTIFY);
    let totalSpendRows = await getTotalSpendFromObjects(allSpotifyTxObjects);
    addToDom("totalcashbackspotify",await limitAmount(totalSpendRows))
    console.log("");
}
async function getNetflix(minusObjects){
    let allNetflixTxObjects = await getAllTxWhichContainName(minusObjects,NETFLIX);
    let totalSpendRows = await getTotalSpendFromObjects(allNetflixTxObjects);
    addToDom("totalcashbacknetflix",await limitAmount(totalSpendRows))
    console.log("");
}

async function limitAmount(amount){
  return parseFloat(amount).toFixed(8);
}

async function calculatePercs(minusObjects){
    await getSpotify(minusObjects);
    await getNetflix(minusObjects);


}
async function calculateMinusRows(resu){
    let spendRows = await getSpendRows(resu);    
    console.log("Overall tx count: ", spendRows.length)
    let negativeRows = await parseNegativeValuesOnly(spendRows);
    console.log("Rows with cashback", negativeRows.length);
    let minusParsed = await parseMinusFromFront(negativeRows);
    console.log("minusparsed count", minusParsed.length);
    return minusParsed;
}

async function getSpendObjects(dirtyRows){
        /*From each row in excel, gets row number 9[8because starts with 0] and adds to a list*/
   return new Promise((resolve,reject)=>{
    let arr = [];
    dirtyRows.forEach(val=>{
        if(val !== null){
            if(val[8].charAt(0) === '-'){
                arr.push(val)
            }
        }
    })
    resolve(arr);

 });


}

async function calculateMinusObjects(resu){
    let spendObjects = await getSpendObjects(resu);
    return spendObjects;
    //let spotifyTx = getAllTxWhichContainName(spendObjects,SPOTIFY);    
    console.log("Overall tx count: ", spendRows.length)

}
async function main(resu){
    let minusObjects = await calculateMinusObjects(resu);
    let minusRows = await calculateMinusRows(resu);
    await showElement2("loader");
    await calculateCashback(minusRows);
    await calculatePlaces(resu);
    await calculatePercs(minusObjects);
    await hideElement2("loader");
}

async function calculateCashback(minusrows){

    let total = await addAllTogether(minusrows);
   
    let cashback = await calculateCashBackPercentage(total);

    /*Biggest cashback*/ 
    
    let biggestSpend = Math.max.apply(null,minusrows);
    let biggestCashback = await calculateCashBackPercentage(biggestSpend);
    await addToDom("biggestcashback",biggestCashback);

    /*Smallest cashback*/
    let smallestSpend = Math.min.apply(null,minusrows);
    let smallestCashback = await calculateCashBackPercentage(smallestSpend);
    await addToDom("smallestcashback",smallestCashback);
    

    /*Add to DOM*/
    addToDom("totalcashbackvalue", await limitAmount(cashback))


}

function createInputListener(){

    //let fileInput = document.getElementById("fileInput");
    fileInput.onchange = async ()=>{
        //let selectedFile = fileInput.files[0];
        let currentFile = await getCurrentFile();

        console.log("currentFile, ", currentFile);
        //bruh(selectedFile);
        
        reader.onload = function (event) {
        console.log(event.target.result); // the CSV content as string
        let resu = CSV.parse(event.target.result);
        console.log(resu)
        main(resu);
        }

        //reader.readAsText(currentFile);
}


}

async function getCurrentFile(){
    let fileInput = document.getElementById("fileInput");

    // dispatch new event
    let selectedFile = fileInput.files[0];

    return selectedFile;


}

async function createRadioListener(){
    let cardTypes = document.getElementsByName("cardtype");
    let currentFile = await getCurrentFile();
    cardTypes.forEach(e=>{
        e.addEventListener('change',(event)=>{
            console.log("changed");
            console.log(event);
            //let currentFile = await getCurrentFile();

            //reader.readAsText(currentFile);
        });
    })
}
async function createCompileListener(){
    let compilebutton = document.getElementById("startcompiling");
    compilebutton.addEventListener("click", async ()=>{
        let currentFile = await getCurrentFile();
        reader.readAsText(currentFile);
    })
}


window.onload = ()=>{
    createInputListener();
    createRadioListener();
    createCompileListener();

};

//main();





async function showElement2(elementID){
    /*This function uses the visibility:hidden / visibility:visible because this way the element take space in DOM*/
    /*This way we don't have items jumping up and down in DOM */ 
    let element;
    try {
        element = document.getElementById(elementID);
    } catch (error) {   
        console.log("error happened, element was not found");
        
    }

    if(!element){
        // element does not exist
        return false;
    }

    element.style.visibility = "visible"
    return true;


}


async function hideElement2(elementID){
    let element = document.getElementById(elementID);
    if(!element){
        return false;
    }

    element.style.visibility = "hidden";
    return true;

}