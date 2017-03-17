"use strict";

const 	Promise = require("bluebird"),
				fs = Promise.promisifyAll(require("fs")),
				inquirer = require("inquirer"),
				colors = require("colors"),
				sizeOptions = require("./assets/conf-options/sizes.json"),
				vendorOptions = require("./assets/conf-options/vendors.json"),
				_ = require("./utils"),
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
	
};

exports.init();