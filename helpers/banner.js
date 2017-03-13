"use strict";

const 	path = require("./path"),
				test = require("./test"),
				fs = require("fs"),
				pug = require("pug"),
				toTitleCase = require('titlecase');

module.exports = {
	one () {
		return new Promise((resolve, reject) => {
			const config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8'));
			if (!config) reject("Error loading ani-conf.json in banner.one()");
			return path.getImagesFor(config.sizes[0])
			.then((imageArray) => processBannerTemplate(config, imageArray))
			.then(() => resolve())
			.catch((error) => reject(error))
		});
	}
}

function processBannerTemplate (config, imageArray) {
	return new Promise((resolve, reject) => {
		const templatePath = `${__dirname}/../${path.template.banner}`,
					options = {
						pretty: true,
						filename: "index.html",
					},
					locals = {
						images: imageArray,
						imgPath: path.directories.images,
						scripts: fs.readdirSync(path.directories.scripts),
						styles: fs.readdirSync(path.directories.styles),
						width: config.sizes[0].split("x")[0],
						height: config.sizes[0].split("x")[1],
						pageTitle: `${toTitleCase(config.project)}-${config.sizes[0]}`,
					};

		const html = pug.renderFile(templatePath, Object.assign(options, locals));
		test.exists(`./banners/${config.project}-${config.sizes[0]}.html`)
		.then((bannerExists) => {
			if (!bannerExists) {
				fs.writeFileSync(`./banners/${config.project}-${config.sizes[0]}.html`, html);
			}
		})
		.then(() => resolve())
		.catch((error) => reject(error))
	});
}