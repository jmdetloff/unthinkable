var levelCreatorMinSize = 40;
var levelCreatorMaxSize = 160;
var levelCreatorIncrement = 20;

// #ee4035 • #f37736 • #fdf498 • #7bc043 • #0392cf

function LevelCreatorView(frame, delegate) {
	this.frame = frame;
	this.nodeViews = new Array();
	this.delegate = delegate;

	var levelCreatorView = this;
	this.onClick = function(x, y) {
		if (levelCreatorView.holdingBox) {
			levelCreatorView.holdingBox = null;
			return;
		}
		var upNode = levelCreatorView.nodeAtPoint(x, y);
		if (upNode) {
			levelCreatorView.clickedNode(upNode);
		} else {
			levelCreatorView.clickedSpot(x, y);
		}
	}
	this.onMouseDown = function(x, y) {
		var downBox = levelCreatorView.enemyBoxAtPoint(x, y);
		if (downBox) {
			downBox.originalFrame = {x: downBox.frame.x, y: downBox.frame.y};
			levelCreatorView.holdingBox = downBox;
		}
	}
	this.onMouseUp = function(x, y) {
		if (!levelCreatorView.holdingBox) {
			return;
		}
		var upNode = levelCreatorView.nodeAtPoint(x, y);
		if (upNode) {
			upNode.type = levelCreatorView.holdingBox.type;
			upNode.backgroundColor = levelCreatorView.holdingBox.backgroundColor;
		}
		levelCreatorView.holdingBox.frame.x = levelCreatorView.holdingBox.originalFrame.x;
		levelCreatorView.holdingBox.frame.y = levelCreatorView.holdingBox.originalFrame.y;
	}
	this.onMouseMove = function(x, y) {
		if (!levelCreatorView.holdingBox) {
			return;
		}
		levelCreatorView.holdingBox.frame.x = x - levelCreatorView.holdingBox.frame.width / 2;
		levelCreatorView.holdingBox.frame.y = y - levelCreatorView.holdingBox.frame.height / 2;
	}

	var selectionBoxSize = 30;

	this.vineBox = new View();
	this.vineBox.interactionDisabled = true;
	this.vineBox.type = "vine";
	this.vineBox.backgroundColor = "#7bc043";
	this.vineBox.frame = {x: 10, y: 10, width: selectionBoxSize, height: selectionBoxSize};
	this.addSubview(this.vineBox);

	this.cellBox = new View();
	this.cellBox.interactionDisabled = true;
	this.cellBox.type = "#ee4035";
	this.cellBox.backgroundColor = "#ee4035";
	this.cellBox.frame = {x: 10 + 10 + selectionBoxSize, y: 10, width: selectionBoxSize, height: selectionBoxSize};
	this.addSubview(this.cellBox);

	this.enemy1Box = new View();
	this.enemy1Box.interactionDisabled = true;
	this.enemy1Box.type = "#0392cf";
	this.enemy1Box.backgroundColor = "#0392cf";
	this.enemy1Box.frame = {x: 10 + 2 * (10 + selectionBoxSize), y: 10, width: selectionBoxSize, height: selectionBoxSize};
	this.addSubview(this.enemy1Box);

	this.enemy2Box = new View();
	this.enemy2Box.interactionDisabled = true;
	this.enemy2Box.type = "#f37736";
	this.enemy2Box.backgroundColor = "#f37736";
	this.enemy2Box.frame = {x: 10 + 3 * (10 + selectionBoxSize), y: 10, width: selectionBoxSize, height: selectionBoxSize};
	this.addSubview(this.enemy2Box);

	this.enemy3Box = new View();
	this.enemy3Box.interactionDisabled = true;
	this.enemy3Box.type = "#fdf498";
	this.enemy3Box.backgroundColor = "#fdf498";
	this.enemy3Box.frame = {x: 10 + 4 * (10 + selectionBoxSize), y: 10, width: selectionBoxSize, height: selectionBoxSize};
	this.addSubview(this.enemy3Box);

	this.enemyBoxes = [this.vineBox, this.cellBox, this.enemy1Box, this.enemy2Box, this.enemy3Box];

	var bottomOffset = 30;

	var directionsLabel = new LabelView();
	directionsLabel.textColor = "white";
	directionsLabel.font = "20px DOSFont";
	directionsLabel.text = "SAVE";
	directionsLabel.frame = {x: 0, y: frame.height - bottomOffset, width: frame.width, height: bottomOffset};
	directionsLabel.onClick = function() {
		levelCreatorView.exportLevel();
	}
	this.addSubview(directionsLabel);
}

LevelCreatorView.prototype = new View();

LevelCreatorView.prototype.enemyBoxAtPoint = function(x, y) {
	for (var i = 0; i < this.enemyBoxes.length; i++) {
		var node = this.enemyBoxes[i];
		if (x >= node.frame.x && x <= node.frame.x + node.frame.width && y >= node.frame.y && y <= node.frame.y + node.frame.height) {
			return node;
		}
	}
	return null;
}

LevelCreatorView.prototype.nodeAtPoint = function(x, y) {
	for (var i = 0; i < this.nodeViews.length; i++) {
		var node = this.nodeViews[i];
		if (x >= node.frame.x && x <= node.frame.x + node.frame.width && y >= node.frame.y && y <= node.frame.y + node.frame.height) {
			return node;
		}
	}
	return null;
}

LevelCreatorView.prototype.clickedNode = function(node) {
	var oldSize = node.frame.width;
	var newSize = oldSize + levelCreatorIncrement;
	var originOffset = levelCreatorIncrement / 2;
	if (newSize > levelCreatorMaxSize) {
		originOffset = - (oldSize - levelCreatorMinSize) / 2;
		newSize = levelCreatorMinSize
	}
	node.frame = {x: node.frame.x - originOffset, y: node.frame.y - originOffset, width: newSize, height: newSize};
}

LevelCreatorView.prototype.clickedSpot = function(x, y) {
	var size = levelCreatorMinSize;
	var frame = this.frame;
	var nodeView = new NodeView();
	nodeView.frame = {x: x - size / 2, y: y - size / 2, width: size, height: size};
	nodeView.interactionDisabled = true;
	this.insertSubview(nodeView);
	this.nodeViews.push(nodeView);
}

LevelCreatorView.prototype.exportLevel = function() {
	var level = { 
		nodes: new Array(),
		mutateDisabled: false,
		enemies: new Array(),
	};
	for (var i = 0; i < this.nodeViews.length; i++) {
		var nodeView = this.nodeViews[i];
		var node = {};
		node.x = nodeView.frame.x / this.frame.width;
		node.y = nodeView.frame.y / this.frame.height;
		node.size = nodeView.frame.width;
		if (nodeView.type === "vine") {
			node.vine = true;
		} else if (nodeView.type) {
			node.enemy = nodeView.type;
			if (!level.enemies.includes(nodeView.type)) {
				level.enemies.push(nodeView.type);
			}
		}
		level.nodes.push(node);
	}
	var customLevels = localStorage.getItem("custom_levels");
	if (!customLevels) {
		customLevels = new Array();
	} else {
		customLevels = JSON.parse(customLevels);
	}
	customLevels.push(JSON.stringify(level));
	localStorage.setItem("custom_levels", JSON.stringify(customLevels));

	this.delegate.removeSubview(this);
	this.delegate.levelCreatorView = null;
}
