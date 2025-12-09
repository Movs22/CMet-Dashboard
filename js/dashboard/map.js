let map;

export function setupMap() {
    map = L.map("map", {
        center: [38.69444, -9.0973],
        zoom: 13,
        preferCanvas: true
    });

    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
            maxZoom: 20,
            attribution: ""
        }
    ).addTo(map)

    vehicleLayer = L.layerGroup().addTo(map);

    const SCALE_FACTOR = 0.075
    vehicleIcon = L.icon({
        iconUrl: "https://carrismetropolitana.pt/assets/map/bus-regular.png",
        iconSize: [200 * SCALE_FACTOR, 504 * SCALE_FACTOR],
        iconAnchor: [100 * SCALE_FACTOR, 252 * SCALE_FACTOR]
    });

    vehicleIcon2 = L.icon({
        iconUrl: "https://carrismetropolitana.pt/assets/map/bus-contactless.png",
        iconSize: [200 * SCALE_FACTOR, 504 * SCALE_FACTOR],
        iconAnchor: [100 * SCALE_FACTOR, 252 * SCALE_FACTOR]
    });
}

function glideTo(vehicle, newLat, newLng, duration = 800) {
    if (vehicle.isAnimating) return;

    vehicle.isAnimating = true;

    const startLat = vehicle.currentPos.lat;
    const startLng = vehicle.currentPos.lng;
    const startTime = performance.now();

    function animate(now) {
        const t = Math.min((now - startTime) / duration, 1);

        const ease = t

        const lat = startLat + (newLat - startLat) * ease;
        const lng = startLng + (newLng - startLng) * ease;

        vehicle.setLatLng([lat, lng]);

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            vehicle.currentPos = { lat: newLat, lng: newLng };
            vehicle.isAnimating = false;
        }
    }

    requestAnimationFrame(animate);
}

export async function showInfo(vecId) {
    vec = vehicleCache.get(vecId)
    vehicleRegistry.keys().forEach(k => {
        if (k !== vecId) {
            vehicleLayer.removeLayer(vehicleRegistry.get(k));
        }
    })

    selectedVehicle = vec.id

    vehicleInfo.querySelector("#line .line-badge").innerHTML = vec.line_id
    vehicleInfo.querySelector("#line .line-badge").style.background = lines.find(z => z.id === vec.line_id).color

    vehicleInfo.querySelector("#license-plate #plate").innerHTML = (vec.license_plate || "??-??-??")
    vehicleInfo.querySelector("#license-plate #reg-date").innerHTML = "<span>" + ((vec.registration_date || "????????").substring(2, 4)) + "</span><span>" + (vec.registration_date || "????????").substring(4, 6) + "</span>"

    vehicleInfo.querySelector("#id").innerHTML = "<span class=\"key\">ID:</span> " + vec.id

    vehicleInfo.querySelector("#placa").innerHTML = "<span class=\"key\">Placa:</span> " + formatPlaca(vec.block_id, vec.agency_id)
    vehicleInfo.querySelector("#chapa").innerHTML = "<span class=\"key\">Chapa:</span> " + formatChapa(vec.shift_id, vec.agency_id)

    vehicleInfo.querySelector("#trip").innerHTML = "<span class=\"key\">Trip ID:</span> " + vec.trip_id
    vehicleInfo.querySelector("#state").innerHTML = "<span class=\"key\">Estado:</span> " + vec.current_status

    vehicleInfo.querySelector("#stop").innerHTML = "<span class=\"key\">Próxima paragem:</span> #" + vec.stop_id
    vehicleInfo.querySelector("#stopName").innerHTML = stops.find(z => z.id === vec.stop_id).long_name
    vehicleInfo.querySelector("#desvio").innerHTML = "<span class=\"key\">Desvio:</span> <span>--m </span>"
    vehicleInfo.style.display = "block"

    let pattern = patternsCache.get(vec.pattern_id) || await fetch(API + "patterns/" + vec.pattern_id).then(r => r.json())
    if (!patternsCache.get(vec.pattern_id)) patternsCache.set(vec.pattern_id, pattern)
    let shape = shapesCache.get(pattern[0].shape_id) || await fetch(API + "shapes/" + pattern[0].shape_id).then(r => r.json())
    if (!shapesCache.get(pattern[0].shape_id)) shapesCache.set(pattern[0].shape_id, shape)
    if (polyline) vehicleLayer.removeLayer(polyline)
    if (polylineLine) vehicleLayer.removeLayer(polylineLine)

    const latlngs = shape.geojson.geometry.coordinates.map(c => [c[1], c[0]]);
    polyline = L.polyline(latlngs, { color: pattern[0].color, weight: 8 });
    polyline.addTo(vehicleLayer);

    polylineLine = L.polylineDecorator(polyline, {
        patterns: [
            { offset: 0, repeat: 20, symbol: L.Symbol.arrowHead({ pixelSize: 3, pathOptions: { color: 'white', fillOpacity: 1 } }) }
        ]
    });
    polylineLine.addTo(vehicleLayer);

    const rawShape = shape.points
        .sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence)
        .map(p => ({
            latlng: L.latLng(p.shape_pt_lat, p.shape_pt_lon),
            dist: p.shape_dist_traveled * 1000
        }));
    result = computeGTFSProgress([vec.lat, vec.lon], rawShape)
    vehicleInfo.querySelector("#desvio").innerHTML = "<span class=\"key\">Desvio:</span> <span style=\"" + (result.distFromRoute > 30 ? "color: red" : "") + "\">" + (result.distFromRoute > 30 ? "DESVIO DA ROTA" : "N/A") + "</span>"
}

export function hideInfo() {
    document.getElementById('info').style.display = 'none';
    selectedVehicle = null
    vehicleRegistry.keys().forEach(k => checkFilters(k, false) ? vehicleRegistry.get(k).addTo(vehicleLayer) : null)
    if (polyline) vehicleLayer.removeLayer(polyline)
    if (polylineLine) vehicleLayer.removeLayer(polylineLine);
    polyline = null;
    polylineLine = null
}