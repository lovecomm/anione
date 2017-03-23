"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				FolderZip = require('folder-zip'),
				$ = require("./utils");

exports.handoff = async function () {
	const config = JSON.parse(await $.read_path("./ani-conf.json")),
				first_banner_file = await $.read_path(`./banners/${config.project}-${config.sizes[0]}.html`);
	if (!config || !first_banner_file) return $.handle_error("No project found, please run 'ani init' and 'ani one' to start your project.");

	try {
		const banner_files = await $.get_files_in("./banners/"),
					handoff_path = "./" + config.project + "-handoff";

		await fs.mkdirAsync(handoff_path);

		for (let vendor in config.vendors)	{
			const vendor_path = `${handoff_path}/${vendor}`;
			await fs.mkdirAsync(vendor_path);

			for (let banner_file of banner_files) {
				$.vendorify(config, banner, vendor, vendor_path);
			}
			// await fs.rmdirAsync(vendor_path);
		}

		// await fs.rmdirAsync(handoff_path);
	} catch (e) {
		console.log(e)
		$.handle_error("Generation of handoff failed.")
	}
};

exports.handoff();
