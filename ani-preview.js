"use strict";

const path = require("./helpers/path"),
			fs = require("fs"),
			pug = require("pug");

exports.preview = function () {
	path.createDir("./preview") // just in case the user deletes it, create if not there
	.then(() => path.createDir("./preview/banners"))
	.then(() => path.createDir("./preview/assets"))
	.then(() => path.cleanDir("./preview/**"))
	.then(() => path.copyFilesIn(__dirname + "/utils/preview/", "./preview"))
	.then(() => path.copyFilesIn("./banners/", "./preview/banners"))
	.then(() => path.copyFilesIn("./assets/", "./preview/assets"))
	.then(() => processPreviewTemplate())
	.then(() => handleRemoveAniCode())
	.then(() => console.log("done"))
	.catch((error) => console.error(error))
}; 

exports.preview();

function processPreviewTemplate () {
	return new Promise((resolve, reject) => {
		var mAnimated, mFailovers;

		path.getFilesIn("./banners/")
		.then((animated) => {
			mAnimated = animated.map((banner) => {
				var newPath = banner.path.replace(/\.\/banners\//ig, "banners/")
				return banner = Object.assign(banner, {path: newPath})
			})
			return path.getFilesIn("./assets/failovers/")
		})
		.then((failovers) => {
			mFailovers = failovers.map((banner) => {
				var newPath = banner.path.replace(/\.\/assets\//ig, "assets/")
				return banner = Object.assign(banner, {path: newPath})
			});
			const config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8')),
						templatePath = `${__dirname}/${path.template.preview}`,
						options = {
							pretty: true,
							filename: "index.html",
						},
						locals = {
							banners: {
								animated: mAnimated,
								failovers: mFailovers,
							},
							pageTitle: config.project,
						};
			const html = pug.renderFile(templatePath, Object.assign(options, locals));
			fs.writeFileSync("./preview/index.html", html)
			resolve(mAnimated)
		})
		.catch((error) => reject(error))
	});
}

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
