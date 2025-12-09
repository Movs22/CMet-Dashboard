const loadedScripts = new Set();
const loadedStyles = new Set();
const pageCache = new Map();

const intervals = new Set();

let notfound = false

async function fetchPage(url) {
  if (pageCache.has(url)) return pageCache.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error("404");

  const html = await res.text();
  pageCache.set(url, html);
  return html;
}

async function loadPage(url, push = true) {
  const app = document.getElementById("dashboard");
  app.classList.add("loading");

  try {
    const html = await fetchPage(url);
    const doc = new DOMParser().parseFromString(html, "text/html");

    const newMain = doc.querySelector("main");
    if (!newMain) throw new Error("No <main>");

    app.innerHTML = newMain.innerHTML;

    requestAnimationFrame(() => {
      app.classList.remove("loading");
    });

    const newTitle = doc.querySelector("title");
    if (newTitle) document.title = newTitle.textContent;

    const newDesc = doc.querySelector('meta[name="description"]');
    if (newDesc) {
      let desc = document.querySelector('meta[name="description"]');
      if (!desc) {
        desc = document.createElement("meta");
        desc.name = "description";
        document.head.appendChild(desc);
      }
      desc.content = newDesc.content;
    }

    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      if (!loadedStyles.has(link.href)) {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = link.href;
        document.head.appendChild(style);
        loadedStyles.add(link.href);
      }
    });

    async function loadScriptSequential(script) {
      return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.type = script.type
        if (script.src) {
          s.src = script.src;
          s.onload = resolve;
          s.onerror = reject;
        } else {
          s.textContent = script.textContent;
          resolve();
        }

        document.body.appendChild(s);
      });
    }

    async function processScriptsSequentially(container) {
      const scripts = [...container.querySelectorAll("script")];

      for (const script of scripts) {
        const key = script.src || script.textContent;
        if (loadedScripts.has(key)) continue;

        await loadScriptSequential(script);
        loadedScripts.add(key);
      }
    }

    processScriptsSequentially(newMain)

    newMain.querySelectorAll("script").forEach(script => {
      const key = script.src || script.textContent;
      if (loadedScripts.has(key)) return;

      const s = document.createElement("script");
      if (script.src) {
        s.type = script.type
        s.src = script.src;
        s.defer;
      } else {
        s.textContent = script.textContent;
      }

      document.body.appendChild(s);
      loadedScripts.add(key);
    });

    const runScripts = doc.querySelectorAll('meta[name="script"]');

    setTimeout(() => {
      runScripts.forEach(script => {
        if (script.content) eval(script.content)
      });
    }, 500)

    if (push) history.pushState({ url }, "", url);
    intervals.forEach(z => clearInterval(z))
    intervals.clear()

  } catch (err) {
    console.log(err)
    history.pushState({ url }, "", url);
    loadPage("/CMet-Dashboard/404.html", false);
    notfound = true
  }
}



window.addEventListener("popstate", e => {
  if (e.state?.url) {
    loadPage(e.state.url, false);
    if (e.state?.url.startsWith("/CMet-Dashboard/dashboard/Area")) highlight("area" + new URLSearchParams(e.state?.url.split("?")[1]).get("a"))
    else if (e.state?.url.startsWith("/CMet-Dashboard/dashboard")) highlight('home')
  }
});

document.addEventListener("click", e => {
  const link = e.target.closest("a[data-link]");
  if (!link) return;

  e.preventDefault();
  loadPage(link.getAttribute("href"));
});

document.addEventListener("mouseover", e => {
  const link = e.target.closest("a[data-link]");
  if (!link || link.dataset.prefetched) return;

  fetchPage(link.href);
  link.dataset.prefetched = "true";
});

if (location.pathname !== "/") {
  loadPage(location.pathname, false);
}

