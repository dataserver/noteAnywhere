// console.log('inject.js');
$(function() {

function unixTime(unix_timestamp) {

    return moment.unix(unix_timestamp).format("YYYY-MM-DD HH:mm");;
}
function grabNote(id) {
    let note = {};
    let pos = $('#sna-note-'+ id +'').position();
    let $this = $('#sna-note-textarea-'+ id +'');
    // let postion_ts = $('.sna-draggable[data-id="'+ id +'"]').attr('data-position-ts');

    note.id = id;
    note.pleft = Math.floor( pos.left);
    note.pleft = (note.pleft < 0)? 0 : note.pleft;
    note.ptop = Math.floor( pos.top );
    note.ptop = (note.ptop < 0)? 0 : note.ptop;
    note.txt = $this.val();
    note.ts = Math.floor( $this.attr('data-ts') );
    note.url = $this.attr('data-url');

    return note;
}
function updateNote(id) {
    let note = {};
    let pos = $('#sna-note-'+ id +'').position();
    let $this = $('#sna-note-textarea-'+ id +'');
    // let postion_ts = $('.sna-draggable[data-id="'+ id +'"]').attr('data-position-ts');

    note.id = id;
    note.pleft = Math.floor( pos.left);
    note.pleft = (note.pleft < 0)? 0 : note.pleft;
    note.ptop = Math.floor( pos.top );
    note.ptop = (note.ptop < 0)? 0 : note.ptop;
    note.txt = $this.val();
    note.ts = Math.floor( $this.attr('data-ts') );
    note.url = $this.attr('data-url');

    chrome.runtime.sendMessage({
        cmd: "bg_update_note",
        id: id,
        data : note
    });

    return true;
}
function getNoteHtml(note) {
    let url_to_src = chrome.extension.getURL('icons/icon19.png');
    let zindex = highestZ++;

    return `
<div id="sna-note-`+ note.id +`" class="sna-draggable sna-note-css" style="position:absolute; z-index:`+ zindex +`;left:`+ note.pleft +`px;top:`+ note.ptop+`px;" data-id="`+ note.id +`">
    <div style="font-size:18px;">
        <span style="float:left;"><span class="sna-note-handle" data-id="`+ note.id +`" style="cursor: move;"><img src="`+url_to_src+`"> Note &nbsp; &nbsp; </span></span>
        <span style="float:right;"><span class="sna-note-act-delete" data-id="`+ note.id +`" title="delete note" style="cursor:pointer;"><i class="material-icons md-20">&#xE92B;</i></span></span>
    </div>
    <div style="clear: both;"></div>
    <textarea type="textarea" name="sna-note-textarea-`+ note.id +`" id="sna-note-textarea-`+ note.id +`" class="sna-note-textarea" data-id="`+ note.id +`" data-ts="`+ note.ts +`" data-url="`+ note.url +`" rows="5">`+ note.txt +`</textarea>
    <div style="clear: both;"></div>
    <div style="font-size:11px;">
        <span class="sna-note-text-ts" data-id="`+ note.id +`" style="float:left;">`+ unixTime(note.ts) +`</span>
        <span class="sna-note-change-status nochange" data-id="`+ note.id +`" style="float:right;">no change</span>
    </div>
</div>
`;
}
function injectNotes(data=[]) {
    if (data.length > 0) {
        $.each(data, function(key, value){
            //console.log('each value', value );
            $('#sna-notes-wrapper').append( getNoteHtml(value) );
        });
    }
    return true;
}
function dragMoveListener (event) {
    let target = event.target;
    // keep the dragged position in the data-x/data-y attributes
    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform = 'translate(' + x + 'px, ' + y + 'px)';
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}



let highestZ = 1 + maxZIndex();
let html_head_append = `
<link type="text/css" id="sna-notes-css-link" rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<style type="text/css" id="sna-notes-style">
</style>
`;
let html_body_append = `<div id="sna-notes-wrapper"></div>`;
//let curr_page = window.location.href;
// no #anchor or ?query string
//let curr_page = location.protocol+'//'+location.hostname+(location.port?":"+location.port:"")+location.pathname+(location.search?location.search:"");
let curr_page = [location.protocol, '//', location.host, location.pathname].join('');
//console.log('curr_page', curr_page);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // console.log(request);
        //console.log(sender);
        switch(request.cmd) {
            case "content_new_note":
                let note = {};

                note.id = genGUID();
                note.url = curr_page;
                note.ts = Math.floor(Date.now()/1000);
                note.pleft = (window.pageXOffset + Math.round(Math.random() * (window.innerWidth - 150)));
                note.ptop = (window.pageYOffset + Math.round(Math.random() * (window.innerHeight - 200)));
                note.txt = '';
                
                chrome.runtime.sendMessage({
                    cmd: "bg_insert_note",
                    data : note
                });
                $('#sna-notes-wrapper').append( getNoteHtml(note) );

                break;
            case "content_build_notes":
                injectNotes(request.data);
                break;
            case "content_build_single_note":
                injectNotes(request.data);
                break;
            case "content_delete_all_notes_from_page":
                let ids = [];

                $('.sna-note-textarea').each(function(){
                    let id = $(this).attr('data-id');
                    ids.push(id);
                    $('#sna-note-'+ id +'').remove();
                });
                chrome.runtime.sendMessage({
                    cmd: "bg_delete_notes",
                    data : {
                        url: curr_page,
                        ids: ids
                    }
                });
                break;
            case "content_update_badge":
                chrome.runtime.sendMessage({
                    cmd: "bg_update_badge",
                    data : {
                        url: curr_page,
                        text: $('.sna-note-textarea').length
                    }
                });
                break;
            default:
                console.log(request);
        }


        return true;
    }
);

window.onload = function() {
    $('head').append( html_head_append );
    $('body').append( html_body_append );

    chrome.runtime.sendMessage({
        cmd: "bg_get_notes",
        url: curr_page
    });

    $('body').on('click', '.sna-note-act-delete', function() {
        let id = $(this).attr('data-id');
        let ids = [];

        ids.push(id);
        $('#sna-note-'+ id).remove();
        chrome.runtime.sendMessage({
            cmd: "bg_delete_notes",
            data: {
                url: curr_page,
                ids: ids
            }
        });

        return false;
    });

    let timeoutId;
    $('body').on('keypress', '.sna-note-textarea', function () {
        let id = $(this).attr('data-id');

        $(this).attr('data-ts', Math.floor(Date.now()/1000) );
        $('.sna-note-change-status[data-id="'+ id +'"]').attr('class', 'sna-note-change-status pending').text('changes pending');
        // If a timer was already started, clear it.
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        // Set timer that will save comment when it fires.
        timeoutId = setTimeout(function () {
            // Make ajax call to save data.
            let ts = Math.floor(Date.now()/1000);
            $(this).attr('data-ts', ts );
            $('.sna-note-text-ts').text( unixTime(ts) );
            let note = grabNote(id);
            chrome.runtime.sendMessage({
                cmd: "bg_update_note",
                id: id,
                data : note
            });
            $('.sna-note-change-status[data-id="'+ id +'"]').attr('class', 'sna-note-change-status saved').text('changes saved');
        }, 850); // 850ms
    });

    // target elements with the "draggable" class
    interact('.sna-draggable')
        .allowFrom('.sna-note-handle')
        .draggable({
            hold: 1000,
            restrict: { // keep the element within the area of it's parent
                restriction: parent,
                endOnly: true,
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            },
            autoScroll: true, // enable autoScroll
            onmove: dragMoveListener, // call this function on every dragmove event
            onend: function (event) { // call this function on every dragend event
                let id = event.target.getAttribute('data-id');
                let note = grabNote(id);
                chrome.runtime.sendMessage({
                    cmd: "bg_update_note",
                    id: id,
                    data : note
                });
            }
    });
}



});
