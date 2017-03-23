"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				colors = require("colors"),
				$ = require("./utils");

exports.resize = async function () {
	const config = JSON.parse(await $.read_path("./ani-conf.json"));
	if (!config) return $.handle_error("No config file found, please run 'ani init'.");	

	const first_banner = {
		file: await $.read_path(`./banners/${config.project}-${config.sizes[0]}.html`),
		size: config.sizes[0],
		width: config.sizes[0].split("x")[0],
		height: config.sizes[0].split("x")[1],
	};
	if (!first_banner.file) return $.handle_error("Your first banner couldn't be found. Run 'ani one' to generate your first banner.");

	for (let size of config.sizes) {
		if (size != first_banner.size) {
			let banner_file = await $.read_path(`./banners/${config.project}-${size}.html`);
			if (banner_file) console.warn(colors.yellow(`The banner, ${config.project}-${size}.html already exists so it will not be regenerated. To regenerate it, delete the file and re-run 'ani resize'`));

			let banner = {
				size: size,
				width: size.split("x")[0],
				height: size.split("x")[1],
				file: first_banner.file,
			}

			// CSS instances of size
			banner.file = $.replaceString(banner.file, first_banner.width + "px" , banner.width + "px");
			banner.file = $.replaceString(banner.file, first_banner.height + "px" , banner.height + "px");
			// Meta tags that use size
			banner.file = $.replaceString(banner.file, "width=" + first_banner.width , "width=" + banner.width);
			banner.file = $.replaceString(banner.file, "height=" + first_banner.height , "height=" + banner.height);
			// HTML/img instances of size
			banner.file = $.replaceString(banner.file, first_banner.size , banner.size);
			// JS vars of size
			banner.file = $.replaceString(banner.file, "var w = " + first_banner.width , "var w = " + banner.width);
			banner.file = $.replaceString(banner.file, "var h = " + first_banner.height , "var h = " + banner.height);

			await fs.writeFileAsync(`./banners/${config.project}-${banner.size}.html`, banner.file)
		}
	}
	await $.processTemplates.dev();
	$.watch();
};

exports.resize();
