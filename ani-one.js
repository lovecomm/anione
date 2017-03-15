"use strict";

const 	banner = require("./helpers/banner"),
				test = require("./helpers/test"),
				dev = require("./helpers/dev"),
				watch = require("./helpers/watch");


exports.one = function () {
	test.exists("./ani-conf.json")
	.then((configExists) => {
		return configExists 
		? banner.one()
		: Promise.reject("No ani-conf.json found. Please run `ani init` to initialize your project.");
	})
	.then(() => dev.buildView())
	.then(() => watch.init())
	.catch((error) => console.warn("Error while attempting to generate the first banner:\n", error));
}; 

exports.one();
