function InfoPanelView(frame) {
	this.frame = frame;

	this.nodePopLabel = new LabelView();
	this.nodePopLabel.font = "20px DOSFont";
	this.nodePopLabel.textColor = "white";
	this.addSubview(this.nodePopLabel);

	this.vinePopLabel = new LabelView();
	this.vinePopLabel.font = "20px DOSFont";
	this.vinePopLabel.textColor = "white";
	this.addSubview(this.vinePopLabel);

	this.vineImmunityLabel = new LabelView();
	this.vineImmunityLabel.font = "20px DOSFont";
	this.vineImmunityLabel.textColor = "white";
	this.addSubview(this.vineImmunityLabel);

	this.purgeButton = new View();
	this.mutateButton = new View();
}

InfoPanelView.prototype = new View();

InfoPanelView.prototype.showData = function(nodePop, vinePop, vineImmunity) {
	this.hidden = false;

	this.nodePopLabel.text = "Cell Pop: " + nodePop;
	this.vinePopLabel.text = "Vine Pop: " + vinePop;
	this.vineImmunityLabel.text = "Vine Immunity: " + (100 - vineImmunity) + "%";

	var margin = 20;
	var xOffset = margin;
	var yOffset = 20;

	this.nodePopLabel.frame.x = xOffset;
	this.nodePopLabel.frame.y = yOffset;

	xOffset += this.nodePopLabel.width() + margin;

	this.vinePopLabel.frame.x = xOffset;
	this.vinePopLabel.frame.y = yOffset;

	xOffset += this.vinePopLabel.width() + margin;

	this.vineImmunityLabel.frame.x = xOffset;
	this.vineImmunityLabel.frame.y = yOffset;	
}

InfoPanelView.prototype.clearData = function() {
	this.hidden = true;
}

InfoPanelView.prototype.drawAtPosition = function(ctx, x, y) {
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