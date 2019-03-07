function LoseScreenView(frame) {
	this.frame = frame;

	var xOffset = 20;
	var yOffset = 20;

	this.successLabel = new LabelView();
	this.successLabel.textColor = "white";
	this.successLabel.font = "25px DOSFont";
	this.successLabel.text = "Experiment Failed";
	this.successLabel.frame = {x: xOffset, y: yOffset, width: frame.width - 40, height: 25};
	this.addSubview(this.successLabel);

	yOffset += 50;

	this.exitLabel = new LabelView();
	this.exitLabel.textColor = "white";
	this.exitLabel.font = "20px DOSFont";
	this.exitLabel.text = "Press Q to exit or R to retry";
	this.exitLabel.frame = {x: xOffset, y: yOffset, width: frame.width - 40, height: 25};
	this.addSubview(this.exitLabel);
}

LoseScreenView.prototype = new BorderView();