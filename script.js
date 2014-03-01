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
        
        $.getJSON("http://suggestqueries.google.com/complete/search?callback=?", {
            "jsonp": "onAutoSuggestRecieved",
            "q": inputSentence, // query term                
            "client":"youtube" // a hack to return results as json
        });
    }
}

function onAutoSuggestRecieved(data) {
    
    // console.log(data);
    var suggestions = []; // declare new array
    var results = data[1];

    for (var i = 0; i < results.length; i++) {
        var value = results[i][0];
        suggestions.push(value);
    }

    var randomIndex = Math.floor(Math.random() * suggestions.length);
    var suggestion = suggestions[randomIndex];

    if (typeof suggestion !== 'undefined') {
        
        // edit output
        var autoSuggestion = uCFirst(suggestion);
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

            var autoSuggestWord = autoSuggestionWords[i].toLowerCase();

            var newInputWord;
            var matchFound = false;

            // and check if any of the input words match
            for (var j = 0; j < inputWords.length; j++) {
                
                var inputWord = inputWords[j];
                
                if (inputWord != "") {

                    // if the new output word IS OR CONTAINS the previous input word
                    if (autoSuggestWord.indexOf(inputWord.toLowerCase()) != -1) {

                        newInputWord = autoSuggestWord.replace(new RegExp('(' + inputWord + ')|.','gi'), function(c) {
                            return c === inputWord.toLowerCase() ? c : replaceChar;
                        });

                        matchFound = true;
                        // console.log('match found for "' + newInputWord + '" when checking against "' + autoSuggestWord + '"'); 
                        break; //break out of `j` for loop

                    } 

                    // else {
                    //     console.log('match NOT found for "' + inputWord + '" when checking against "' + autoSuggestWord + '"');
                    // }
                }
            }
            
            if (!matchFound) {
                newInputWord = new Array(autoSuggestWord.length + 1).join(replaceChar);
            }

            newInputWords.push(newInputWord);      
        }

        input += ' ' + uCFirst(newInputWords.join(' ')) + '.';

        // update the input
        $('#input').val(input.trimLeft());
    
    }
}

function uCFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// removes the last sentence
function undo() {

    var input = $('#input').val();
    var appendChar = (input.split('.').length - 1 > 2) ? '.' : '';
    input = input.substring(0, input.length - 1); // remove last period
    $('#input').val(input.substring(0, input.lastIndexOf('.')) + appendChar);

    var output = $('#output').text();
    output = output.substring(0, output.length - 1); // remove last period
    $('#output').text(output.substring(0, output.lastIndexOf('.')) + appendChar);
}
    