"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				$ = require("./utils");

exports.one = async function () {
	const config = JSON.parse(await $.read_path("./ani-conf.json"));
	if (!config) return $.handle_error("No config file found, please run 'ani init'.");

	const banner_file = await $.read_path(`./banners/${config.project}-${config.sizes[0]}.html`);

	try {
		const image_list = await $.get_images_for(config.sizes[0]);
		await $.processTemplates.banner(config, image_list);
		await $.processTemplates.dev();
		await $.watch();
	} catch (e) {
		$.handle_error(e, "Failed to generate first banner.")
	}
}; 

exports.one();
