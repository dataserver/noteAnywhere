// console.log('background.js');
(function() {
updateBadge = function ({text="", url="",data=[]}={}) {
    let badge_text = data.length;

    if (text !="" || text!=0) {
        chrome.browserAction.setBadgeBackgroundColor({ color: "#000000"});
        chrome.browserAction.setBadgeText({text: ''+ text});
        return;
    }
    if (url=="") {
        badge_text = "";
    } else {
        if ( data.length>0 ) {
            found = _.filter(data, {'url': url});
        } else {
            found = _.filter(storage_data, {'url': url});
        }
        let count = found.length;
        if (count > 0) {
            badge_text = count;
        } else {
            badge_text = '';
        }
    }    
    chrome.browserAction.setBadgeBackgroundColor({ color: "#000000"});
    chrome.browserAction.setBadgeText({text: ''+ badge_text});
}

let storage_data = [];
let data = [];
chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.sendMessage(activeInfo.tabId, {
        cmd: "content_update_badge"
        // ,response: "Message received",
        //data: data
    });
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    chrome.storage.local.get(["notesdb"], function(storage_result) {
        storage_data = storage_result.notesdb;
        // let db = new loki('loki.json');
        // let dbnotes = db.addCollection('notes');
        // dbnotes.insert(storage_data);
        if (storage_data.constructor !== Array) {
            storage_data = [];
        }
        switch(request.cmd) {
            case "bg_get_notes":
                data = _.filter(storage_data, {'url': request.url});
                //console.log(sender);
                chrome.tabs.sendMessage(sender.tab.id, {
                    cmd: "content_build_notes",
                    // response: "Message received",
                    data: data
                });
                updateBadge({
                    text: data.length
                });
                break;
            case "bg_insert_note":
                data = storage_data;
                data.push(request.data);
                chrome.storage.local.set({"notesdb": data}, function() {
                    if (!chrome.runtime.lastError) {
                        chrome.tabs.sendMessage(sender.tab.id, {
                            cmd: "content_build_single_note",
                            // response: "Success: db : note inserted",
                            data: request.data
                        });
                    }
                });
                updateBadge({
                    url: sender.tab.url,
                    data: data
                });
                break;
            case "bg_update_note":
                let note = request.data;
                
                data = _.filter(storage_data, function(e) {
                    return e.id !== note.id;
                });
                data.push(note);
                chrome.storage.local.set({"notesdb": data}, function() {
                    //
                });
                break;
            case "bg_delete_notes":
                let ids = request.data.ids;
                // let url = request.data.url;
                data = _.filter(storage_data, (v) => !_.includes(ids, v.id));
                // data = _.filter(storage_data, function(e) {
                //     return e.url !== url;
                // });
                // console.log(data);
                chrome.storage.local.set({"notesdb": data}, function() {
                    // if (!chrome.runtime.lastError) {
                    //     chrome.tabs.sendMessage(sender.tab.id, {
                    //         response: "Success: page : all notes deleted",
                    //         cmd: "log",
                    //         data: ids
                    //     });
                    // }
                    updateBadge({
                        url: sender.tab.url,
                        data: data
                    });
                });
                break;
            case "bg_update_badge":
                data = request.data;
                updateBadge({
                    url: data.url,
                    text: data.text
                    // data: data
                });
                break;
            default:
                console.log(request);
                
        }


    });

    return true;
});


})();