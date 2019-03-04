function LessView(text, frame) {
	this.text = text;
	this.frame = frame;

	this.container = new View();
	this.container.frame = {x: 0, y: 0, width: frame.width, height: 0};
	this.addSubview(this.container);

	var bottomOffset = 30;

	var label = new LabelView();
	label.lineWrap = true;
	label.lineHeight = 30;
	label.textColor = "white";
	label.font = "20px DOSFont";
	label.text = text;
	label.frame = {x: 0, y: 0, width: frame.width, height: 0};
	label.maxTextHeight = frame.height - bottomOffset - 30;
	this.container.addSubview(label);

	this.textHeight = label.height();

	var directionsLabel = new LabelView();
	directionsLabel.textColor = "white";
	directionsLabel.font = "20px DOSFont";
	directionsLabel.text = "Q to exit, arrow keys to scroll.";
	directionsLabel.frame = {x: 0, y: frame.height - bottomOffset, width: frame.width, height: bottomOffset};
	this.addSubview(directionsLabel);
};

LessView.prototype = new View();

LessView.prototype.scrollUp = function() {
	if (this.container.frame.y >= 0) {
		return;
	}
	this.container.frame.y += 30;
	this.container.frame.y = Math.min(0, this.container.frame.y);
}

LessView.prototype.scrollDown = function() {
	if (this.textHeight <= this.frame.height - 60 - this.container.frame.y) {
		return;
	}

	this.container.frame.y -= 30;
}