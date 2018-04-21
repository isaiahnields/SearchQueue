/* Queue.js contains all of the functions that are solely used on the queue.html page. */

// displays the import page which allows the user to import multiple terms
function openImport() {
    document.getElementById("import-prompt").style.display = "block";
}

// processes and saves the terms entered on the import page
function saveImport() {
    document.getElementById("import-prompt").style.display = "none";
    var searches = document.getElementById("import-text").value.split("\n");
    chrome.storage.local.get(["numSearches"], function (items) {
        for (i = 0; i < searches.length; i++) {
            addHelper(searches[i], i + 1 + items["numSearches"]);
        }
        chrome.storage.local.set({"numSearches": items["numSearches"] + searches.length});
    });
    document.getElementById("import-text").value = "";
}

// saves the prepended and appended phrases, as well as all terms
function save() {
    var searches = document.getElementsByClassName("searches");
    var terms = {};
    terms["prepend"] = document.getElementById("prepend").value;
    terms["append"] = document.getElementById("append").value;
    terms["numSearches"] = searches.length;
    for (i = 0; i < searches.length; i++) {
        terms["search" + i] =  searches[i].value;
    }
    chrome.storage.local.set(terms);
}

// clears all queued search terms
function clear() {
    var searches = document.getElementById("searches");
    while (searches.firstChild) {
        searches.removeChild(searches.firstChild);
    }
    save();
    chrome.storage.local.set({"numSearches": 0});
}

// removes the last term from the search queue
function remove() {
    var termDivs = document.getElementsByClassName("termDivs");
    var searchName = "search" + termDivs.length;
    termDivs[0].parentNode.removeChild(termDivs[termDivs.length - 1]);

    chrome.storage.local.get(["numSearches"], function (items) {
        chrome.storage.local.set({
            searchName: "",
            "numSearches": items.numSearches - 1
        });
    });
    save();
}

// helps the add function add a new search term
function addHelper(value, i) {
    // Creates a div for each term
    var div = document.createElement("div");
    div.classList.add("termDivs");

    // Creates a p to display each term
    var text = document.createElement("p");
    text.innerText = "Search " + i;
    text.align = "left";
    text.margin = "30px";
    document.getElementById("searches").appendChild(text);

    // Creates an input term
    var input = document.createElement("input");
    input.classList.add("searches");
    input.type = "text";
    input.value = value;
    input.addEventListener("change", save);

    // Appends the search items to div
    div.appendChild(text);
    div.appendChild(input);

    // Appends div to the searches list
    document.getElementById("searches").appendChild(div);
}

// adds a new search term
function add() {
    chrome.storage.local.get(["numSearches"], function (items) {
        addHelper(null, items.numSearches + 1)
        chrome.storage.local.set({
            "numSearches": items.numSearches + 1
        });
    });
}

// restores the queue editor page on load
function restore() {
    chrome.storage.local.get(null, function (items) {
        if (items["prepend"] != undefined) {
            document.getElementById("prepend").value = items["prepend"];
        }
        if (items["prepend"] != undefined) {
            document.getElementById("append").value = items["append"];
        }
        if (items["numSearches"] === undefined) {
            chrome.storage.local.set({"numSearches": 0});
        }
        if (items["index"] === undefined) {
            chrome.storage.local.set({"index": 0});
        }
        for (i = 0; i < items["numSearches"]; i++) {
            addHelper(items["search" + i], i + 1);
        }
    });
}

// restores queue editor page and links functions to their buttons
document.addEventListener('DOMContentLoaded', function () {
    restore();
    document.getElementById('import').addEventListener('click', openImport);
    document.getElementById('clear').addEventListener('click', clear);
    document.getElementById('add').addEventListener('click', add);
    document.getElementById('remove').addEventListener('click', remove);
    document.getElementById("save-import").addEventListener("click", saveImport);
});

// saves the queue editor terms before closing
window.addEventListener("beforeunload", function (e) {
    save();
}, false);

