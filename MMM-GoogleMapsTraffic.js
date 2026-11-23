/* global Module */

/* Magic Mirror
 * Module: MMM-GoogleMapsTraffic
 *
 * By Victor Mora (modified)
 * MIT Licensed.
 */

Module.register("MMM-GoogleMapsTraffic", {
    defaults: {
        key: '',
        lat: '',          // Provide a valid latitude (e.g., 40.7128)
        lng: '',          // Provide a valid longitude (e.g., -74.0060)
        height: '300px',
        width: '300px',
        zoom: 10,
        mapTypeId: 'roadmap',
        styledMapType: 'standard',
        disableDefaultUI: true,
        updateInterval: 900000,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        markers: []
    },

    start: function () {
        console.log("MMM-GoogleMapsTraffic starting");
        if (this.config.key === "") {
            Log.error("MMM-GoogleMapsTraffic: key not set!");
            return;
        }

        // Unique DOM id so the module does not clash with other modules (or a second instance)
        this.mapId = `${this.identifier}_map`;

        // The style file never changes, so it only needs to be requested once
        this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-GET", { style: this.config.styledMapType });
        console.log("Sent initial notification for style:", this.config.styledMapType);

        // Periodically refresh only the traffic layer
        this.updateIntervalId = setInterval(() => {
            this.refreshTrafficLayer();
        }, this.config.updateInterval);
    },

    refreshTrafficLayer: function () {
        if (!this.map) {
            return;
        }
        console.log("Refreshing traffic layer");
        if (this.trafficLayer) {
            this.trafficLayer.setMap(null);
        }
        this.trafficLayer = new google.maps.TrafficLayer();
        this.trafficLayer.setMap(this.map);
    },

    getStyles: function () {
        return ["MMM-GoogleMapsTraffic.css"];
    },

    getDom: function () {
    
        // Reset map instance if exists
        if (this.map) {
            console.log("Resetting existing map instance");
            google.maps.event.clearInstanceListeners(this.map);
            this.map = null;
        }
    
    
        const wrapper = document.createElement("div");
        wrapper.setAttribute("id", this.mapId);
        wrapper.className = "GoogleMap";
        wrapper.style.height = this.config.height;
        wrapper.style.width = this.config.width;

        // Check if the Google Maps API is already loaded
        if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.config.key}&callback=initMap&libraries=places&v=weekly&loading=async`;
            script.defer = true;
            script.async = true;

            // Create a global callback that calls our module's initMap
            window.initMap = () => {
	        console.log("Google Maps script loaded, initializing map");
                setTimeout(() => {
                    this.initMap();
                }, 100);
            };

            document.body.appendChild(script);
        } else if (typeof google !== "undefined" && google.maps) {
	    console.log("Google Maps already loaded, initializing map");
            // If the API is already loaded, call initMap directly after a brief delay.
            setTimeout(() => {
                this.initMap();
            }, 100);
        }

        return wrapper;
    },


	initMap: function () {
        console.log("Initializing map...");
        const lat = parseFloat(this.config.lat);
        const lng = parseFloat(this.config.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            console.error("Invalid latitude or longitude");
            return;
        }

        const mapElement = document.getElementById(this.mapId);
        if (!mapElement) {
            console.error("Map element not found");
            return;
        }

        try {
            console.log("Creating new map instance");
            this.map = new google.maps.Map(mapElement, {
                zoom: this.config.zoom,
                mapTypeId: this.config.mapTypeId,
                center: { lat: lat, lng: lng },
                styles: this.styledMapType || [],
                disableDefaultUI: this.config.disableDefaultUI,
                backgroundColor: this.config.backgroundColor
            });

            this.trafficLayer = new google.maps.TrafficLayer();
            this.trafficLayer.setMap(this.map);

            if (this.config.markers && Array.isArray(this.config.markers)) {
                this.config.markers.forEach(marker => {
                    const markerLat = parseFloat(marker.lat);
                    const markerLng = parseFloat(marker.lng);
                    if (!Number.isFinite(markerLat) || !Number.isFinite(markerLng)) {
                        console.error("Skipping marker with invalid latitude or longitude:", marker);
                        return;
                    }
                    new google.maps.Marker({
                        map: this.map,
                        position: { lat: markerLat, lng: markerLng },
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 6,
                            fillColor: marker.fillColor || "red",
                            fillOpacity: 1,
                            strokeWeight: 1
                        }
                    });
                });
            }

            google.maps.event.trigger(this.map, 'resize');
            console.log("Map initialized and resize triggered");
        } catch (error) {
            console.error("Error initializing map:", error);
        }
    },

    socketNotificationReceived: function (notification, payload) {
        console.log("Received socket notification:", notification);
        if (notification === "MMM-GOOGLE_MAPS_TRAFFIC-RESPONSE") {
            console.log("Received style response, styledMapType length:", payload.styledMapType.length);
            this.styledMapType = payload.styledMapType;

            if (this.map) {
                console.log("Updating existing map styles");
                this.map.setOptions({ styles: this.styledMapType });
                google.maps.event.trigger(this.map, 'resize');
            } else {
                console.log("Map not initialized, updating DOM");
                this.updateDom(500);
            }
        }
    }
});
