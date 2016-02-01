var showList = [
  ["Arrested Development", "http://www.netflix.com/title/70140358"],
  ["The West Wing", "http://www.netflix.com/title/70157152"],
  ["Doctor Who", "http://www.netflix.com/title/70142441"],
  ["30 Rock", "http://www.netflix.com/title/70136124"],
  ["Planet Earth", "http://www.netflix.com/title/70219642"],
  ["The Office", "http://www.netflix.com/title/70136120"],
  ["Freaks and Geeks", "http://www.netflix.com/title/70253797"],
  ["Peep Show", "http://www.netflix.com/title/70217140"],
  ["Mad Men", "http://www.netflix.com/title/70136135"],
  ["Buffy the Vampire Slayer", "http://www.netflix.com/title/70140365"]
];

/*
show 0 Mad Men
show 1 Three Kings
show 2 Three Musketeers
show 3 Kings And Queens

word
1 Mad
2 Three
3 Kings
4 Men
5 Musketeers
6 And
7 Queens

Graph
1 Mad: {4:4}
2 Three: {3:5, 5:6}
3 Kings: {6:7}
4: {0:0}  Mad Men
5: {0:1}  Three Kings
6: {0:2}  Three Musketeers
7: {7:8}
8: {0:3}  Kings and Queens
*/

var dict = {};
var nextWordId = 1;
function getWordId(word) {
  if (dict.hasOwnProperty(word)) return dict[word];
  var wordId = nextWordId++;
  dict[word] = wordId;
  return wordId;
};
function getWordIdIfExists(word) {
  return (dict.hasOwnProperty(word)) ? dict[word] : 0;
};

var graph = {};
var nextGraphNodeId = 1;
function getNextNodeIdIfExists(fromNodeId, nextWordId) {
  if (graph.hasOwnProperty(fromNodeId)) {
    if (graph[fromNodeId].hasOwnProperty(nextWordId)) {
      return graph[fromNodeId][nextWordId];
    }
  }
  return 0;
}

showList.forEach(function(showInfo) {
  var firstWord = showInfo[0].split(" ")[0];
  graph[getWordId(firstWord)] = {};
  nextGraphNodeId++;
});
var maxStartingNodeId = nextGraphNodeId;

showList.forEach(function(showInfo, idx) {
  var curNodeId = 0;
  showInfo[0].split(" ").forEach(function(word) {
    var wordId = getWordId(word);
    if (curNodeId == 0) {
      curNodeId = wordId;
    }
    else if (graph[curNodeId].hasOwnProperty(wordId)) {
      curNodeId = graph[curNodeId][wordId];
    }
    else {
      var nextNodeId = nextGraphNodeId++;
      graph[curNodeId][wordId] = nextNodeId;
      graph[nextNodeId] = {};
      curNodeId = nextNodeId;
    }
  });
  graph[curNodeId][""] = idx;
});

//console.log(JSON.stringify(dict, null, 1));
//console.log(JSON.stringify(graph, null, 1));

$(document).ready(function() {
  var textNodes = $("*:not(iframe)").contents().filter(function() {
    return this.nodeType === 3;
  });
  textNodes.each(function() {
    var words = this.nodeValue.split(" ");
    var newText = [];
    var cutBegin = 0;
    for (i=0; i<words.length; ++i) {
      var nodeId = getWordIdIfExists(words[i]);
      if (nodeId == 0 || nodeId >= maxStartingNodeId) continue;
      for (j=i+1; nodeId > 0 && j<words.length; ++j) {
        var nextWordId = getWordIdIfExists(words[j]);
        if (nextWordId == 0) break;
        nodeId = getNextNodeIdIfExists(nodeId, nextWordId);
        if (graph[nodeId].hasOwnProperty("")) break;
      }
      if (nodeId > 0 && graph[nodeId].hasOwnProperty("")) {
        console.log(words + " node " + nodeId);
        var showId = graph[nodeId][""];
        if (cutBegin != i) {
            var preceding = document.createElement("div");
            preceding.innerHTML = words.slice(cutBegin, i).join(" ");
            newText.push(preceding);
        }
        var showName = document.createElement("div");
        showName.innerHTML = '<a href="' + showList[showId][1] + '">' + words.slice(i, j+1).join(" ") + ' (is on Netflix)</a>';
        newText.push(showName);
        i = j+1;
        cutBegin = i;
      }
    }
    if (newText.length > 0) {
      if (cutBegin != words.length) {
          var trailing = document.createElement("div");
          trailing.innerHTML = words.slice(cutBegin, words.length).join(" ");
          newText.push(trailing);
      }
      var textNode = this;
      newText.forEach(function(divElem) {
        textNode.parentNode.insertBefore(divElem.firstChild, textNode);
      });
      textNode.parentNode.removeChild(textNode);
    }
  });
});
