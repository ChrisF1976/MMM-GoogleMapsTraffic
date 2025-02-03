/* global Module */

/* Magic Mirror
 * Module: MMM-GoogleMapsTraffic
 *
 * By Victor Mora
 * MIT Licensed.
 */

Module.register("MMM-GoogleMapsTraffic", {
    defaults: {
        key: '',
        lat: '',
        lng: '',
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
       // Log.info("Starting module: " + this.name);

        if (this.config.key === "") {
            Log.error("MMM-GoogleMapsTraffic: key not set!");
            return;
        }

        this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-GET", { style: this.config.styledMapType });

        this.updateInterval = setInterval(() => {
            this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-GET", { style: this.config.styledMapType });
        }, this.config.updateInterval);
    },

    getStyles: function () {
      return ["MMM-GoogleMapsTraffic.css"];
    },
    
    getDom: function () {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("id", "map");
      wrapper.className = "GoogleMap";
      wrapper.style.height = this.config.height;
      wrapper.style.width = this.config.width;
    
      if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.config.key}&callback=initMap&libraries=places&v=weekly&loading=async`;
        script.defer = true;
        script.async = true;
    
        window.initMap = () => {
          setTimeout(() => this.initMap(), 100);
        };
    
        document.body.appendChild(script);
      }
    
      return wrapper;
    },

    initMap: function () {
    
        // Wait for styledMapType to be available
    if (!this.styledMapType) {
        setTimeout(() => this.initMap(), 100); // Retry in 100ms
        return;
    }

    try {
        this.map = new google.maps.Map(document.getElementById("map"), {
            zoom: this.config.zoom,
            mapTypeId: this.config.mapTypeId,
            center: { lat: this.config.lat, lng: this.config.lng },
            styles: this.styledMapType.length > 0 ? this.styledMapType : null, // Fallback to default style
            disableDefaultUI: this.config.disableDefaultUI,
            backgroundColor: this.config.backgroundColor
        });

        
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(this.map);
        
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

        } catch (error) {
        console.error("Error initializing Google Map:", error);
    }
},


    socketNotificationReceived: function (notification, payload) {
        if (notification === "MMM-GOOGLE_MAPS_TRAFFIC-RESPONSE") {
            this.styledMapType = payload.styledMapType || [];
            this.updateDom();
        }
    }
});
