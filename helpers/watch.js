"use strict";

const path = require("./path"),
			fs = require("fs"),
			browserSync = require('browser-sync').create(),
			config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8'));

module.exports = {
	init () {
		return new Promise((resolve, reject) => {
			browserSync.init({
				server: {
						baseDir: './'
				},
				files: path.watch,
				logPrefix: config.client,
				reloadOnRestart: true,
				notify: false
			});
			browserSync.watch(path.watch);
			resolve();
		})
	}
};
