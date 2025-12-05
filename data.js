const HISTORY_ENDPOINT = "http://mvs22.vm.blahajcloud.net:65000/{DATE}/{AREA}.txt"

let stops = null
let vehicles = null
let current_date = null

let a1_data = null
let a2_data = null
let a3_data = null
let a4_data = null

let lines = null
let routes = null
let patterns = {}

function getCurrentOperationalDate() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1; 
  let day = now.getDate();

  if (now.getHours() < 4) {
    day -= 1;

    if (day === 0) {
      const prevMonth = new Date(year, month - 1, 0); 
      year = prevMonth.getFullYear();
      month = prevMonth.getMonth() + 1;
      day = prevMonth.getDate();
    }
  }

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");

  return `${year}-${mm}-${dd}`;
}