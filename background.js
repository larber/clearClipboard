//https://stackoverflow.com/questions/3436102/copy-to-clipboard-in-chrome-extension/18455088#18455088
function copyTextToClipboard(text) {
    //Create a textbox field where we can insert text to. 
    var copyFrom = document.createElement("textarea");

    //Set the text content to be the text you wished to copy.
    copyFrom.textContent = text;

    //Append the textbox field into the body as a child. 
    //"execCommand()" only works when there exists selected text, and the text is inside 
    //document.body (meaning the text is part of a valid rendered HTML element).
    document.body.appendChild(copyFrom);

    //Select all the text!
    copyFrom.select();

    //Execute command
    document.execCommand('copy');

    //(Optional) De-select the text using blur(). 
    copyFrom.blur();

    //Remove the textbox field from the document.body, so no other JavaScript nor 
    //other elements can get access to this.
    document.body.removeChild(copyFrom);
}


chrome.runtime.onInstalled.addListener(function() { console.log("clearClipboard extension loaded"); });

var incognitoIds = new Set();

function checkIncognitoId(id)
{
    if(incognitoIds.has(id))
    {
        copyTextToClipboard(" ");
        console.log("clipboard cleared due to incognito id " + id + " closed");
        incognitoIds.delete(id);
    }
}

chrome.windows.onRemoved.addListener(function(windowId){ checkIncognitoId(windowId); });  
chrome.tabs.onRemoved.addListener(function(tabId){ checkIncognitoId(tabId); });

chrome.windows.onCreated.addListener(function(window) {
    if(window.incognito)
    {
        console.log("adding incognito window id " + window.id );
        incognitoIds.add(window.id);
    }
});

chrome.tabs.onCreated.addListener(function(tab) {
    if(tab.incognito)
    {
        console.log("adding incognito tab id " + tab.id );
        incognitoIds.add(tab.id);
    }
});
