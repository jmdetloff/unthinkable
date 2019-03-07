function VinesView(frame, vineManager, workers, gameDataEnemies, enemies) {
	this.frame = frame;
	this.interactionDisabled = true;
	this.vineManager = vineManager;
	this.workers = workers;
	this.enemies = enemies;
	this.gameDataEnemies = gameDataEnemies;
}

VinesView.prototype = new View();

VinesView.prototype.drawAtPosition = function(ctx, x, y) {
	View.prototype.drawAtPosition.call(this, ctx, x, y);
	
	this.vineManager.drawVineNodeSegments(ctx, x, y, this.frame);

	var totalPop = this.workers.length;

	// var (153,102,51)

	ctx.save();

	ctx.fillStyle = 'green';

	for (var i = 0; i < this.workers.length; i++) {
		var worker = this.workers[i];
		ctx.fillRect(worker.location.x, worker.location.y, 4, 4);
	}

	ctx.restore();

	for (var i = 0; i < this.gameDataEnemies.length; i++) {
		ctx.save();
		ctx.fillStyle = this.gameDataEnemies[i];

		var enemy = this.enemies[this.gameDataEnemies[i]];
		for (var j = 0; j < enemy.workers.length; j++) {
			var worker = enemy.workers[j];
			ctx.fillRect(worker.location.x, worker.location.y, 4, 4);
		}

		ctx.restore();
	}
}