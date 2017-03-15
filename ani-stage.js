"use strict";

const 	rsync = require('rsyncwrapper'),
				fs = require("fs"),
				inquirer = require("inquirer"),
				test = require("./helpers/test"),
				rsyncQuestions = [
				{
					type: "input",
					name: "destination",
					message: "What is the rsync destination (SSH)? Note: Your project name will be added as a child directory of the path you provide.",
					validate: (answer) => {
						if (answer.length < 1) return "A destination must be provided.\n";
						return true;
					}
				}
			];

function handleRsync (options) {
	rsync(options, (error, stdout, stderr, cmd) => {
		if (error) console.error("Error when attempting to rsync the preview to your specified server, ", error, "\n The command: ", cmd);
	});
}

exports.stage = function () {
	test.exists("./preview")
	.then((previewExists) => {
		if (!previewExists) {
			return console.error("You must generate a preview before you can copy it to a staging server. To do this run `ani preview`.")
		} else {
			let config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8'));
			let rsyncOptions = {
				ssh: true,
				src: "./preview/",
				recursive: true,
			}

			if (!config.stagePath) {
				inquirer.prompt(rsyncQuestions)
				.then((answers) => {
					rsyncOptions.dest = answers.destination + config.project + "/"
					config.rsyncPath = rsyncOptions.dest
					fs.writeFileSync("./ani-conf.json", JSON.stringify(config, null, 2));
					handleRsync(rsyncOptions)
				});
			} else {
				rsyncOptions.dest = config.rsyncPath;
				handleRsync(rsyncOptions);
			}
		}
	})
	.catch((error) => console.error("Error in checking if preview exists", error))
};

exports.stage();
