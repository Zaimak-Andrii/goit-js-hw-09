const CHANGE_BACKGROUND_DELAY = 1000;

const refs = {
  body: document.body,
  start: document.querySelector('[data-start]'),
  stop: document.querySelector('[data-stop]'),
};
const interval = {
  id: null,
  start(cb, delay) {
    if (this.id) return;

    this.id = setInterval(cb, delay);
  },
  stop() {
    if (!this.id) return;

    clearInterval(this.id);
    this.id = null;
  },
};

setStartButtonEnabled(true);

refs.start.addEventListener('click', startInterval);
refs.stop.addEventListener('click', stopInterval);

function startInterval() {
  setStartButtonEnabled(false);
  changeBodyBacgroundColor();

  interval.start(changeBodyBacgroundColor, CHANGE_BACKGROUND_DELAY);
}

function stopInterval() {
  setStartButtonEnabled(true);
  interval.stop();
}

function setStartButtonEnabled(enabledStart) {
  const { start, stop } = refs;

  start.disabled = !enabledStart;
  stop.disabled = enabledStart;
}

function changeBodyBacgroundColor() {
  refs.body.style = `background-color: ${getRandomHexColor()}`;
}

function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, 0)}`;
}
