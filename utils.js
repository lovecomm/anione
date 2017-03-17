"use strict";

module.exports = {
	isHidden (filename) {
		if (/^\./.test(filename)) {
			return true;
		} else {
			return false;
		}
	}
};
