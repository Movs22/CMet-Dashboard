const __localArea = areas["41"]

utils.va.chapa = function(shift_id) {
    if(shift_id.startsWith("VS")) return null
    let match = shift_id[1] // y_xXxx 
    if(shift_id[1] === "9" && (shift_id[2] === "2" || shift_id[2] === "3")) return __localArea.sectors.Special.name
    let matchedGroup;
    Object.values(__localArea.sectors).forEach(sector => {
        Object.keys(sector.groups).forEach(group => {
            if(!sector.groups[group].includes(match)) return
            matchedGroup = group
        })
    })
    return matchedGroup
}

utils.va.placa = function(block_id) {
    if(block_id.startsWith("VS") || block_id.split("_").length < 2) return null
    let match = block_id.split("_")[1][1] // y_xXxx 
    if(block_id.split("_")[0].length > 1) return __localArea.sectors.Special
    let matchedSector;
    Object.values(__localArea.sectors).forEach(sector => {
        if(Object.values(sector.groups).find(z => z.includes(match))) matchedSector = sector
    })
    return matchedSector
}

utils.va.formatPlaca = function(n) {
  return n.split("-")[0] // removes overhead from blockId, reducing it to X(X)_YYYY
}

utils.va.formatChapa = function(n) {
  return n.split("+")[0].split("'")[0] // removes overhead from shiftId reducing it to XXXX
}