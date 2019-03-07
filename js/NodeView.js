function NodeView() {
      // init
      // var nodeView = this;
      // this.onMouseDown = function(x, y) {
      // 	console.log("tapped node x:" + x / nodeView.frame.width + " y:" + y / nodeView.frame.height);
      // }
};

NodeView.prototype = new View();

NodeView.prototype.drawAtPosition = function(ctx, x, y) {
	var minDimension = Math.min(this.frame.width, this.frame.height);
	var midSection = minDimension * 0.4;
	var sideSection = minDimension * 0.3;

	ctx.save();

	ctx.strokeStyle = 'white';
	if (this.backgroundColor) {
		ctx.fillStyle = this.backgroundColor;
	} else {
		ctx.fillStyle = 'rgba(5, 14, 16, 1)';	
	}
	ctx.lineWidth = 3;

	ctx.beginPath();
	ctx.moveTo(x + 0, y + sideSection);
	ctx.lineTo(x + sideSection, y + 0);
	ctx.lineTo(x + sideSection + midSection, y + 0);
	ctx.lineTo(x + sideSection * 2 + midSection, y + sideSection);
	ctx.lineTo(x + sideSection * 2 + midSection, y + sideSection + midSection);
	ctx.lineTo(x + sideSection + midSection, y + sideSection * 2 + midSection);
	ctx.lineTo(x + sideSection, y + sideSection * 2 + midSection);
	ctx.lineTo(x + 0, y + sideSection + midSection);
	ctx.lineTo(x + 0, y + sideSection);
	ctx.closePath();
	
	ctx.stroke();
	ctx.fill();

	ctx.restore();
}
