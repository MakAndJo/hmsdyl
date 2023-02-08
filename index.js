const picker = document.querySelector("input#datetime");
const shareButton = document.querySelector("button#share-btn");
const s_counter = document.querySelector(".container[data-type=seconds] > div.count");
const s_subtitle = document.querySelector(".container[data-type=seconds] > div.subtitle");
const m_counter = document.querySelector(".container[data-type=minutes] > div.count");
const m_subtitle = document.querySelector(".container[data-type=minutes] > div.subtitle");
const h_counter = document.querySelector(".container[data-type=hours] > div.count");
const h_subtitle = document.querySelector(".container[data-type=hours] > div.subtitle");
const d_counter = document.querySelector(".container[data-type=days] > div.count");
const d_subtitle = document.querySelector(".container[data-type=days] > div.subtitle");
const mn_counter = document.querySelector(".container[data-type=month] > div.count");
const mn_subtitle = document.querySelector(".container[data-type=month] > div.subtitle");
const yy_counter = document.querySelector(".container[data-type=years] > div.count");
const yy_subtitle = document.querySelector(".container[data-type=years] > div.subtitle");

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function queryUpdate(params = {}) {
  var url = new URL(location.href);
  Object.entries(params).forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
  window.history.pushState({}, undefined, url.toString());
  // location.href = url.toString();
}

function parseBool(value = "") {
  return (value.toLocaleLowerCase() == "true" || value == "1");
};

function parseNum(value = "", default_value = 0) {
  default_value ||= 0;
  if (!value) return default_value;
  const num = parseInt(value);
  if (num == NaN) return default_value;
  return num;
};

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


const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
  // SameValue algorithm
  if (x === y) { // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    // Added the nonzero y check to make Flow happy, but it is redundant
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    // Step 6.a: NaN == NaN
    return x !== x && y !== y;
  }
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null ||
    typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (
      !hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}

const monthDifference = (dateFrom, dateTo) => dateTo.getMonth() - dateFrom.getMonth() +
  (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
const yearsDifference = (dateFrom, dateTo) => new Date(dateTo - dateFrom).getFullYear() - 1970;


function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

{

  var dateFrom = new Date();
  function InitParams() {
    dateFrom = new Date(parseNum(getUrlParameter("date"), (new Date()).getTime()));
    console.debug(">> time query", "->", dateFrom.getTime());
    picker.value = new Date(dateFrom.getTime() + new Date().getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 19)
  }

  var prevState = undefined;
  const updateContainer = () => {
    const t1 = new Date();
    const t2 = new Date(dateFrom);
    const dif = t1.getTime() - t2.getTime();
    const seconds = Math.floor(dif / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const month = monthDifference(t2, t1);
    const years = yearsDifference(t2, t1);
    let nextState = {
      seconds: seconds,
      minutes: minutes,
      hours: hours,
      days: days,
      month: month,
      years: years,
    }
    if (!shallowEqual(prevState, nextState)) {
      if (prevState?.seconds != nextState.seconds) {
        s_counter.innerText = nextState.seconds;
        s_subtitle.innerText = declination(nextState.seconds, ["секунда", "секунды", "секунд"]);
      }
      if (prevState?.minutes != nextState.minutes) {
        m_counter.innerText = nextState.minutes;
        m_subtitle.innerText = declination(nextState.minutes, ["минута", "минуты", "минут"]);
      }
      if (prevState?.hours != nextState.hours) {
        h_counter.innerText = nextState.hours;
        h_subtitle.innerText = declination(nextState.hours, ["час", "часа", "часов"]);
      }
      if (prevState?.days != nextState.days) {
        d_counter.innerText = nextState.days;
        d_subtitle.innerText = declination(nextState.days, ["день", "дня", "дней"]);
      }
      if (prevState?.month != nextState.month) {
        mn_counter.innerText = nextState.month;
        mn_subtitle.innerText = declination(nextState.month, ["месяц", "месяца", "месяцев"]);
      }
      if (prevState?.years != nextState.years) {
        yy_counter.innerText = nextState.years;
        yy_subtitle.innerText = declination(nextState.years, ["год", "года", "лет"]);
      }
      prevState = nextState;
    }
    window.requestAnimationFrame(updateContainer);
  };

  picker.addEventListener("change", (e) => {
    const value = e.target.value;
    dateFrom = new Date(value);
    console.debug(">> time pick", "->", dateFrom.getTime());
  });

  shareButton.addEventListener("click", (e) => {
    console.debug(">> time share", "->", dateFrom.getTime());
    queryUpdate({ date: dateFrom.getTime() });
    copyTextToClipboard(location.href);
  });

  window.addEventListener("popstate", (e) => {
    InitParams();
  });

  InitParams();
  window.requestAnimationFrame(updateContainer);
}