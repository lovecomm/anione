"use strict";

const Promise = require("bluebird"),
			fs = Promise.promisifyAll(require("fs")),
			camel = require('to-camel-case'),
			toTitleCase = require('titlecase'),
			pug = require("pug"),
			colors = require("colors");

const utils = {
	handle_error(e, default_message) { // We don't want to just throw an error object at a user.. so when we reject promises we can give useful error messages. But in the event that it's not an error we're aware of, we still want a default message for that specific ani command.
		if(typeof(e) !== "string") e = default_message;
		console.error(colors.red(`Error! ${e}`));
	},
	handle_success(message) {
		console.log(colors.green(message));
	},
	is_hidden (filename) {
		if (/^\./.test(filename)) {
			return true;
		} else {
			return false;
		}
	},
	read_path: async function(filePath) { // return file if exists, return false if it doesn't
		try {
			return Promise.resolve(await fs.readFileAsync(filePath, "utf8"));
		} catch (e) {
			return Promise.resolve(false)
		}
	},
	get_images_for: async function (size, copy, destination) {
		let img_array = [];
		
		try {
			const files = await fs.readdirAsync("./assets/images/");
				for (let i = 0; i < files.length; i++) {
				let filename = files[i];

				if (!this.is_hidden(filename)) { // we don't want hidden files
					let layer_name = camel(filename.split('-')[0]);

					if( filename.indexOf( size ) > -1 ) { // specific to the size provided
						img_array.push({
							'filename' : filename,
							"layer_name" : layer_name}
						);

						if(copy) await fs.copyAsync("./assets/images/" + filename, destination + filename);
					}
				}
			}
			return Promise.resolve(img_array);
		} catch (e) {
			return Promise.reject("Problem finding image assets.")
		}
	},
	processTemplates: {
		banner: async function (config, image_list) {
			const $ = utils;
			const templatePath = `${__dirname}/${$.paths.template.banner}`,
						options = {
							pretty: true,
							filename: "index.html",
						},
						locals = {
							images: image_list,
							imgPath: $.paths.directories.images,
							width: config.sizes[0].split("x")[0],
							height: config.sizes[0].split("x")[1],
							pageTitle: `${toTitleCase(config.project)}-${config.sizes[0]}`,
						},
						html = pug.renderFile(templatePath, Object.assign(options, locals));
			try {
				locals.scripts = await fs.readdirAsync($.paths.directories.scripts);
				locals.styles = await fs.readdirAsync($.paths.directories.styles);
				await fs.writeFileAsync(`./banners/${config.project}-${config.sizes[0]}.html`, html);
				return Promise.resolve();
			} catch (e) {
				console.log(e)
				return Promise.reject("Failed to process banner template.")
			}
		},
		dev: async function () {
			const $ = utils;
		}
	},
	build_directories: async function() {
		for (let i = 0; i <= this.paths.build_directories.length; i++) {
			const directory = this.paths.build_directories[i];
			if (directory) {
				try {
					const directoryStat = await this.read_path(directory);
					if (!directoryStat) await fs.mkdirAsync(directory);
				} catch (e) {
					return console.warn(colors.yellow(`Couldn't create project directory, ${directory}`));
				}
			}
		}
		return Promise.resolve();
	},
	paths: {
		build_directories: [ // these are the directories that are generated during `ani init`
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
	}
};

module.exports = utils;