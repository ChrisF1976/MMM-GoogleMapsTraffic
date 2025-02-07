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
        if (this.config.key === "") {
            Log.error("MMM-GoogleMapsTraffic: key not set!");
            return;
        }

        // Request the styled map JSON from node_helper
        this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-GET", { style: this.config.styledMapType });

        this.updateIntervalId = setInterval(() => {
            this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-GET", { style: this.config.styledMapType });
        }, this.config.updateInterval);
    },

    getStyles: function () {
        return ["MMM-GoogleMapsTraffic.css"];
    },

    getDom: function () {
        const wrapper = document.createElement("div");
        // Use a fixed id (adjust if you plan on multiple instances)
        wrapper.setAttribute("id", "map");
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
                setTimeout(() => {
                    this.initMap();
                }, 100);
            };

            document.body.appendChild(script);
        } else if (typeof google !== "undefined" && google.maps) {
            // If the API is already loaded, call initMap directly after a brief delay.
            setTimeout(() => {
                this.initMap();
            }, 100);
        }

        return wrapper;
    },

    initMap: function () {
        // Validate latitude and longitude.
        if (!this.config.lat || !this.config.lng) {
            console.error("MMM-GoogleMapsTraffic: Invalid latitude or longitude. Please check your configuration.");
            return;
        }

        const mapElement = document.getElementById("map");
        if (!mapElement) {
            console.error("MMM-GoogleMapsTraffic: Map element not found.");
            return;
        }

        // If the map already exists, update its options (style, center, etc.)
        if (this.map) {
            this.map.setOptions({
                zoom: this.config.zoom,
                center: { lat: this.config.lat, lng: this.config.lng },
                styles: (this.styledMapType && this.styledMapType.length > 0) ? this.styledMapType : null,
                disableDefaultUI: this.config.disableDefaultUI,
                backgroundColor: this.config.backgroundColor
            });
        } else {
            try {
                this.map = new google.maps.Map(mapElement, {
                    zoom: this.config.zoom,
                    mapTypeId: this.config.mapTypeId,
                    center: { lat: this.config.lat, lng: this.config.lng },
                    styles: (this.styledMapType && this.styledMapType.length > 0) ? this.styledMapType : null,
                    disableDefaultUI: this.config.disableDefaultUI,
                    backgroundColor: this.config.backgroundColor
                });

                // Add a traffic layer to the map.
                const trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(this.map);

                // Add any markers specified in the configuration.
                if (this.config.markers && Array.isArray(this.config.markers)) {
                    this.config.markers.forEach(marker => {
                        const markerOptions = {
                            map: this.map,
                            position: { lat: marker.lat, lng: marker.lng },
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 6,
                                fillColor: marker.fillColor || "red",
                                fillOpacity: 1,
                                strokeWeight: 1
                            }
                        };
                        new google.maps.Marker(markerOptions);
                    });
                }
            } catch (error) {
                console.error("Error initializing Google Map:", error);
            }
        }
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "MMM-GOOGLE_MAPS_TRAFFIC-RESPONSE") {
            this.styledMapType = payload.styledMapType || [];

            // If the map is already initialized, update its style.
            if (this.map) {
                this.map.setOptions({
                    styles: (this.styledMapType && this.styledMapType.length > 0) ? this.styledMapType : null
                });
            } else {
                // If the map isn't initialized yet, updateDom() will trigger getDom() and then initMap().
                this.updateDom();
            }
        }
    }
});
