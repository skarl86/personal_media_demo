/**
 * Created by NK on 2017. 2. 16..
 */


var ntriple;
var ntripleList;

var N3_BASE_PATH = "new_n3";
var IMAGE_BASE_URL = "http://192.168.0.13:5000/uploads";

var selectedRule = "";

var fileListDictionary = {
    amusement_park:["AmusementPark_n3_thumb", "AmusementPark"],
    bicycle:["Bicycle_stunt_n3_thumb", "Bicycle_stunt"],
    birthday_party:["BirthdayParty_n3_thumb", "BirthdayParty"],
    camping:["Camping_n3_thumb","Camping"],
    climbing:["Climbing_n3_thumb", "Climbing"],
    cook:["Cook_n3_thumb","Cook"],
    cute_festival:["Cute_festival_n3_thumb","Cute_festival"],
    entrance_ceremony:["Entrance_ceremony_n3_thumb", "Entrance_ceremony"],
    first_birthday:["First_birthday_n3_thumb","First_birthday"],
    fishing:["Fishing_n3_thumb","Fishing"],
    golf:["Golf_n3_thumb","Golf"],
    graduation_ceremony:["GraduationCeremony_n3_thumb","GraduationCeremony"],
    makeup:["Makeup_n3_thumb","Makeup"],
    pet:["Pet_n3_thumb","Pet"],
    tod: ["Tod_n3_thumb","Tod"],
    wedding:["Wedding_n3_thumb","Wedding"]
};

var ruleDictionary = {
    tod:"TodEvent<-BabyToddleActivity<<BabyActivity",
    birthday_party:"BirthdayPartyEvent<-BirthdaySongActivity<<BlowOutCandleActivity"
};

function getThumbImageList(ntripleStr) {
    /**
     * http://192.168.0.13:5000/uploads/medias/wedding/2708/shot_start_2.jpg
     * <http://www.personalmedia.org/soongsil-diquest#Video00001454_Shot00002003_thumb> <http://www.w3.org/2000/01/rdf-schema#label> "medias/first_birthday/1454/shot_start_61.jpg"^^<http://www.w3.org/2001/XMLSchema#string> .
     */
    var shotImageURLList = [];
    var list = ntripleStr.split("\n");

    for(var i in list){
        var spo = list[i].split(" ");
        if(spo[0].includes("Shot") && spo[1].includes("#label") && spo[2].includes(".jpg")) {
            var relativeImgUrl = spo[2].split("^^")[0].replace('"','').replace('"','');
            shotImageURLList.push([IMAGE_BASE_URL, relativeImgUrl].join("/"));
        }
    }
    // var htmlText = '<img src = "'+[IMAGE_BASE_URL, shotImageRelativeURLList[0]].join("/") + '">';
    // document.getElementById("test-area").innerHTML = htmlText;
    return shotImageURLList;
}
function selectLocalFile(ntripleStr) {
    var list = ntripleStr.split("\n");
    var instanceStr = "";
    var label = "";
    var category = "";
    var id = "";
    var fileHeadName = "";
    var fileName = "";
    var filePath = "";
    var fileExt = ".n3";

    for(var i in list){
        var spo = list[i].split(" ");
        if(spo.length > 2){
            /**
             * <http://www.personalmedia.org/soongsil-diquest#Video00001454> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.personalmedia.org/soongsil-diquest#First_birthdayEvent> .
             * <http://www.personalmedia.org/soongsil-diquest#Video00001454_Shot00002003_local> <http://www.w3.org/2000/01/rdf-schema#label> "medias/first_birthday/1454/Raphaels_First_Birthday_Party_-_\uB3CC\uC7A1\uC774.mp4"^^<http://www.w3.org/2001/XMLSchema#string> .
             * Bicycle_stunt467.n3
             */

            if(spo[0].includes("_local") && spo[1].includes("#label") && spo[2].includes("medias")){
                label = unicodeToChar(spo[2]);
                category = label.split("/")[1];
                id = label.split("/")[2];
                if(1000 > parseInt(id)){
                    category = "birthday_party"
                }else{
                    category = "tod"
                }
            }
            // if(spo[0].includes("Video") && spo[1].includes("#type") && spo[2].includes("Event")){
            //     fileHeadName = spo[2].split("#")[1].replace("Event>","")
            // }
            // document.getElementById("test-area").innerText = "Category : " + category + "\nID : " + id + "\nFile Name : " + fileHeadName + id + "\nFull File Name : " + filePath;
        }
    }
    fileHeadName = fileListDictionary[category][1];
    fileName = fileHeadName + id + fileExt;
    filePath = [N3_BASE_PATH, fileListDictionary[category][0], fileName].join("/");

    selectedRule = ruleDictionary[category];

    return filePath;
}

function unicodeToChar(text) {
    return text.replace(/\\u[\dA-F]{4}/gi,
        function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        });
}
function preprocessing(receiveData) {
    var r = /\\u([\d\w]{4})/gi;
    ntriple = receiveData.replace(r, function (match, grp) {
        return String.fromCharCode(parseInt(grp, 16)); } );
    ntriple = unescape(ntriple);

    var triplesWithoutURI = eraseURIs(ntriple.split("\n"));
    var triplesList = triplesWithoutURI.split("\n");
    var shotList = [];
    for(var index in triplesList){
        var triple = triplesList[index];
        var spo = triple.split(" ");
        if(spo.length > 2){
            if(spo[1].includes("hasShot")){
                shotList.push(spo[2]);
            }
        }
    }

    var instanceByShot = [];
    for(var i in shotList){
        var instanceTriple = [];
        for(var j in triplesList){
            var triple = triplesList[j];
            var spo = triple.split(" ");
            if(spo.length > 2){
                if(spo[0].includes(shotList[i]) || spo[2].includes(shotList[i])
                || spo[1].includes("type") || spo[1].includes("subClassOf")){
                    instanceTriple.push(triple);
                }
            }
        }
        instanceByShot.push(instanceTriple.join("\n"));
    }
    for(var i in instanceByShot){
        //console.log(instanceByShot[i]);
    }

    ntripleList = instanceByShot;
    return instanceByShot;
}

function getRule() {
    return selectedRule;
}

function getInstance() {
    return ntripleList.join("**");
}
function getNtripleList() {
    return ntripleList;
}
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    };
    rawFile.send(null);
}

function eraseURIs(lines){
    var triples = "";
    for (var index in lines){
        triples += eraseURI(lines[index]);
    }

    return triples;
}

function eraseURI(line) {
    //console.log(line);
    var spo = line.split(" ");
    if(spo.length > 2){
        //var match = /<http?:\/\/?[\da-z\.-]+\.[a-z\.]{2,6}[\/\w_\.-]*\/?#([\w].+)>/.exec(line);
        var match1 = /<http?:\/\/?[\da-z\.-]+\.[a-z\.]{2,6}[\/\w_\.-]*\/?#([\w].+)>/.exec(spo[0]);
        var match2 = /<http?:\/\/?[\da-z\.-]+\.[a-z\.]{2,6}[\/\w_\.-]*\/?#([\w].+)>/.exec(spo[1]);
        var match3 = /<http?:\/\/?[\da-z\.-]+\.[a-z\.]{2,6}[\/\w_\.-]*\/?#([\w].+)>/.exec(spo[2]);

        if(!match1 && !match2 && !match3){
            throw new Error('Not an ISO Date: ' + line);
        }

        return "<" + match1[1] + "> " + "<" + match2[1] + "> " + "<" +match3[1] + "> .\n";
    }
    else{ return "" }
}