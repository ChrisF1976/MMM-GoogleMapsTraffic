const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({
    start: function () {
        console.log("MMM-GoogleMapsTraffic node helper started");
    },

    socketNotificationReceived: function (notification, payload) {
        console.log("Node helper received notification:", notification);
        if (notification === "MMM-GOOGLE_MAPS-TRAFFIC-GET" || notification === "MMM-GOOGLE_MAPS_TRAFFIC-GET") {
            console.log("Processing style:", payload.style);
            const stylePayload = this.getStyleMap(payload.style);
            this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-RESPONSE", stylePayload);
        }
    },

    getStyleMap: function (style) {
        try {
            const filePath = path.join(__dirname, "mapStyle", `${style}.json`);
            const styledMapType = JSON.parse(fs.readFileSync(filePath, "utf8"));
            console.log("Style loaded successfully:", style);
            return { styledMapType };
        } catch (err) {
            if (err.code === "ENOENT") {
                console.log(`Styled map file not found: ${style}`);
            } else {
                console.error(`Error loading styled map file: ${style}`, err);
            }
            return { styledMapType: [] };
        }
    }
});
