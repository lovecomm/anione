"use strict";

const 	rsync = require('rsyncwrapper'),
				Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				$ = require("./utils"),
				inquirer = require("inquirer"),
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

exports.stage = async function () {
	const preview_file = $.read_path("./preview/index.html");
	if (!preview_file) $.handle_error("No preview found. Generate a prview by running 'ani preview'.");

	let config = JSON.parse(await $.read_path("./ani-conf.json")),
			rsyncOptions = {
				ssh: true,
				src: "./preview/",
				recursive: true,
			};
	
	if (!config.rsyncPath) {
		try {
			const answers = await inquirer.prompt(rsyncQuestions);
			rsyncOptions.dest = answers.destination + config.project + "/";
			config.rsyncPath = rsyncOptions.dest;

			await fs.writeFileAsync("./ani-conf.json", JSON.stringify(config, null, 2));
			handleRsync(rsyncOptions);
		} catch(e) {
			$.handle_error("Rsync setup failed.");
		}

	} else {
		rsyncOptions.dest = config.rsyncPath;
		handleRsync(rsyncOptions);
	}
};

function handleRsync (options) {
	rsync(options, (error, stdout, stderr, cmd) => {
		if (error) $.handle_error(`Error when attempting to rsync the preview to your specified server: ${error}\nThe command: ${cmd}`);
	});
}

exports.stage();
