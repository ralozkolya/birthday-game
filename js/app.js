//https://imgur.com/a/bPgeH
var cj = createjs;
var app = {
	qr: new Image(),
	canvas: document.getElementById('canvas'),
	tiles: []
};

app.qr.addEventListener('load', init);
app.qr.src = '../img/qr3.png';

function init() {
	
	var stage = app.stage = new cj.Stage(canvas);
	cj.Touch.enable(stage);

	var container = app.container = new cj.Container();

	var frame = app.frame = new cj.Shape();
	frame.graphics.s('#000').dr(0, 0, 300, 300);
	container.addChild(frame);

	stage.addChild(container);
	
	container.setTransform(200, 200);

	adjustSize();

	sliceImage();

	shuffle(app.tiles);

	update();
}

function sliceImage() {

	clear();

	for (var i = 0; i < 25; i++) {
		var tile = getTile(i);
		app.container.addChild(tile);
		app.tiles.push(tile);
	}
}

window.addEventListener('resize', adjustSize);

function adjustSize() {
	var width = app.canvas.width = Math.max(window.innerWidth, 320);
	var height = app.canvas.height = Math.max(window.innerHeight, 320);

	app.container.setTransform((width - 300) / 2, (height - 300) / 2);
}

function getTile(index) {

	var point = getPoint(index);
		
	var x = point.x;
	var y = point.y;

	var tile = new cj.Container();
	var mask = new cj.Shape();
	mask.graphics.f('#000').dr(0, 0, 60, 60);

	var image = new cj.Bitmap(app.qr);
	image.setTransform(-x, -y);
	image.mask = mask;

	tile.addChild(image);

	var frame = tile.frame = new cj.Shape();
	frame.graphics.s('#ccc').dr(0, 0, 60, 60);
	tile.addChild(frame);

	tile.mouseChildren = false;

	tile.setTransform(x, y);

	tile.index = index;

	tile.on('mousedown', function(e) {
		tile.snapped = false;
		tile.parent.setChildIndex(tile, tile.parent.numChildren - 1);
		tile.offset = {x: this.x - e.stageX, y: this.y - e.stageY};
	});

	tile.move = function(x, y) {
		tile.setTransform(x, y);
	}

	tile.on('pressmove', function(e) {

		var x = e.stageX + tile.offset.x;
		var y = e.stageY + tile.offset.y;

		var snapped = snap(x, y, tile.index);

		if (snapped.snapped) {
			tile.snapped = true;
		}

		tile.move(snapped.x, snapped.y);
	});

	tile.on('pressup', function(e) {
		var inPlace = app.tiles.reduce(function (total, tile) {
			return tile.snapped ? ++total : total;
		}, 0);
		if (inPlace >= 25) {
			finish();
		}
	});

	return tile;
}

function getPoint(index) {

	return {
		x: index % 5 * 60,
		y: Math.floor(index / 5) * 60
	}
}

function snap(x, y, index) {
	var point = getPoint(index);
	var distance = getDistance(point, { x: x, y: y });
	var snapped = false;

	if (distance < 25) {
		x = point.x;
		y = point.y;
		snapped = true;
	}

	return { x: x, y: y, snapped: snapped };
}

function getDistance(p1, p2) {
	var x = Math.abs(p1.x - p2.x);
	var y = Math.abs(p1.y - p2.y);
	return Math.sqrt(x * x + y * y);
}

function clear() {
	app.tiles.forEach(function(tile) {
		tile.parent.removeChild(tile);
	});
	app.tiles = [];
}

function shuffle(tiles) {
	tiles.forEach(function(tile) {
		var x = Math.random() * (app.canvas.width - 60) - app.container.x;
		var y = Math.random() * (app.canvas.height - 60) - app.container.y;
		tile.move(x, y);
	});
}

function finish() {
	app.tiles.forEach(function(tile) {
		tile.removeChild(tile.frame);
	});

	//sliceImage();
}

function update() {
	app.stage.update();
	requestAnimationFrame(update);
}

function restart() {
	sliceImage();
	shuffle(app.tiles);
}
