// Augo Suggest Hack: http://shreyaschand.com/blog/2013/01/03/google-autocomplete-api/

var replaceChar = "█" // black box
var input = ""; // holds all of the input text
var output = ""; // holds all of the output text
var inputSentence; // holds the last input sentence

// called when a "." is intered into input field
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
        
        // make a request to the Google auto suggest API. 
        // Will call onAutoSuggestRecieved() when data is loaded
        $.getJSON("http://suggestqueries.google.com/complete/search?callback=?", {
            "jsonp": "onAutoSuggestRecieved",
            "q": inputSentence, // query term                
            "client":"youtube" // a hack to return results as json
        });
    }
}

// called when autoSuggest recieves data from Google
function onAutoSuggestRecieved(data) {
    
    // console.log(data);
    var suggestions = []; // declare new array to hold suggestions
    var results = data[1];

    // populate the suggestions array with the autocomplete suggestions from Google
    for (var i = 0; i < results.length; i++) {
        var value = results[i][0];
        suggestions.push(value);
    }

    // pick a random auto suggestion
    var randomIndex = Math.floor(Math.random() * suggestions.length);
    var suggestion = suggestions[randomIndex];

    // if any results were found...
    if (typeof suggestion !== 'undefined') {
        
        // edit output
        var autoSuggestion = uCFirst(suggestion); // capitalize the suggestion
        output += ' ' + autoSuggestion + '.';
        $('#output').text(output);

        console.log('auto suggestion: ' + autoSuggestion);
        
        // edit input
        var newInputWords = [];
        var inputWords = inputSentence.split(' ');
        var autoSuggestionWords = autoSuggestion.split(' ');
        
        // loop through all output words...
        for (var i = 0; i < autoSuggestionWords.length; i++) {

            var autoSuggestWord = autoSuggestionWords[i].toLowerCase();

            var newInputWord;
            var matchFound = false;

            // and check if any of the input words match...
            for (var j = 0; j < inputWords.length; j++) {
                
                var inputWord = inputWords[j];
                
                if (inputWord != "") {

                    // if the new output word IS OR CONTAINS the previous input word
                    if (autoSuggestWord.indexOf(inputWord.toLowerCase()) != -1) {

                        // replace the new characters with replaceChar.
                        // i.e. "with" -> "without" would become "with███" 
                        newInputWord = autoSuggestWord.replace(new RegExp('(' + inputWord + ')|.','gi'), function(c) {
                            return c === inputWord.toLowerCase() ? c : replaceChar;
                        });

                        matchFound = true;
                        break; //break out of `j` for loop

                    } 
                }
            }
            
            // if this word wasn't included in the input because it was
            // auto suggested in its entirety
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

// removes the last sentence
function undo() {

    var appendChar = (input.split('.').length - 1 > 1) ? '.' : '';
    input = input.substring(0, input.length - 1); // remove last period
    input = input.substring(0, input.lastIndexOf('.')) + appendChar;
    input = input.trimLeft();
    $('#input').val(input);

    output = output.substring(0, output.length - 1); // remove last period
    output = output.substring(0, output.lastIndexOf('.')) + appendChar;
    output = output.trimLeft();
    $('#output').text(output);
}

// helper function to capitalize the first letter in a string
function uCFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

    