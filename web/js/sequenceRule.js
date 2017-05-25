/**
 * Created by Namgee on 2017. 2. 18..
 */
// var infList = [["M_Activity_실내_Empty", "M_Activity_Empty_집", "BabyToddleActivity", "M_Activity_걸음마하다_집", "BabyActivity", "M_Activity_집_Empty", "M_Activity_걸음마하다_Empty"],
//     ["M_Activity_Empty_집","BabyActivity"]];
// findMatchedEvent(infList, "TodEvent<-BabyToddleActivity<<BabyActivity");
function findMatchedEvent(inferList, rule) {
    var temp = rule.split("<-");
    var goal = temp[0];
    var seqList = temp[1].split("<<");

    var totalCandidate = [];
    for(var i in inferList){
        var infer = inferList[i];
        var tempCand = [];
        for(var h in infer){
            if(seqList.includes(infer[h])){
                tempCand.push(infer[h]);
            }
        }
        totalCandidate.push(tempCand);
    }

    var isMatched = false;
    for(var k in totalCandidate){
        var candList = totalCandidate[k];
        for(var f in candList){
            if(candList[f] == seqList[k]){
                isMatched = true;
            }
        }
    }

    return [isMatched ? goal : "", totalCandidate];
}
function getSequenceRuleList(rule) {
    var temp = rule.split("<-");
    var goal = temp[0];
    return temp[1].split("<<");
}
function getMatchedList(seqList, inferList) {
    var tempCand = [];
    for(var i in inferList){
        var infer = inferList[i];
        if(seqList.includes(inferList[i])){
            tempCand.push(infer);
        }
    }
    return tempCand;
}