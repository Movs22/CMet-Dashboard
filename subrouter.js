const path = location.pathname + location.search + location.hash;
location.replace("/?redirect=" + encodeURIComponent(path));