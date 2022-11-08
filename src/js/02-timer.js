import flatpickr from 'flatpickr';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import 'flatpickr/dist/flatpickr.min.css';

class CountDownTimer {
  #SECOND = 1000;

  #timerRefs = {};
  #date = null;
  #interval = {
    id: null,
    start(cb, delay) {
      if (this.id) return;

      this.id = setInterval(cb, delay);
    },
    isStarted() {
      return !!this.id;
    },
    stop() {
      if (!this.id) return;

      clearInterval(this.id);
      this.id = null;
    },
  };

  constructor(timerRef) {
    this.#timerRefs = {
      days: timerRef.querySelector('[data-days]'),
      hours: timerRef.querySelector('[data-hours]'),
      minutes: timerRef.querySelector('[data-minutes]'),
      seconds: timerRef.querySelector('[data-seconds]'),
    };
  }

  /**
   * Start timer.
   *
   * @param {Date} date
   * @param {Function | null} cb Call, when timer is complete.
   */
  start(date, cb = null) {
    // Stop previous timer
    if (this.#interval.isStarted()) {
      this.stop();
    }

    let delta = this.#dateDeltaInMilleseconds(date);

    this.#updateTimer(delta);
    this.#interval.start(() => {
      delta -= this.#SECOND;

      if (delta < this.#SECOND) {
        delta = 0;
        this.stop();

        if (cb) cb();
      }

      this.#updateTimer(delta);
    }, this.#SECOND);
  }

  stop() {
    if (!this.#interval.isStarted()) return;

    this.#date = null;
    this.#updateTimer(0);
    this.#interval.stop();
  }

  /**
   * Update timer DOM elements.
   *
   * @param {Object} { days, hours, minutes, seconds }
   */
  #updateTimer(date) {
    const { days, hours, minutes, seconds } = Utils.convertMs(date);

    this.#timerRefs.days.innerHTML = days;
    this.#timerRefs.hours.innerHTML = hours;
    this.#timerRefs.minutes.innerHTML = minutes;
    this.#timerRefs.seconds.innerHTML = seconds;
  }

  /**
   * Convert date to milleseconds and calculate delta.
   *
   * @param {Date} date
   * @returns {Number}
   */
  #dateDeltaInMilleseconds(date) {
    return date.getTime() - Date.now();
  }
}

class Utils {
  /**
   * Convert date in milliseconds to Object.
   *
   * @param {Number} ms
   *
   * @returns {Object} {  days, hours, minutes, seconds }
   */
  static convertMs(ms) {
    // Number of milliseconds per unit of time
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    // Remaining days
    const days = this.addLeadingZero(Math.floor(ms / day));
    // Remaining hours
    const hours = this.addLeadingZero(Math.floor((ms % day) / hour));
    // Remaining minutes
    const minutes = this.addLeadingZero(
      Math.floor(((ms % day) % hour) / minute)
    );
    // Remaining seconds
    const seconds = this.addLeadingZero(
      Math.floor((((ms % day) % hour) % minute) / second)
    );

    return { days, hours, minutes, seconds };
  }

  /**
   * Add leading zeros.
   *
   * @param {Number} value
   * @param {Number} count  default value 2
   *
   * @returns {Number}
   */
  static addLeadingZero(value, count = 2) {
    return value.toString().padStart(count, 0);
  }
}

const refs = {
  start: document.querySelector('[data-start]'),
  timer: document.querySelector('.timer'),
};
const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,

  onClose([endDate]) {
    canStartTimer(endDate);
  },
};
const calendar = flatpickr('#datetime-picker', options);
const timer = new CountDownTimer(refs.timer);

refs.start.addEventListener('click', startTimerHandler);

setButtonStartStatus(false);

function startTimerHandler() {
  const date = canStartTimer(calendar.selectedDates[0]);

  if (!date) return;

  setButtonStartStatus(false);
  timer.start(date, () => {
    Notify.success('Timer comlete.');
  });
}

/**
 * Check for current date. Date must be in a future.
 *
 * @param {Date} date Date.
 *
 * @returns {Date | null} Date - date, if date in a future, null - if in the past.
 */
function canStartTimer(date) {
  if (date < Date.now()) {
    Notify.failure('Please choose a date in the future!');
    setButtonStartStatus(false);

    return null;
  }

  setButtonStartStatus(true);

  return date;
}
/**
 * Set button activity.
 *
 * @param {bool} value
 */
function setButtonStartStatus(value) {
  refs.start.disabled = !value;
}
