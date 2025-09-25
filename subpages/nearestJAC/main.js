const $ = (sel) => document.querySelector(sel);

function kms(m){ return (m/1000).toFixed(3); }
function fmtDur(s){
  const m = Math.round(s/60); if (m < 60) return `${m} min`;
  const h = Math.floor(m/60), r = m % 60; return r ? `${h} h ${r} min` : `${h} h`;
}

/* =========================
   LUGARES INTERNOS (EDITA AQUÍ)
   ========================= */
const PLACES = [
  // JAC
  { alias: "CELUPAZ JAC MONTEBELLO", entrada: "PQGJ+VJF, San Salvador", category: "JAC", url: "https://www.instagram.com/jacsatelite/" },
  { alias: "CELUPAZ JAC SATÉLITE",   entrada: "PQ9J+74 San Salvador", category: "JAC", url: "https://www.instagram.com/jac_montebello/" },
  { alias: "CELUPAZ JAC MONSERAT",      entrada: "MQJP+J9X San Salvador", category: "JAC", url: "https://www.instagram.com/jac.monserrat/" },
  { alias: "CELUPAZ JAC ALTOS DE MONTEBELLO",      entrada: "PQHH+24W, San Salvador", category: "JAC", url: "https://www.instagram.com/jac.altosdemontebello/" },
  { alias: "CELUPAZ JAC ALTOS DE MONTEBELLO 2",      entrada: "PQ9J+74 San Salvador", category: "JAC", url: "https://www.instagram.com/jac.altos2/" },
  { alias: "CELUPAZ JAC ESCORIAL",  entrada: "PQ9J+74 San Salvador", category: "JAC", url: "https://www.instagram.com/jacescorial/" },

  // JÓVENES
  { alias: "PW83+M4 Ilopango", entrada: "PW83+M4, Ilopango", category: "JOVENES", url: "https://www.facebook.com/" },
  { alias: "Urbanización Sierra Morena 2", entrada: "PQ9J+74, San Salvador", category: "JOVENES", url: "https://www.instagram.com/" },

  // (Opcionales de tu lista)
  { alias: "PQHH+24W San Salvador", entrada: "PQHH+24W, San Salvador", category: "JOVENES", url: "" },
  { alias: "PQPR+3WW Mejicanos",    entrada: "PQPR+3WW, Mejicanos", category: "JOVENES", url: "" },
  { alias: "12 Calle Poniente",     entrada: "MQWV+G6P, 12 Calle Poniente, San Salvador", category: "JOVENES", url: "" },
  { alias: "16 Av. Sur (Santa Tecla)", entrada: "MPF3+65X, 16 Avenida Sur, Santa Tecla", category: "JOVENES", url: "" },
];

/* ======= GPS button ======= */
$("#btnGps").addEventListener("click", () => {
  const btn = $("#btnGps"), out = $("#gpsMsg"); out.textContent = "";
  if (!("geolocation" in navigator)) { out.textContent = "Este navegador no soporta geolocalización."; return; }
  btn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      $("#origin").value = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
      out.textContent = "Ubicación establecida desde GPS."; btn.disabled = false;
    },
    err => {
      btn.disabled = false;
      const map = {1:"Permiso denegado.",2:"Posición no disponible.",3:"Tiempo de espera agotado."};
      out.textContent = map[err.code] || `Error: ${err.message}`;
    },
    { enableHighAccuracy:true, timeout:10000, maximumAge:10000 }
  );
});

/* ======= Calcular ======= */
$("#run").addEventListener("click", () => {
  const origin = $("#origin").value.trim();
  const mode = $("#mode").value;
  const useTraffic = $("#traffic").checked;
  const trafficModel = $("#trafficModel").value;

  const cats = [...document.querySelectorAll(".cat:checked")].map(c => c.value.toUpperCase());
  if (!origin) { $("#msg").textContent = "Escribe un origen o usa el botón de ubicación."; return; }

  // Filtrar por categorías seleccionadas
  const selected = PLACES.filter(p => cats.includes(p.category));
  if (!selected.length) { $("#msg").textContent = "No hay destinos en las categorías seleccionadas."; return; }
  if (selected.length > 25) { $("#msg").textContent = "Máximo 25 destinos por llamada (reduce categorías)."; return; }

  $("#msg").textContent = "Consultando Distance Matrix…";
  $("#nearest").style.display = "none"; $("#ranking").style.display = "none";

  const service = new google.maps.DistanceMatrixService();
  const req = {
    origins: [origin],
    destinations: selected.map(p => p.entrada),
    travelMode: google.maps.TravelMode[mode],
    unitSystem: google.maps.UnitSystem.METRIC,
    language: "es",
    region: "SV"
  };
  if (mode === "DRIVING" && useTraffic) {
    req.drivingOptions = { departureTime: new Date(), trafficModel };
  }

  service.getDistanceMatrix(req, (res, status) => {
    if (status !== "OK") { $("#msg").textContent = `Error: ${status}`; return; }

    const elements = res.rows?.[0]?.elements || [];
    const resolved  = res.destinationAddresses || [];

    const rows = elements.map((el, i) => {
      const item = selected[i];
      const display = (resolved[i] && resolved[i].trim()) || item.entrada;
      if (el.status !== "OK") {
        return { ...item, display, status: el.status, distanceMeters: Infinity, durationSec: Infinity };
      }
      const dist = el.distance?.value ?? Infinity;
      const dur  = (el.duration_in_traffic?.value ?? el.duration?.value ?? Infinity);
      return { ...item, display, status: "OK", distanceMeters: dist, durationSec: dur };
    });

    rows.sort((a,b) => a.distanceMeters - b.distanceMeters);
    const nearest = rows.find(r => r.status === "OK");

    /* ====== Render: más cercano (alias con link a url) ====== */
    if (nearest) {
      const link = nearest.url ? `<a href="${nearest.url}" target="_blank" rel="noopener">${nearest.alias}</a>` : nearest.alias;
      $("#nearest").innerHTML = `
        <h2>Más cercano</h2>
        <div><span class="ok">${link}</span> <span class="tiny muted">(${nearest.category})</span></div>
        <div class="muted tiny">${nearest.display}</div>
        <div style="margin-top:6px;">Distancia: <b>${kms(nearest.distanceMeters)} km</b></div>
        <div>Duración aprox.: <b>${fmtDur(nearest.durationSec)}</b></div>
        <div style="margin-top:8px;">
          <a target="_blank" rel="noopener"
             href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(nearest.entrada)}&travelmode=${mode.toLowerCase()}">
            Abrir en Google Maps ➜
          </a>
        </div>`;
      $("#nearest").style.display = "block";
    } else {
      $("#nearest").innerHTML = `<span class="err">No hay rutas disponibles.</span>`;
      $("#nearest").style.display = "block";
    }

    /* ====== Render: ranking (alias + link si hay url) ====== */
    const rowsHtml = rows.map((r, idx) => {
      const link = r.url ? `<a href="${r.url}" target="_blank" rel="noopener">${r.alias}</a>` : r.alias;
      if (r.status === "OK") {
        return `<tr>
          <td>${String(idx+1).padStart(2,"0")}</td>
          <td><b>${link}</b> <span class="tiny muted">(${r.category})</span>
              <div class="tiny muted">${r.display}</div></td>
          <td>${kms(r.distanceMeters)} km</td>
          <td>~ ${fmtDur(r.durationSec)}</td>
        </tr>`;
      } else {
        return `<tr>
          <td>${String(idx+1).padStart(2,"0")}</td>
          <td><b>${link}</b> <span class="tiny muted">(${r.category})</span>
              <div class="tiny muted">${r.display}</div></td>
          <td colspan="2"><span class="err">${r.status}</span></td>
        </tr>`;
      }
    }).join("");

    $("#ranking").innerHTML = `
      <h2>Ranking (por distancia)</h2>
      <table>
        <thead><tr><th>#</th><th>Destino</th><th>Distancia</th><th>Duración</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="tiny muted" style="margin-top:6px;">
        Categorías activas: ${cats.join(", ")}
      </div>`;
    $("#ranking").style.display = "block";
    $("#msg").textContent = "";
  });
});
