# MMM-GoogleMapsTraffic

![Alt text](/Traffic.png "A preview of the MMM-GoogleMapsTraffic module.")

A module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/) that displays a map, centered at provided coordinates, with Google Maps Traffic information.

---
**This module has been forked from https://github.com/vicmora/MMM-GoogleMapsTraffic.**
---
## Changes in this fork
- removed all dependencies. If you have the old module installed,delete completely and reinstall this (or use ```mv MMM-GoogleMapsTraffic MMM-GoogleMapsTraffic_backup``` if you have doubts).
- removed nearly all error messages in the console.
- better in the behavior with other modules (I had some crazy failiures - the old module was the reason).
- config.js remains unchanged
- files in the mapStyle folder have a *.json ending now. Please update your mapStyle with this ending, too. - ```mv YOURmapStyle YOURmapStyle.json```

### open issue
in the console you will see this message from google:

`[Warning] As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide. (main.js, line 185)`

I tried to fix that, but this means that the predefined layouts cannot be used anymore. Then erveryone must do this in the maps api. As long as this is only a warning I will ignore that. I had this failire fixed and defeated the google API but it is really complicated to explain. So lets's keep it easy at this point.

## Installation

1. Navigate into your MagicMirror's `~/MagicMirror/modules` folder and execute
```
git clone https://github.com/ChrisF1976/MMM-GoogleMapsTraffic.git
```
**This module has no dependencies anymore.** 
---
## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-GoogleMapsTraffic',
            position: 'top_left',
            config: {
                key: 'YOUR_KEY',
                lat: 37.8262306,
                lng: -122.2920096,
                height: '300px',
                width: '300px'
                styledMapType: "meins",
                disableDefaultUI: true,
                backgroundColor: 'hsla(0, 0%, 0%, 0)',
                markers: [
                    {
                        lat: 37.8262316,
                        lng: -122.2920196,
                        fillColor: '#9966ff'
                    },
                ],
            },
        }
    ]
}
```

## Configuration options

| Option               | Description
|--------------------- |-----------
| `key`                | *Required* Google api key. See below for help.
| `lat`                | *Required* Latitude used to center the map. See below for help. <br><br>**Type:** `float`
| `lng`                | *Required* Longitude used to center the map. See below for help. <br><br>**Type:** `float`
| `height`             | Height of the map. <br><br>**Type:** `string` (pixels) <br> **Default value:** `300px`
| `width`              | Width of the map. <br><br>**Type:** `string` (pixels) <br> **Default value:** `300px`
| `zoom`               | Zoom value to display from lat/lng. <br><br>**Type:** `integer` <br> **Default value:** `10`
| `mapTypeId`          | The map type to display (roadmap, satellite, hybrid, terrain).  <br><br>**Type:** `string` <br> **Default value:** `roadmap`
| `styledMapType`      | Style of the map. See below for help.<br><br>**Type:** `string`<br> **Possible value:** `standard`, `dark`, `night`, `black` or *custom*<br> **Default value:** `standard`
| `disableDefaultUI`   | Disable default UI buttons (Zoom and Street View). <br><br>**Type:** `boolean` <br> **Default value:** `true`
| `updateInterval`     | How often the module should load the map.<br><br>**Type:** `int` in millisecond<br> **Default value:** `900000 (15 mins)`
| `markers`            | Additional markers in the map as an array. See example.
| `backgroundColor`    | Backgound behind the map.Can be set to transparent (`'hsla(0, 0%, 0%, 0)'`) or left at black (default).  <br><br>**Type:** `string` <br> **Default value:** `'rgba(0, 0, 0, 0)'`


## Google API Key

Obtain an api at [Google Developer's page](https://developers.google.com/maps/documentation/javascript/).

## Coordinates

The easiest way to obtain latitude and longitude coordinates is via [Google Maps](https://maps.google.com). Type an address, location, or center the map where you'd like it centered. The coordinates will appear in the address bar as seen below.

![Alt text](https://github.com/vicmora/MMM-GoogleMapsTraffic/img/coordinates.png)

## Map style

The easiest way to create your own styled map is via [Google Maps APIs Styling Wizard](https://mapstyle.withgoogle.com/). Create a new file in `~/MagicMirror/modules/MMM-GoogleMapsTraffic/mapStyle` , using the style name as the filename. Copy JSON data generated by wizard into this file.
**Hint:**
- If you want to configure your own layout press on "use the legacy JSON styling wizard". The "Cloud Console" solution is not implemented in this module yet.
- If you want to use the Cloud Console anyway then contact me. I have the code for that version ready but you will be the alphatester then 8-)

## Dependencies
- none
