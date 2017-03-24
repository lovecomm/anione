"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				rimraf = Promise.promisify(require('rimraf')),
				FolderZip = require('folder-zip'),
				$ = require("./utils");

exports.handoff = async function () {
	const config = JSON.parse(await $.read_path("./ani-conf.json")),
				first_banner_file = await $.read_path(`./banners/${config.project}-${config.sizes[0]}.html`);
	if (!config || !first_banner_file) return $.handle_error("No project found, please run 'ani init' and 'ani one' to start your project.");

	try {
		const banner_files = await $.get_files_in("./banners/"),
					handoff_path = "./" + config.project + "-handoff",
					handoff_path_exists = $.read_path(handoff_path);
		
		if (handoff_path_exists) await rimraf(handoff_path);
		await fs.mkdirAsync(handoff_path);

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
					await $.copy_files_in("./assets/libs-css/", `${banner.path}/`);
					await $.copy_files_in("./assets/libs-js/", `${banner.path}/`);
					await zipFolder(banner.path, {excludeParentFolder: true});
					await writeToFile(`${banner.path}.zip`);
					await rimraf(banner.path)
				} catch (e) {
					console.log(e)
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
		$.handle_error("Generation of handoff failed.")
	}
};

exports.handoff();
