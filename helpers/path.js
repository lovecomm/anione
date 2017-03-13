"use strict";

const camel = require('to-camel-case'),
			fs = require("fs"),
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
	}
};
