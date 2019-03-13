const kCommandLineBottomMargin = 100;

var parentDirectory = false;

var devMode = false;
var levelCreator = false;
var parentDirectory = false;
var secretDirectory = false;

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

	this.commands = new Array();
	this.commandIndex = 0;

	// localStorage.clear();
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
	if (parentDirectory) {
		tilde.font = "20px DOSFont";
		tilde.text = "dir "
	} else if (secretDirectory) {
		tilde.font = "20px DOSFont";
		tilde.text = "dir/secret "
	} else {
		tilde.text = "~  "
	}
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

BootSequenceView.prototype.keysUpdated = function(keysDown, event) {
	if (!this.readyForInput || event.type != "keydown") {
		return;
	}

	if (event.keyCode == 9 || event.keyCode == 32 || event.keyCode == 8) {
        event.preventDefault();
    }

	if (this.lessView) {
		if (event.keyCode == 38) {
			event.preventDefault();
			this.lessView.scrollUp();
		} else if (event.keyCode == 40) {
			event.preventDefault();
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

	if (this.levelCreatorView) {
		if (event.keyCode == 81) {
			this.removeSubview(this.levelCreatorView);
			this.levelCreatorView = null;
		} else if (event.keyCode == 82) {
			this.removeSubview(this.levelCreatorView);
			this.levelCreatorView = null;
			var frame = {x: 0, y: 0, width: this.frame.width, height: this.frame.height};
			var levelCreatorView = new LevelCreatorView(frame, this);
			levelCreatorView.backgroundColor = this.backgroundColor;
			levelCreatorView.backgroundColor = "#272822";
			this.addSubview(levelCreatorView);
			this.levelCreatorView = levelCreatorView;
		}
		return;
	}

	if (this.promptingForKeyFile) {
		if (event.keyCode == 13) {
			if (this.promptIsUnlocked || this.inputLabel.text === this.promptingForKeyFile.key) {
				this.unlockFile(this.promptingForKeyFile);
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

		if (this.eventCodeIsInput(event)) {
			this.insertKey(event.key);
		} else if (event.keyCode == 8) {
			this.deleteKey();
		}
		return;
	}

	// up/down
	if (event.keyCode == 38) {
		event.preventDefault();
		if (this.commandIndex > 0) {
			this.commandIndex--;
			this.insertCommand(this.commands[this.commandIndex]);
		}
		return;
	} else if (event.keyCode == 40) {
		event.preventDefault();
		if (this.commandIndex < this.commands.length) {
			this.commandIndex++;
		}
		if (this.commandIndex == this.commands.length) {
			this.insertCommand("");
		} else {
			this.insertCommand(this.commands[this.commandIndex]);
		}
		return;
	}

	// if (levelCreator && event.keyCode == 49) {
	// 	var frame = {x: 0, y: 0, width: this.frame.width, height: this.frame.height};
	// 	var levelCreatorView = new LevelCreatorView(frame);
	// 	levelCreatorView.backgroundColor = this.backgroundColor;
	// 	levelCreatorView.backgroundColor = "#272822";
	// 	this.addSubview(levelCreatorView);
	// 	this.levelCreatorView = levelCreatorView;
	// 	return;
	// }

	if (this.eventCodeIsInput(event)) {
		this.insertKey(event.key);

	} else if (event.keyCode == 8) {
		this.deleteKey();

	} else if (event.keyCode == 13) {
		this.enterCommand(this.inputLabel.text);
	} else if (event.keyCode == 9) {
		this.tabTapped();
	}
	View.prototype.keysUpdated.call(this, keysDown, event);
}

BootSequenceView.prototype.tabTapped = function() {
	var command = this.inputLabel.text;
	command = command.trim();
	if (command && (command.startsWith("less ") || command === "less" || command.startsWith("run ") || command === "run")) {
		var otherText = command.split(" ");
		otherText.shift();
		otherText = otherText.join(" ").toLowerCase();

		if (!otherText) {
			this.printUnlockedFiles();
			return;
		}

		var files = this.unlockedFiles();
		var matchingFiles = new Array();
		for (var i = 0; i < files.length; i++) {
			var filename = files[i];
			if (filename.toLowerCase().startsWith(otherText)) {
				var toAdd = filename.toLowerCase().substring(otherText.length);
				matchingFiles.push(toAdd);
			}
		}

		if (matchingFiles.length == 1) {
			if (this.inputLabel.text && this.inputLabel.text.length > 0) {
				this.xOffset -= this.inputLabel.width();
			}
			this.inputLabel.text += matchingFiles[0];
			this.xOffset += this.inputLabel.width();
			this.cursor.frame = {x: this.xOffset, y: this.inputLabel.frame.y, width: 0, height: 0};
		}

	}
}

BootSequenceView.prototype.insertKey = function(key) {
	if (this.inputLabel.text && this.inputLabel.text.length > 0) {
		this.xOffset -= this.inputLabel.width();
	}
	if (this.inputLabel.text) {
		this.inputLabel.text = this.inputLabel.text + key;
	} else {
		this.inputLabel.text = key;
	}
	this.xOffset += this.inputLabel.width();
	this.cursor.frame = {x: this.xOffset, y: this.inputLabel.frame.y, width: 0, height: 0};
}

BootSequenceView.prototype.deleteKey = function() {
	if (this.inputLabel.text && this.inputLabel.text.length > 0) {
		this.xOffset -= this.inputLabel.width();
		this.inputLabel.text = this.inputLabel.text.substring(-1, this.inputLabel.text.length - 1);
		this.xOffset += this.inputLabel.width();
		this.cursor.frame = {x: this.xOffset, y: this.inputLabel.frame.y, width: 0, height: 0};
	}
}

BootSequenceView.prototype.insertCommand = function(command) {
	if (this.inputLabel.text && this.inputLabel.text.length > 0) {
		this.xOffset -= this.inputLabel.width();
	}
	this.inputLabel.text = command;
	this.xOffset += this.inputLabel.width();
	this.cursor.frame = {x: this.xOffset, y: this.inputLabel.frame.y, width: 0, height: 0};
}

BootSequenceView.prototype.eventCodeIsInput = function(event) {
	// numbers, letters, space, period, underscore
	return (event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 32 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 191 || event.keyCode == 173;
}

BootSequenceView.prototype.enterCommand = function(command) {
	command = command.trim();

	this.commands.push(command);
	this.commandIndex = this.commands.length;

	if (command.startsWith("cd ") || command === "cd") {
		this.navigate(command);
	} else if (command === "ls") {
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

BootSequenceView.prototype.navigate = function(command) {
	var path = command.substring(3).trim().toLowerCase();

	this.yOffset += 40;

	if (!parentDirectory) {
		if (path === "..") {
			parentDirectory = true;
			secretDirectory = false;
		} else if (path === "../home") {
			parentDirectory = false;
			secretDirectory = false;
		} else if (path === "../secret") {
			parentDirectory = false;
			secretDirectory = true;
		}
		this.addCommandLine();
		return;
	}

	if (parentDirectory) {
		if (path === "secret") {
			parentDirectory = false;
			secretDirectory = true;
			this.addCommandLine();
			return;
		} else if (path === "home") {
			parentDirectory = false;
			this.addCommandLine();
			return;
		}
	}

	var filesLabel = new LabelView();
	filesLabel.lineWrap = true;
	filesLabel.lineHeight = 30;
	filesLabel.textColor = "white";
	filesLabel.font = "20px DOSFont";
	filesLabel.text = "Access Denied";
	filesLabel.frame = {x: 0, y: this.yOffset, width: 700, height: 0};
	this.container.addSubview(filesLabel);

	this.yOffset += filesLabel.height() + 20;

	this.addCommandLine();
}

BootSequenceView.prototype.printUnlockedFiles = function() {
	this.yOffset += 40;

	var text;
	if (parentDirectory) {
		text = "home   secret";
	} else if (secretDirectory) {
		text = "level_creator";
		var customFiles = localStorage.getItem("custom_levels");
		if (customFiles) {
			customFiles = JSON.parse(customFiles);
			for (var i = 0; i < customFiles.length; i++) {
				text += "   custom_level_" + (i + 1);
			}
		}
	} else {
		var fileNames = this.unlockedFiles();
		text = fileNames.join('   ');
	}

	var filesLabel = new LabelView();
	filesLabel.lineWrap = true;
	filesLabel.lineHeight = 30;
	filesLabel.textColor = "white";
	filesLabel.font = "20px DOSFont";
	filesLabel.text = text;
	filesLabel.frame = {x: 0, y: this.yOffset, width: 700, height: 0};
	this.container.addSubview(filesLabel);

	this.yOffset += filesLabel.height() + 20;

	this.addCommandLine();
}

BootSequenceView.prototype.unlockedFiles = function() {
	var unlockedFiles = localStorage.getItem("unlocked_files");
	if (!unlockedFiles) {
		unlockedFiles = Array();
	} else {
		unlockedFiles = JSON.parse(unlockedFiles);
	}

	var fileNames = Array();
	for (var i = 0; i < kFiles.length; i++) {
		var file = kFiles[i];
		if (!file.key || unlockedFiles.indexOf(file.name.toLowerCase()) != -1 || devMode) {
			fileNames.push(file.name);
		}
	}

	return fileNames;
}

BootSequenceView.prototype.unlockFile = function(file) {
	var unlockedFiles = localStorage.getItem("unlocked_files");
	if (!unlockedFiles) {
		unlockedFiles = Array();
	} else {
		unlockedFiles = JSON.parse(unlockedFiles);
	}
	if (!unlockedFiles.includes(file.name.toLowerCase())) {
		unlockedFiles.push(file.name.toLowerCase());
		localStorage.setItem("unlocked_files", JSON.stringify(unlockedFiles));
	}
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
	if (!fileToOpen || parentDirectory || secretDirectory) {
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
	this.promptIsUnlocked = unlockedFiles.indexOf(fileToOpen.name.toLowerCase()) > -1 || devMode
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

	if (secretDirectory) {
		if (fileName === "level_creator") {
			
			var frame = {x: 0, y: 0, width: this.frame.width, height: this.frame.height};
			var levelCreatorView = new LevelCreatorView(frame, this);
			levelCreatorView.backgroundColor = this.backgroundColor;
			levelCreatorView.backgroundColor = "#272822";
			this.addSubview(levelCreatorView);
			this.levelCreatorView = levelCreatorView;

			this.yOffset += 40;
			this.addCommandLine();
			return;
		} else if (fileName.startsWith("custom_level_")) {
			var number = fileName.substring(13);
			number = parseInt(number, 10) - 1;
			if (!isNaN(number)) {
				var customFiles = localStorage.getItem("custom_levels");
				if (!customFiles) {
					customFiles = new Array();
				} else {
					customFiles = JSON.parse(customFiles);
				}
				if (number >= 0 && number < customFiles.length) {
					fileToOpen = JSON.parse(customFiles[number]);
					fileToOpen.type = "game";
					fileToOpen.name = "custom_level_" + number;
				}
			}
		}

	} else {
		for (var i = 0; i < kFiles.length; i++) {
			var file = kFiles[i];
			if (file.name.toLowerCase() === fileName) {
				fileToOpen = file;
				break;
			}
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
	gameView.backgroundColor = this.backgroundColor;
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

