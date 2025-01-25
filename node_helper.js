const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({
    start: function () {
      
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "MMM-GOOGLE_MAPS_TRAFFIC-GET") {
            
            this.sendNotification(this.getStyleMap(payload.style));
        }
    },

    getStyleMap: function (style) {
        try {
            const filePath = path.join(__dirname, "mapStyle", `${style}.json`);
            
            const styledMapType = JSON.parse(fs.readFileSync(filePath, "utf8"));
            
            return { styledMapType };
        } catch (err) {
            if (err.code === "ENOENT") {
                console.log(`Styled map file not found: ${style}`);
            } else {
                console.error(`Error loading styled map file: ${style}`, err);
            }
            return { styledMapType: [] }; // Return empty if file not found or invalid
        }
    },

    sendNotification: function (payload) {
        this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-RESPONSE", payload);
    }
});
