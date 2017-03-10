"use strict";

const 	fs = require("fs"),
				path = require("./path");

module.exports = {
	buildDirectories (data) {
		return new Promise((resolve, reject) => {
			for (let i = 0; i <= path.buildDirectories.length; i++) {
				const directory = path.buildDirectories[i];
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
			for (let i = 0; i <= path.templates.length; i++) {
				const template = path.templates[i];
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