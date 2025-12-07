/*
XYZZ
X - 1/2/3 Dut/sab/dom
Y - 0/1/2/3/4/5/6/7/8/9 Amadora/Amadora/Cacém/Carcavelos/Oeiras/Oeiras/Queluz/SintraA/SintraQ/Montelavar+CP
    Adroana - 3/7
    Queluz - 0/1/2/4/5/6/8/9*
*/

function formatPlaca(n, a) {
  if(n.startsWith("VS")) return n
  if(a === "43") return n // this one's perfect LOL
  if(a === "42")return n.split("-")[0]
  if(a === "41") return n.split("_")[1].split("-")[0] + " (" + getPlaca(n, "41") + ")"
  return "...-" + n.split("-")[1] + "-..."
}

function formatChapa(n, a) {
  return n.split("+")[0].split("'")[0] + (a === "41" ? " (" + getChapa(n, "41") + ")" : "")
}

function getPlaca(n, agency) {
  if(n.startsWith("VS")) return "--"
  if(agency !== "41") return "NÃO SUPORTADO"
  if(agency === "41") {
    let b = n.split("_")[1][1] // X_YYYY
    if("0124568".includes(b)) return "Queluz Baixo"
    if("37".includes(b)) return "Adroana"
    if(n.split("_")[0].startsWith("9")) return "CP Subst."
    return "Montelavar"
  }
}

function getChapa(n, agency) {
  if(agency !== "41") return "NÃO SUPORTADO"
  if(agency === "41") {
    let b = n[1] // X_YYYY
    if("01".includes(b)) return "Amadora"
    if("2".includes(b)) return "Cacém"
    if("3".includes(b)) return "Carcavelos"
    if("45".includes(b)) return "Oeiras"
    if("6".includes(b)) return "Queluz"
    if("78".includes(b)) return "Sintra"
    if("9".includes(b) && "23".includes(n[2])) return "CP Subst."
    return "Montelavar"
  }
}