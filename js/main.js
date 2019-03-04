// Variables

var _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;
var _then;
var _gameWindow;
var globalCtx;


var startGame = function() {
	_then = Date.now()
	
	var body = document.getElementsByTagName("BODY")[0];
	body.style.backgroundColor = 'rgba(5, 14, 16, 1)';
	// body.style.backgroundColor = 'rgba(40, 40, 40, 1)';

	var canvas = document.getElementById("gameCanvas");
	canvas.style.backgroundColor = 'rgba(5, 14, 16, 1)';
	document.body.appendChild(canvas);

	globalCtx = canvas.getContext("2d");

	var startView = new BootSequenceView();
	startView.frame = {x: 0, y:0, width: canvas.width, height: canvas.height};

	_gameWindow = new GameWindow(canvas, startView);

	startView.startBoot();

	// var file = kFiles[2];
	// var frame = {x: 0, y:0, width: canvas.width, height: canvas.height};
	// var gameView = new GameView(file, frame);

	// _gameWindow = new GameWindow(canvas, gameView);

	main();
}

var main = function () {
	var now = Date.now();
	var delta = now - _then;

	if (_gameWindow.rootView.update) {
		_gameWindow.rootView.update(delta / 1000);
	}

	_gameWindow.render();

	_then = now;

	_requestAnimationFrame(main);
};

document.addEventListener('DOMContentLoaded', function() {
   startGame();
}, false);