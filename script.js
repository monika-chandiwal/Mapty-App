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

//OOP
class Workout {
  date = new Date();
  id = Math.trunc(Math.random() * 1000000 + 100000).toString();

  constructor(distance, duration, coords, name) {
    this.distance = distance; //km
    this.duration = duration; //min
    this.coords = coords; //[lat, lng]
    //this.calcDate();
    this.name = name;
    this._setDescription();
  }
  // calcDate() {
  //   let now = new Date();
  //   let month = now.toLocaleString('default', { month: 'long' });
  //   let date = now.getDate().toString().padStart(2, '0');
  //   this.date = `${month} ${date}`;
  //   return this.date;
  // }
  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    console.log(this.name);
    this.description = `${this.name} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
    return this.description;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords, 'Running');
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    this.pace = parseFloat(this.pace.toFixed(1));
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(distance, duration, coords, elevationGain) {
    super(distance, duration, coords, 'Cycling');
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);

    return this.speed;
  }
}

///main part
class App {
  //create private members
  #map;
  #mapEvent;
  #workout = [];
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    workouts.addEventListener('click', this._moveToPopup.bind(this));
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
    const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...input) => input.every(inp => inp > 0);

    //get data from from
    const { lat, lng } = this.#mapEvent.latlng;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    let inputTypeValue = inputType.value === 'running' ? 'Running' : 'Cycling';
    let workout;
    //check if data is valid
    // if (!Number.isFinite(distance) || distance < 0) {
    //   return alert('distance should be positive');
    //   inputDistance.value = '';
    // }
    // if (!Number.isFinite(duration) || duration < 0) {
    //   return alert('duration should be positive');
    //   inputDuration.value = '';
    // }
    //if workout running , create running object
    if (inputTypeValue === 'Running') {
      const cadence = +inputcadence.value;
      if (
        //!Number.isFinite(cadence)
        !validInput(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Running(distance, duration, [lat, lng], cadence, 'Running');
    }
    //if workouot cycling , create cycling object
    if (inputTypeValue === 'Cycling') {
      const elevation = +inputElevation.value;
      if (
        //!Number.isFinite(elevation)
        !validInput(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers');
      workout = new Cycling(
        distance,
        duration,
        [lat, lng],
        elevation,
        'Cycling'
      );
    }
    this.#workout.push(workout);
    console.log(workout);
    //Render workout on map as marker
    this._renderWorkoutMarker(workout);
    //render workout on list
    this._renderWorkout(workout);
    //clear inputs
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputcadence.value =
        '';
    //hide the form
    form.classList.add('hidden');
    setTimeout(() => 1000);
  }
  _renderWorkoutMarker(workout) {
    L.marker([...workout.coords])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxwidth: 200,
          minwidth: 50,
          autoClose: false,
          closeOnClick: false,
          closeOnEscapKey: false,
          //className: `${inputType.value}-popup`,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;
    if (workout.type === 'running')
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">
            ${workout.pace}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div></li>`;
    else
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>

    </li>`;

    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(e) {
    const worke = e.target.closest('.workout');
    console.log(worke);
    if (!worke) return;

    const wrk = this.#workout.find(w => w.id === worke.dataset.id);

    console.log('coords : ', wrk.coords);
    this.#map.setView(wrk.coords, 13, {
      animate: true,
      pan: { duration: 1 },
    });
  }
}

const app = new App();
