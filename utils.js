"use strict";

const Promise = require("bluebird"),
			fs = Promise.promisifyAll(require("fs-extra")),
			camel = require('to-camel-case'),
			toTitleCase = require('titlecase'),
			pug = require("pug"),
			colors = require("colors"),
			imagemin = require('imagemin'),
			browserSync = require('browser-sync').create();

const utils = {
	handle_error(e, default_message) { // We don't want to just throw an error object at a user.. so when we reject promises we can give useful error messages. But in the event that it's not an error we're aware of, we still want a default message for that specific ani command.
		if(typeof(e) !== "string") e = default_message;
		console.error(colors.red(`Error! ${e}`));
	},
	handle_notice(message) {
		console.log(colors.yellow(`Notice: ${message}`));
	},
	handle_success(message) {
		console.log(colors.green(`Success! ${message}`));
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
	read_dir: async function(dirPath) {
		try {
			let files = await fs.readdirAsync(dirPath, {hidden: true});
			files = files.filter((file) => file !== ".DS_Store");
			if (files.length > 0) {
				return Promise.resolve(files);
			} else {
				return Promise.resolve(false);
			}
		} catch(e) {
			return Promise.resolve(false);
		}
	},
	vendorify: async function(config, banner_info, vendor_name, vendor_path) {
		const vendor = config.vendors[vendor_name],
					size = banner_info.layer_name,
					destPath = "./" + config.project + "-handoff/" + vendor_name + "/" + size,
					source_path = "./banners/" + size + ".html";

		try {
			let source = await fs.readFileAsync(source_path, "utf8");
			source = this.replace_string_regex(source, "<!-- ANIONE: vendorScriptHeader -->", vendor.scriptHeader);
			source = this.replace_string_regex(source, "<!-- ANIONE: vendorScriptFooter -->", vendor.scriptFooter);
			source = this.replace_string_regex(source, "#ANIONE:vendorLink", vendor.link);
			source = this.replace_string_regex(source, "../assets/images/", "");
			source = source.replace(/return \(function\(\) \{/, '(function() {');

			return Promise.resolve({
				file: source,
				path: destPath,
				size: size,
			});
		} catch (e) {
			return Promise.reject("Failed to vendorify.\nBanner: ${banner.filename}.\nVendor: ${vendor_name}.")
		}
	},
	get_images_for: async function (size, copy, destination) {
		let img_array = [];

		try {
			const files = await fs.readdirAsync("./assets/images/");
				for (let i = 0; i < files.length; i++) {
				let filename = files[i];

				if (!this.is_hidden(filename)) { // we don't want hidden files
					let layer_name = camel(filename.split('-')[1].split('.')[0]);

					if( filename.indexOf( size ) > -1 ) { // specific to the size provided
						img_array.push({
							"filename" : filename,
							"layer_name" : layer_name
						});
					}
				}
			}
			if (copy) {
				await imagemin([`./assets/images/${size}-*.{jpg,png,gif}`], destination, {});
				let img_array_paths = img_array.map((img_item) => `${destination}${img_item.filename}`);
			}
			return Promise.resolve(img_array);
		} catch (e) {
			return Promise.reject("Problem finding image assets.")
		}
	},
	process_templates: {
		banner: async function (config, image_list) {
			const $ = utils;
			const banner_file = await $.read_path(`./banners/${config.sizes[0]}.html`),
						templatePath = `${__dirname}/${$.paths.template.banner}`,
						options = {
							pretty: true,
							filename: "index.html",
						},
						locals = {
							images: image_list,
							imgPath: $.paths.directories.images,
							width: config.sizes[0].split("x")[0],
							height: config.sizes[0].split("x")[1],
							pageTitle: config.sizes[0],
						},
						html = pug.renderFile(templatePath, Object.assign(options, locals));

			if (banner_file) return $.handle_notice(`Your first banner, ${config.sizes[0]} already exists. You can regenerate it from the template by deleting ${config.sizes[0]}.html and running 'ani one' again.`);

			try {
				await fs.writeFileAsync(`./banners/${config.sizes[0]}.html`, html);
				return Promise.resolve();
			} catch (e) {
				return Promise.reject("Failed to process banner template.")
			}
		},
		dev: async function () {
			const $ = utils;
			try {
				let 	banner_files = await fs.readdirAsync("./banners/"),
							scrubber = await $.read_path(`${__dirname}/assets/GSDevTools.js`),
							templatePath = `${__dirname}/${$.paths.template.dev}`;
							banner_files = banner_files.filter((filename) => !$.is_hidden(filename));
				const options = {
								pretty: true,
								filename: "index.html",
							},
							locals = {
								banners: banner_files,
								scrubber: scrubber
							},
							html = pug.renderFile(templatePath, Object.assign(options, locals));
				await fs.writeFileAsync("./index.html", html);
			} catch (e) {
				return Promise.reject("Failed to process development template.")
			}
		},
		preview: async function () {
			const $ = utils,
						config = JSON.parse(await $.read_path("./ani-conf.json"));
			if (!config) return Promise.reject("No config found. Watch failed.");

			try {
				let animated_banners = await $.get_files_in("./banners/"),
						static_banners = await $.get_files_in("./assets/statics/");

				animated_banners = animated_banners.map((banner) => {
					const newPath = banner.path.replace(/\.\/banners\//ig, "banners/"),
								size = banner.layer_name;
					return banner = Object.assign(banner, {
						path: newPath,
						width: size.split("x")[0],
						height: size.split("x")[1],
					})
				});

				static_banners = static_banners.map((banner) => {
					var newPath = banner.path.replace(/\.\/assets\//ig, "assets/")
					return banner = Object.assign(banner, {path: newPath})
				});

				const templatePath = `${__dirname}/${$.paths.template.preview}`,
							options = {
								pretty: true,
								filename: "index.html",
							},
							locals = {
								banners: {
									animated: animated_banners,
									statics: static_banners,
								},
								pageTitle: config.project,
							},
							html = pug.renderFile(templatePath, Object.assign(options, locals));
				await fs.writeFileAsync("./preview/index.html", html)
				return Promise.resolve();
			} catch(e) {
				return Promise.reject("Cannot find banners.")
			}
		},
	},
	watch: async function() {
		const config = await this.read_path("./ani-conf.json");
		if (!config) return Promise.reject("No config found. Watch failed.")

		browserSync.init({
			server: {
					baseDir: './'
			},
			files: this.paths.watch,
			logPrefix: config.project,
			reloadOnRestart: true,
			notify: false
		});
		browserSync.watch(this.paths.watch);
		return Promise.resolve();
	},
	replace_string_regex (source, pattern, newString) {
		const re = new RegExp(pattern, "g");
		return source.replace(re, newString);
	},
	get_files_in: async function (filePath) {
		try {
			const files = await fs.readdirAsync(filePath);
			let files_array = [];
			for (let filename of files) {
				if (filename && !this.is_hidden(filename)) { // we don't want hidden files
					let layer_name = camel(filename.split('.')[0]);
					files_array.push({
						'filename' : filename,
						"layer_name" : layer_name,
						"path": filePath + filename,
					});
				}
			}
			return Promise.resolve(files_array);
		} catch (e) {
			return Promise.reject(`Problem getting files in ${filePath}`)
		}
	},
	copy_files_in: async function (srcPath, targetPath) {
		try {
			let srcFiles = await this.read_dir(srcPath);
			if (srcFiles) {
				await fs.copyAsync(srcPath, targetPath);
				return Promise.resolve(true);
			} else {
				return Promise.resolve(false);
			}
		} catch (e) {
			return Promise.reject(`Problem copying files from ${srcPath} to ${targetPath}.`);
		}
 	},
	str_replace_in_files: async function (file_path, target, replacement) {
		try {
			let result = await fs.readFileAsync(file_path, "utf8");
			result = result.replace(target, replacement);
			await fs.writeFileAsync(file_path, result);
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
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
					return this.handle_notice(`Couldn't create project directory, ${directory}`);
				}
			}
		}
		return Promise.resolve();
	},
	paths: {
		build_directories: [ // these are the directories that are generated during `ani init`
			"./assets",
			"./assets/statics",
			"./assets/images",
			"./banners",
			"./preview",
			"./preview/assets",
			"./preview/banners",
		],
		directories: {
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
