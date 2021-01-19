let elementToObserve = window.document.getElementById('notifCont');
let knownNotifications = {};

/**
 * Reload previously stored notifications, if any. Assign an observer to site's native notification area.
 */
docReady(function () {
    knownNotifications = loadNotificationsFromStorage()
    console.log('Restored conjurer notifications: ' + JSON.stringify(knownNotifications));

    observer.observe(elementToObserve, {characterData: false, childList: true, attributes: false});

    // Create a placeholder for future notifications on a page
    let reporterDiv = document.getElementById('conjurerNotificationsContainer') || document.createElement("div");
    reporterDiv.id = 'conjurerNotificationsContainer';
    reporterDiv.innerHTML = '<ul id="conjurerNotificationsList"></ul>';
    document.getElementById("page").appendChild(reporterDiv);

    repaintList();
});

/**
 * Creates new popup in the list
 * @param data A notification object
 */
function newElement(data) {
    // console.log('Adding new item to conjurer panel', JSON.stringify(data));
    let newConjurerListItem = document.createElement("li");
    let newConjurerListItemContainer = document.createElement("div");
    newConjurerListItem.appendChild(newConjurerListItemContainer);

    let chatLinkItem = document.createElement("a");
    chatLinkItem.href = data.chatUrl;
    chatLinkItem.appendChild(document.createTextNode(data.messageTitle));
    newConjurerListItemContainer.appendChild(chatLinkItem);
    newConjurerListItemContainer.appendChild(document.createTextNode(':'));

    let messageTextItem = document.createElement("p");
    messageTextItem.appendChild(document.createTextNode(data.messageText));
    newConjurerListItemContainer.appendChild(messageTextItem);

    document.getElementById("conjurerNotificationsList").appendChild(newConjurerListItem);

    // close button
    let span = document.createElement("span");
    let txt = document.createTextNode('x');
    span.className = "conjurer-entry-close-button";
    span.appendChild(txt);
    newConjurerListItemContainer.appendChild(span);
    span.onclick = function () {
        let cToRemoveItem = this.parentElement.parentElement;
        cToRemoveItem.style.display = "none";
        delete knownNotifications[data.id];
        saveNotificationsToStorage();
    }
}

/**
 * Listen for native notification area changes. Parse popup contents when it appears and save the data.
 * @type {MutationObserver}
 */
let observer = new MutationObserver(function (mutationsList) {
    knownNotifications = loadNotificationsFromStorage();

    for (let mutation of mutationsList) {
        for (let node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;

            // console.log('notifCont popup data found: ', node);

            let messageText = node.getElementsByTagName("p")[0].innerText;
            let authorTitle = node.getElementsByTagName("a")[1].innerText;
            let profileUrl = node.getElementsByTagName("a")[1].href;
            let messageTitle = node.getElementsByTagName("a")[2].innerText;
            let chatUrl = node.getElementsByTagName("a")[2].href;

            if (messageText === '#{text}' && messageTitle === '#{title}') {
                continue;
            }
            let entryId = Date.now() + authorTitle;
            let entry = {
                'id': entryId,
                'messageText': messageText,
                'authorTitle': authorTitle,
                'profileUrl': profileUrl,
                'messageTitle': messageTitle,
                'chatUrl': chatUrl
            }
            knownNotifications[entryId] = entry;
            newElement(entry);
        }
    }

    saveNotificationsToStorage();
});

/**
 * Reload notifications from localStorage
 * @returns {any|{}}
 */
function loadNotificationsFromStorage() {
    return JSON.parse(localStorage.getItem('ipNotifications')) || {};
}

/**
 * Save known notifications to localStorage
 */
function saveNotificationsToStorage() {
    localStorage.setItem("ipNotifications", JSON.stringify(knownNotifications));
}

/**
 * Create a popup in the reserved area for each known notification
 */
function repaintList() {
    // console.log('Repaint request', knownNotifications);
    for (let id in knownNotifications) {
        newElement(knownNotifications[id]);
    }
}

/**
 * Call some function onDocumentReady (https://stackoverflow.com/a/9899701/6948900)
 * @param fn function callback
 */
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

/*
    // Trigger site's notification popup. For testing purposes
    $("#notifCont").notify("create",{url:'testUrl',username:'testUserName',title:'testTitle',text:'testText',img:''});
*/

/*
    // Intercept the call with devtools. This doesn't work easily with addons because of security reasons.

    console.log('Overriding showNotifications method')
    origShowNotifications = showNotifications;

    showNotifications = function (msgs) {
        for (var i = 0; i < msgs.length; i++) {
            // if (new RegExp("pm.php").test(window.location.href) && typeof msgs[i]["thread_id"] != "undefined" && get_active_thread_id() == msgs[i]["thread_id"]) {
            //     continue
            // }
            if (document.readyState !== "complete") {
                return
            }
            console.log(msgs[i].url, msgs[i].username, msgs[i].text)
        }
        return origShowNotifications(msgs);
    };
    console.log('Overriding showNotifications complete', showNotifications)
*/