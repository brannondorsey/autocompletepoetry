var replaceChar = "█" // black box
var input = "";
var output = "";
var inputSentence; 


function autoSuggest(textValue) {

    var lastCharacter = textValue.charAt(textValue.length - 1);
    
    if (lastCharacter == '.') {
        

        // remove the last period, we will add it back later
        textValue = textValue.substring(0, textValue.length - 1);
        var previousPeriodIndex = textValue.lastIndexOf('.');

        // if there is more than one sentence
        if (previousPeriodIndex != -1) {
            inputSentence = textValue.substring(previousPeriodIndex + 1, textValue.length).trimLeft();
        } else { // if this is the first sentence
            inputSentence = textValue.trimLeft();
        }
        // console.log(inputSentence);
        $.getJSON("http://suggestqueries.google.com/complete/search?callback=?", {
            "jsonp": "onAutoSuggestRecieved",
            "q": inputSentence, // query term                
            "client":"youtube" // a hack to return results as json
        });
    }
}

function onAutoSuggestRecieved(data) {
    
    // console.log(data);
    var suggestions = [];

    $.each(data[1], function(key, val) {
        suggestions.push({"value":val[0]});
    });
    suggestions.length = 5; // prune suggestions list to only 5 item

    if (typeof suggestions[0] !== 'undefined') {
        
        // edit output
        var autoSuggestion = uCFirst(suggestions[0].value);
        output += ' ' + autoSuggestion + '.';
        $('#output').text(output);
        
        // edit input
        var originalWords = [];

        var newInputWords = [];
        var wordMatches = []; // keeps track of input words that remain the same when converted to output
        var inputWords = inputSentence.split(' ');
        
        var autoSuggestionWords = autoSuggestion.split(' ');
        
        // loop through all output words...
        for (var i = 0; i < autoSuggestionWords.length; i++) {

            var newInputWord;
            var autoSuggestWord = autoSuggestionWords[i].toLowerCase();
            console.log('autoSuggestWord: ', autoSuggestWord);
            
            // and check if any of the input words match
            for (var j = 0; j < inputWords.length; j++) {
                
                var inputWord = inputWords[j];
                
                if (inputWord != "") {

                    // if a match hasn't already been found for this word
                    if (wordMatches.indexOf(inputWord) == -1) {

                        // if the new output word IS OR CONTAINS the previous input word
                        if (autoSuggestWord.indexOf(inputWord) != -1) {

                            console.log('inputWord: ' + inputWord);
                            
                            newInputWord = autoSuggestWord.replace(new RegExp('(' + inputWord + ')|.','gi'), function(c) {
                                return c === inputWord ? c : replaceChar;
                            });

                            console.log('newInputWord: ' + newInputWord);

                            // originalWords.push(inputWord);
                            // wordMatches.push(inputWord);
                            console.log(wordMatches);

                        } else {
                            console.log('fired else');
                            newInputWord = new Array(autoSuggestWord.length + 1).join(replaceChar);
                        }
                        
                        wordMatches.push(inputWord);
                    }
                }
            }

            newInputWords.push(newInputWord);
            console.log(newInputWords);          
        }

        // console.log(wordMatches);

        input += ' ' + uCFirst(newInputWords.join(' ')) + '.';

        // update the input
        $('#input').val(input.trimLeft());
    
    }
}


function uCFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
    