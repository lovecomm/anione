"use strict";

const fs = require("fs"),
			test = require("./helpers/test"),
			path = require("./helpers/path"),
			banner = require("./helpers/banner");

exports.handoff = function () {
	const config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8')),
				handoffPath = "./" + config.project + "-handoff";
	path.getFilesIn("./banners/")
	.then((files) => {
		path.createDir(handoffPath)
		.catch((error) => console.error(error));
		return files	
	})
	.then((files) => {
		Object.keys(config.vendors).forEach((vendorName) => {
			const vendorPath = handoffPath + "/" + vendorName;
			path.createDir(vendorPath)
			.catch((error) => console.error(error));
		});	
		return files;
	})
	.then((files) => {
		files.forEach((file) => {
			banner.vendorify(file)
			.catch((error) => console.error(error))
		})
	})
	.catch((error) => console.error("Error in `ani resize`:\n", error))
};

exports.handoff();
