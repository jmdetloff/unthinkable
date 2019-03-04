function BorderView(frame) {
	this.frame = frame;

	if (frame) {
		this.label = new LabelView();
		this.label.frame.y = 20;
		this.label.frame.width = frame.width;
		this.label.frame.height = frame.height;
		this.label.centerHorizontally = true;
		this.label.textColor = "white";
		this.label.font = "20px DOSFont";
		this.addSubview(this.label);
	}
}

BorderView.prototype = new View();

BorderView.prototype.setText = function(text) {
	this.label.text = text;
}

BorderView.prototype.drawAtPosition = function(ctx, x, y) {
	if (this.hidden) {
		return;
	}

	View.prototype.drawAtPosition.call(this, ctx, x, y);

	var borderWidth = 3;

	ctx.save();
	ctx.fillStyle = "white";
	ctx.fillRect(x, y, this.frame.width, borderWidth);
	ctx.fillRect(x, y, borderWidth, this.frame.height);
	ctx.fillRect(x + this.frame.width - borderWidth, y, borderWidth, this.frame.height);
	ctx.fillRect(x, y + this.frame.height - borderWidth, this.frame.width, borderWidth);



	ctx.restore();
}