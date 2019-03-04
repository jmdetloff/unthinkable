const kCommandLineBottomMargin = 100;

function BootSequenceView(delegate) {
	this.delegate = delegate;
	this.labels = Array();
	this.yOffset = 0;
	this.xOffset = 0;
	this.typing = false;

	this.container = new View();
	this.container.frame = {x: 0, y: 0, width: 0, height: 0};
	this.addSubview(this.container);

	this.backgroundColor = 'rgba(5, 14, 16, 1)';

	this.scrollOffset = 0;

	localStorage.clear();
};

BootSequenceView.prototype = new View();

BootSequenceView.prototype.update = function(timeDelta) {
	if (this.gameView) {
		this.gameView.update(timeDelta);
	}
}

BootSequenceView.prototype.startBoot = function() {
	this.loadSegmentAtIndex(0);
}

BootSequenceView.prototype.bootSegments = function() {
	var segments =
		[{text: "COMPYBIO (C) 1991 Motherboard, Inc.", delay: 0, newLine: true},
		 {text: "BIOS Date 06/01/91 17:22:29 Ver: 09.00.18", delay: 0.1, newLine: true},
		 {text: "CPU:", delay: 0.1, newLine: false},
		 {text: " Intel(R) CPU 330 @ 40 MHz", delay: 0.1, newLine: true},
		 {text: "Speed:", delay: 0.1, newLine: false}, 
		 {text: " 40 MHz", delay: 0.1, newLine: true},
		 {text: "", delay: 0.1, newLine: true},
		 {text: "Press F11 for BBS POPUP", delay: 0.1, newLine: true},
		 {text: "Memory Clock:", delay: 0.1, newLine: false}, 
		 {text: " 64 MHz, Tcl:7 Trcd:4 Trp:8 Tras:20 (2T Timing) 8 bit", delay: 0.1, newLine: true},
		 {text: "Memory Test:", delay: 0.1, newLine: false},
		 {text: " 128420K OK", delay: 0.1, newLine: true},
		 {text: "", delay: 0.1, newLine: true},
		 {text: "PMU ROM Version:", delay: 0.1, newLine: false},
		 {text: "  9303", delay: 0.1, newLine: true},
		 {text: "NVMM ROM Version:", delay: 0.1, newLine: false}, 
		 {text: " 4.092.88", delay: 0.1, newLine: true},
		 {text: "Initializing USB Controllers...", delay: 0.1, newLine: false},
		 {text: "Done.", delay: 0.1, newLine: true},
		 {text: "128MB OK", delay: 0.1, newLine: true},
		 {text: "USB Device(s):", delay: 0.1, newLine: false},
		 {text: " 1 Keyboard, 1 Mouse, 1 Hub, 1 Storage Device", delay: 0.1, newLine: true},
		 {text: "Auto-detecting USB Mass Storage Devices..", delay: 0.1, newLine: true},
		 {text: "Device #01: USB 2.0 FlashDisk *Speed*", delay: 0.1, newLine: true},
		 {text: "01 USB mass storage devices found and configured.", delay: 0.1, newLine: true},
		 {text: "(C) Motherboard, Inc.", delay: 0.1, newLine: true},
		 {text: "64-0100-00001-001011111-092909-79297-1AE0V003-Y2UC", delay: 0.1, newLine: true},
		 {text: "Booting from Hard Disk...", delay: 0.1, newLine: true}];

	return segments;
}

BootSequenceView.prototype.loadSegmentAtIndex = function(index) {
	var segments = this.bootSegments();
	var segment = segments[index];
	var delay = segment.delay;

	var bootSequenceView = this;
	setTimeout(function() { 
		var label = new LabelView();
		label.text = segment.text;
		label.textColor = "white";
		label.frame = {x: bootSequenceView.xOffset, y: bootSequenceView.yOffset, width: 0, height: 0};
		label.font = "20px DOSFont";
		bootSequenceView.container.addSubview(label);

		bootSequenceView.labels.push(label);

		if (segment.newLine) {
			bootSequenceView.yOffset += 25;
			bootSequenceView.xOffset = 0;
		} else {
			bootSequenceView.xOffset += label.width();
		}

		if (index + 1 < segments.length) {
			bootSequenceView.loadSegmentAtIndex(index + 1)
		} else {
			bootSequenceView.endBootSequence();
		}

	}, delay * 1000);
}

BootSequenceView.prototype.endBootSequence = function() {
	this.xOffset = 0;
	this.yOffset += 50;
	this.addCommandLine();
	// var bootSequenceView = this;
	// setTimeout(function() {
	// 	bootSequenceView.typeCommand("ls");
	// }, 1500)
}

BootSequenceView.prototype.addCommandLine = function() {
	this.xOffset = 0;

	if (this.yOffset - this.scrollOffset > this.frame.height - kCommandLineBottomMargin) {
		this.scrollOffset = this.yOffset - this.frame.height + kCommandLineBottomMargin;
		this.container.frame.y = - this.scrollOffset;
	}

	var promptStart = new LabelView();
	promptStart.textColor = "white";
	promptStart.font = "20px DOSFont";
	promptStart.text = "Compy:"
	promptStart.frame = {x: 0, y: this.yOffset, width: 0, height: 0};
	this.container.addSubview(promptStart);

	this.xOffset += promptStart.width();

	var tilde = new LabelView();
	tilde.textColor = "white";
	tilde.text = "~  "
	tilde.frame = {x: this.xOffset, y: this.yOffset, width: 0, height: 0};
	this.container.addSubview(tilde);

	this.xOffset += tilde.width();

	var promptEnd = new LabelView();
	promptEnd.textColor = "white";
	promptEnd.font = "20px DOSFont";
	promptEnd.text = "richardnl$ "
	promptEnd.frame = {x: this.xOffset, y: this.yOffset, width: 0, height: 0};
	this.container.addSubview(promptEnd);

	this.xOffset += promptEnd.width();

	this.inputLabel = new LabelView();
	this.inputLabel.textColor = "white";
	this.inputLabel.font = "20px DOSFont";
	this.inputLabel.frame = {x: this.xOffset, y: this.yOffset, width: 0, height: 0};
	this.container.addSubview(this.inputLabel);

	if (!this.cursor) {
		this.cursor = new LabelView();
		this.cursor.font = "20px DOSFont";
		this.cursor.textColor = "white";
		this.cursor.text = "\u{2588}"
		this.container.addSubview(this.cursor);

		var bootSequenceView = this;
		setInterval(function() {
			if (bootSequenceView.typing) {
				bootSequenceView.cursor.hidden = true;
				return;
			}
			bootSequenceView.cursor.frame = {x: bootSequenceView.xOffset, y: bootSequenceView.inputLabel.frame.y, width: 0, height: 0};
			bootSequenceView.cursor.hidden = !bootSequenceView.cursor.hidden;
		}, 600);
	}
	
	this.cursor.frame = {x: this.xOffset, y: this.yOffset, width: 0, height: 0};

	this.readyForInput = true;
}

BootSequenceView.prototype.typeCommand = function(command) {
	this.typing = true;
	this.cursor.hidden = true;

	var characterIndex = 0;
	var bootSequenceView = this;
	var typeInterval = setInterval(function() {
		if (characterIndex >= command.length) {
			bootSequenceView.typing = false;
			clearInterval(typeInterval);
			return;
		}
		if (characterIndex > 0) {
			bootSequenceView.xOffset -= bootSequenceView.inputLabel.width();
		}
		bootSequenceView.inputLabel.text = command.substring(-1, characterIndex + 1);
		bootSequenceView.xOffset += bootSequenceView.inputLabel.width();
		characterIndex++;
	}, 150);
}

BootSequenceView.prototype.keysUpdated = function(keysDown, event) {
	if (!this.readyForInput || event.type != "keydown") {
		return;
	}

	if (this.lessView) {
		if (event.keyCode == 38) {
			this.lessView.scrollUp();
		} else if (event.keyCode == 40) {
			this.lessView.scrollDown();
		} else if (event.keyCode == 81) {
			this.removeSubview(this.lessView);
			this.lessView = undefined;
		}
		return;
	}

	if (this.gameView) {
		if (event.keyCode == 81) {
			this.gameContainer.removeSubview(this.gameView);
			this.removeSubview(this.gameContainer);
			this.gameView = null;
		} else if (event.keyCode == 32) {
			this.gameView.togglePause();
		} else if (event.keyCode == 82) {
			var file = this.gameView.file;
			this.gameContainer.removeSubview(this.gameView);
			this.removeSubview(this.gameContainer);
			this.gameView = null;
			this.runUnlockedFile(file);
		}
		return;
	}

	if (this.promptingForKeyFile) {
		if (event.keyCode == 13) {
			if (this.promptIsUnlocked && this.inputLabel.text === this.promptingForKeyFile.key) {
				this.validPasscodeEntered();
				return;
			} else if (!this.promptIsUnlocked) {
				this.invalidPasscodeEntered();
				return;
			}
		}

		if (this.promptIsUnlocked) {
			this.addCorrectCharacterToPasscodeInput();
			return;
		}
	}

	if (this.eventCodeIsInput()) {
		if (this.inputLabel.text && this.inputLabel.text.length > 0) {
			this.xOffset -= this.inputLabel.width();
		}
		if (this.inputLabel.text) {
			this.inputLabel.text = this.inputLabel.text + event.key;
		} else {
			this.inputLabel.text = event.key;
		}
		this.xOffset += this.inputLabel.width();
		this.cursor.frame = {x: this.xOffset, y: this.inputLabel.frame.y, width: 0, height: 0};
	} else if (event.keyCode == 8) {
		if (this.inputLabel.text && this.inputLabel.text.length > 0) {
			this.xOffset -= this.inputLabel.width();
			this.inputLabel.text = this.inputLabel.text.substring(-1, this.inputLabel.text.length - 1);
			this.xOffset += this.inputLabel.width();
			this.cursor.frame = {x: this.xOffset, y: this.inputLabel.frame.y, width: 0, height: 0};
		}
	} else if (event.keyCode == 13) {
		this.enterCommand(this.inputLabel.text);
	}
	View.prototype.keysUpdated.call(this, keysDown, event);
}

BootSequenceView.prototype.eventCodeIsInput = function(code) {
	// numbers, letters, space, period, underscore
	return (event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 32 || event.keyCode == 190 || event.keyCode == 189;
}

BootSequenceView.prototype.enterCommand = function(command) {
	if (command === "ls") {
		this.printUnlockedFiles();
	} else if (command === "help") {
		this.printHelp();
	} else if (command.startsWith("less ") || command === "less") {
		this.lessFile(command);
	} else if (command.startsWith("run ") || command === "run") {
		this.runFile(command);
	} else {
		this.printUnrecognizedCommand();
	}
}

BootSequenceView.prototype.printUnlockedFiles = function() {
	this.yOffset += 40;

	var unlockedFiles = localStorage.getItem("unlocked_files");
	if (!unlockedFiles) {
		unlockedFiles = Array();
	} else {
		unlockedFiles = JSON.parse(unlockedFiles);
	}

	var fileNames = Array();
	for (var i = 0; i < kFiles.length; i++) {
		var file = kFiles[i];
		if (!file.key || unlockedFiles.indexOf(file.name.toLowerCase()) != -1) {
			fileNames.push(file.name);
		}
	}

	var filesLabel = new LabelView();
	filesLabel.lineWrap = true;
	filesLabel.lineHeight = 30;
	filesLabel.textColor = "white";
	filesLabel.font = "20px DOSFont";
	filesLabel.text = fileNames.join('   ');
	filesLabel.frame = {x: 0, y: this.yOffset, width: 700, height: 0};
	this.container.addSubview(filesLabel);

	this.yOffset += filesLabel.height() + 20;

	this.addCommandLine();
}

BootSequenceView.prototype.lessFile = function(command) {
	var fileName = command.substring(5, command.length).trim().toLowerCase();
	var fileToOpen;
	for (var i = 0; i < kFiles.length; i++) {
		var file = kFiles[i];
		if (file.name.toLowerCase() === fileName) {
			fileToOpen = file;
			break;
		}
	}
	if (!fileToOpen) {
		this.yOffset += 40;

		var unrecognizedCommandLabel = new LabelView();
		unrecognizedCommandLabel.textColor = "white";
		unrecognizedCommandLabel.font = "20px DOSFont";
		unrecognizedCommandLabel.text = "No such file exists."
		unrecognizedCommandLabel.frame = {x: 0, y: this.yOffset, width: 0, height: 0};
		this.container.addSubview(unrecognizedCommandLabel);
	} else if (fileToOpen.type !== "text") {
		this.yOffset += 40;
		var unrecognizedCommandLabel = new LabelView();
		unrecognizedCommandLabel.textColor = "white";
		unrecognizedCommandLabel.font = "20px DOSFont";
		unrecognizedCommandLabel.text = "Error: File improperly formatted"
		unrecognizedCommandLabel.frame = {x: 0, y: this.yOffset, width: 0, height: 0};
		this.container.addSubview(unrecognizedCommandLabel);
	} else {
		if (fileToOpen.key && fileToOpen.key.length) {
			this.promptForKey(fileToOpen);
			return;
		} else {
			this.lessUnlockedFile(fileToOpen);
		}
	}

	this.yOffset += 40;

	this.addCommandLine();
}

BootSequenceView.prototype.promptForKey = function(fileToOpen) {
	this.yOffset += 40;

	var promptLabel = new LabelView();
	promptLabel.textColor = "white";
	promptLabel.font = "20px DOSFont";
	promptLabel.text = "Enter file key: ";
	promptLabel.frame = {x: 0, y: this.yOffset, width: 0, height: 0};
	this.container.addSubview(promptLabel);

	this.xOffset = promptLabel.width();

	this.inputLabel = new LabelView();
	this.inputLabel.textColor = "white";
	this.inputLabel.font = "20px DOSFont";
	this.inputLabel.frame = {x: this.xOffset, y: this.yOffset, width: 0, height: 0};
	this.container.addSubview(this.inputLabel);

	this.cursor.frame = {x: this.xOffset, y: this.yOffset, width: 0, height: 0};

	var unlockedFiles = localStorage.getItem("unlocked_files");
	if (!unlockedFiles) {
		unlockedFiles = Array();
	} else {
		unlockedFiles = JSON.parse(unlockedFiles);
	}

	this.promptingForKeyFile = fileToOpen;
	this.promptIsUnlocked = unlockedFiles.indexOf(fileToOpen.name.toLowerCase()) > -1
}

BootSequenceView.prototype.lessUnlockedFile = function(fileToOpen) {
	var lessView = new LessView(fileToOpen.text, this.frame);
	lessView.backgroundColor = this.backgroundColor;
	this.addSubview(lessView);
	this.lessView = lessView;

	if (fileToOpen.unlocks && fileToOpen.unlocks.length) {
		var unlockedFiles = localStorage.getItem("unlocked_files");
		if (!unlockedFiles) {
			unlockedFiles = new Array();
		} else {
			unlockedFiles = JSON.parse(unlockedFiles);
		}
		if (unlockedFiles.indexOf(fileToOpen.unlocks) == -1) {
			unlockedFiles.push(fileToOpen.unlocks.toLowerCase());
			localStorage.setItem("unlocked_files", JSON.stringify(unlockedFiles));
		}
	}
}

BootSequenceView.prototype.runFile = function(command) {
	var fileName = command.substring(4, command.length).trim().toLowerCase();
	var fileToOpen;
	for (var i = 0; i < kFiles.length; i++) {
		var file = kFiles[i];
		if (file.name.toLowerCase() === fileName) {
			fileToOpen = file;
			break;
		}
	}
	if (!fileToOpen) {
		this.yOffset += 40;

		var unrecognizedCommandLabel = new LabelView();
		unrecognizedCommandLabel.textColor = "white";
		unrecognizedCommandLabel.font = "20px DOSFont";
		unrecognizedCommandLabel.text = "No such file exists."
		unrecognizedCommandLabel.frame = {x: 0, y: this.yOffset, width: 0, height: 0};
		this.container.addSubview(unrecognizedCommandLabel);
	} else if (fileToOpen.type !== "game") {
		this.yOffset += 40;
		var unrecognizedCommandLabel = new LabelView();
		unrecognizedCommandLabel.textColor = "white";
		unrecognizedCommandLabel.font = "20px DOSFont";
		unrecognizedCommandLabel.text = "Error: File improperly formatted"
		unrecognizedCommandLabel.frame = {x: 0, y: this.yOffset, width: 0, height: 0};
		this.container.addSubview(unrecognizedCommandLabel);
	} else {
		if (fileToOpen.key && fileToOpen.key.length) {
			this.promptForKey(fileToOpen);
			return;
		} else {
			this.runUnlockedFile(fileToOpen);
		}
	}

	this.yOffset += 40;

	this.addCommandLine();
}

BootSequenceView.prototype.runUnlockedFile = function(fileToOpen) {
	if (!this.gameViewContainer) {
		var gameContainer = new View();
		gameContainer.frame = {x: 0, y: 0, width: this.frame.width, height: this.frame.height};
		gameContainer.backgroundColor = this.backgroundColor;
		this.gameContainer = gameContainer;
	}

	this.addSubview(gameContainer);

	var frame = {x: 0, y: 0, width: this.frame.width, height: this.frame.height};
	var gameView = new GameView(fileToOpen, frame);
	gameView.winScreenBackgroundColor = this.backgroundColor;
	this.gameContainer.addSubview(gameView);
	this.gameView = gameView;
}

BootSequenceView.prototype.invalidPasscodeEntered = function() {
	this.yOffset += 30;

	var unrecognizedCommandLabel = new LabelView();
	unrecognizedCommandLabel.textColor = "white";
	unrecognizedCommandLabel.font = "20px DOSFont";
	unrecognizedCommandLabel.text = "Invalid Key"
	unrecognizedCommandLabel.frame = {x: 0, y: this.yOffset, width: 0, height: 0};
	this.container.addSubview(unrecognizedCommandLabel);

	this.promptingForKeyFile = undefined;
	this.promptIsUnlocked = false;

	this.yOffset += 40;

	this.addCommandLine();
}

BootSequenceView.prototype.validPasscodeEntered = function() {
	if (this.promptingForKeyFile.type === "text") {
		this.lessUnlockedFile(this.promptingForKeyFile);
		this.promptingForKeyFile = undefined;
	} else {
		this.runUnlockedFile(this.promptingForKeyFile);
		this.promptingForKeyFile = undefined;
	}

	this.yOffset += 40;

	this.addCommandLine();	
}

BootSequenceView.prototype.addCorrectCharacterToPasscodeInput = function() {
	var password = this.promptingForKeyFile.key;
	if (this.inputLabel.text && this.inputLabel.text.length >= password.length) {
		return;
	}
	var existingText = this.inputLabel.text ? this.inputLabel.text : "";
	if (existingText.length) {
		this.xOffset -= this.inputLabel.width();
	}
	this.inputLabel.text = existingText + password.charAt(existingText.length);
	this.xOffset += this.inputLabel.width();
	this.cursor.frame = {x: this.xOffset, y: this.inputLabel.frame.y, width: 0, height: 0};
}

BootSequenceView.prototype.printHelp = function() {
	this.yOffset += 40;

	var helpLines = 
		[
			"ls : Print available files", 
			"less *.txt : Display contents of text file.", 
			"run *.jek : Playback experiment data.",
			"help : Show available commands."
		];

	for (var i = 0; i < helpLines.length; i++) {
		var helpLabel = new LabelView();
		helpLabel.textColor = "white";
		helpLabel.font = "20px DOSFont";
		helpLabel.text = helpLines[i];
		helpLabel.frame = {x: 0, y: this.yOffset, width: 0, height: 0};
		this.container.addSubview(helpLabel);

		this.yOffset += 25;
	}

	this.yOffset += 15;

	this.addCommandLine();
}

BootSequenceView.prototype.printUnrecognizedCommand = function() {
	this.yOffset += 40;

	var unrecognizedCommandLabel = new LabelView();
	unrecognizedCommandLabel.textColor = "white";
	unrecognizedCommandLabel.font = "20px DOSFont";
	unrecognizedCommandLabel.text = "Unrecognized command. Enter 'help' for a list of recognized commands."
	unrecognizedCommandLabel.frame = {x: 0, y: this.yOffset, width: 0, height: 0};
	this.container.addSubview(unrecognizedCommandLabel);

	this.yOffset += 40;

	this.addCommandLine();
}
