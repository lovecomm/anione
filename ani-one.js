"use strict";

const 	banner = require("./helpers/banner"),
				test = require("./helpers/test"),
				dev = require("./helpers/dev");


exports.one = function () {
	test.exists("./ani-conf.json")
	.then((configExists) => {
		return configExists 
		? banner.one()
		: console.warn("Sorry! You're project hasn't been initialized. Please run `ani init` to initialize your project.");
	})
	.then(() => dev.buildView())
	.catch((error) => console.warn("Error while attempting to generate the first banner: ", error));
}; 

exports.one();
