const 	inquirer = require("inquirer"),
				fs = require("fs"),
				colors = require("colors"),
				sizeOptions = require("./conf-options/sizes.json"),
				vendorOptions = require("./conf-options/vendors.json"),
				blueprint = require("./helpers/blueprint");


const init = (function () {
	if (fs.existsSync("./ani-conf.json")) {
		console.warn("Sorry! You're project has already been initialized. You can view options by running `ani --help`, or edit the ani-conf.json file manually.")
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
			.then(() => blueprint.copyTemplates())
			.then(() => getExpandedVendors(answers.vendors))
			.then((vendors) => {
				answers.vendors = vendors;

				fs.writeFile("ani-conf.json", JSON.stringify(answers, null, "  "), (err) => {
					if (err) throw err;
					console.log(colors.yellow(JSON.stringify(answers, null, "  ")), colors.yellow("\n\nYour project config is listed above.\n\nIf this is inaccurate you can edit 'ani-conf.json' manually.\n"));
				});	
			})
			.catch((error) => console.error("Error in blueprint.js module, ", error));
		})
		.catch((error) => console.error("Error in init, ", error));	
	}
})();

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
