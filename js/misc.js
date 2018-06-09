function maxZIndex() {
	let elems = document.getElementsByTagName('body *');
	let highest = 0;

	for (let i=0; i<elems.length; i++) {
		let zindex = document.defaultView.getComputedStyle(elems[i],null).getPropertyValue("z-index");
		if ((zindex > highest) && (zindex != 'auto')) {
			highest = zindex;
		}
	}
	return highest;
}
function S4() {

    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function genGUID() {
    let guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();

    return guid;
}
