"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				inquirer = require("inquirer"),
				colors = require("colors"),
				sizeOptions = require("./conf-options/sizes.json"),
				vendorOptions = require("./conf-options/vendors.json"),
				helpers = require("./helpers/helpers"),
				test = require("./helpers/test"),
				configQuestions = [
				{
					type: "input",
					name: "project",
					message: "Project Name? This may be the concept, or a combination of client and concept.\n",
					validate: (answer) => {
						if (answer.length < 1) return "You must enter the Project Name.\n";
						return true;
					}
				}, {
					type: "checkbox",
					message: "Select Banner Sizes. If you do not see all of the required sizes for your project here, you can add them after the project initialization by running `ani size -a widthXHeight`, or by editing ani-conf.js directly.\n",
					name: "sizes",
					choices: sizeOptions,
					validate: (answer) => {
						if (answer.length < 1) return "You must choose at least one size.\n";
						return true;
					}
				}, {
					type: "checkbox",
					message: "Select Vendors. If you do not see all of the required sizes for your project here, you can add them after the project initialization by running `ani vendor -a vendorName`, or by editing ani-conf.js directly.\n",
					name: "vendors",
					choices: Object.keys(vendorOptions),
					validate: (answer) => {
						if (answer.length < 1) return "You must choose at least one vendor.\n";
						return true;
					}
				}
			];

exports.init = async function () {

	let config = await helpers.getConfig();

	if (!config.exists) {
		try {
			let config = await inquirer.prompt(configQuestions);
			helpers.buildDirectories();
			config = await expandVendorsForConfig(config)
			generateConfig(config);
		} catch (e) {
			console.error("Error during init: ", e);
		}
	} else {
		console.warn("Your project has already been initialized. To re-initialize, first delete ani-conf.json.")
	}
};

exports.init();

function expandVendorsForConfig (answers) {
	var vendorKeys = answers.vendors;
	let vendors = {};
	for (let i = 0; i <= vendorKeys.length; i++) {
		const vendorName = vendorKeys[i];
		const vendor = vendorOptions[vendorName];
		if (vendor) vendors[vendorName] = vendor;
	}
	answers.vendors = vendors;
	return Promise.resolve(answers);
}

async function generateConfig (config) {
	// Copy conf file to project instance
	await (fs.writeFileAsync("ani-conf.json", JSON.stringify(config, null, "  ")))

	// Display config to user
	console.log(colors.yellow(JSON.stringify(config, null, "  ")), colors.yellow("\n\nYour project config is listed above.\n\nIf this is inaccurate you can edit 'ani-conf.json' manually.\n"));

	// Copy README file to project instance
	fs.createReadStream(__dirname + `/README.md`)
	.pipe(fs.createWriteStream("./README.md"));

	// Copy scrubber.js file to project instance
	fs.createReadStream(__dirname + `/utils/scrubber.js`)
	.pipe(fs.createWriteStream("./.anione/scrubber.js"));

	return Promise.resolve();
}
