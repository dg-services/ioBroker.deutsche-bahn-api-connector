"use strict";


function trailingZero(paramNumber){
	let stringNumber = paramNumber.toString();
	if (stringNumber.length < 2) stringNumber = "0" + stringNumber.toString();
	return stringNumber;
}

function parseSpecial(paramDatum) {

	const constDatum = paramDatum.toString();

	const y = parseInt("20" + constDatum.substr(0,2));
	const m = constDatum.substr(2,2);
	const d = constDatum.substr(4,2);
	const h = constDatum.substr(6,2);
	const M = constDatum.substr(8,2);


	//const myDate = d+"."+m+".20"+y+" "+h+":"+M;
	const localDate = new Date(y, m, d, h, M);

	return localDate;
}

module.exports = {
	trailingZero,
	parseSpecial
};