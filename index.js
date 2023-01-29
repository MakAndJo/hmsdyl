const s_counter = document.querySelector(".container[data-type=seconds] > div.count");
const s_subtitle = document.querySelector(".container[data-type=seconds] > div.subtitle");
const picker = document.querySelector("input#datetime");

/**
 * Declination value
 * @param {Number} - value
 * @param {Array} - words
 */
function declination(value, words) {
  function declineWord(val, words) {
    const value = Math.abs(val) % 100;
    const num = value % 10;
    if (value > 10 && value < 20) return words[2];
    if (num > 1 && num < 5) return words[1];
    if (num == 1) return words[0];
    return words[2];
  }
  const word = declineWord(value, words);
  return `${word}`;
}

let dateFrom = new Date();
let prevState = undefined;

const updateContainer = () => {
  const t1 = new Date();
  const t2 = new Date(dateFrom);
  const dif = t1.getTime() - t2.getTime();
  let nextState = Math.round(dif / 1000);
  if (prevState != nextState) {
    s_counter.innerText = nextState;
    s_subtitle.innerText = declination(nextState, ["секунда", "секунды", "секунд"]);
    prevState = nextState;
  }
  window.requestAnimationFrame(updateContainer);
};

picker.addEventListener("change", (e) => {
  const value = e.target.value;
  console.debug(value);
  dateFrom = value;
});
picker.value = new Date(dateFrom.getTime() + new Date().getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 19)
window.requestAnimationFrame(updateContainer);