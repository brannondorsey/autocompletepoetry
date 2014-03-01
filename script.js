var replaceChar = "█" // black box
var input = "";
var output = "";
var previousSentence; 


function autoSuggest(textValue) {

    var lastCharacter = textValue.charAt(textValue.length - 1);
    
    if (lastCharacter == '.') {
        

        // remove the last period, we will add it back later
        textValue = textValue.substring(0, textValue.length - 1);
        var previousPeriodIndex = textValue.lastIndexOf('.');

        // if there is more than one sentence
        if (previousPeriodIndex != -1) {
            previousSentence = textValue.substring(previousPeriodIndex + 1, textValue.length).trimLeft();
        } else { // if this is the first sentence
            previousSentence = textValue.trimLeft();
        }
        // console.log(previousSentence);
        $.getJSON("http://suggestqueries.google.com/complete/search?callback=?", {
            "jsonp": "onAutoSuggestRecieved",
            "q": previousSentence, // query term                
            "client":"youtube" // a hack to return results as json
        });
    }
}

function onAutoSuggestRecieved(data) {
    console.log('recieved');
    // console.log(data);
    var suggestions = [];

    $.each(data[1], function(key, val) {
        suggestions.push({"value":val[0]});
    });
    suggestions.length = 5; // prune suggestions list to only 5 item

    if (typeof suggestions[0] !== 'undefined') {
        
        // edit output
        var newestOutputSentence = uCFirst(suggestions[0].value);
        output += ' ' + newestOutputSentence + '.';
        $('#output').text(output);
        
        // edit input
        var newInputWords = [];
        var wordMatches = [];
        var previousWords = previousSentence.split(' ');
        var newestOutputWords = newestOutputSentence.split(' ');
        
        // loop through all output words...
        for (var i = 0; i < newestOutputWords.length; i++) {

            var newOutputWord = newestOutputWords[i];

            // and check if any of the input words match
            for (var j = 0; j < previousWords.length; j++) {
                var previousInputWord = previousWords[j];
                if (previousWords[j] != "") {

                    var newInput;
                    // if the new output word IS OR CONTAINS the previous input word
                    // AND a match hasn't already been found for this word
                    if (newOutputWord.indexOf(previousInputWord) != -1 &&
                        wordMatches.indexOf(previousInputWord) == -1) {
                        newInput = newOutputWord.replace(new RegExp('(^' + previousInputWord + ')', 'i'), function(match){
                            //generates a string of replaceChars that is the length of match
                            return new Array(match.length).join(replaceChar);
                        });
                        wordMatches.push(previousInputWord);
                    } else {
                        newInput = new Array(newOutputWord.length).join(replaceChar);
                    }
                }
            }

            newInputWords.push(newInput);            
        }

        input += ' ' + uCFirst(newInputWords.join(' ')) + '.';
        console.log(input);

        // console.log($('textarea#input')[0]);
        $('#input').val(input);
    
    }

    function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

}


function uCFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
    