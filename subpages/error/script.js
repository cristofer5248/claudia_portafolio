var bluescreen = document.getElementById('bluescreen'),
  // isInIFrame = (window.location != window.parent.location) ? true : false;
  isInIFrame = window.location.href.indexOf('s.codepen.io/eky/fullpage/') >= 0 ? true : false;
  fullscreen = document.getElementById('fullscreen'),
  isFs = false,
  notSupportFullscreenAPI = !fullscreen.webkitRequestFullScreen && !fullscreen.mozRequestFullScreen && !fullscreen.requestFullScreen;

// Outdated stuff
isInIFrame = false;

if(notSupportFullscreenAPI){
  document.getElementById('click').innerHTML = 'Your browser does not support full screen API.';
  document.getElementById('owata').innerHTML = "／^o^＼";
}else if(isInIFrame){
  document.getElementById('click').innerHTML = 'Please view in <a href="https://codepen.io/eky/pen/xlwhH" target="_parent">editor page</a>.';
  document.getElementById('owata').innerHTML = "／^o^＼";
}else{
  var target = document.getElementById('click');
  target.addEventListener("click", function(event){
  	if(fullscreen.webkitRequestFullScreen)
			fullscreen.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		else if(fullscreen.mozRequestFullScreen)
			fullscreen.mozRequestFullScreen();
    else
      fullscreen.requestFullScreen();
	}, false);
	
	var screenRatio = screen.width/screen.height;
	bluescreen.style.height = 640/screenRatio+'px';
	if(fullscreen.mozRequestFullScreen)
		bluescreen.style.marginTop = '-'+(640/screenRatio/2)+'px';
	var widthRatio = screen.width/640;
	var heightRatio = screen.height/(480/screenRatio);
	
	var fsChange = function(event){
		if(!isFs){
			bluescreen.style.WebkitTransform = 'scale('+widthRatio+')';
			bluescreen.style.MozTransform = 'scale('+widthRatio+')';
			bluescreen.style.transform = 'scale('+widthRatio+')';
			bluescreen.style.transformOrigin = '0 0';
		}
		isFs = isFs ? false : true;
	};
	
	fullscreen.onwebkitfullscreenchange = fsChange;
	fullscreen.onmozfullscreenchange = fsChange;
	fullscreen.onfullscreenchange = fsChange;
}