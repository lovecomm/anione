const 	inquirer = require("inquirer"),
				fs = require("fs"),
				colors = require("colors"),
				sizeOptions = require("./conf-options/sizes.json"),
				vendorOptions = require("./conf-options/vendors.json"),
				blueprint = require("./helpers/blueprint"),
				test = require("./helpers/test");


const init = (function () {
	test.exists("./ani-conf.json")
	.then((configExists) => {
		if (configExists) {
			console.warn("Sorry! You're project has already been initialized. You can view options by running `ani --help`, or edit the ani-conf.json file manually.");
		} else {
			const 	sizes = sizeOptions,
						vendorsNames = Object.keys(vendorOptions);
	
			inquirer.prompt([
				{
					type: "input",
					name: "project",
					message: "Project Name? This may be the concept, or a combination of client and concept.\n",
					validate: (answer) => {
						if (answer.length < 1) return "You must enter the Project Name.\n";
						return true;
					}
				}, {
					type: "input",
					name: "maxFileSize",
					message: "What is the max file size for your HTML5 banners (in kb)?\n",
					validate: (answer) => {
						if ( isNaN(parseInt(answer)) ) return "You must select a number.\n";
						return true;
					},
					filter: (answer) => parseInt(answer)
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
					choices: vendorsNames,
					validate: (answer) => {
						if (answer.length < 1) return "You must choose at least one vendor.\n";
						return true;
					}
				}
			]).then((answers) => {
				blueprint.buildDirectories()
				.then(() => getExpandedVendors(answers.vendors))
				.then((vendors) => generateConfig({
					project: answers.project,
					maxFileSize: answers.maxFileSize,
					sizes: answers.sizes,
					vendors: vendors,
				}))
				.catch((error) => console.error("Error in blueprint.js module, ", error));
			})
			.catch((error) => console.error("Error in init, ", error));	
		}
	})
	.catch((error) => console.warn("Error checking if config exists, ", error));
})();

function generateConfig (config) {
	console.log("\nconfig \n", config);
	return new Promise((resolve, reject) => {
		// Copy conf file to project instance
		fs.writeFile("ani-conf.json", JSON.stringify(config, null, "  "), (err) => {
			if (err) throw err;
			console.log(colors.yellow(JSON.stringify(config, null, "  ")), colors.yellow("\n\nYour project config is listed above.\n\nIf this is inaccurate you can edit 'ani-conf.json' manually.\n"));
		});	

		// Copy README file to project instance
		test.exists("./README.md")
		.then((readmeExists) => {
			if (readmeExists) {
				fs.createReadStream(__dirname + `/README.md`)
				.pipe(fs.createWriteStream("./README.md"));
			}
		})
		.catch((error) => console.warn("Error checking if README.md exists, ", error));
		resolve(config);
	})
}

function getExpandedVendors (vendorKeys) {
	return new Promise((resolve, reject) => {
		let vendors = {};
		for (let i = 0; i <= vendorKeys.length; i++) {
			const vendorName = vendorKeys[i];
			const vendor = vendorOptions[vendorName];
			if (vendor) vendors[vendorName] = vendor;
		}
		resolve(vendors);
	});
}
