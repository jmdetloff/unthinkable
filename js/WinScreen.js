function WinScreenView(frame, delegate) {
	this.frame = frame;
	this.delegate = delegate;

	var xOffset = 20;
	var yOffset = 20;

	this.successLabel = new LabelView();
	this.successLabel.textColor = "white";
	this.successLabel.font = "25px DOSFont";
	this.successLabel.text = "Experiment Complete";
	this.successLabel.frame = {x: xOffset, y: yOffset, width: frame.width - 40, height: 25};
	this.addSubview(this.successLabel);

	yOffset += 50;

	this.nextFileLabel = new LabelView();
	this.nextFileLabel.textColor = "white";
	this.nextFileLabel.font = "20px DOSFont";
	this.nextFileLabel.text = "Proceed to next file: " + delegate.nextFile();
	this.nextFileLabel.frame = {x: xOffset, y: yOffset, width: frame.width - 40, height: 25};
	this.addSubview(this.nextFileLabel);

	yOffset += 45;

	this.keyLabel = new LabelView();
	this.keyLabel.textColor = "white";
	this.keyLabel.font = "20px DOSFont";
	this.keyLabel.text = "Key: " + delegate.nextFileKey();
	this.keyLabel.frame = {x: xOffset, y: yOffset, width: frame.width - 40, height: 25};
	this.addSubview(this.keyLabel);

	yOffset += 45;

	this.exitLabel = new LabelView();
	this.exitLabel.textColor = "white";
	this.exitLabel.font = "20px DOSFont";
	this.exitLabel.text = "Press Q to exit or R to retry";
	this.exitLabel.frame = {x: xOffset, y: yOffset, width: frame.width - 40, height: 25};
	this.addSubview(this.exitLabel);
}

WinScreenView.prototype = new BorderView();