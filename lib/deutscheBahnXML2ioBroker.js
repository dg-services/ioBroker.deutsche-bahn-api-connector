"use strict";
const XML2JS = require("xml2js");

let thisAdapter;

function parseSpecial(t) {
	thisAdapter.log.debug("parseSpecial param: " + t);
	const y = t.substr(0,2);
	const m = t.substr(2,2);
	const d = t.substr(4,2);
	const h = t.substr(6,2);
	const M = t.substr(8,2);

	const myDate = d+"."+m+".20"+y+" "+h+":"+M;

	return myDate;
}

function writeTimeTable(paramDbXML) {
	thisAdapter.log.silly("writeTimeTable() was called. paramXML: "+ JSON.stringify(paramDbXML));

	const parseString = XML2JS.parseString;

	parseString(paramDbXML, function (err, result) {

		const allConnections = result.timetable.s;

		thisAdapter.log.debug("allConnections: " + JSON.stringify(allConnections));

		allConnections.forEach(thisConnection => {
			const id = thisConnection.$.id;
			const linie = thisConnection.tl[0].$.c + result.timetable.s[0].dp[0].$.l;
			const direction = thisConnection.dp[0].$.ppth.split("|")[0];
			const departureTime = parseSpecial(thisConnection.dp[0].$.pt);
			thisAdapter.log.debug("ID : " + id);
			thisAdapter.log.debug("Linie : " + linie);
			thisAdapter.log.debug("Richtung : " + direction);
			thisAdapter.log.debug("Abfahrtszeit : " + departureTime);
		});


		const linie = result.timetable.s[0].tl[0].$.c + result.timetable.s[0].dp[0].$.l;
		const direction = result.timetable.s[0].dp[0].$.ppth.split("|")[0];
		const departureTime = parseSpecial(result.timetable.s[0].dp[0].$.pt);

		thisAdapter.log.debug("Response: " + JSON.stringify(result));
		thisAdapter.log.debug("S: " +JSON.stringify(result.timetable.s[0].dp[0].$.ppth));
		thisAdapter.log.debug("Linie : " +JSON.stringify(result.timetable.s[0].tl[0].$.c));
		thisAdapter.log.debug("Linie : " +JSON.stringify(result.timetable.s[0].dp[0].$.l));
		thisAdapter.log.debug("Linie : " + linie);
		thisAdapter.log.debug("Richtung : " + direction);
		thisAdapter.log.debug("Abfahrtszeit : " + departureTime);

	});

}

// @ts-ignore
class deutscheBahnXML2ioBroker{

	constructor(inAdapter) {
		thisAdapter = inAdapter;
		thisAdapter.log.debug("Class dbApiConnector is ready to go");
	}

	async writeTimeTable(dbXML){
		thisAdapter.log.silly("writeTimeTable() function was called");
		//	adapterUpAndRunning = true;
		try{
			writeTimeTable(dbXML);
		} catch(error){
			thisAdapter.log.error(error);
			throw "failed to write timeTable";
		}
	}

}
module.exports = deutscheBahnXML2ioBroker;