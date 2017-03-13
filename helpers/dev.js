"use strict";

const path = require("./path"),
			pug = require("pug"),
			fs = require("fs");

module.exports = {
	buildView () {
		return new Promise((resolve, reject) => {
			path.getFilesIn("./banners/")
			.then((banners) => processDevTemplate(banners))
			.then(() => resolve())
			.catch((error) => reject(error))
		});	
	}
}

function processDevTemplate (banners) {
	return new Promise((resolve, reject) => {
		const templatePath = `${__dirname}/../${path.template.dev}`,
					options = {
						pretty: true,
						filename: "index.html",
					},
					locals = {
						banners: banners
					};
		const html = pug.renderFile(templatePath, Object.assign(options, locals));
		fs.writeFileSync("./index.html", html);
		resolve();
	});
}