'use strict';


// CLASSES FOR DATA
class Event {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;
    constructor (coords, duration, review, fun) {
        this.coords = coords;
        this.duration = duration;
        this.review = review;
        this.fun = fun;
    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        console.log(this.type)
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
          months[this.date.getMonth()]
        } ${this.date.getDate()}`;
      }

      click() {
        this.clicks++;
      }
}

class Vacation extends Event {
    type = 'vacation'

    constructor (coords, duration, review, fun) {
        super(coords, duration, review, fun);
        this._setDescription();
    }
}

class Business extends Event {
    type = 'business'

    constructor (coords, duration, review, fun) {
        super(coords, duration, review, fun);
        this._setDescription();
    }
}

class Education extends Event {
    type = 'education'

    constructor (coords, duration, review, fun) {
        super(coords, duration, review, fun);
        this._setDescription();
    }
}

const ee = new Business([1, 2], 12, 3, 1);
console.log(ee)
// ACTUAL APPLICATION CODE STARTS HERE
const form = document.querySelector('.form');
const containerLocations = document.querySelector('.locations');
const inputType = document.querySelector('.form__input--type');
const inputDuration = document.querySelector('.form__input--duration');
const inputReview = document.querySelector('.form__input--review');
const inputFun = document.querySelector('.form__input--fun');
const deleteEvents = document.querySelector('.delete');

class App {
    #map;
    #mapZoomLevel = 13;
    #mapEvent;
    #events = [];

    constructor() {
        this._getUserPosition();

      // Get data from local storage
      this._getLocalStorage();

        form.addEventListener('submit', this._newEvent.bind(this));
      inputType.addEventListener('change', this._toggleElevationField);
      containerLocations.addEventListener('click', this._moveToPopup.bind(this));
      deleteEvents.addEventListener('click', this.reset.bind(this))

    }

    _getUserPosition() {
      console.log("Position received")
        if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
    }

    _loadMap(position) {
     
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        // console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);
    
        const coords = [latitude, longitude];
    
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);
        console.log("Map loaded");
        // Handling clicks on map
        this.#map.on('click', this._showForm.bind(this));
    
        this.#events.forEach(work => {
          this._renderEventMarker(work);
        });
      }

      _showForm(mapE) {
        console.log("Form showed")
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDuration.focus();
      }
    
      _hideForm() {
        console.log("Form hidden")
        // Empty inputs
        //inputDuration =
         // '';
    
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000);
      }

      _newEvent(e) {
        console.log("New event created")
        const validInputs = (...inputs) =>
          inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    
        e.preventDefault();
    
        // Get data from form
        const type = inputType.value;
        const duration = +inputDuration.value;
        const review = inputReview.value;
        const fun = inputFun.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let event;
    
        // If event vacation, create vacation object
        if (type === 'vacation') {
    
          // Check if data is valid
          if (
            // !Number.isFinite(distance) ||
            // !Number.isFinite(duration) ||
            // !Number.isFinite(cadence)
            !validInputs(duration) ||
            !allPositive(duration)
          )
            return alert('Inputs have to be positive numbers!');
    
          event = new Vacation([lat, lng], duration, review, fun);
        }

        if (type === 'business') {
    
            // Check if data is valid
            if (
              // !Number.isFinite(distance) ||
              // !Number.isFinite(duration) ||
              // !Number.isFinite(cadence)
              !validInputs(duration) ||
              !allPositive(duration)
            )
              return alert('Inputs have to be positive numbers!');
      
            event = new Business([lat, lng], duration, review, fun);
          }
          
          if (type === 'education') {
    
            // Check if data is valid
            if (
              // !Number.isFinite(distance) ||
              // !Number.isFinite(duration) ||
              // !Number.isFinite(cadence)
              !validInputs(duration) ||
              !allPositive(duration)
            )
              return alert('Inputs have to be positive numbers!');
      
            event = new Education([lat, lng], duration, review, fun);
          }
       
    
        // Add new object to event array
        this.#events.push(event);
    
        // Render event on map as marker
        this._renderEventMarker(event);
    
        // Render event on list
        this._renderEvent(event);
    
        // Hide form + clear input fields
        this._hideForm();
    
        // Set local storage to all events
        this._setLocalStorage();
      }

      _renderEventMarker(event) {
        let emoji;
        if (event.type === 'vacation') emoji = '⛽️';
        if (event.type === 'business') emoji = '📠';
        if (event.type === 'education') emoji = '📚'
        L.marker(event.coords)
          .addTo(this.#map)
          .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: `${event.type}-popup`,
            })
          )
          .setPopupContent(
            `${emoji} ${event.description}`
          )
          .openPopup();
      }

      _renderEvent(event) {
        let emoji;
        if (event.type === 'vacation') emoji = '⛽️';
        if (event.type === 'business') emoji = '📠';
        if (event.type === 'education') emoji = '📚'
        let html = `
          <li class="location event--${event.type}" data-id="${event.id}">
            <h2 class="event__title">${event.description}</h2>
            <div class="event__details">
              <span class="event__icon">${
               emoji
              }</span>
              <span class="event__value">${event.type[0].toUpperCase()}${event.type.slice(1)}</span>
              <span class="event__unit"></span>
            </div>
            <div class="event__details">
              <span class="event__icon">⭐</span>
              <span class="event__value">${event.review}</span>
              <span class="event__unit">star</span>
            </div>
            <div class="event__details">
              <span class="event__icon">⏱</span>
              <span class="event__value">${event.duration}</span>
              <span class="event__unit">${event.duration === 1 ? 'day' : 'days'}</span>
          </div>
          <div class="event__details">
              <span class="event__icon">${event.fun === 'yes' ? '😄' : event.fun === 'sorta' ? '🤔' : '😭'}</span>
              <span class="event__value">${event.fun === 'yes' ? 'Great!' : event.fun === 'sorta' ? 'Okay...' : 'Not okay.'}</span>
              <span class="event__unit"></span>
          </div>
        </li>
        `;
    
       
    
       
    
        form.insertAdjacentHTML('afterend', html);
        //console.log(event.type)
       
      }

      _moveToPopup(e) {
        // BUGFIX: When we click on a workout before the map has loaded, we get an error. But there is an easy fix:
        if (!this.#map) return;
    
        const eventEl = e.target.closest('.location');
    
        if (!eventEl) return;
    
        const event = this.#events.find(
          event => event.id === eventEl.dataset.id
        );
    
        this.#map.setView(event.coords, this.#mapZoomLevel, {
          animate: true,
          pan: {
            duration: 1,
          },
        });
    
        // using the public interface
        // workout.click();
      }
      _setLocalStorage() {
        localStorage.setItem('events', JSON.stringify(this.#events));
      }
    
      _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('events'));
    
        if (!data) return;
    
        this.#events = data;
    
        this.#events.forEach(ev => {
          this._renderEvent(ev);
        });
      }
    
      reset() {
        if (this.#events.length === 0) {
          alert('There are no events to delete!')
          return;
        }
        if (confirm("Are you sure you want to reset?")) {
          localStorage.removeItem('events');
          location.reload();
        } else {
          return;
        }
        
      }
    
}

const app = new App();
