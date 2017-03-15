"use strict";

const 	banner = require("./helpers/banner"),
				test = require("./helpers/test"),
				watch = require("./helpers/watch"),
				processTemplate = require("./helpers/processTemplate");


exports.one = function () {
	test.exists("./ani-conf.json")
	.then((configExists) => {
		return configExists 
		? banner.one()
		: Promise.reject("No ani-conf.json found. Please run `ani init` to initialize your project.");
	})
	.then(() => processTemplate.dev())
	.then(() => watch.init())
	.catch((error) => console.warn("Error while attempting to generate the first banner:\n", error));
}; 

exports.one();
