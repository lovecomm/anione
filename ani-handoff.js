"use strict";

const fs = require("fs"),
			test = require("./helpers/test");

exports.handoff = function () {
	const config = JSON.parse(fs.readFileSync('./ani-conf.json', 'utf8'));
	test.exists()
	.then((firstSizeExists) => {
		
	})
	.catch((error) => console.error("Error in `ani resize`:\n", error))
};

exports.handoff();
