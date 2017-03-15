"use strict";

const 	path = require("./path"),
				fs = require("fs"),
				toTitleCase = require('titlecase'),
				test = require("./test"),
				pug = require("pug");

module.exports = {
	banner (imageArray) {
		return new Promise((resolve, reject) => {
			const config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8'));
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
	},
	dev () {
		return new Promise((resolve, reject) => {
			path.getFilesIn("./banners/")
			.then((banners) => {
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
			})
		});
	},
	preview () {
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
							templatePath = `${__dirname}/../${path.template.preview}`,
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
}