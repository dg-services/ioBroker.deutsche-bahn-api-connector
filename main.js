"use strict";

/*
 * Created with @iobroker/create-adapter v1.29.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const dbApiConnector = require(__dirname + "/lib/deutscheBahnApiConnector");
const dbXML2ioBroker = require(__dirname + "/lib/deutscheBahnXML2ioBroker");
let dbConn;
let dbXML2io;
let adapter;
let lastHour;
let evaID;
// Load your modules here, e.g.:
// const fs = require("fs");

async function getTimeTable(evaID){
	await dbConn.getTimeTableData(evaID)
		.then(dbXML => {
			dbXML2io.writeTimeTable(dbXML);
		});
}

async function getAllUpdates(evaID){
	await dbConn.getFullUpdate(evaID)
		.then(dbXML => {
			dbXML2io.updateTimeTable(dbXML);
		})
	;
}


async function getRecentUpdates(evaID){
	await dbConn.getRecentUpdate(evaID)
		.then(dbXML => {
			dbXML2io.updateTimeTable(dbXML);
		});

}

async function checkWhatToDo(){
	const currentHour = new Date().getHours();

	adapter.log.debug("CheckWhat to do was called. TimeStamp: " + currentHour);

	try{
		if(lastHour != currentHour)	{
			adapter.log.debug("CheckWhat: Full Update");
			await getTimeTable(evaID);
			await getAllUpdates(evaID);
			await getRecentUpdates(evaID);
		} else {
			adapter.log.debug("CheckWhat: RecentUpdate");
			//await getTimeTable(evaID);
			await getRecentUpdates(evaID);

		}
	} catch (error) {
		throw "Nix wars!";
	}

	lastHour = currentHour;
}

class DeutscheBahnApiConnector extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "deutsche-bahn-api-connector",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		adapter = this;
		const localAccessToken 	 = this.config.accessToken;
		evaID 		 = adapter.config.evaID;
		dbConn = new dbApiConnector(this,localAccessToken);
		dbXML2io = new dbXML2ioBroker(this);

		//		try{
		// get initial connections from train station
		//			await dbConn.getTimeTableData(evaID)
		//				.then(dbXML => {
		//					//this.log.debug("getTimeTable dbXML: " + JSON.stringify(dbXML));
		//					dbXML2io.writeTimeTable(dbXML);
		//				});

		// get initial connections from train station
		//			await dbConn.getFullUpdate(evaID)
		//				.then(dbXML => {
		//					this.log.debug("getFullUpdate dbXML: " + JSON.stringify(dbXML));
		//					dbXML2io.updateTimeTable(dbXML);
		//				})
		//			;
		// get initial connections from train station
		//			await dbConn.getRecentUpdate(evaID)
		//				.then(dbXML => {
		//					this.log.debug("getRecentUpdate dbXML: " + JSON.stringify(dbXML));
		//					dbXML2io.updateTimeTable(dbXML);
		//				})
		//			;
		checkWhatToDo();
		setInterval(checkWhatToDo, 60000);

		//		} catch(error){
		//			adapter.log.error(error);
		//			throw "Alles Mist! Ich bin raus!";
		//		}

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/


		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates("lights.*");
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates("*");

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		//await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		//await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		//await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		//let result = await this.checkPasswordAsync("admin", "iobroker");
		//this.log.info("check user admin pw iobroker: " + result);

		//result = await this.checkGroupAsync("admin", "admin");
		//this.log.info("check group user admin group admin: " + result);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.message" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new DeutscheBahnApiConnector(options);
} else {
	// otherwise start the instance directly
	new DeutscheBahnApiConnector();
}