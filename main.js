"use strict";

/*
 * Created with @iobroker/create-adapter vunknown
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const request = require("request");

// Load your modules here, e.g.:
// const fs = require("fs");

class tunnelbrokerEndpointUpdater extends utils.Adapter {

    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: "tunnelbroker-endpoint-updater",
        });
        this.on("ready", this.onReady);
        this.on("objectChange", this.onObjectChange);
        this.on("stateChange", this.onStateChange);
        // this.on("message", this.onMessage);
        this.on("unload", this.onUnload);

        this.updateIp();
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        this.log.debug("config username: " + this.config.username);
        this.log.debug("config updatekey: " + this.config.updatekey);
        this.log.debug("config tunnelId: " + this.config.tunnelId);

        await this.updateIp();
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.log.info("cleaned everything up...");
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        } else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }

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

    /**
     * Main Function that Updates the IP Address on Tunnelbroker.net
     */
    async updateIp() {
        try {
            const url = "https://" + this.config.username + ":" + this.config.updatekey + "@ipv4.tunnelbroker.net/nic/update?hostname=" + this.config.tunnelId;
            this.log.info(url);
            const self = this;
            request({method: "GET", url}, function (error, response, result) {
                self.log.info("update TunnelBroker IP output: " + result);
                self.stop();
            }).on("error", function (e) {
                self.log.info(e);
                self.stop();
            });
        } catch (e) {

            this.log.info("Catch Error");
            this.log.info(e);
        }
    }

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

if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new tunnelbrokerEndpointUpdater(options);
} else {
    // otherwise start the instance directly
    new tunnelbrokerEndpointUpdater();
}
