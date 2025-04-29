const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const Log = require("logger");

module.exports = NodeHelper.create({
    start: function () {
        Log.log("MMM-GoogleMapsTraffic node helper started");
    },

    socketNotificationReceived: function (notification, payload) {
        Log.log("Node helper received notification:", notification);
        if (notification === "MMM-GOOGLE_MAPS-TRAFFIC-GET" || notification === "MMM-GOOGLE_MAPS_TRAFFIC-GET") {
            Log.log("Processing style:", payload.style);
            const stylePayload = this.getStyleMap(payload.style);
            this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-RESPONSE", stylePayload);
        }
    },

    getStyleMap: function (style) {
        try {
            const filePath = path.join(__dirname, "mapStyle", `${style}.json`);
            const styledMapType = JSON.parse(fs.readFileSync(filePath, "utf8"));
            Log.log("Style loaded successfully:", style);
            return { styledMapType };
        } catch (err) {
            if (err.code === "ENOENT") {
                Log.log(`Styled map file not found: ${style}`);
            } else {
                Log.error(`Error loading styled map file: ${style}`, err);
            }
            return { styledMapType: [] };
        }
    }
});
