"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				path = require("./path");

module.exports = {
	buildDirectories () {
		for (let i = 0; i <= path.buildDirectories.length; i++) {
			const directory = path.buildDirectories[i];
			if (
				directory
				&& !fs.existsSync(directory)
			) fs.mkdirSync(directory)
		}
		return Promise.resolve();
	},
	getConfig: async function() {
		try {
			let config = await fs.statAsync("./ani-conf.json");
			return Promise.resolve({exists: true, config: config})
		} catch (e) {
			if (e.code === "ENOENT") {
				return Promise.resolve({exists: false, config: {}})
			} else {
				return Promise.reject(e)
			}
		}
	}
};