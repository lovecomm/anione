"use strict";

const fs = require("fs"),
			test = require("./helpers/test"),
			banner = require("./helpers/banner"),
			processTemplate = require("./helpers/processTemplate");

exports.resize = function () {
	const config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8'));
	test.exists("./banners/" + config.project + "-" + config.sizes[0] + ".html")
	.then((firstSizeExists) => {
		if (!firstSizeExists) {
			console.log("first size doesn't exist")
			Promise.reject("First banner not found. Generate the first banner by running `ani one`.")
		} else {
			return banner.resize();
		}
	})
	.then(() => processTemplate.dev())
	.catch((error) => console.error("Error in `ani resize`:\n", error))
};

exports.resize();
