"use strict";

const camel = require('to-camel-case'),
			fs = require("fs-extra"),
			test = require("./test");

module.exports = {
	buildDirectories: [ // these are the directories that are generated during `ani init`
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
	getImagesFor (size, copy) {
		return new Promise((resolve, reject) => {
			if (!size) reject("Error: No size was provided to path.getImages()");

			let imgArray = [];
			const files = fs.readdirSync("./assets/images/");

			for (let i = 0; i < files.length; i++) {
				let filename = files[i];

				if (!test.isHidden(filename)) { // we don't want hidden files
					let layerName = camel(filename.split('-')[0]);

					if( filename.indexOf( size ) > -1 ) {
						imgArray.push({
							'fileName' : filename,
							"layerName" : layerName}
						);

						if(copy) {
							//copy images to banner specific folder
						}
					}
				}
			}
			resolve(imgArray);
		});
	},
	getFilesIn (path) {
		return new Promise((resolve, reject) => {
			const files = fs.readdirSync(path);
			let filesArray = [];

			for (let i = 0; i < files.length; i++) {
				let filename = files[i];

				if (!test.isHidden(filename)) { // we don't want hidden files
					let layerName = camel(filename.split('.')[0]);

					filesArray.push(
						{
							'fileName' : filename,
							"layerName" : layerName,
							"path": path + filename,
						}
					);
				}
			}
			resolve(filesArray);
		})
	},
	copyFilesIn (target, destination) {
		return new Promise((resolve, reject) => {
			fs.copy(target, destination, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	},
	cleanDir (target) {
		return new Promise((resolve, reject) => {
			fs.remove(target, err => {
				if (err) return reject(err)
				resolve();
			});
		});
	},
	createDir (target) {
		return new Promise((resolve, reject) => {
			test.exists(target)
			.then((targetExists) => {
				if (!targetExists) {
					fs.mkdir(target, err => {
						if (err) return reject(err)
						resolve();
					})
				} else resolve();
			})
			.catch((error) => reject(error))
		});
	},
	strReplaceInFiles (file, target, replacement) {
		return new Promise((resolve, reject) => {
			fs.readFile(file, 'utf8', (err,data) => {
				if (err) reject(err);
				var result = data.replace(target, replacement);

				fs.writeFile(file, result, 'utf8', (err) => {
					if (err) reject(err);
					resolve();
				});
			});
		});
	}
};
