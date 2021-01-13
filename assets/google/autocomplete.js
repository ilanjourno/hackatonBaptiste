module.exports = class AutocompleteDirectionsHandler {
    constructor(map) {
        this.map = map;
        this.originPlaceId = "";
        this.originPos = {};
        this.destinationPlaceId = "";
        this.destinationPos = {};
        this.duration = '';
        this.distance = '';
        this.distanceKm = '';
        this.o = 0;
        this.travelMode = google.maps.TravelMode.WALKING;
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer();
        this.directionsRenderer.setMap(map);
        const originInput = document.getElementById("origin-input");
        const destinationInput = document.getElementById("destination-input");
        const modeSelector = document.getElementById("mode-selector");
        const originAutocomplete = new google.maps.places.Autocomplete(originInput, {country: 'fr'}
        );
        // Specify just the place data fields that you need.
        this.map.controls[google.maps.ControlPosition.BOTTOM].push(document.getElementById('blagues'));
        this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('conseil'));
        originAutocomplete.setFields(["place_id", "geometry", "address_component"]);
        const destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput, {country: 'fr'});
        // Specify just the place data fields that you need.
        destinationAutocomplete.setFields(["place_id", "geometry", "address_component"]);
        this.setupClickListener(
            "changemode-walking",
            google.maps.TravelMode.WALKING
        );
        this.setupClickListener(
            "changemode-bicycling",
            google.maps.TravelMode.BICYCLING
        );
        this.setupClickListener(
            "changemode-transit",
            google.maps.TravelMode.TRANSIT
        );
        this.setupClickListener(
            "changemode-driving",
            google.maps.TravelMode.DRIVING
        );
        this.setupPlaceChangedListener(originAutocomplete, "ORIG");
        this.setupPlaceChangedListener(destinationAutocomplete, "DEST");
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
        this.map.controls[google.maps.ControlPosition.LEFT].push(modeSelector);
    }
    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.
    setupClickListener(id, mode) {
        const radioButton = document.getElementById(id);
        radioButton.addEventListener("click", () => {
        this.travelMode = mode;
        this.route();
        });
    }
    setupPlaceChangedListener(autocomplete, mode) {
        autocomplete.bindTo("bounds", this.map);
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const city = place.address_components[2].long_name;

            if (!place.place_id) {
                window.alert("Veuillez sélectionner une option dans la liste déroulante.");
                return;
            }

            if (mode === "ORIG") {
                this.originPlaceId = place.place_id;
                this.originPos.lat = lat;
                this.originPos.lng = lng;
                this.getWeather(this.originPos, city, mode).then(() => this.route());
            } else {
                this.destinationPlaceId = place.place_id;
                this.destinationPos.lat = lat;
                this.destinationPos.lng = lng;
                this.getWeather(this.destinationPos, city, mode).then(() => this.route());
            }
        });
    }
    getWeather(geometry, city, mode){
        return fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${geometry.lat}&lon=${geometry.lng}&appid=${process.env.WEATHER_API_KEY}&lang=fr&units=metric`).then(response => response.json())
        .then(response => {
            this.o++;
            const departure = mode === "ORIG" ? 'origin' : 'destination';        
            const weather = document.getElementById(`weather-info-${departure}`);
            document.getElementById(`weather-info-${departure}-country`).innerHTML = response.sys.country;
            document.getElementById(`weather-info-${departure}-temp`).innerHTML = response.weather[0].description;
            document.getElementById(`weather-info-${departure}-icon`).src = `http://openweathermap.org/img/w/${response.weather[0].icon}.png`;
            document.getElementById(`weather-info-${departure}-city`).innerHTML = city;
            document.getElementById(`weather-info-${departure}-degrer`).innerHTML = `${response.main.temp}°C`;
            document.getElementById(`weather-info-${departure}-humidity`).innerHTML = `${response.main.humidity}%`;
            if(this.o <= 2){
                return this.map.controls[google.maps.ControlPosition.LEFT].push(weather);
            }
            return;
        });
    }
    route() {
        if (!this.originPlaceId || !this.destinationPlaceId) return;
        const me = this;
        this.directionsService.route(
        {
            origin: { placeId: this.originPlaceId },
            destination: { placeId: this.destinationPlaceId },
            travelMode: this.travelMode,
        }, (response, status) => {
            if (status === "OK") {
                this.duration = response.routes[0].legs[0].duration.text;
                this.distance = response.routes[0].legs[0].distance.value;
                this.distanceKm = response.routes[0].legs[0].distance.text;
                document.getElementById('conseil').innerHTML = this.conseils();
                this.blagues();
                me.directionsRenderer.setDirections(response);
                return;
            } else {
            window.alert("Directions request failed due to " + status);
            }
        }
        );
    }
    conseils(){
        // 1000 = 1 km
        var locomotion = '';
        if(this.distance <= 5000){
            locomotion = '<span class="text-success">vélo ou à pied</span>';
        }else if(this.distance <= 10000){
            locomotion = '<span class="text-success">vélo ou en transport en commun</span>';
        }else if(this.distance <= 15000){
            locomotion = '<span class="text-success">vélo ou en transport en commun</span>';
        }else if(this.distance <= 20000){
            locomotion = '<span class="text-success">transport en commun</span>';
        }else if(this.distance <= 45000){
            locomotion = '<span class="text-warning">transport en commun ou en voiture</span>';
        }else{
            locomotion = '<span class="text-danger">voiture</span>';
        }
        return `Votre trajet est d'une durée de : <span class="text-info">${this.duration} avec ${this.distanceKm}</span>, nous vous conseillons de vous y rendre en ${locomotion} ! Pour vous accompagner, une blague rigolotte vous attends en bas de l'écran !!`;
    }
    blagues(){
        return fetch(`https://blague.xyz/api/joke/random`, {
            headers: {
                'Authorization': `${process.env.BLAGUES_API_TOKEN}`
            }
        }).then(response => response.json()).then(response => {
            document.getElementById('question').innerHTML = response.joke.question;
            document.getElementById('reponse').innerHTML = response.joke.answer;
        })
    }
}