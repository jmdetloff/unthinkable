function VinesReachingView(frame, vineManager) {
	this.frame = frame;
	this.interactionDisabled = true;
	this.vineManager = vineManager;
}

VinesReachingView.prototype = new View();

VinesReachingView.prototype.drawAtPosition = function(ctx, x, y) {
	View.prototype.drawAtPosition.call(this, ctx, x, y);

	this.vineManager.drawVineReachSegments(ctx, x, y);
}