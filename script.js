const workouts = document.querySelector('.workouts');
const form = document.querySelector('.form');
const hidden = document.querySelector('.hidden');
const form__row = document.querySelector('.form__row');
const inputType = document.querySelector('.form__input--type');
const inputDuration = document.querySelector('.form__input--duration');
const inputDistance = document.querySelector('.form__input--distance');
const inputcadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const workout = document.querySelector('.workout');

class App {
  //create private members
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function (error) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert('User denied the request for Geolocation.');
              break;
            case error.POSITION_UNAVAILABLE:
              alert('Location information is unavailable.');
              break;
            case error.TIMEOUT:
              alert('The request to get user location timed out.');
              break;
            case error.UNKNOWN_ERROR:
              alert('An unknown error occurred.');
              break;
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }
  _loadMap(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    console.log(
      'position : ',
      position,
      '\nLatitude:',
      latitude,
      'Longitude:',
      longitude
    );
    console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);
    console.log(this.#map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    console.log(this.#mapEvent);
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputcadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    e.preventDefault();
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputcadence.value =
        '';
    //date
    let now = new Date();
    let month = now.toLocaleString('default', { month: 'long' });
    let date = now.getDate().toString().padStart(2, '0');
    let inputTypeValue = inputType.value === 'running' ? 'Running' : 'Cycling';
    //display marker
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxwidth: 200,
          minwidth: 50,
          autoClose: false,
          closeOnClick: false,
          closeOnEscapKey: false,
          className:
            inputType.value === 'running' ? 'running-popup' : 'cycling-popup',
        })
      )
      .setPopupContent(`${inputTypeValue} on ${month} ${date}`)
      .openPopup();
    const distance = inputDistance.value;
    const duration = inputDuration.value;
    form.classList.add('hidden');
  }
}

const app = new App();

//OOP
class Workout {
  constructor(id, distance, duration, coords, date) {
    this.id = id;
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
    this.date = date;
  }
}
class Running extends Workout {
  constructor(id, distance, duration, coords, date, name, cadence, pace) {
    super(id, distance, duration, coords, date);
    this.name = name;
    this.cadence = cadence;
    this.pace = pace;
  }
}
class Cycling extends Workout {
  constructor(
    id,
    distance,
    duration,
    coords,
    date,
    name,
    elevationGain,
    speed
  ) {
    super(id, distance, duration, coords, date);
    this.name = name;
    this.elevationGain = elevationGain;
    this.speed = speed;
  }
}
