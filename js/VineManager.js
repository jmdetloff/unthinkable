function VineManager() {
	this.vines = new Array();
	this.animations = new Array();
}

VineManager.prototype.vineNodeCaptured = function(node) {
	var vine = this.vineForNode(node);
	if (!vine) {
		return;
	}

	var vineIndex = this.vines.indexOf(vine);
	var nodeIndex = this.indexOfNode(vine, node);

	this.vines.splice(vineIndex, 1);

	var leftPath = nodeIndex > 0 ? vine.path.slice(0, nodeIndex - 1) : [];
	var rightPath = nodeIndex + 2 < vine.path.length ? vine.path.slice(nodeIndex + 2, vine.path.length) : [];

	var deadSegments = new Array();
	deadSegments.push(vine.path[nodeIndex]);
	if (nodeIndex != 0) {
		deadSegments.push(vine.path[nodeIndex - 1]);
	}
	if (nodeIndex + 1 < vine.path.length) {
		deadSegments.push(vine.path[nodeIndex + 1]);
	}

	if (leftPath.length == 1 && leftPath[0].node.owner !== "player") {
		deadSegments.push(vine.path[nodeIndex - 2]);
		leftPath[0].node.topNotFree = false;
		leftPath[0].node.bottomNotFree = false;
		leftPath[0].node.topReachingSegment = null;
		leftPath[0].node.bottomReachingSegment = null;
		leftPath = [];
	}

	if (rightPath.length == 1 && rightPath[0].node.owner !== "player") {
		deadSegments.push(vine.path[nodeIndex + 2]);
		rightPath[0].node.topNotFree = false;
		rightPath[0].node.bottomNotFree = false;
		rightPath[0].node.topReachingSegment = null;
		rightPath[0].node.bottomReachingSegment = null;
		rightPath = [];
	}

	var removedSegment = vine.path[nodeIndex];
	removedSegment.node.topNotFree = false;
	removedSegment.node.bottomNotFree = false;
	removedSegment.node.topReachingSegment = null;
	removedSegment.node.bottomReachingSegment = null;

	if (leftPath.length) {
		var reach = vine.path[nodeIndex - 1];
		var node = leftPath[leftPath.length - 1];
		if (node.node.topReachingSegment === reach) {
			node.node.topNotFree = false;
			node.node.topReachingSegment = null;
		} else if (node.node.bottomReachingSegment === reach) {
			node.node.bottomNotFree = false;
			node.node.bottomReachingSegment = null;
		}
		this.vines.push({path: leftPath, color: "green", immunity: vine.immunity, mutating: vine.mutating});
	}

	if (rightPath.length) {
		var reach = vine.path[nodeIndex + 1];
		var node = rightPath[0];
		if (node.node.topReachingSegment === reach) {
			node.node.topNotFree = false;
			node.node.topReachingSegment = null;
		} else if (node.node.bottomReachingSegment === reach) {
			node.node.bottomNotFree = false;
			node.node.bottomReachingSegment = null;
		}
		this.vines.push({path: rightPath, color: "green", immunity: vine.immunity, mutating: vine.mutating});
	}

	for (var i = 0; i < deadSegments.length; i++) {
		var segment = deadSegments[i];
		this.animateDeadSegment(segment);
	}
}

VineManager.prototype.animateDeadSegment = function(segment) {
	var animation = {
		segment: segment,
		time: 0,
		total: 1000,
	}
	this.animations.push(animation);
	var manager = this;
	var interval = setInterval(function() {
		animation.time += 16;
		if (animation.time >= animation.total) {
			var animationIndex = manager.animations.indexOf(animation);
			manager.animations.splice(animationIndex, 1);
			clearInterval(interval);
		}
	}, 16)
}

VineManager.prototype.vineForNode = function(node) {
	if (!node) {
		return null;
	}

	for (var i = 0; i < this.vines.length; i++) {
		var vine = this.vines[i];
		for (var j = 0; j < vine.path.length; j++) {
			var segment = vine.path[j];
			if (segment.type === "node" && segment.node == node) {
				return vine;
			}
		}
	}
	return null;
}

VineManager.prototype.drawVineReachSegments = function(ctx, x, y) {
	for (var i = 0; i < this.vines.length; i++) {
		var vine = this.vines[i];
		for (var j = 0; j < vine.path.length; j++) {
			var pathSegment = vine.path[j];
			if (pathSegment.type === "reach") {

				if (vine.mutating) {
					var percentHealthy = 0.5;
					var red = (0 * percentHealthy + 255 * (1 - percentHealthy));
					var green = (128 * percentHealthy + 255 * (1 - percentHealthy));
					var blue = (0 * percentHealthy + 255 * (1 - percentHealthy));
					this.drawReachVineSegment(ctx, x, y, pathSegment, "rgba(" + red + ", " + green + ", " + blue + ", 1)");
				} else {
					var percentHealthy = Math.min(1, vine.immunity / 75);
					var red = (0 * percentHealthy + 153 * (1 - percentHealthy));
					var green = (128 * percentHealthy + 102 * (1 - percentHealthy));
					var blue = (0 * percentHealthy + 51 * (1 - percentHealthy));
					this.drawReachVineSegment(ctx, x, y, pathSegment, "rgba(" + red + ", " + green + ", " + blue + ", 1)");
				}
			}
		}
	}
	for (var i = 0; i < this.animations.length; i++) {
		var animation = this.animations[i];
		if (animation.segment.type === "reach") {
			this.drawDeadReach(ctx, x, y, animation);
		}
	}
}

VineManager.prototype.drawVineNodeSegments = function(ctx, x, y, frame) {
	for (var i = 0; i < this.vines.length; i++) {
		var vine = this.vines[i];
		for (var j = 0; j < vine.path.length; j++) {
			var pathSegment = vine.path[j];
			if (pathSegment.type === "node") {

				if (vine.mutating) {
					var percentHealthy = 0.5;
					var red = (0 * percentHealthy + 255 * (1 - percentHealthy));
					var green = (128 * percentHealthy + 255 * (1 - percentHealthy));
					var blue = (0 * percentHealthy + 255 * (1 - percentHealthy));
					this.drawNodeVineSegment(ctx, x, y, pathSegment, frame, "rgba(" + red + ", " + green + ", " + blue + ", 1)");
				} else {
					var percentHealthy = Math.min(1, vine.immunity / 75);
					var red = (0 * percentHealthy + 153 * (1 - percentHealthy));
					var green = (128 * percentHealthy + 102 * (1 - percentHealthy));
					var blue = (0 * percentHealthy + 51 * (1 - percentHealthy));
					this.drawNodeVineSegment(ctx, x, y, pathSegment, frame, "rgba(" + red + ", " + green + ", " + blue + ", 1)");
				}
			}
		}
	}
	for (var i = 0; i < this.animations.length; i++) {
		var animation = this.animations[i];
		if (animation.segment.type === "node") {
			this.drawDeadNode(ctx, x, y, animation, frame);
		}
	}
}

function mixColor(color1, color2, percent) {
  	var r = (color1.red() * percent + color2.red() * (1 - percent)) / 2;
  	var g = (color1.green() * percent + color2.green() * (1 - percent)) / 2;
  	var b = (color1.blue() * percent + color2.blue() * (1 - percent)) / 2;
  	return Color().rgb([r, g, b]);  
}

VineManager.prototype.vinePopulation = function(vine) {
	var pop = 0;
	for (var j = 0; j < vine.path.length; j++) {
		var pathSegment = vine.path[j];
		if (pathSegment.type === "node" && pathSegment.node.owner === "player") {
			pop += pathSegment.node.workers.length;
		}
	}
	return pop;
}

VineManager.prototype.drawDeadReach = function(ctx, x, y, animation) {
	var yOffset = 70;
	var opacityOffset = 1;
	var animationPercent = animation.time / animation.total;

	this.drawReachVineSegment(ctx, x, y + yOffset * animationPercent, animation.segment, "rgba(210,105,30," + (1 - opacityOffset * animationPercent)  + ")");
}

VineManager.prototype.drawReachVineSegment = function(ctx, x, y, segment, color) {
	ctx.save();

	ctx.strokeStyle = color;
	ctx.lineWidth = 3;
	ctx.lineCap = "round";

	var startX = x + segment.leadPoint.x;
	var startY =  y + segment.leadPoint.y;

	var controlX = startX + segment.tinySwivelDistance * (segment.vector.x / Math.sqrt(Math.pow(segment.vector.x, 2) + Math.pow(segment.vector.y, 2)));
	var controlY = startY + segment.tinySwivelDistance * (segment.vector.y / Math.sqrt(Math.pow(segment.vector.x, 2) + Math.pow(segment.vector.y, 2)));

	var oppositeVector = {x: segment.vector.x, y: -1 * segment.vector.y};

	var swivelMultiple = (segment.swivelPercent - 0.5) * 5;
	var tinySwivelMultiple = (segment.tinySwivelPercent - 0.5) * 2;

	var endX = controlX + tinySwivelMultiple * segment.tinySwivelDistance * (oppositeVector.x / Math.sqrt(Math.pow(oppositeVector.x, 2) + Math.pow(oppositeVector.y, 2)));
	var endY = controlY + tinySwivelMultiple * segment.tinySwivelDistance * (oppositeVector.y / Math.sqrt(Math.pow(oppositeVector.x, 2) + Math.pow(oppositeVector.y, 2)));

	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.quadraticCurveTo(controlX, controlY, endX, endY);

	var otherSwivelMultiple = swivelMultiple;
	
	var midPoint = {x: segment.startPoint.x + (startX - segment.startPoint.x) / 2, y: segment.startPoint.y + (startY - segment.startPoint.y) / 2};
	var otherControlX = midPoint.x + segment.swivelDistance * otherSwivelMultiple * (oppositeVector.x / Math.sqrt(Math.pow(oppositeVector.x , 2) + Math.pow(oppositeVector.y, 2)));
	var otherControlY = midPoint.y + segment.swivelDistance * otherSwivelMultiple * (oppositeVector.y / Math.sqrt(Math.pow(oppositeVector.x , 2) + Math.pow(oppositeVector.y, 2)));

	ctx.moveTo(x + segment.startPoint.x, y + segment.startPoint.y);
	ctx.quadraticCurveTo(otherControlX, otherControlY, startX, startY);

	ctx.stroke();

	ctx.restore();
}

VineManager.prototype.drawDeadNode = function(ctx, x, y, animation, frame) {
	var yOffset = 70;
	var opacityOffset = 1;
	var animationPercent = animation.time / animation.total;

	this.drawNodeVineSegment(ctx, x, y + yOffset * animationPercent, animation.segment, frame, "rgba(210,105,30," + (1 - opacityOffset * animationPercent)  + ")");
}

VineManager.prototype.drawNodeVineSegment = function(ctx, x, y, segment, frame, color) {
	ctx.save();

	ctx.strokeStyle = color;
	ctx.lineWidth = 3;
	ctx.lineCap = "round";

	var nodeX = x + segment.node.view.frame.x;
	var nodeY = y + segment.node.view.frame.y;
	var nodeCenterX = nodeX + segment.node.size / 2;
	var nodeCenterY = nodeY + segment.node.size / 2;

	for (var i = 0; i < segment.loops.length; i++) {
		var loop = segment.loops[i];

		ctx.beginPath();
		ctx.moveTo(nodeX + loop.start.x * segment.node.size, nodeY + loop.start.y * segment.node.size);
		ctx.quadraticCurveTo(nodeCenterX, nodeCenterY, nodeX + loop.end.x * segment.node.size, nodeY + loop.end.y * segment.node.size);
		ctx.stroke();
	}

	if (segment.node.vine) {
		ctx.beginPath();
		ctx.moveTo(nodeX, nodeY + 0.5 * segment.node.size);
		ctx.lineTo(nodeX + 0.25 * segment.node.size, nodeY + 0.5 * segment.node.size);
		ctx.stroke();
	} else if (!segment.node.bottomNotFree) {
		var vector = {x: -7, y: 11};
		var distance = 12;

		var startX = nodeX + segment.node.size * kNodeEntryPoint.x;
		var startY = nodeY + kNodeEntryPoint.y * segment.node.size
		var endX = startX + distance * (vector.x / Math.sqrt(vector.x * vector.x + vector.y * vector.y));
		var endY = startY + distance * (vector.y / Math.sqrt(vector.x * vector.x + vector.y * vector.y));
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
	}

	if (!segment.node.topNotFree) {
		var vector = {x: 6, y: -8};
		var distance = 15;

		var startX = nodeX + segment.node.size * kNodeExitPoint.x;
		var startY = nodeY + kNodeExitPoint.y * segment.node.size;
		var endX = startX + distance * (vector.x / Math.sqrt(vector.x * vector.x + vector.y * vector.y));
		var endY = startY + distance * (vector.y / Math.sqrt(vector.x * vector.x + vector.y * vector.y));
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
	}

	ctx.restore();
}

VineManager.prototype.createVine = function(node) {
	node.bottomNotFree = true;
	var newVine = { path: [ this.generateNodeSegment(node) ], color: "green", immunity: 50 }
	this.vines.push(newVine);
}

VineManager.prototype.indexOfNode = function(vine, node) {
	if (!vine.path) {
		return 0;
	}

	for (var i = 0; i < vine.path.length; i++) {
		var segment = vine.path[i];
		if (segment.type === "node" && segment.node === node) {
			return i;
		}
	}
	return -1;
}

VineManager.prototype.generateNodeSegment = function(node) {
	var loopPoints = [
		{x: 0.15, y: 0.15},
		{x: 0.48, y: 0},
		{x: 0.88, y: 0.16},
		{x: 0.99, y: 0.53},
		{x: 0.87, y: 0.85},
		{x: 0.51, y: 0.99},
		{x: 0.12, y: 0.81},
		{x: 0.02, y: 0.46}
	];

	var segment = 
		{
			type: "node",
			node: node,
			loops: Array(),
		};

	var selectedLoopPoints = Array();
	for (var i = 0; i < 6; i++) {
		var random = Math.floor(Math.random() * loopPoints.length); 
		while (selectedLoopPoints.indexOf(random) >= 0 || (node.vine && random == 7)) {
			random = Math.floor(Math.random() * loopPoints.length); 
		}
		selectedLoopPoints.push(random);
	}

	while(selectedLoopPoints.length) {
		segment.loops.push({
			start: loopPoints[selectedLoopPoints[0]],
			end: loopPoints[selectedLoopPoints[1]],
		});
		selectedLoopPoints.splice(0, 2);
	}

	return segment;
}

VineManager.prototype.startReaching = function(vine, fromNode, toNode, currentTime) {

	var nodeX = fromNode.view.frame.x;
	var nodeY = fromNode.view.frame.y;

	var reachingSegment = {
		type: "reach",
		startTime: currentTime,
		currentTime: currentTime,
		fromNode: fromNode,
		toNode: toNode,
		swivelPercent: 0.5,
		swivelingUp: true,
	};

	var toNodeEntry = {x: toNode.view.frame.x + kNodeEntryPoint.x * toNode.size, y: toNode.view.frame.y + kNodeEntryPoint.y * toNode.size};
	var toNodeExit = {x: toNode.view.frame.x + kNodeExitPoint.x * toNode.size, y: toNode.view.frame.y + kNodeExitPoint.y * toNode.size};

	for (var i = 0; i < this.vines.length; i++) {
		var vine = this.vines[i];
		for (var j = 0; j < vine.path.length; j++) {
			var pathSegment = vine.path[j];
			if (pathSegment.type === "reach" && !pathSegment.completed) {
				if (pathSegment.toNode === toNode) {
					return;
				}
			}
		}
	}

	if (fromNode.topNotFree) {
		fromNode.bottomNotFree = true;
		fromNode.bottomReachingSegment = reachingSegment;

		var startingPoint = {x: nodeX + fromNode.size * kNodeEntryPoint.x, y: nodeY + kNodeEntryPoint.y * fromNode.size};
		var distEntry = Math.sqrt(Math.pow(toNodeEntry.x - startingPoint.x, 2) + Math.pow(toNodeEntry.y - startingPoint.y, 2));
		var distExit = Math.sqrt(Math.pow(toNodeExit.x - startingPoint.x, 2) + Math.pow(toNodeExit.y - startingPoint.y, 2));
		if (distEntry < distExit) {
			reachingSegment.endPoint = toNodeEntry;
			reachingSegment.toBottom = true;
		} else {
			reachingSegment.endPoint = toNodeExit;
			reachingSegment.toBottom = false;
		}

		reachingSegment.start = true;
		reachingSegment.startPoint = {x: nodeX + fromNode.size * kNodeEntryPoint.x, y: nodeY + kNodeEntryPoint.y * fromNode.size};
		reachingSegment.swivelDistance = 12;
		reachingSegment.leadPoint = startingPoint;
		reachingSegment.vector = {x: -7, y: 11};
		reachingSegment.startVector = {x: -7, y: 11};
		
	} else {
		fromNode.topNotFree = true;
		fromNode.topReachingSegment = reachingSegment;

		var startingPoint = {x: nodeX + fromNode.size * kNodeExitPoint.x, y: nodeY + kNodeExitPoint.y * fromNode.size};
		var distEntry = Math.sqrt(Math.pow(toNodeEntry.x - startingPoint.x, 2) + Math.pow(toNodeEntry.y - startingPoint.y, 2));
		var distExit = Math.sqrt(Math.pow(toNodeExit.x - startingPoint.x, 2) + Math.pow(toNodeExit.y - startingPoint.y, 2));
		if (distEntry < distExit) {
			reachingSegment.endPoint = toNodeEntry;
			reachingSegment.toBottom = true;
		} else {
			reachingSegment.endPoint = toNodeExit;
			reachingSegment.toBottom = false;
		}

		reachingSegment.start = false;
		reachingSegment.startPoint =  {x: nodeX + fromNode.size * kNodeExitPoint.x, y: nodeY + kNodeExitPoint.y * fromNode.size};
		reachingSegment.swivelDistance = 15;
		reachingSegment.leadPoint = startingPoint;
		reachingSegment.vector = {x: 6, y: -8};
		reachingSegment.startVector = {x: 6, y: -8};
	}

	var index = this.indexOfNode(vine, fromNode);
	if (index == 0) {
		if (vine.path.length == 1) {
			vine.path.push(reachingSegment);
		} else {
			vine.path.unshift(reachingSegment);	
		}
	} else {
		vine.path.push(reachingSegment);
	}
}

VineManager.prototype.updateImmunity = function(currentTime) {
	for (var i = 0; i < this.vines.length; i++) {
		var vine = this.vines[i];

		if (!vine.lastImmunityChange) {
			vine.lastImmunityChange = currentTime;
			continue;
		}

		var nodeCount = 0;
		for (var j = 0; j < vine.path.length; j++) {
			var segment = vine.path[j];
			if (segment.type === "node") {
				nodeCount++;
			}
		}

		var immunityTime = nodeCount / 1.5;
		if (currentTime > vine.lastImmunityChange + immunityTime) {
			if (vine.mutating) {
				vine.immunity += 2;
			} else {
				vine.immunity--;
			}
			if (vine.immunity >= 100) {
				vine.immunity = 100;
				vine.mutating = false;
			}
			vine.lastImmunityChange = currentTime;
		}
	}	
}

VineManager.prototype.updateReachData = function(timeDelta) {
	var swivelSpeed = 0.3;
	var pointSpeed = 50;
	var turnAmount = Math.PI / 2 * timeDelta;
	var turnDelay = 0.5;
	var swivelDelay = 0.5;

	for (var i = 0; i < this.vines.length; i++) {
		var vine = this.vines[i];

		for (var j = 0; j < vine.path.length; j++) {
			var segment = vine.path[j];
			if (segment.type !== "reach" || segment.completed) {
				continue;
			}

			segment.currentTime += timeDelta;

			var timeElapsed = segment.currentTime - segment.startTime;

			segment.vector.x = segment.vector.x / Math.sqrt(Math.pow(segment.vector.x, 2) + Math.pow(segment.vector.y, 2));
			segment.vector.y = segment.vector.y / Math.sqrt(Math.pow(segment.vector.x, 2) + Math.pow(segment.vector.y, 2));

			var goalVector = {x: segment.endPoint.x - segment.leadPoint.x, y: segment.endPoint.y - segment.leadPoint.y}
			var distanceToGoal = Math.sqrt(Math.pow(goalVector.x, 2) + Math.pow(goalVector.y, 2));
			var almostThere = distanceToGoal < 50;

            if (almostThere) {
            	turnAmount *= 50 / distanceToGoal;
            }

			if (timeElapsed > swivelDelay) {
				var swivelUp = almostThere ? segment.swivelPercent > 0 : segment.swivelingUp;

				if (swivelUp) {
					segment.swivelPercent += swivelSpeed * timeDelta;
					if (segment.swivelPercent > 1) {
						segment.swivelingUp = false;
						segment.swivelPercent = 2 - segment.swivelPercent;
					}
				} else {
					segment.swivelPercent += -swivelSpeed * timeDelta;
					if (segment.swivelPercent < 0) {
						segment.swivelingUp = true;
						segment.swivelPercent *= -1;
					}
				}

				if (almostThere) {
					var percent = segment.tinySwivelPercent - 0.5;
					percent -= percent / distanceToGoal;
					percent += 0.5;
					segment.tinySwivelPercent = percent;
					segment.tinySwivelDistance -= segment.tinySwivelDistance / distanceToGoal * 2;
				} else {
					segment.tinySwivelPercent = segment.swivelPercent;
					segment.tinySwivelDistance = segment.swivelDistance;
				}
			}

			var goalDegrees = Math.atan2(goalVector.y, goalVector.x);
			var currentDegrees = Math.atan2(segment.vector.y, segment.vector.x);

			if (Math.abs((goalDegrees - 2 * Math.PI) - currentDegrees) < Math.abs(goalDegrees - currentDegrees)) {
				goalDegrees -= 2 * Math.PI;
			}

			if (Math.abs((goalDegrees + 2 * Math.PI) - currentDegrees) < Math.abs(goalDegrees - currentDegrees)) {
				goalDegrees += 2 * Math.PI;
			}

			var change = goalDegrees - currentDegrees;

			if (Math.abs(change) > Math.PI) {
				var min = Math.min(goalDegrees, currentDegrees);
				var max = Math.max(goalDegrees, currentDegrees);
				change = 2 * Math.PI - max + min;
			}

			var absChange = Math.min(Math.abs(change), turnAmount);
			if (change != 0) {
				change = absChange * change / Math.abs(change);
			}

			segment.vector.x = Math.cos(change + currentDegrees);
			segment.vector.y = Math.sin(change + currentDegrees);

			var movementDistance = timeDelta * pointSpeed;
			if (movementDistance < distanceToGoal) {
				var pointXDelta = movementDistance * (segment.vector.x / Math.sqrt(Math.pow(segment.vector.x, 2) + Math.pow(segment.vector.y, 2)));
				var pointYDelta = movementDistance * (segment.vector.y / Math.sqrt(Math.pow(segment.vector.x, 2) + Math.pow(segment.vector.y, 2)));
				segment.leadPoint.x += pointXDelta;
				segment.leadPoint.y += pointYDelta;
			} else {
				segment.leadPoint.x = segment.endPoint.x;
				segment.leadPoint.y = segment.endPoint.y;
				segment.completed = true;
				this.completeReach(vine, segment);
			}
		}
	}
}

VineManager.prototype.completeReach = function(vine, reach) {
	var newNode = this.generateNodeSegment(reach.toNode)
	newNode.node.topNotFree = !reach.toBottom;
	newNode.node.bottomNotFree = reach.toBottom;
	if (reach.toBottom) {
		newNode.node.bottomReachingSegment = reach;
	} else {
		newNode.node.topReachingSegment = reach;
	}
	if (vine.path[0] === reach) {
		vine.path.unshift(newNode);
	} else {
		vine.path.push(newNode);
	}
}