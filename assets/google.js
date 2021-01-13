import { Loader } from "@googlemaps/js-api-loader";
import AutocompleteDirectionsHandler from './google/autocomplete.js'; 
const google_api_key = process.env.GOOGLE_API_KEY;
let map, infoWindow;

const loader = new Loader({
    apiKey: google_api_key,
    version: "weekly",
    libraries: ["places", "directions"]
});

loader.load().then(() => {
    const [startInput, endInput] = [document.getElementById('origin-input'), document.getElementById('destination-input')];
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 46.71109, lng: 1.7191036 },
        zoom: 7,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT
        },
    });
    new AutocompleteDirectionsHandler(map);
});

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
        );
    infoWindow.open(map);
}