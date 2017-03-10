const fs = require("fs");

module.exports = {
	exists (path) { // tests path or file
		return new Promise((resolve, reject) => {
			if (fs.existsSync(path)) {
				resolve(true);
			} else {
				resolve(false);
			}
		})
	}
}