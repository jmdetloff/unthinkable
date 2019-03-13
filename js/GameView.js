const kNodeEntryPoint = {x: 0.28, y: 1.05};
const kNodeExitPoint = {x: 0.75, y: -0.05};
const kSpawnTime = 1;
const kDespawnTime = 0.5;
const kWorkerSpeed = 10;
const kTransferSpeed = 35;

const kEnemyMinMoveTime = 3;
const kEnemyMaxMoveTime = 10;
const kEnemyEmptyAttackChance = 0.7;

const kTimeMulti = 2;

function GameView(file, frame) {
	this.currentTime = 0;
	this.file = file;
	this.gameData = kGameData[file.name.toLowerCase()];
	if (!this.gameData) {
		this.gameData = file;
	}
	this.frame = frame;

	this.vineManager = new VineManager();

	var xOffset = 10;

	this.purgeButton = new BorderView({x: xOffset, y: 20, width: 200, height: 70});
	this.purgeButton.setText("Purge");
	this.addSubview(this.purgeButton);

	xOffset += this.purgeButton.frame.width + 10;

	this.infoPanel = new InfoPanelView({x: xOffset, y: 20, width: this.frame.width - xOffset - 220, height: 70});
	this.addSubview(this.infoPanel);

	xOffset += this.infoPanel.frame.width + 10;

	this.mutateButton = new BorderView({x: xOffset, y: 20, width: 200, height: 70});
	this.mutateButton.setText("Mutate");
	this.addSubview(this.mutateButton);	

	this.nodes = new Array()
    this.workers = new Array();
    this.enemies = {};

    for (var i = 0; i < this.gameData.enemies.length; i++) {
    	var enemy = {};
    	enemy.name = this.gameData.enemies[i];
    	enemy.workers = new Array();
    	enemy.nodes = new Array();
    	this.enemies[enemy.name] = enemy;
    }

	var bottomOffset = 30;

	var gameView = this;

	var directionsLabel = new LabelView();
	directionsLabel.textColor = "white";
	directionsLabel.font = "20px DOSFont";
	directionsLabel.text = "Q to exit, R to restart, space to pause/unpause playback.";
	directionsLabel.frame = {x: 0, y: frame.height - bottomOffset, width: frame.width, height: bottomOffset};
	this.addSubview(directionsLabel);

	var subFrame = {x: 0, y: 0, width: this.frame.width, height: this.frame.height};
	this.vinesReachingView = new VinesReachingView(subFrame, this.vineManager);
	this.addSubview(this.vinesReachingView);

	for (var i = 0; i < this.gameData.nodes.length; i++) {
		var gameDataNode = this.gameData.nodes[i];
		var node = {x: gameDataNode.x, y: gameDataNode.y, size: gameDataNode.size};
		node.workers = new Array();
		node.lastSpawn = 0;
		node.lastDespawn = 0;
		if (gameDataNode.vine) {
			this.vineManager.createVine(node);
			node.owner = "player";
		} else if (gameDataNode.enemy) {
			node.owner = gameDataNode.enemy;
		} else {
			node.owner = null;
		}
		this.createNodeView(node);
		this.nodes.push(node);
	}

	this.onClick = function(x, y) {
		console.log("x: " + x / gameView.frame.width + " y: " + y / gameView.frame.height);
	}
	this.onMouseDown = function(x, y) {
		var downNode = gameView.nodeAtPoint(x, y);
		if (downNode) {
			gameView.nodeOnMouseDown(downNode);
		}
	};
	this.onMouseUp = function(x, y) {
		var upNode = gameView.nodeAtPoint(x, y);
		if (gameView.hoverNode) {
			gameView.hoverNode.view.selectionBox.hidden = true;
			gameView.hoverNode = null;
		}
		if (upNode) {
			gameView.nodeOnMouseUp(upNode);
		} else {
			if (this.selectedNode) {
				if (gameView.onPurgeButton(x, y)) {
					gameView.purge(this.selectedNode);
				} else if (gameView.onMutateButton(x, y)) {
					gameView.mutate(this.selectedNode);
				}
				gameView.selectedNode.view.selectionBox.hidden = true;
				gameView.selectedNode = null;
				gameView.updateInfoPanel();
			}
		}
	};
	this.onMouseMove = function(x, y) {
		if (!gameView.selectedNode) {
			return;
		}
		if (gameView.hoverNode && gameView.hoverNode != gameView.selectedNode) {
			gameView.hoverNode.view.selectionBox.hidden = true;
		}
		gameView.hoverNode = null;
		var hoverNode = gameView.nodeAtPoint(x, y);
		if (hoverNode && hoverNode != gameView.selectedNode) {
			gameView.hoverNode = hoverNode;
			gameView.hoverNode.view.selectionBox.hidden = false;
		}
	}

	this.vinesView = new VinesView(subFrame, this.vineManager, this.workers, this.gameData.enemies, this.enemies);
	this.addSubview(this.vinesView);

	if (this.gameData.message) {

		var shownMessages = localStorage.getItem("shown_messages");
		if (!shownMessages) {
			shownMessages = new Array();
		} else {
			shownMessages = JSON.parse(shownMessages);
		}
		if (!shownMessages.includes(this.gameData.message)) {
			shownMessages.push(this.gameData.message);
			localStorage.setItem("shown_messages", JSON.stringify(shownMessages));

			var xOffset = 20;
			var yOffset = 20;

			var panelWidth = this.frame.width * 0.7;

			var messageLabel = new LabelView();
			messageLabel.textColor = "white";
			messageLabel.font = "25px DOSFont";
			messageLabel.lineHeight = 25;
			messageLabel.text = this.gameData.message;
			messageLabel.lineWrap = true;
			messageLabel.frame = {x: xOffset, y: yOffset, width: panelWidth - 40, height: messageLabel.height()};

			yOffset += messageLabel.height() + 20;

			var continueLabel = new LabelView();
			continueLabel.textColor = "white";
			continueLabel.font = "25px DOSFont";
			continueLabel.lineHeight = 25;
			continueLabel.text = "Space to continue";
			continueLabel.frame = {x: xOffset, y: yOffset, width: panelWidth - 40, height: 25};

			var panelHeight = messageLabel.height() + 40 + 45;
			var panelFrame = {x: (this.frame.width - panelWidth) / 2, y: (this.frame.height - panelHeight) / 2, width: panelWidth, height: panelHeight};

			var messagePanel = new BorderView(panelFrame);
			messagePanel.backgroundColor = 'rgba(5, 14, 16, 1)';
			messagePanel.addSubview(messageLabel);
			messagePanel.addSubview(continueLabel);
			this.addSubview(messagePanel);

			this.messagePanel = messagePanel;

			this.paused = true;
		}
	}

	this.updateInfoPanel();
};

GameView.prototype = new View();

GameView.prototype.mutate = function(node) {
	var vine = this.vineManager.vineForNode(node);
	if (!vine) {
		return;
	}
	vine.mutating = true;
}

GameView.prototype.purge = function(node) {
	var workers = node.workers.slice();
	for (var i = 0; i < workers.length; i++) {
		var worker = workers[i];
		this.deleteWorker(worker);
	}
	node.owner = "";
	this.vineManager.vineNodeCaptured(node);
}

GameView.prototype.onPurgeButton = function(x, y) {
	if (this.purgeButton.hidden) { return false; }
	return x > this.purgeButton.frame.x && x < this.purgeButton.frame.x + this.purgeButton.frame.width && y > this.purgeButton.frame.y && y < this.purgeButton.frame.y + this.purgeButton.frame.height;
}

GameView.prototype.onMutateButton = function(x, y) {
	if (this.mutateButton.hidden) { return false; }
	return x > this.mutateButton.frame.x && x < this.mutateButton.frame.x + this.mutateButton.frame.width && y > this.mutateButton.frame.y && y < this.mutateButton.frame.y + this.mutateButton.frame.height;
}

GameView.prototype.nodeAtPoint = function(x, y) {
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		if (x >= node.view.frame.x && x <= node.view.frame.x + node.view.frame.width && y >= node.view.frame.y && y <= node.view.frame.y + node.view.frame.height) {
			return node;
		}
	}
	return null;
}

GameView.prototype.createNodeView = function(node) {
	var frame = this.frame;
	var nodeView = new NodeView();
	nodeView.frame = {x: frame.width * node.x, y: frame.height * node.y, width: node.size, height: node.size};
	nodeView.interactionDisabled = true;
	this.addSubview(nodeView);
	node.view = nodeView;

	nodeView.selectionBox = new SelectionBox();
	nodeView.selectionBox.hidden = true;
	nodeView.selectionBox.interactionDisabled = true;
	nodeView.selectionBox.frame = {x: -10, y: -10, width: node.size + 20, height: node.size + 20};
	nodeView.addSubview(nodeView.selectionBox);
}

GameView.prototype.nodeOnMouseDown = function(node) {
	if (node.owner === "player") {
		node.view.selectionBox.hidden = false;
		this.selectedNode = node;
		this.updateInfoPanel();
	}
}

GameView.prototype.updateInfoPanel = function() {
	if (this.selectedNode && this.selectedNode.owner !== "player") {
		this.selectedNode.view.selectionBox.hidden = true;
		this.selectedNode = null;
	}

	if (this.selectedNode) {
		var nodePop = this.selectedNode.workers.length;
		var vine = this.vineManager.vineForNode(this.selectedNode);
		var vinePop = this.vineManager.vinePopulation(vine);
		this.infoPanel.showData(nodePop, vinePop, vine.immunity);
		this.mutateButton.hidden = this.gameData.mutateDisabled;
		this.purgeButton.hidden = false;
	} else {
		this.infoPanel.clearData();
		this.mutateButton.hidden = true;
		this.purgeButton.hidden = true;
	}
}

GameView.prototype.nodeOnMouseUp = function(node) {
	var vineForNode = this.vineManager.vineForNode(node);
	var selectedVine = this.vineManager.vineForNode(this.selectedNode);

	var selectedNode = this.selectedNode;

	if (this.selectedNode) {
		this.selectedNode.view.selectionBox.hidden = true;
		this.selectedNode = null;
		this.updateInfoPanel();
	}

	if (selectedNode === node || (selectedVine && selectedVine.mutating)) {
		return;
	}

	if (selectedNode && (!selectedNode.topNotFree || !selectedNode.bottomNotFree) && (!node.topNotFree && !node.bottomNotFree)) {
		this.vineManager.startReaching(selectedVine, selectedNode, node, this.currentTime);
		
	} else if (selectedNode && selectedVine === vineForNode && selectedNode.workers.length > 0) {
		this.moveWorkers(selectedNode, node);
	}
}

GameView.prototype.moveWorkers = function(fromNode, toNode) {
	var workersToMove = fromNode.workers.slice(0, Math.floor(fromNode.workers.length / 2));
	for (var i = 0; i < workersToMove.length; i++) {
		var worker = workersToMove[i];
		worker.fromNode = fromNode;
		worker.destinationNode = toNode;
		worker.destination = null;
		var index = worker.node.workers.indexOf(worker);
		worker.node.workers.splice(index, 1);
		worker.node = null;
	}
}

GameView.prototype.update = function(timeDelta) {
	if (this.paused) {
		return;
	}

	timeDelta *= kTimeMulti;

	this.currentTime += timeDelta;
	this.vineManager.updateReachData(timeDelta);
	if (!this.gameData.mutateDisabled) {
		this.vineManager.updateImmunity(this.currentTime);
	}
    this.spawnWorkers(timeDelta);
    this.updateWorkers(timeDelta);
    this.captureNodes();
    this.updateEnemies();
    this.updateInfoPanel();

    var ownsAllNodes = true;
    var ownsAnyNodes = false;
    for (var i = 0; i < this.nodes.length; i++) {
    	var node = this.nodes[i];
    	node.view.selectionBox.dashFlicker = Math.floor(this.currentTime) % 2 == 0;
    	if (node.owner !== "player") {
    		ownsAllNodes = false;
    	} else {
    		ownsAnyNodes = true;
    	}
    }

    for (var i = 0; i < this.vineManager.vines.length; i++) {
    	var vine = this.vineManager.vines[i];
    	if (vine.immunity > 0) {
    		continue;
    	}
		var path = vine.path.slice();
		for (var j = 0; j < path.length; j++) {
			var segment = path[j];
			if (segment.type === "node") {
				this.purge(segment.node);
			}
		}
    }

    if (ownsAllNodes) {
    	this.showWinScreen();
    } else if (!ownsAnyNodes) {
    	this.showLoseScreen();
    }

 //    if (this.currentTime > 5) {
 //   		this.showWinScreen();
	// }
}

GameView.prototype.showWinScreen = function() {
	var winScreenWidth = this.frame.width * 0.7;
	var winScreenHeight = this.frame.height * 0.3;
	var winViewFrame = {x: (this.frame.width - winScreenWidth) / 2, y: (this.frame.height - winScreenHeight) / 2, width: winScreenWidth, height: winScreenHeight};
	var winView = new WinScreenView(winViewFrame, this);
	winView.backgroundColor = this.winScreenBackgroundColor;
	this.addSubview(winView);


	if (this.file.unlocks && this.file.unlocks.length) {
		var unlockedFiles = localStorage.getItem("unlocked_files");
		if (!unlockedFiles) {
			unlockedFiles = new Array();
		} else {
			unlockedFiles = JSON.parse(unlockedFiles);
		}
		if (unlockedFiles.indexOf(this.file.unlocks) == -1) {
			unlockedFiles.push(this.file.unlocks.toLowerCase());
			localStorage.setItem("unlocked_files", JSON.stringify(unlockedFiles));
		}
	}
}

GameView.prototype.showLoseScreen = function() {
	var width = this.frame.width * 0.7;
	var height = this.frame.height * 0.16;
	var frame = {x: (this.frame.width - width) / 2, y: (this.frame.height - height) / 2, width: width, height: height};
	var winView = new LoseScreenView(frame);
	winView.backgroundColor = this.winScreenBackgroundColor;
	this.addSubview(winView);
}

GameView.prototype.nextFile = function() {
	return this.file.unlocks;
}

GameView.prototype.nextFileKey = function() {
	return this.file.earnedKey;
}

GameView.prototype.updateEnemies = function(timeDelta) {
	for (var i = 0; i < this.gameData.enemies.length; i++) {
		var enemyName = this.gameData.enemies[i];
		var enemy = this.enemies[enemyName];

		if (!enemy.nextAttack) {
			enemy.nextAttack = Math.random() * (kEnemyMaxMoveTime - kEnemyMinMoveTime) + kEnemyMinMoveTime;
			continue;
		}

		if (this.currentTime > enemy.nextAttack) {
			this.performEnemyMove(enemy);
			enemy.nextAttack = this.currentTime + Math.random() * (kEnemyMaxMoveTime - kEnemyMinMoveTime) + kEnemyMinMoveTime;
		}
	}
}

GameView.prototype.performEnemyMove = function(enemy) {
	// return;

	var nodeToAttack;
	if (Math.random() < kEnemyEmptyAttackChance) {
		var emptyNodes = this.emptyNodes();
		if (emptyNodes.length) {
			nodeToAttack = emptyNodes[Math.floor(Math.random() * emptyNodes.length)];
		}
	}

	if (!nodeToAttack) {
		var otherNodes = new Array();
		for (var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i];
			if (node.owner !== enemy) {
				otherNodes.push(node);
			}
		}

		nodeToAttack = otherNodes[Math.floor(Math.random() * otherNodes.length)];
	}

	var enemyNodes = this.enemyNodes(enemy.name);
	if (!enemyNodes.length) {
		return;
	}

	var fromNode = enemyNodes[Math.floor(Math.random() * enemyNodes.length)];

	this.moveWorkers(fromNode, nodeToAttack);
}

GameView.prototype.emptyNodes = function() {
	var emptyNodes = new Array();
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		if (!node.owner) {
			emptyNodes.push(node);
		}
	}
	return emptyNodes;
}

GameView.prototype.playerNodes = function() {
	var playerNodes = new Array();
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		if (node.owner === "player") {
			playerNodes.push(node);
		}
	}
	return playerNodes;
}

GameView.prototype.enemyNodes = function(enemy) {
	var enemyNodes = new Array();
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		if (node.owner === enemy) {
			enemyNodes.push(node);
		}
	}
	return enemyNodes;	
}

GameView.prototype.updateWorkers = function(timeDelta) {
	for (var i = 0; i < this.workers.length; i++) {
		var worker = this.workers[i];
		this.moveWorker(worker, timeDelta);
		if (worker.node) {
			var vine = this.vineManager.vineForNode(worker.node);
			worker.immunity = vine.immunity;
		}
	}
	for (var i = 0; i < this.gameData.enemies.length; i++) {
		var enemy = this.enemies[this.gameData.enemies[i]];
		for (var j = 0; j < enemy.workers.length; j++) {
			var worker = enemy.workers[j];
			this.moveWorker(worker, timeDelta);
		}
	}
}

GameView.prototype.moveWorker = function(worker, timeDelta) {
	var node = worker.node;
	if (!worker.destination) {
		var moveNode;
		if (worker.destinationNode) {
			if (worker.owner === "player") {
				if (!worker.nextNode) {
					var vine = this.vineManager.vineForNode(worker.destinationNode);
					if (vine) {
						var nextIndex = this.getNextIndex(vine, worker.fromNode, worker.destinationNode);
						var segment = vine.path[nextIndex];
						worker.nextNode = segment.node;
					}
				}
				moveNode = worker.nextNode;
				
			} else {
				moveNode = worker.destinationNode;
			}
		} else {
			moveNode = node;
		}
		if (!moveNode) {
			this.deleteWorker(worker);
			return;
		}
		worker.destination = this.randomLocationOnNode(moveNode);
	}
	var deltaX = worker.destination.x - worker.location.x;
	var deltaY = worker.destination.y - worker.location.y;
	if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
		if (worker.destinationNode) {
			if (worker.nextNode === worker.destinationNode || !worker.nextNode) {
				this.arriveAtNode(worker, worker.destinationNode);
				worker.nextNode = null;
			} else {
				var vine = this.vineManager.vineForNode(worker.destinationNode);
				if (vine) {
					var nextIndex = this.getNextIndex(vine, worker.nextNode, worker.destinationNode);
					if (nextIndex == -1) {
						this.deleteWorker(worker);
					} else {
						var segment = vine.path[nextIndex];
						worker.nextNode = segment.node;				
					}
				} else {
					this.deleteWorker(worker);
				}
			}
		}
		worker.destination = null;
		return;
	}
	var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	var normX = deltaX / distance;
	var normY = deltaY / distance;
	var speed = worker.destinationNode ? kTransferSpeed : kWorkerSpeed;
	worker.location.x += normX * speed * Math.min(timeDelta, 1);
	worker.location.y += normY * speed * Math.min(timeDelta, 1);
}

GameView.prototype.getNextIndex = function(vine, fromNode, toNode) {
	var vineA = this.vineManager.vineForNode(fromNode);
	var vineB = this.vineManager.vineForNode(toNode);
	if (vineA !== vineB) {
		return -1;
	}

	var currentIndex = this.vineManager.indexOfNode(vine, fromNode);
	var destIndex = this.vineManager.indexOfNode(vine, toNode);
	var nextIndex;
	if (currentIndex < destIndex) {
		nextIndex = currentIndex + 2;
	} else {
		nextIndex = currentIndex - 2;
	}
	return nextIndex;
}

GameView.prototype.arriveAtNode = function(worker, node) {
	if (worker.owner === "player") {
		var vine = this.vineManager.vineForNode(node);
		if (!vine) {
			this.deleteWorker(worker);
			return;
		}
	}

	if (node.owner && node.owner !== worker.owner) {
		if (node.workers.length) {
			var numKills = 0;
			if (worker.owner === "player") {
				var immunity = worker.immunity;
				numKills = Math.floor(immunity / 50);
				if (Math.random() < ((immunity % 50) / 50)) {
					numKills++;
				}
			} else {
				if (node.owner === "player") {
					var immunity = node.workers[0].immunity;
					numKills = 50 / immunity;
					if (numKills < 1) {
						numKills = Math.random() < numKills ? 1 : 0;
					} else {
						numKills = Math.floor(numKills);
					}
				} else {
					numKills = 1;
				}
			}

			this.deleteWorker(worker);
			for (var i = 0; i < numKills && node.workers.length; i++) {
				var deadWorker = node.workers[0];
				this.deleteWorker(deadWorker);				
			}
			
		} else {
			var capturedFromPlayer = node.owner === "player";

			node.owner = worker.owner;
			node.workers.push(worker);
		  	worker.node = node;

			if (capturedFromPlayer) {
				this.vineManager.vineNodeCaptured(node);
			}
		}
	} else {
		node.workers.push(worker);
	  	worker.node = node;
	}
  	worker.destinationNode = null;
  	worker.fromNode = null;
}

GameView.prototype.spawnWorkers = function() {
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		if (node.owner) {
			var vine = this.vineManager.vineForNode(node);
			var preventSpawn = vine && vine.mutating && node.owner === "player";
			var maxSpawn = Math.floor(node.size / 2);
			if (!preventSpawn && node.workers.length < maxSpawn && node.lastSpawn < this.currentTime - kSpawnTime) {
				this.createWorker(node);
			}
			if (node.workers.length > maxSpawn && node.lastDespawn < this.currentTime - kDespawnTime) {
				this.deleteRandomWorker(node);
			}
		}		
	}
}

GameView.prototype.captureNodes = function() {
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		var hasWorkers = node.workers.length > 0;
		var hasVine = this.vineManager.vineForNode(node);
		if (hasWorkers) {
			node.owner = node.workers[0].owner;
		} else if (hasVine) {
			node.owner = "player";
		}
	}
}

GameView.prototype.deleteRandomWorker = function(node) {
	var randomIndex = Math.floor(Math.random() * node.workers.length);
	var randomWorker = node.workers[randomIndex];
	randomWorker.node = null;
	node.workers.splice(randomIndex, 1);
	if (node.owner === "player") {
		var index = this.workers.indexOf(randomWorker);
		this.workers.splice(index, 1);
	} else {
		var enemy = this.enemies[node.owner];
		var index = enemy.workers.indexOf(randomWorker);
		enemy.workers.splice(index, 1);
	}
}

GameView.prototype.deleteWorker = function(worker) {
	var node = worker.node;
	worker.node = null;
	if (node) {
		var index = node.workers.indexOf(worker);
		node.workers.splice(index, 1);
	}
	if (worker.owner === "player") {
		var index = this.workers.indexOf(worker);
		this.workers.splice(index, 1);
	} else {
		var enemy = this.enemies[worker.owner];
		var index = enemy.workers.indexOf(worker);
		enemy.workers.splice(index, 1);
	}
}

GameView.prototype.createWorker = function(node) {
	node.lastSpawn = this.currentTime;
	var worker = {location: this.randomLocationOnNode(node), owner: node.owner};
	if (node.owner === "player") {
		this.workers.push(worker);
	} else {
		var enemy = this.enemies[node.owner];
		enemy.workers.push(worker);
	}
	node.workers.push(worker);
	worker.node = node;
}

GameView.prototype.randomLocationOnNode = function(node) {
	var location = {};
	location.x = node.view.frame.x + Math.random() * node.size * 0.8 + node.size * 0.08 
	location.y = node.view.frame.y + Math.random() * node.size * 0.8 + node.size * 0.08;
	return location;
}

GameView.prototype.togglePause = function() {
	this.paused = !this.paused;
	if (this.messagePanel) {
		this.removeSubview(this.messagePanel);
		this.messagePanel = null;
	}
}

GameView.prototype.renderHierarchy = function(ctx, x, y) {
	View.prototype.renderHierarchy.call(this, ctx, x, y);
}

GameView.prototype.drawAtPosition = function(ctx, x, y) {
	View.prototype.drawAtPosition.call(this, ctx, x, y);

	var totalPop = this.workers.length;

	for (var i = 0; i < this.gameData.enemies.length; i++) {
		var enemy = this.enemies[this.gameData.enemies[i]];
		totalPop += enemy.workers.length;
	}

	var percentPlayer = this.workers.length / totalPop;
	var playerWidth = this.frame.width * percentPlayer;
	var offset = 0;
	var barHeight = 10;

	ctx.save();
	ctx.fillStyle = 'green';
	ctx.fillRect(offset, 0, playerWidth, barHeight);
	ctx.restore();

	offset += playerWidth;

	for (var i = 0; i < this.gameData.enemies.length; i++) {
		ctx.save();
		ctx.fillStyle = this.gameData.enemies[i];

		var enemy = this.enemies[this.gameData.enemies[i]];
		var enemyPercent = enemy.workers.length / totalPop;
		var enemyWidth = this.frame.width * enemyPercent;
		ctx.fillRect(offset, 0, enemyWidth, barHeight);
		ctx.restore();

		offset += enemyWidth;
	}
}
