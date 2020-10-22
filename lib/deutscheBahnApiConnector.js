"use strict";

const FETCH = require("node-fetch");
//const { URLSearchParams } = require("url");
//const WEBSOCKET = require("ws");
const XML2JS = require("xml2js");
const MOMENT = require("moment");


let thisAdapter;
let authTooken;
let evaID;
//let adapterUpAndRunning = false;

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

async function fctGetTimeTable() {
	thisAdapter.log.silly("fctGetTimeTable() was called");

	thisAdapter.log.debug("evaID: " + evaID);
	thisAdapter.log.debug("AuthToken: " + authTooken);

	const url = "https://api.deutschebahn.com/timetables/v1/plan/"+evaID+"/201022/22";

	thisAdapter.log.silly("Aufruf: "+ url);

	const myHeaders = {
		"Authorization": "Bearer "+authTooken,
		"Accept": "application/json"
	};

	thisAdapter.log.debug("Headers: " + JSON.stringify(myHeaders));

	try{
		await FETCH(url,
			{
				method: "GET",
				headers: myHeaders,
				responseType: "json"
			})
			.then((response) => {
				if(response.status == 200){
					return response.clone().json().catch(() => response.text());
				} else {
					thisAdapter.log.error("Response Status "+ response.status + " "+ response.statusText );
					throw "Bad Reply from API";
				}
			//adapter.log.debug('Response: ' + response.status);
			//return response.clone().json().catch(() => response.text())
			})
			.then(myData => {

				//				apiLocationID = myData.data[0].id;
				//				locationID = apiLocationID;
				//locationName = myData.data[0].attributes.name;
				//				const locationType = myData.data[0].type;

				const parseString = XML2JS.parseString;

				parseString(myData, function (err, result) {

					const linie = result.timetable.s[0].tl[0].$.c + result.timetable.s[0].dp[0].$.l;
					const direction = result.timetable.s[0].dp[0].$.ppth.split("|")[0];
					const departureTime = parseSpecial(result.timetable.s[0].dp[0].$.pt);

					thisAdapter.log.debug("Response: " + JSON.stringify(result));
					thisAdapter.log.error("S: " +JSON.stringify(result.timetable.s[0].dp[0].$.ppth));
					thisAdapter.log.error("Linie : " +JSON.stringify(result.timetable.s[0].tl[0].$.c));
					thisAdapter.log.error("Linie : " +JSON.stringify(result.timetable.s[0].dp[0].$.l));
					thisAdapter.log.error("Linie : " + linie);
					thisAdapter.log.error("Richtung : " + direction);
					thisAdapter.log.error("Abfahrtszeit : " + departureTime);

				});

				//thisAdapter.log.debug("Response: " + JSON.stringify(myData));
				//			thisAdapter.log.debug('Location ID: ' + locationID);

				// create Channel locationID
				//	thisAdapter.setObjectNotExists(thisAdapter.name + '.' + thisAdapter.instance + '.' + locationID, {
				//					type: 'folder',
				//					common: {
				//						name: `Location: ${locationName}`,  desc: `Location: ${locationName}`
				//					},
				//					native: {}
				//				});

				//				thisAdapter.setState(thisAdapter.name + '.' + thisAdapter.instance + '.' + locationID, { val: 'Hier steht was', ack: true });

			});
	} catch(error){
		thisAdapter.log.error("Error: " + error);
		throw "fctGetTimeTable failed";
	}
}

// @ts-ignore
class deutscheBahnApiConnector{

	constructor(inAdapter) {
		thisAdapter = inAdapter;
		thisAdapter.log.debug("Class dbApiConnector is ready to go");


		evaID 		 = thisAdapter.config.evaID;
		authTooken 		 = thisAdapter.config.authTooken;
	}

	async start(){
		thisAdapter.log.silly("dbApiConnector.start() function was called");
		//	adapterUpAndRunning = true;
		try{
			await fctGetTimeTable();
		} catch(error){
			thisAdapter.log.error(error);
			throw "Alles Mist! Ich bin raus!";
		}
	}

}
module.exports = deutscheBahnApiConnector;