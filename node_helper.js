const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({
    start: function () {
        // Initialization if needed.
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "MMM-GOOGLE_MAPS-TRAFFIC-GET" || notification === "MMM-GOOGLE_MAPS_TRAFFIC-GET") {
            const stylePayload = this.getStyleMap(payload.style);
            this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-RESPONSE", stylePayload);
        }
    },

    getStyleMap: function (style) {
        try {
            // Look for the style JSON file in the "mapStyle" subfolder.
            const filePath = path.join(__dirname, "mapStyle", `${style}.json`);
            const styledMapType = JSON.parse(fs.readFileSync(filePath, "utf8"));
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
