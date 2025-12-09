function checkValue(key, val) {
    if (key === "LINE") {
        if (val.startsWith("[")) {
            value1 = val.substring(1, 5)
            value2 = val.substring(6, 10)
            if (parseInt(value1) > parseInt(value2)) return "<span class=\"token error\">" + val + "</span>"
            if (val[5] !== "-") return "<span class=\"token error\">" + val + "</span>"
            return "<span class=\"token " + (val.endsWith("]") && val.length === 11 ? "" : "error") +
                "\">[</span><span class=\"token " + (/^[0-9?]{4}$/.test(value1) ? "accent" : "error")
                + "\">" + value1 +
                "</span>" + val.substring(5, 6) + "<span class=\"token " + (/^[0-9?]{4}$/.test(value2) ? "accent" : "error")
                + "\">" + value2 + "</span>" + val.substring(10, 11)
        } else {
            if (/^!?[0-9X?]{4}$/.test(val)) return "<span class=\"token accent\">" + val + "</span>"
            return "<span class=\"token error\">" + val + "</span>"
        }
    }
    if (key === "ID") {
        if (val.includes("|") && !["41", "42", "43", "44"].includes(val.split("|")[0])) return "<span class=\"token error\">" + val + "</span>"
        val2 = ""
        if (val[2] === "|") {
            vals = val.split("|")
            val2 = vals.slice(0, -1).join("|") + "|"
            val = vals[vals.length - 1]
        }
        if (val === "") return "<span class=\"token accent\">" + val2 + val + "</span>"
        if (val.startsWith("[")) {
            value1 = val.split("-")[0].replace("[", "")
            value2 = (val.split("-")[1] || "").replace("]", "")
            if (parseInt(value1) > parseInt(value2)) return "<span class=\"token error\">" + val2 + val + "</span>"
            return "<span class=\"token accent\">" + val2 + "</span><span class=\"token " + (val.endsWith("]") ? "" : "error") +
                "\">[</span><span class=\"token " + (/^[0-9]+$/.test(value1) ? "valid" : "error")
                + "\">" + value1 +
                "</span>" + (val.includes("-") ? "-" : "") + "<span class=\"token " + (/^[0-9]+$/.test(value2) ? "valid" : "error")
                + "\">" + value2 + "</span>" + (val.endsWith("]") ? "]" : "")
        }
        if (!/^[0-9X?]+$/.test(val)) return "<span class=\"token error\">" + val2 + val + "</span>"
        return "<span class=\"token accent\">" + val2 + val + "</span>"
    }
    if (key === "CHP" || key === "PLC") return val
}

export function updateSearchbar(searchTerm) {
    tokens = searchTerm.split(" ")
    if (tokens.length === 0 || tokens.join("") === "") {
        searchBar.style.display = "none"
        return
    }
    hideInfo()
    searchBar.style.display = "block"
    let tokensRemapped = []
    let token;
    for (let i = 0; i < tokens.length; i++) {
        if (token === "") tokensRemapped[i] = ""
        token = tokens[i]
        if (!token.includes("=")) {
            tokensRemapped[i] = "<span class=\"token grey\">" + token + "</span>"
            continue
        }
        tokenSplit = token.split("=")
        if (["CHP", "PLC", "ID", "LINE"].includes(tokenSplit[0])) {
            tokensRemapped[i] = "<span class=\"token valid\">" + tokenSplit[0] + "</span>=" + checkValue(tokenSplit[0], tokenSplit[1])
        } else {
            tokensRemapped[i] = "<span class=\"token error\">" + tokenSplit[0] + "</span>=<span class=\"token grey\">" + tokenSplit[1] + "</span>"
        }
    }
    searchBar.innerHTML = tokensRemapped.join(" ")
    if (!tokensRemapped.join(" ").includes("token error")) {
        filterVehicles(tokens.filter(a => a.includes("=")).map(z => z.split("=")).filter(z => ["CHP", "PLC", "ID", "LINE"].includes(z[0])))
    } else {
        filters = {}
        vehicleRegistry.keys().forEach(vec => {
            checkFilters(vec)
        })
    }
}

function checkFilters(vec, remove = true) {
    let vehicle = vehicleCache.get(vec)
    if (filters["shift_id"]) {
        if (filters.shift_id.flipped && vehicle.shift_id.match(filters.shift_id.match)) {
            if (remove) vehicleLayer.removeLayer(vehicleRegistry.get(vec))
            return false
        } else if (!vehicle.shift_id.match(filters.shift_id.match) && !filters.shift_id.flipped) {
            if (remove) vehicleLayer.removeLayer(vehicleRegistry.get(vec))
            return false
        }
    }
    if (filters["block_id"]) {
        if (filters.block_id.flipped && vehicle.block_id.match(filters.block_id.match)) {
            if (remove) vehicleLayer.removeLayer(vehicleRegistry.get(vec))
            return false
        } else if (!vehicle.block_id.match(filters.block_id.match) && !filters.block_id.flipped) {
            if (remove) vehicleLayer.removeLayer(vehicleRegistry.get(vec))
            return false
        }
    }
    if (filters["id"]) {
        if (filters.id.agency && vehicle.agency_id !== filters.id.agency) {
            if (remove) vehicleLayer.removeLayer(vehicleRegistry.get(vec))
            return false
        }
        if (filters.id.match && !vehicle.id.split("|")[1].match(filters.id.match)) {
            if (remove) vehicleLayer.removeLayer(vehicleRegistry.get(vec))
            return false
        }
        let n = parseInt(vehicle.id.split("|")[1])
        if (filters.id.min > n || filters.id.max < n) {
            if (remove) vehicleLayer.removeLayer(vehicleRegistry.get(vec))
            return false
        }
    }
    if (filters["line"]) {
        if (filters.line.match && (filters.line.flipped && vehicle.line_id.match(filters.line.match)) || (!filters.line.flipped && !vehicle.line_id.match(filters.line.match))) {
            if (remove) vehicleLayer.removeLayer(vehicleRegistry.get(vec))
            return false
        }
        let n = parseInt(vehicle.line_id)
        if ((filters.line.min > n || filters.line.max < n) && !filters.line.flipped) {
            if (remove) vehicleLayer.removeLayer(vehicleRegistry.get(vec))
            return false
        }
        if ((filters.line.min <= n && filters.line.max >= n) && filters.line.flipped) {
            if (remove) vehicleLayer.removeLayer(vehicleRegistry.get(vec))
            return false
        }
    }
    if (remove) vehicleRegistry.get(vec).addTo(vehicleLayer)
    return true
}