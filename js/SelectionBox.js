function SelectionBox() {
	this.dashSize = 10;
	this.dashFlicker = true;
};

SelectionBox.prototype = new View();

SelectionBox.prototype.drawAtPosition = function(ctx, x, y) {
	if (this.hidden) {
		return;
	}

	ctx.save();

	ctx.strokeStyle = 'white';
	ctx.lineWidth = 3;

	if (this.dashFlicker) {
		ctx.setLineDash([this.dashSize, this.dashSize]);
	} else {
		ctx.setLineDash([0, this.dashSize, this.dashSize, 0]);
	}

	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + this.frame.width, y + 0);
	ctx.lineTo(x + this.frame.width, y + this.frame.height);
	ctx.lineTo(x, y + this.frame.height);
	ctx.lineTo(x, y);
	
	ctx.stroke();

	ctx.restore();

	View.prototype.drawAtPosition.call(this, ctx, x, y);
}
