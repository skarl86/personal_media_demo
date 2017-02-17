/**
 * Created by NK on 2017. 2. 16..
 */

var lines = ["<http://www.personalmedia.org/soongsil-diquest#hasWhatBehavior> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#ObjectiveProperty> .",
    "<http://www.personalmedia.org/soongsil-diquest#hasThumb> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#ObjectiveProperty> ."
]
console.log(eraseURIs(lines));

function eraseURIs(lines){
    for (var index in lines){
        console.log(eraseURI(lines[index]));
    }
}
function eraseURI(line) {
    console.log(line);
    var spo = line.split(" ");
    //var match = /<http?:\/\/?[\da-z\.-]+\.[a-z\.]{2,6}[\/\w_\.-]*\/?#([\w].+)>/.exec(line);
    var match1 = /<http?:\/\/?[\da-z\.-]+\.[a-z\.]{2,6}[\/\w_\.-]*\/?#([\w].+)>/.exec(spo[0]);
    var match2 = /<http?:\/\/?[\da-z\.-]+\.[a-z\.]{2,6}[\/\w_\.-]*\/?#([\w].+)>/.exec(spo[1]);
    var match3 = /<http?:\/\/?[\da-z\.-]+\.[a-z\.]{2,6}[\/\w_\.-]*\/?#([\w].+)>/.exec(spo[2]);

    if(!match1 && !match2 && !match3){
        throw new Error('Not an ISO Date: ' + line);
    }

    return "<" + match1[1] + "> " + "<" + match2[1] + "> " + "<" +match3[1] + "> .\n";
}