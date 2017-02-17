/**
 * Created by NK on 2016. 12. 20..
 */
var classDict = {};
var countDict = {};
var finalDict = {};
var sortedResult = [];
var propDict = {};
var activityDict = {};
var currentActivityName = "BirthdayPartyActivity";

var probJson = null;
var ALPHA = 0.97;
var GRAPH_DISPLAY_COUNT = 10;

var instanceText = '';
var origOwlText = '';

var OWL_FILE_PATH = "./owl/new_owl.owl";
var PROB_JSON_PATH = "./json/prob_data.json";

var newDescription = "";
var someDescrpition = [];
var allDescription = [];

readOWLFile("owl/PersonalMedia151108.owl");
//readInstanceFile("./instance/shot");
readInstanceFile("./instance/birth_shot");
readTextFile(PROB_JSON_PATH, function(text){
    probJson = JSON.parse(text);
});

$(document).ready(function(){
    $('#btn-run').on('click', function(event) {
        event.preventDefault(); // To prevent following the link (optional)
        //your awesome code here
        console.log("CLICK BUTTON1");
        readInstance(instanceText);
        calculateND(countDict); // finalDict 갱신 됨.
        newDescription = createDescription();
        //console.log(newDescription);
        showPrettyDescription();
        $(document).ready( function() {
            $("#graph").load("testgraph.html");
        });
        //getGraphData();
        //window.requestFileSystem(window.TEMPORARY, 5*1024*1024, onInitFs,errorHandler);

    });
});
/**
 *
 * @param text
 * @returns {{}}
 */
function createClassDictionary(text) {
    var lines = text.split('\n');

    for(var i = 0; i < lines.length; i++){
        var triples = lines[i].split(' ');
        if(triples[1].includes("type")){
            var key = triples[0].replace(/[<>]/gi,"");
            var value = triples[2].replace(/[<>]/gi,"");
            classDict[key] = value;
        }
    }
    return classDict;
}
/**
 *
 * @param text
 * @returns {{}}
 */
function createPropertyDictionary(text) {
    var lines = text.split('\n');

    for(var i = 0; i < lines.length; i++){
        var triples = lines[i].split(' ');
        var object = triples[2].replace(/[<>]/gi,"");
        var className = classDict[object];
        if(className != undefined){
            var propName = triples[1].replace(/[<>]/gi,"");
            propDict[className] = propName;
        }
        // propDict["Bicycle"] = "hasVisual"
        // Bicycle == classDict["bicycle01"]
    }

    return propDict;
}
/**
 *
 * @param text
 */
function createActivityDictionary(text) {
    var lines = text.split('\n');
    for(var i = 0; i < lines.length; i++){
        var triples = lines[i].split(' ');
        if(triples[1].includes("hasActivity")){
            var key = triples[2].replace(/[<>]/gi,"");
            var className = classDict[key];
            activityDict[key] = className;
            //currentActivityName = className;
        }
    }
}

/**
 *
 * @param text
 */
function readInstance(text) {
    var classDict = createClassDictionary(text);
    createActivityDictionary(text);
    createPropertyDictionary(text); // 무조건 클래스 딕셔너리 뒤에 실행되어야 한다.
    console.log(propDict);
    var lines = text.split('\n');
    for(var i = 0; i < lines.length; i++){
        var triples = lines[i].split(' ');
        if(triples[1].includes("hasVisual") || triples[1].includes("hasWhatBehavior")){
            var key = triples[2].replace(/[<>]/gi,"");
            var className = classDict[key];
            if(countDict[className] != undefined){
                var count = countDict[className];
                countDict[className] = count + 1;
            }else{
                countDict[className] = 1;
            }
        }
    }
    //console.log(countDict);
    //console.log(classDict);
}
/**
 *
 */
function showPrettyDescription(){
    for(var key1 in probJson){
        console.log(key1);
        console.log(probJson[key1][0].name, probJson[key1][0].cdf);
        console.log(probJson[key1][1].name, probJson[key1][1].cdf);
        var objectList =[];
        objectList.push(probJson[key1][0].name);
        objectList.push(probJson[key1][1].name);

        $('#graph-table > tbody:last').append(
            '<tr>' +
            '<td id="act-text">' + key1 + '</td>' +
            '<td id="desc-text">' + makeAxiomText(objectList) + '</td>' +
            '<td class="graph-text">' + '<svg class="chart-'+key1 + '" viewBox="400 0 100 300"></svg>' + '</td>' +
            '</tr>');
        drawChart("chart-"+key1, getGraphData(probJson[key1]));
    }
}
function makeAxiomText(objectList){
    var text = "";
    var property = "hasVisual";
    for(var index in objectList){
        text += "∀∃";
        text += property + ".";
        text += "<b>" + objectList[index] +"</b>";
        text += "<br>";
    }
    return text;
}
/**
 *
 * @param type
 * @param property
 * @param className
 * @returns {string}
 */
function getPrettyDescription(type, property, className) {
    var text = "";

    if(type == "All"){
        text = "SubClass Of :" + "</br>" +
                "<b>" + property + "</b>" +
                "<b><font color='#ff00ff'> only </font></b>" +
                "<b>" + className + "</b>";
    }else if(type == "Some"){
        text = "Equivalent To :" + "</br>" +
            "<b>" + property + "</b>" +
            "<b><font color='#ff00ff'> some </font></b>" +
            "<b>" + className + "</b>";
    }
    console.log(text);
    return text;
}
/**
 *
 * @returns {string}
 */
function createDescription(){
    var xmlDoc;
    var parser;

    if (window.DOMParser)
    {
        parser=new DOMParser();
        xmlDoc=parser.parseFromString(origOwlText,"text/xml");
    }
    else // Internet Explorer
    {
        xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async=false;
        xmlDoc.loadXML(origOwlText);
    }
    createSomeValueDescription(xmlDoc);
    createAllValueDescription(xmlDoc);

    return (new XMLSerializer()).serializeToString(xmlDoc);
}

//function createDeclaration(xmlDoc, className){
//    /**
//     * <Declaration>
//     * <Class IRI="#Above"/>
//     * </Declaration>
//     */
//
//    var decl = xmlDoc.createElement('Declaration');
//    var clss = xmlDoc.createElement('Class');
//    clss.setAttribute("IRI","#" + className);
//
//    decl.appendChild(clss);
//    xmlDoc.documentElement.appendChild(decl);
//    console.log("Declaration : \n" + (new XMLSerializer()).serializeToString(decl));
//}

function createSomeValueDescription(xmlDoc){
    var equi = xmlDoc.createElement("EquivalentClasses");
    xmlDoc.documentElement.appendChild(equi);

    var classElm = xmlDoc.createElement('Class');
    classElm.setAttribute("IRI","#"+currentActivityName);

    equi.appendChild(classElm);

    // finalDict
    // Key : Class 이름 , Value : 정규분포 확률값.
    for(var key in finalDict){
        var property = propDict[key];
        var objSomeValueFrom = xmlDoc.createElement('ObjectSomeValuesFrom');
        var objProp = xmlDoc.createElement('ObjectProperty');
        objSomeValueFrom.appendChild(objProp);
        objProp.setAttribute("IRI", "#"+property);

        var clss = xmlDoc.createElement('Class');
        objSomeValueFrom.appendChild(clss);
        clss.setAttribute("IRI","#"+key);
        equi.appendChild(objSomeValueFrom);
        someDescrpition.push(getPrettyDescription("Some", property, key));
    }

    xmlDoc.documentElement.appendChild(equi);
    console.log("Some Value : \n" + (new XMLSerializer()).serializeToString(equi));
}

/**
 *
 * @param xmlDoc
 */
function createAllValueDescription(xmlDoc){
    var subClassOf = xmlDoc.createElement("SubClassOf");
    xmlDoc.documentElement.appendChild(subClassOf);

    var classElm = xmlDoc.createElement('Class');
    classElm.setAttribute("IRI","#"+currentActivityName);

    subClassOf.appendChild(classElm);

    // finalDict
    // Key : Class 이름 , Value : 정규분포 확률값.
    for(var key in finalDict){
        var property = propDict[key];
        var objAllValueFrom = xmlDoc.createElement('ObjectAllValuesFrom');
        var objProp = xmlDoc.createElement('ObjectProperty');
        objAllValueFrom.appendChild(objProp);
        objProp.setAttribute("IRI", "#"+property);

        var clss = xmlDoc.createElement('Class');
        objAllValueFrom.appendChild(clss);
        clss.setAttribute("IRI","#"+key);
        subClassOf.appendChild(objAllValueFrom);
        allDescription.push(getPrettyDescription("All", property, key));
    }
    xmlDoc.documentElement.appendChild(subClassOf);
    console.log("All Value : \n" + (new XMLSerializer()).serializeToString(subClassOf));
}
/**
 *
 * @param file
 * @param callback
 */
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

/**
 *
 * @param file
 */
function readInstanceFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                instanceText = rawFile.responseText;
            }
        }
    };
    rawFile.send(null);
}

/**
 *
 * @param file
 */
function readOWLFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                origOwlText = rawFile.responseText;
            }
        }
    };
    rawFile.send(null);
}

/**
 *
 * @param dict
 * @returns {Array}
 */
function sortingResult(dict) {
    var tuples = [];

    for (var key in dict) tuples.push([key, dict[key]]);

    tuples.sort(function(a, b) {
        a = a[1];
        b = b[1];

        return a > b ? -1 : (a < b ? 1 : 0);
    });

    var result = [];
    for (var i = 0; i < tuples.length; i++) {
        var key = tuples[i][0];
        var value = tuples[i][1];
        result.push([key, value]);
        // do something with key and value
    }

    return result;
}
/**
 *
 * @param xmlDoc
 */
function writeOWLFile(xmlDoc) {
    var owlText = new Blob([(new XMLSerializer()).serializeToString(xmlDoc)],{type : 'text/xml'});
    save(owlText, OWL_FILE_PATH);
    //var file = new File([owlText], OWL_FILE_PATH);
    //file.open();
    //file.write(owlText);
    //file.close();
}

/**
 *
 * @param countDict
 */
function calculateND(countDict) {
    var countArray = [];
    for(var key in countDict){
        countArray.push(countDict[key]);
    }
    var M = math.mean(countArray);
    var SD = math.std(countArray);
    var dict = {}
    console.log("Mean : " + M + " / SD : " + SD);
    for(var key in countDict){
        if(key.startsWith("Visual_")){
            var Z = countDict[key];
            var Prob = normalProbability(Z,M,SD);
            dict[key] = Prob;
            if(ALPHA < Prob){
                finalDict[key] = Prob;
            }
        }
    }
    sortedResult = sortingResult(dict);
    console.log(finalDict);
}
/**
 *
 * @param Z
 * @param M
 * @param SD
 * @returns {number}
 */
function normalProbability(Z, M, SD){
    var Prob = 0;
    with (Math) {
        if (SD<0) {
            alert("The standard deviation must be nonnegative.")
        } else if (SD==0) {
            if (Z<M){
                Prob=0
            } else {
                Prob=1
            }
        } else {
            Prob=normalcdf((Z-M)/SD);
            Prob=round(100000*Prob)/100000;
        }
    }

    return Prob;
}

/**
 *
 * @returns {{labels: string[], series: Array}}
 */
function getGraphData(totalObjectList) {

    var displayArray = [];
    for(var i = 0; i < GRAPH_DISPLAY_COUNT; i++){
        var obj = totalObjectList[i];
        var objectName = obj.name;
        var objectValue = obj.cdf;

        displayArray.push({label: objectName, values: [objectValue]})
    }

    var data = {
        labels: [
            ''
        ],
        series: displayArray
    };

    return data;
}
/**
 *
 * @param X
 * @returns {number}
 */
function normalcdf(X){   //HASTINGS.  MAX ERROR = .000001
    var T=1/(1+.2316419*Math.abs(X));
    var D=.3989423*Math.exp(-X*X/2);
    var Prob=D*T*(.3193815+T*(-.3565638+T*(1.781478+T*(-1.821256+T*1.330274))));
    if (X>0) {
        Prob=1-Prob
    }
    return Prob
}