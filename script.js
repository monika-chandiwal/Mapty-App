const workouts = document.querySelector('.workouts');
const form = document.querySelector('.form');
const hidden = document.querySelector('.hidden');
const form__row = document.querySelector('.form__row');
const inputType = document.querySelector('.form__input--type');
const inputDuration = document.querySelector('.form__input--duration');
const inputDistance = document.querySelector('.form__input--distance');
const inputcadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map;
let mapEvent;
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
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
      map = L.map('map').setView(coords, 13);
      console.log(map);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on('click', function (mapE) {
        mapEvent = mapE;
        console.log(mapEvent);
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    },
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

inputType.addEventListener('change', function (e) {
  console.log(inputcadence.closest('.form__row'));
  inputcadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});

form.addEventListener('submit', function (e) {
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
  //display marker
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
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
    .setPopupContent(
      `${
        inputType.value === 'running' ? 'Running' : 'Cycling'
      } on ${month} ${date}`
    )
    .openPopup();
  form.classList.add('hidden');
});
