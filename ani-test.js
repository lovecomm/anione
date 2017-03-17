"use strict";

function* getLetters() {
	var word = yield get
}

function* getNumbers(number) {
	yield 32;
	yield 4;
	yield 3;
}

var numbers = getNumbers();

for (const number of numbers) {
	console.log(number);
}
