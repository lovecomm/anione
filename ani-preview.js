"use strict";

const path = require("./helpers/path"),
			fs = require("fs"),
			pug = require("pug"),
			processTemplate = require("./helpers/processTemplate");

exports.preview = function () {
	path.createDir("./preview") // just in case the user deletes it, create if not there
	.then(() => path.createDir("./preview/banners"))
	.then(() => path.createDir("./preview/assets"))
	.then(() => path.cleanDir("./preview/**"))
	.then(() => path.copyFilesIn(__dirname + "/utils/preview/", "./preview"))
	.then(() => path.copyFilesIn("./banners/", "./preview/banners"))
	.then(() => path.copyFilesIn("./assets/", "./preview/assets"))
	.then(() => processTemplate.preview())
	.then(() => handleRemoveAniCode())
	.then(() => console.log("done"))
	.catch((error) => console.error(error))
}; 

exports.preview();

function handleRemoveAniCode () {
	return new Promise((resolve, reject) => {
		path.getFilesIn("./preview/banners/")
		.then((banners) => {
			banners = banners.map((banner) => banner.path);
			banners.forEach((banner) => {
				path.strReplaceInFiles(banner, /return \(function\(\) \{/, '(function() {')
			});
		})
		.catch((error) => reject(error))
	});
}
