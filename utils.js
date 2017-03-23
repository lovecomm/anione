"use strict";

const Promise = require("bluebird"),
			fs = Promise.promisifyAll(require("fs")),
			colors = require("colors");

module.exports = {
	handle_error(e, default_message) { // We don't want to just throw an error object at a user.. so when we reject promises we can give useful error messages. But in the event that it's not an error we're aware of, we still want a default message for that specific ani command.
		if(typeof(e) !== "string") e = default_message;
		console.error(colors.red(`Error! ${e}`));
	},
	handle_success(message) {
		console.log(colors.green(message));
	},
	is_hidden (filename) {
		if (/^\./.test(filename)) {
			return true;
		} else {
			return false;
		}
	},
	read_path: async function(filePath) { // return file if exists, return false if it doesn't
		try {
			return Promise.resolve(await fs.readFileAsync(filePath, "utf8"));
		} catch (e) {
			return Promise.resolve(false)
		}
	},
	build_directories: async function() {
		for (let i = 0; i <= this.paths.build_directories.length; i++) {
			const directory = this.paths.build_directories[i];
			if (directory) {
				try {
					const directoryStat = await this.read_path(directory);
					if (!directoryStat) await fs.mkdirAsync(directory);
				} catch (e) {
					return console.warn(colors.yellow(`Couldn't create project directory, ${directory}`));
				}
			}
		}
		return Promise.resolve();
	},
	paths: {
		build_directories: [ // these are the directories that are generated during `ani init`
			"./assets",
			"./.anione",
			"./assets/failovers",
			"./assets/images",
			"./assets/libs-js",
			"./assets/libs-css",
			"./banners",
			"./preview",
			"./preview/assets",
			"./preview/banners",
		],
		directories: {
			"scripts": "./assets/libs-js/",
			"styles": "./assets/libs-css/",
			"images": "../assets/images/",
		},
		template: {
			"banner" : "templates/banner.pug",
			"dev" : "templates/dev.pug",
			"preview" : "templates/preview.pug",
		},
		watch: [
			"banners/**", 
			"assets/**", 
			"index.html",
		],
	}
};
