"use strict";

const FETCH = require("node-fetch");

let thisAdapter;
let authTooken;
let evaID;

// @ts-ignore
class deutscheBahnApiConnector{

	constructor(paramInAdapter, paramAuthTooken) {
		thisAdapter = paramInAdapter;
		authTooken 	 = paramAuthTooken;
		thisAdapter.log.debug("Class dbApiConnector is ready to go");
		thisAdapter.log.debug("AuthTooken Constructor: "+authTooken);
	}

	// Returns an XML
	async getTimeTableData(paramEvaID){

		thisAdapter.log.silly("getTimeTableData() was called");

		evaID 		 = paramEvaID;


		thisAdapter.log.debug("evaID: " + evaID);
		thisAdapter.log.debug("AuthToken: " + authTooken);

		const localDate = new Date();
		const currentHours = localDate.getHours();
		const currentYear = localDate.getFullYear().toString().substr(2,2);
		let currentMonth = (localDate.getMonth()+1).toString();
		let currentDay = localDate.getDate().toString();

		if (currentMonth.length < 2) currentMonth = "0" + currentMonth;
		if (currentDay.length < 2) currentDay = "0" + currentDay;

		thisAdapter.log.silly("Datum: "+localDate+" Stunde: "+ currentHours+" Tag: "+currentDay+" Monat: "+currentMonth+" Jahr: "+currentYear);

		const url = "https://api.deutschebahn.com/timetables/v1/plan/"+evaID+"/"+currentYear+currentMonth+currentDay+"/"+currentHours;

		thisAdapter.log.silly("Aufruf: "+ url);

		const myHeaders = {
			"Authorization": "Bearer "+authTooken,
			"Accept": "application/json"
		};

		thisAdapter.log.debug("Headers: " + JSON.stringify(myHeaders));

		try{
			return await FETCH(url,
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
					thisAdapter.log.debug("getTimeTableData Reply: "+ JSON.stringify(myData));
					return myData;
				});
		} catch(error){
			thisAdapter.log.error("Error: " + error);
			throw "fctGetTimeTable failed";
		}
	}

	async getFullUpdate(paramEvaID){

		thisAdapter.log.silly("getFullUpdate() was called");

		evaID 		 = paramEvaID;

		thisAdapter.log.debug("evaID: " + evaID);
		thisAdapter.log.debug("AuthToken: " + authTooken);

		const url = "https://api.deutschebahn.com/timetables/v1/fchg/"+evaID;

		thisAdapter.log.silly("Aufruf: "+ url);

		const myHeaders = {
			"Authorization": "Bearer "+authTooken,
			"Accept": "application/json"
		};

		thisAdapter.log.debug("Headers: " + JSON.stringify(myHeaders));

		try{
			return await FETCH(url,
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
					thisAdapter.log.debug("getFullUpdate Reply: "+ JSON.stringify(myData));
					return myData;
				});
		} catch(error){
			thisAdapter.log.error("Error: " + error);
			throw "fctGetTimeTable failed";
		}
	}
	async getRecentUpdate(paramEvaID){

		thisAdapter.log.silly("getRecentUpdate() was called");

		evaID 		 = paramEvaID;

		thisAdapter.log.debug("evaID: " + evaID);
		thisAdapter.log.debug("AuthToken: " + authTooken);

		const url = "https://api.deutschebahn.com/timetables/v1/rchg/"+evaID;

		thisAdapter.log.silly("Aufruf: "+ url);

		const myHeaders = {
			"Authorization": "Bearer "+authTooken,
			"Accept": "application/json"
		};

		thisAdapter.log.debug("Headers: " + JSON.stringify(myHeaders));

		try{
			return await FETCH(url,
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
					thisAdapter.log.debug("getRecentUpdate RestApi Reply: "+ JSON.stringify(myData));
					return myData;
				});
		} catch(error){
			thisAdapter.log.error("Error: " + error);
			throw "fctGetTimeTable failed";
		}
	}
}
module.exports = deutscheBahnApiConnector;