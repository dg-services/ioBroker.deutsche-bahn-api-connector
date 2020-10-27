"use strict";
const XML2JS = require("xml2js");
const { parseSpecial } = require("./toolCase");

let thisAdapter;

function createIobrokerChannel(channelID, channelName){
	thisAdapter.log.silly("createIobrokerChannel() was called");

	thisAdapter.setObjectNotExists(channelID, {
		type: "channel",
		role: "",
		common: {
		// @ts-ignore
			name: channelName
		},
		native: {}
	});
}

// create tree object name
function createIobrokerStateText(stateID, stateDeviceName, stateDeviceDesc, stateDeviceValue, stateRole, stateWriteable, statePossibleValues){
	thisAdapter.log.silly("createIobrokerStateText() was called");
	thisAdapter.setObjectNotExists(thisAdapter.name + "." + thisAdapter.instance + "." + stateID  + "." + stateDeviceName, {
		type: "state",
		common: {name: stateDeviceDesc,
			desc: stateDeviceDesc,
			type: "string",
			read: true,
			write: stateWriteable,
			role: stateRole,
			states: statePossibleValues
		},
		native: {}
	});
	thisAdapter.setState(thisAdapter.name + "." + thisAdapter.instance + "." + stateID + "." + stateDeviceName, { val: stateDeviceValue, ack: true });
}


// @ts-ignore
class deutscheBahnXML2ioBroker{

	constructor(inAdapter) {
		thisAdapter = inAdapter;
		thisAdapter.log.debug("Class dbApiConnector is ready to go");
	}

	writeTimeTable(paramDbXML) {
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

				createIobrokerChannel(id,"Verbindung");
				createIobrokerStateText(id, "Linie", "Name der Verbindung", String(linie), "text", false);
				createIobrokerStateText(id, "Richtung", "Fahrtrichtung", String(direction), "text", false);
				createIobrokerStateText(id, "Abfahrtszeit", "Geplante Abfahrtszeit", String(departureTime), "text", false);
			});

		});

	}

	updateTimeTable(paramDbXML) {
		thisAdapter.log.silly("updateTimeTable() was called. paramXML: "+ JSON.stringify(paramDbXML));

		const parseString = XML2JS.parseString;

		parseString(paramDbXML, function (err, result) {
			thisAdapter.log.debug("updateTimeTable result: " + JSON.stringify(result));

			const position =  JSON.stringify(result).indexOf("id");

			if (position > 0){
				thisAdapter.log.debug("Aktualisiere Daten");
				const allConnections = result.timetable.s;

				allConnections.forEach(async thisConnection => {
					const id = thisConnection.$.id;
					const departureTime = parseSpecial(thisConnection.dp[0].$.ct);

					thisAdapter.log.debug("ID : " + id);
					thisAdapter.log.debug("Abfahrtszeit Neu: " + departureTime);

					try {
						// Hier muss ich nochmal ran. Ein anderes mal :-)
						const state_check = await thisAdapter.getStateAsync("deutsche-bahn-api-connector.0."+id+".Abfahrtszeit");

						if(String(state_check) != "UNAVAILABLE"){
							const textAlteZeit = state_check.val;
							const alteZeit = new Date(textAlteZeit);
							thisAdapter.log.silly("New Time: " + departureTime + " Old Time: "+alteZeit);
							const diff = departureTime.getTime() - alteZeit.getTime();
							const diffInMinuten = diff/(1000*60);
							thisAdapter.log.silly("Diff Time: "+ diffInMinuten);

							let diffInMinutenText;

							if(diffInMinuten > 0) {diffInMinutenText = "+"+diffInMinuten +" Min";}
							else if(diffInMinuten < 0){	diffInMinutenText = "-"+diffInMinuten + " Min"; }
							else{diffInMinutenText = "On time";}
							createIobrokerStateText(id, "Abfahrtszeit Neu", "Neue Abfahrtszeit", String(departureTime), "text", false);
							createIobrokerStateText(id, "Differenze", "Verschiebung", String(diffInMinutenText), "text", false);
						}

					} catch (error) {
						thisAdapter.log.silly("Diff Time nicht ermittelbar: ");
					}
				});
			} else { thisAdapter.log.debug("Keine Updates vorhanden"); }
		});

	}

}
module.exports = deutscheBahnXML2ioBroker;