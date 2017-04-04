"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				colors = require("colors"),
				$ = require("./utils");

exports.resize = async function () {
	const config = JSON.parse(await $.read_path("./ani-conf.json"));
	if (!config) return $.handle_error("No config file found, please run 'ani init'.");	

	try {
		const first_banner = {
			file: await $.read_path(`./banners/${config.sizes[0]}.html`),
			size: config.sizes[0],
			width: config.sizes[0].split("x")[0],
			height: config.sizes[0].split("x")[1],
		};
		if (!first_banner.file) return $.handle_error("Your first banner couldn't be found. Run 'ani one' to generate your first banner.");

		for (let size of config.sizes) {
			if (size != first_banner.size) {
				let banner_file = await $.read_path(`./banners/${size}.html`);
				if (banner_file) {
					$.handle_notice(`The banner, ${size}.html already exists so it will not be regenerated. To regenerate it, delete the file and re-run 'ani resize'`);
				} else {
					let banner = {
						size: size,
						width: size.split("x")[0],
						height: size.split("x")[1],
						file: first_banner.file,
					}

					// CSS instances of size
					banner.file = $.replace_string_regex(banner.file, first_banner.width + "px" , banner.width + "px");
					banner.file = $.replace_string_regex(banner.file, first_banner.height + "px" , banner.height + "px");
					// Meta tags that use size
					banner.file = $.replace_string_regex(banner.file, "width=" + first_banner.width , "width=" + banner.width);
					banner.file = $.replace_string_regex(banner.file, "height=" + first_banner.height , "height=" + banner.height);
					// HTML/img instances of size
					banner.file = $.replace_string_regex(banner.file, first_banner.size , banner.size);
					// JS vars of size
					banner.file = $.replace_string_regex(banner.file, "var w = " + first_banner.width , "var w = " + banner.width);
					banner.file = $.replace_string_regex(banner.file, "var h = " + first_banner.height , "var h = " + banner.height);

					await fs.writeFileAsync(`./banners/${banner.size}.html`, banner.file)
				}
			}
		}
		await $.process_templates.dev();
		$.watch();
	} catch(e) {
		$.handle_error(e, "Failed to resize.")
	}
};

exports.resize();
