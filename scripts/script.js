function openNav() {
	document.getElementById("mySidenav").style.width = "250px";
	document.getElementById("main").style.marginLeft = "250px";
	document.getElementById("open").style.display = "none";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
	document.getElementById("main").style.marginLeft = "0";
	document.getElementById("open").style.display = "block";
}

navbool = true;
function navclose(){
	closeNav();
	
	navbool = false;
}
function navopen(){
	openNav();
	
	navbool = false;
}


var sticky = document.getElementById('navbar').offsetTop;



function stick() {

	if(window.window.pageYOffset < sticky){
		navbool = true;
	}
	if(navbool){
		if (window.pageYOffset > sticky) {
		document.getElementById('navbar').style.position = "fixed";
			openNav();

		} else {
			document.getElementById('navbar').style.position = "relative";
			closeNav();

		}
	}

}

window.onscroll = function () { stick() };