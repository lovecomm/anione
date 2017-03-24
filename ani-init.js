"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				inquirer = require("inquirer"),
				colors = require("colors"),
				$ = require("./utils"),
				configQuestions = (vendors, sizes) => {
					return [
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
							choices: sizes,
							validate: (answer) => {
								if (answer.length < 1) return "You must choose at least one size.\n";
								return true;
							}
						}, {
							type: "checkbox",
							message: "Select Vendors. If you do not see all of the required sizes for your project here, you can add them after the project initialization by running `ani vendor -a vendorName`, or by editing ani-conf.js directly.\n",
							name: "vendors",
							choices: Object.keys(vendors),
							validate: (answer) => {
								console.log("answer", answer)
								if (answer.length < 1) return "You must choose at least one vendor.\n";
								return true;
							},
							filter: (vendorKeys) => {
								let fullVendors = {};
								for (let vendorKey of vendorKeys) {
									fullVendors[vendorKey] = vendors[vendorKey];
								}
								return fullVendors;
							}
						}
					];
					return Promise.resolve();
				}

let 	vendors = (async () => await $.read_path(__dirname + "/assets/conf-options/vendors.json"))(),
			sizes = (async () => await $.read_path(__dirname + "/assets/conf-options/sizes.json"))();




exports.init = async function () {
	const config_file = await $.read_path("./ani-conf.json"),
				readme_file = await $.read_path("./README.md"),
				gitignore_file = await $.read_path("./.gitignore");

	if (config_file) return $.handle_notice("Your project has already been initialized. To re-initialize, first delete ani-conf.json.");

	try {
		await $.build_directories();
		vendors = JSON.parse(await vendors);
		sizes = JSON.parse(await sizes);
		let config = await inquirer.prompt(await configQuestions(vendors, sizes));
		config = JSON.stringify(config, null, 2);

		await fs.writeFileAsync("ani-conf.json", config);

		$.handle_success(`${config}\n\nHere is your project config. If this is wrong, you can edit 'ani-conf.json' manually.\n`)

		// Copy README file to project instance
		if (!readme_file) fs.createReadStream(__dirname + `/README.md`).pipe(fs.createWriteStream("./README.md"));

		// Create gitignore
		if (!gitignore_file) await fs.writeFileAsync("./.gitignore", "node_modules");

	} catch (e) {
		$.handle_error(e, "Failed to generate config.")
	}
};

exports.init();