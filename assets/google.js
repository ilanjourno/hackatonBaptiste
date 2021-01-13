import { Loader } from "@googlemaps/js-api-loader";

const google_api_key = process.env.GOOGLE_API_KEY;
let map, infoWindow;

const loader = new Loader({
    apiKey: google_api_key,
    version: "weekly",
});

loader.load().then(() => {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 46.71109, lng: 1.7191036 },
        zoom: 7,
    });
    infoWindow = new google.maps.InfoWindow();
    const locationButton = document.createElement("button");
    locationButton.textContent = "Panoramique vers l'emplacement actuel";
    locationButton.classList.add("custom-map-control-button");
    locationButton.classList.add("btn");
    locationButton.classList.add("btn-primary");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

    locationButton.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    infoWindow.setPosition(pos);
                    infoWindow.setContent("Location found.");
                    infoWindow.open(map);
                    map.setCenter(pos);
                }, () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
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