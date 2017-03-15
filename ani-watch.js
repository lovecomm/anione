"use strict";

const watch = require("./helpers/watch.js"),
			test = require("./helpers/test");

exports.watch = function () {
	test.exists("./ani-conf.json")
	.then((confExists) => {
		if (!confExists) return Promise.reject("No ani-conf.json found. Please initialize your project by running `ani init`.");

		return test.exists("./index.html")
	})
	.then((devPageExists) => { // if devPage doesn't exist, then neither does the first banner
		if (!devPageExists) return Promise.reject("No banners found. Please generate your first banner by running `ani one`.")

		watch.init();
	})
	.catch((error) => console.error("Error running `ani watch`.\n", error));
};

exports.watch();
