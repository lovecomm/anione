"use strict";

const 	fs = require("fs"),
				directories = [
					"./assets",
					"./assets/failovers",
					"./assets/images",
					"./assets/libs-js",
					"./assets/libs-css",
					"./banners",
					"./templates",
				],
				templates = [
					"banner.lodash",
					"dev.lodash",
					"preview.lodash",
				];

module.exports = {
	buildDirectories () {
		return new Promise((resolve, reject) => {
			for (let i = 0; i <= directories.length; i++) {
				const directory = directories[i];
				if (
					directory
					&& !fs.existsSync(directory)
				) fs.mkdirSync(directory)
			}
			resolve();
		});
	},
	copyTemplates () {
		return new Promise((resolve, reject) => {
			for (let i = 0; i <= templates.length; i++) {
				const template = templates[i];
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