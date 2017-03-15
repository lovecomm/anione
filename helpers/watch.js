"use strict";

const path = require("./path"),
			fs = require("fs"),
			browserSync = require('browser-sync').create();

module.exports = {
	init () {
		const config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8'));

		return new Promise((resolve, reject) => {
			browserSync.init({
				server: {
						baseDir: './'
				},
				files: path.watch,
				logPrefix: config.project,
				reloadOnRestart: true,
				notify: false
			});
			browserSync.watch(path.watch);
			resolve();
		})
	}
};
