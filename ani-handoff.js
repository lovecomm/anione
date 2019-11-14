"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				rimraf = Promise.promisify(require('rimraf')),
				FolderZip = require('folder-zip'),
				imagemin = require('imagemin'),
				colors = require("colors"),
				$ = require("./utils");

exports.handoff = async function () {
	const config = JSON.parse(await $.read_path("./ani-conf.json")),
				first_banner_file = await $.read_path(`./banners/${config.sizes[0]}.html`);
	if (!config || !first_banner_file) return $.handle_error("No project found, please run 'ani init' and 'ani one' to start your project.");

	try {
		const banner_files = await $.get_files_in("./banners/"),
					handoff_path = "./" + config.project + "-handoff",
					handoff_path_exists = $.read_path(handoff_path);

		if (handoff_path_exists) await rimraf(handoff_path);
		await fs.mkdirAsync(handoff_path);

		// statics
		try {
			let static_files = await $.read_dir("./assets/statics");
			if (static_files) {
				await fs.mkdirAsync(`${handoff_path}/statics`);
				await imagemin([`./assets/statics/*.{jpg,png,gif}`], `${handoff_path}/statics`, {});
				// Rename statics with project name
				await fs.readdir(`${handoff_path}/statics`, (err, files) => {
					for (const file of files) {
						fs.rename(`${handoff_path}/statics/${file}`, `${handoff_path}/statics/${config.project}-${file}`, (err) => {
							if (err) throw err
						})
					}
				})

			} else {
				$.handle_notice("No static files found. As such, none will be added to the handoff.");
			}
		} catch (e) {
			$.handle_notice("No static files found. As such, none will be added to the handoff.");
		}
		// end statics

		for (let vendor_name in config.vendors)	{
			const vendor_path = `${handoff_path}/${vendor_name}`;
			await fs.mkdirAsync(vendor_path);

			for (let banner_info of banner_files) {
				try {
					const zip = Promise.promisifyAll(new FolderZip()),
								zipFolder = Promise.promisify(zip.zipFolder, {context: zip}),
								writeToFile = Promise.promisify(zip.writeToFile, {context: zip}),
								banner = await $.vendorify(config, banner_info, vendor_name, vendor_path);
					await fs.mkdirAsync(banner.path);
					await fs.writeFileAsync(`${banner.path}/index.html`, banner.file);
					await $.get_images_for(banner.size, true, banner.path + "/");
					await zipFolder(banner.path, {excludeParentFolder: true});
					await writeToFile(`${banner.path}.zip`);
					await fs.rename(`${banner.path}.zip`, `${vendor_path}/${config.project}-${banner.size}.zip`, (err) => {
							if (err) throw err
						});
					await rimraf(banner.path)

				} catch (e) {
					$.handle_error(`Failed to gather assets for or zip ${banner_info.filename}`);
				}
			}
		}

		const zip = Promise.promisifyAll(new FolderZip()),
					zipFolder = Promise.promisify(zip.zipFolder, {context: zip}),
					writeToFile = Promise.promisify(zip.writeToFile, {context: zip});

		await zipFolder(handoff_path, {excludeParentFolder: true});
		await writeToFile(`${handoff_path}.zip`);
		await rimraf(handoff_path);
	} catch (e) {
		console.log(e)
		$.handle_error(e, "Generation of handoff failed.")
	}
};

exports.handoff();
