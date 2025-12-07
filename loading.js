let progressBar = document.getElementById("loading-progress");
let progressStatus = document.getElementById("loading-status");
let errorBox = document.getElementById("error-prompt");



let loading = document.getElementById("loading")

function setStage(percent, text) {
    progressBar.style.width = percent + "%";
    progressStatus.innerHTML = text;
}

function showError(text) {
    errorBox.innerHTML = text;
    errorBox.style.display = "block"
}

let p = 0;

async function load() {

    if (notfound) return loading.classList.remove("loading")

    p = 10
    setStage(p, "A descarregar paragens")

    stops = await fetch("https://api.cmet.pt/stops").then(r => {
        if (!r.ok) throw new Error("Failed to fetch " + r.url);
        return r.json()
    }).catch(showError)
    if (!stops) return console.warn("STOPPED PAGE LOADING DUE TO FAILURE AT STOPS.JSON DOWNLOAD")

    p = 20
    setStage(p, "A descarregar linhas")

    lines = await fetch("https://api.cmet.pt/lines").then(r => {
        if (!r.ok) throw new Error("Failed to fetch " + r.url);
        return r.json()
    }).catch(showError)
    if (!lines) return console.warn("STOPPED PAGE LOADING DUE TO FAILURE AT LINES.JSON DOWNLOAD")

    p = 30
    setStage(p, "A descarregar rotas")
    routes = await fetch("https://api.cmet.pt/routes").then(r => {
        if (!r.ok) throw new Error("Failed to fetch " + r.url);
        return r.json()
    }).catch(showError)
    if (!routes) return console.warn("STOPPED PAGE LOADING DUE TO FAILURE AT ROUTES.JSON DOWNLOAD")

    p = 40
    setStage(p, "A descarregar alertas")
    alerts = await fetch("https://api.cmet.pt/alerts").then(r => {
        if (!r.ok) throw new Error("Failed to fetch " + r.url);
        return r.json()
    }).catch(showError)
    if (!routes) return console.warn("STOPPED PAGE LOADING DUE TO FAILURE AT ALERTS.JSON DOWNLOAD")


    current_date = getCurrentOperationalDate()

    p = 50
    setStage(p, "A descarregar dados")
    await Promise.all(

        ["CM1", "CM2", "CM3", "CM4"].map(async area => {
            const temp_data = await fetch(HISTORY_ENDPOINT.replace("{DATE}", current_date).replace("{AREA}", area)).then(r => {
                if (!r.ok) throw new Error("Failed to fetch " + r.url);
                return r.text()
            }).catch(showError)
            p = p + 10
            setStage(p, "A descarregar dados")
            dataStore[area] = temp_data
        })
    )

    setStage(p, "A processar dados");

    ["CM1", "CM2", "CM3", "CM4"].forEach(area => {

        let toProcess = dataStore[area].split("\n").splice(1)
        let processed = {}
        let vehicles
        for (let i = 0; i < toProcess.length; i += 2) {
            vehicles = toProcess[i + 1].split("€").map(z => z.split("<"))
            processed[toProcess[i]] = vehicles
            speeds[area][toProcess[i]] = vehicles.map(z => parseFloat(z[3])).reduce((acc, val) => acc + val, 0)
            speeds.TOTAL[toProcess[i]] = (speeds.TOTAL[toProcess[i]] || 0) + vehicles.map(z => parseFloat(z[3])).reduce((acc, val) => acc + val, 0)
            stats[area][toProcess[i]] = vehicles.length
            stats.TOTAL[toProcess[i]] = (stats.TOTAL[toProcess[i]] || 0) + vehicles.length
        }
        processedDataStore[area] = processed
    })

    p = 100
    setStage(p, "Carregado!")
    loading.classList.remove("loading")
    if (!window.Location.pathname || window.Location.pathname === "/") return loadPage("/dashboard")
    let redirect = new URLSearchParams(window.location.search).get("redirect")

    if (redirect) loadPage(redirect)
}

