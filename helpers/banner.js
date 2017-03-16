"use strict";

const 	path = require("./path"),
				test = require("./test"),
				fs = require("fs"),
				pug = require("pug"),
				processTemplate = require("./processTemplate"),
				FolderZip = require('folder-zip'),
				rimraf = require('rimraf');

module.exports = {
	one () {
		return new Promise((resolve, reject) => {
			const config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8'));
			if (!config) reject("Error loading ani-conf.json in banner.one()");
			return path.getImagesFor(config.sizes[0])
			.then((imageArray) => processTemplate.banner(imageArray))
			.then(() => resolve())
			.catch((error) => reject(error))
		});
	},
	resize () {
		return new Promise((resolve, reject) => {
			let config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8'));
			const one = {
				size: config.sizes[0],
				width: config.sizes[0].split("x")[0],
				height: config.sizes[0].split("x")[1],
				html: fs.readFileSync("./banners/" + config.project + "-" + config.sizes[0] + ".html", 'utf8')
			};
			let files = {};
			config.sizes.forEach((size) => {
				if (size !== one.size) { // we already have the first size, dont need it here
					test.exists("./banners/" + config.project + "-" + size + ".html", 'utf8')
					.then((sizeExists) => {
						if (sizeExists) {
							console.warn("The banner, " + config.project + "-" + size + ".html, already exists. To regenerate it, delete the file and re-run `ani resize`")
						} else {
							files[size] = {
								size: size,
								width: size.split("x")[0],
								height: size.split("x")[1],
								html: one.html,
							};

							// CSS instances of size
							files[size].html = replaceString(files[size].html, one.width + "px" , files[size].width + "px");
							files[size].html = replaceString(files[size].html, one.height + "px" , files[size].height + "px");
							// Meta tags that use size
							files[size].html = replaceString(files[size].html, "width=" + one.width , "width=" + files[size].width);
							files[size].html = replaceString(files[size].html, "height=" + one.height , "height=" + files[size].height);
							// HTML/img instances of size
							files[size].html = replaceString(files[size].html, one.size , files[size].size);
							// JS vars of size
							files[size].html = replaceString(files[size].html, "var w = " + one.width , "var w = " + files[size].width);
							files[size].html = replaceString(files[size].html, "var h = " + one.height , "var h = " + files[size].height);
						}
					})
				}
			});
			Object.keys(files).forEach((key) => {
				const file = files[key];
				fs.writeFileSync(`./banners/${config.project}-${file.size}.html`, file.html);
			});
			resolve();
		});
	},
	vendorify (banner) {
		return new Promise((resolve, reject) => {
			const config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8'));
			Object.keys(config.vendors).forEach((vendorName) => {
				const vendor = config.vendors[vendorName],
							size = banner.layerName.split(config.project)[1],
							destPath = "./" + config.project + "-handoff/" + vendorName + "/" + config.project + "-" + size,
							sourcePath = "./banners/" + config.project + "-" + size + ".html";
				let source = fs.readFileSync(sourcePath, 'utf8');

					source = replaceString(source, "<!-- ANIONE: vendorScriptHeader -->", vendor.scriptHeader)
					source = replaceString(source, "<!-- ANIONE: vendorScriptFooter -->", vendor.scriptFooter)
					source = replaceString(source, "#ANIONE:vendorLink", vendor.link)
					source = replaceString(source, "../assets/images/", "")
					source = replaceString(source, "../assets/libs-css/", "")
					source = replaceString(source, "../assets/libs-js/", "")
					source = source.replace(/return \(function\(\) \{/, '(function() {')
				
				path.createDir(destPath + "/")
				.then(() => fs.writeFileSync(destPath + "/index.html", source))
				.then(() => path.getImagesFor(size, true, destPath + "/")) 
				.then(() => path.copyFilesIn("./assets/libs-css/", destPath + "/"))
				.then(() => path.copyFilesIn("./assets/libs-js/", destPath + "/"))
				.then(() => {
					const zip = new FolderZip();
					zip.zipFolder(destPath, () => {
						zip.writeToFile(destPath + ".zip", () => {
							return
						})
					})
				})
				.then(() => {
					// ALSO DEBUG WHY RESIZE ISN'T WORKING
					rimraf(destPath, {
					}, (error) => {
						if (error) Promise.reject(error)
						resolve()
					});
				})
				.catch((error) => reject(error));
			});
		})
	}
}

function replaceString (source, pattern, newString) {
	const re = new RegExp(pattern, "g");
	return source.replace(re, newString);
}