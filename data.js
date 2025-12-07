const HISTORY_ENDPOINT = "http://mvs22.vm.blahajcloud.net:65000/{DATE}/{AREA}.txt"
const API = "https://api.cmet.pt/"

let stops = null
let vehicles = null
let current_date = null

let dataStore = {}
let processedDataStore = {}

let stats = {
  CM1: {},
  CM2: {},
  CM3: {},
  CM4: {},
  TOTAL: {}
}

let speeds = {
  CM1: {},
  CM2: {},
  CM3: {},
  CM4: {},
  TOTAL: {}
}

let lines = null
let routes = null
let patterns = {}
let alerts = null

function getCurrentOperationalDate(returnDate = false) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1; 
  let day = now.getDate();

  if (now.getHours() < 4) {
    day -= 1;
    now.setDate(now.getDate() - 1)

    if (day === 0) {
      const prevMonth = new Date(year, month - 1, 0); 
      year = prevMonth.getFullYear();
      month = prevMonth.getMonth() + 1;
      day = prevMonth.getDate();
    }
  }
  if(returnDate) return now.setHours(4, 0, 0, 0)

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");

  return `${year}-${mm}-${dd}`;
}

function formatNumber(n) {
  if(n < 1000) return n
  /*
  XXX 6 - 3
  X.XXY 6 - 4
  XX.XYY   6 - 5
  XXX.YYY
  */
  if(n < 1000000) return ((n/1000).toFixed(6 - n.toString().length)) + "K"
  if(n < 1000000000) return ((n/1000000).toFixed(9 - n.toString().length)) + "M"
}

function formatPercent(n) {
  let p = n * 100;

  let i = Math.floor(Math.abs(p)).toString().length;

  let d = Math.max(0, 3 - i);

  return p.toFixed(d) + "%";
}

function parseHHMM(a) {
  return ((a.getHours() < 10 ? "0" + a.getHours() : a.getHours()) + ":" + (a.getMinutes() < 10 ? "0" + a.getMinutes() : a.getMinutes()))
}