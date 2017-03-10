"use strict";

const 	fs = require("fs"),
				paths = require("./paths");

module.exports = {
	buildDirectories (data) {
		return new Promise((resolve, reject) => {
			for (let i = 0; i <= paths.directories.length; i++) {
				const directory = paths.directories[i];
				if (
					directory
					&& !fs.existsSync(directory)
				) fs.mkdirSync(directory)
			}
			resolve(data);
		});
	},
	copyTemplates () {
		return new Promise((resolve, reject) => {
			for (let i = 0; i <= paths.templates.length; i++) {
				const template = paths.templates[i];
				if (
					template
					&& !fs.existsSync(`./templates/${template}`)
				) {
					fs.createReadStream(__dirname + `/../templates/${template}`)
					.pipe(fs.createWriteStream(`./templates/${template}`));
				}
			}
			resolve();
		})
	}
};