const selection = {
    "area": "GLOBAL",
    "sector": ""
}

let areaSelect = document.getElementById("area")
let sectorSelect = document.getElementById("sector")

document.body.onload = () => {
    areaSelect.innerHTML = Object.values(areas).map(a => `<option value="${a.agency_id}">${a.full_name}</option>`).reduce((acc, v) => acc += v, "")
    areaSelect.value = "*"
    sectorSelect.innerHTML = '<option value="*">N/A</option>'
    sectorSelect.value = "*"
    areaSelect.onchange = () => {
        selection.area = areaSelect.value
        sectorSelect.innerHTML = '<option value="*">N/A</option>' + Object.keys(areas[areaSelect.value].sectors).map(k => `<option value="${k}">${areas[areaSelect.value].sectors[k].full_name}</option>`).reduce((acc, v) => acc += v, "")
    }

    sectorSelect.onchange = () => {
        selection.sector = sectorSelect.value
    }

    //loadPageContent()
}
