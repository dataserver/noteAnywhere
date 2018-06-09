// console.log('popup.js');

$(function() {

    $('#addNote').click(function(){
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            let currentTab = tabs[0];

            chrome.tabs.sendMessage(currentTab.id, {
                cmd: "content_new_note"
            });
            window.close();
        });
    });
    $('#deleteAllNotes').click(function(){
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            let currentTab = tabs[0];

            chrome.tabs.sendMessage(currentTab.id, {
                cmd: "content_delete_all_notes_from_page"
            });
            window.close();
        });
    });
});
