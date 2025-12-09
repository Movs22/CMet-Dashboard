const path = location.pathname + location.search + location.hash;
location.replace("/CMet-Dashboard/?redirect=" + encodeURIComponent(path));