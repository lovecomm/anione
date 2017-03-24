"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs-extra")),
				$ = require("./utils");

exports.preview = async function () {
	const config = JSON.parse(await $.read_path("./ani-conf.json"));
	if (!config) return $.handle_error("No config file found, please run 'ani init'.");

	try {
		await fs.copyAsync(__dirname + "/assets/preview/", "./preview");
		await fs.copyAsync("./banners/", "./preview/banners");
		await fs.copyAsync("./assets/", "./preview/assets");
		await $.process_templates.preview();
		const banner_files = await fs.readdirAsync("./preview/banners/");

		for (let banner_file of banner_files) {
			await $.str_replace_in_files(
				`./preview/banners/${banner_file}`, 
				"return (function() {", 
				"\(function\(\) \{"
			)
		}
	} catch(e) {
		$.handle_error(e, "Failed to generate preview.")
	}
}; 

exports.preview();
