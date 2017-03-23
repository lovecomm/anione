"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				$ = require("./utils");

exports.one = async function () {
	const config = JSON.parse(await $.read_path("./ani-conf.json"));
	if (!config) return $.handle_error("No config file found, please run 'ani init'.");

	const banner_file = await $.read_path(`./banners/${config.project}-${config.sizes[0]}.html`);
	if (config && banner_file) return $.handle_error(`Your first banner, ${config.project}-${config.sizes[0]} already exists. You can regenerate it from the template by deleting ${config.project}-${config.sizes[0]}.html and running 'ani one' again.`);

	try {
		const image_list = await $.get_images_for(config.sizes[0]);
		await $.processTemplates.banner(config, image_list)
		await $.processTemplates.dev()
	} catch (e) {
		console.log(e)
		$.handle_error(e, "Failed to generate first banner.")
	}
}; 

exports.one();
