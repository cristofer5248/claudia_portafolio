// ========= util =========
const $ = (sel) => document.querySelector(sel);
function kms(m){ return (m/1000).toFixed(3); }
function fmtDur(s){
  const m = Math.round(s/60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m/60), r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

// ========= lugares internos (ocultos) =========
// alias: lo que se muestra al usuario
// entrada: dirección / plus code que se manda a Distance Matrix
// category: para filtros (JAC / JOVENES)
// url: red social o web del lugar (se abre en nueva pestaña)
const PLACES = [
  // JAC
  { alias: "CELUPAZ JAC MONTEBELLO", entrada: "PQGJ+VJF, San Salvador", category: "JAC", url: "https://www.instagram.com/jacsatelite/" },
  { alias: "CELUPAZ JAC SATÉLITE",   entrada: "PQ9J+74 San Salvador", category: "JAC", url: "https://www.instagram.com/jac_montebello/" },
  { alias: "CELUPAZ JAC MONSERAT",      entrada: "MQJP+J9X San Salvador", category: "JAC", url: "https://www.instagram.com/jac.monserrat/" },
  { alias: "CELUPAZ JAC ALTOS DE MONTEBELLO",      entrada: "PQHH+24W, San Salvador", category: "JAC", url: "https://www.instagram.com/jac.altosdemontebello/" },
  { alias: "CELUPAZ JAC ALTOS DE MONTEBELLO 2",      entrada: "PQ9J+74 San Salvador", category: "JAC", url: "https://www.instagram.com/jac.altos2/" },
  { alias: "CELUPAZ JAC ESCORIAL",  entrada: "PQ9J+74 San Salvador", category: "JAC", url: "https://www.instagram.com/jacescorial/" },
  { alias: "CELUPAZ JAC AYUTUXTEPEQUE", entrada: "PQPR+3WW, Mejicanos", category: "JAC", url: "https://www.instagram.com/jac.ayutuxtepeque/" },

  // JÓVENES
  { alias: "PW83+M4 Ilopango", entrada: "PW83+M4, Ilopango", category: "JOVENES", url: "https://www.facebook.com/" },
  { alias: "Urbanización Sierra Morena 2", entrada: "PQ9J+74, San Salvador", category: "JOVENES", url: "https://www.instagram.com/" },

  // (opcionales de tu lista)
  { alias: "PQHH+24W San Salvador", entrada: "PQHH+24W, San Salvador", category: "JOVENES", url: "" },
  { alias: "PQPR+3WW Mejicanos",    entrada: "PQPR+3WW, Mejicanos", category: "JOVENES", url: "" },
  { alias: "12 Calle Poniente",     entrada: "MQWV+G6P, 12 Calle Poniente, San Salvador", category: "JOVENES", url: "" },
  { alias: "16 Av. Sur (Santa Tecla)", entrada: "MPF3+65X, 16 Avenida Sur, Santa Tecla", category: "JOVENES", url: "" },
];

// ========= estado privado del origen (no se imprime coords) =========
let ORIGIN_GPS = null;   // { lat, lng }
let ORIGIN_LABEL = null; // "cerca de: Plaza Mundo, San Salvador"

// Reverse geocoding para mostrar un label sin exponer coords
function reverseGeocode(lat, lng) {
  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.length) resolve(results[0].formatted_address);
      else resolve(null);
    });
  });
}

// ========= botón GPS (icono rojo) =========
$("#btnGps").addEventListener("click", () => {
  const btn = $("#btnGps");
  const out = $("#gpsMsg");
  out.textContent = "";
  if (!("geolocation" in navigator)) {
    out.textContent = "Este navegador no soporta geolocalización.";
    return;
  }
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    ORIGIN_GPS = { lat: +latitude.toFixed(6), lng: +longitude.toFixed(6) }; // guardado en memoria
    ORIGIN_LABEL = await reverseGeocode(ORIGIN_GPS.lat, ORIGIN_GPS.lng) || "Ubicación actual";
    // Confirmamos sin mostrar coords
    out.textContent = `Ubicación establecida (cerca de: ${ORIGIN_LABEL}).`;
    btn.disabled = false;
  }, (err) => {
    btn.disabled = false;
    const map = {1:"Permiso denegado.",2:"Posición no disponible.",3:"Tiempo de espera agotado."};
    out.textContent = map[err.code] || `Error: ${err.message}`;
  }, { enableHighAccuracy:true, timeout:10000, maximumAge:10000 });
});

// ========= calcular nearest =========
$("#run").addEventListener("click", () => {
  const mode = $("#mode").value;
  const useTraffic = $("#traffic").checked;
  const trafficModel = $("#trafficModel").value;

  // Origen: preferimos GPS; si no, el manual
  const originManual = $("#origin").value.trim();
  let origins;         // lo que enviamos a Distance Matrix
  let origenVisible;   // lo que mostramos al usuario (sin coords)

  if (ORIGIN_GPS) {
    origins = [ new google.maps.LatLng(ORIGIN_GPS.lat, ORIGIN_GPS.lng) ];
    origenVisible = `GPS · cerca de: ${ORIGIN_LABEL || "Ubicación actual"}`;
  } else {
    if (!originManual) { $("#msg").textContent = "Escribe un origen o usa el botón de ubicación."; return; }
    origins = [ originManual ];
    origenVisible = originManual;
  }

  // Categorías seleccionadas
  const cats = [...document.querySelectorAll(".cat:checked")].map(c => c.value.toUpperCase());

  // Filtrar lugares por categoría
  const selected = PLACES.filter(p => cats.includes(p.category));
  if (!selected.length) { $("#msg").textContent = "No hay destinos en las categorías seleccionadas."; return; }
  if (selected.length > 25) { $("#msg").textContent = "Máximo 25 destinos por llamada (reduce categorías)."; return; }

  $("#msg").textContent = "Consultando Distance Matrix…";
  $("#nearest").style.display = "none";
  $("#ranking").style.display = "none";

  const service = new google.maps.DistanceMatrixService();
  const req = {
    origins,                                      // <- importante: usar la variable 'origins'
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

    rows.sort((a,b)=> a.distanceMeters - b.distanceMeters);
    const nearest = rows.find(r => r.status === "OK");

    // ====== render: más cercano (alias clickeable con url) ======
    if (nearest) {
      const linkAlias = nearest.url
        ? `<a href="${nearest.url}" target="_blank" rel="noopener">${nearest.alias}</a>`
        : nearest.alias;

      // URL de Google Maps sin origin= (no exponemos ubicación)
      const gmUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nearest.entrada)}&travelmode=${mode.toLowerCase()}`;

      $("#nearest").innerHTML = `
        <h2>Más cercano</h2>
        <div><span class="ok">${linkAlias}</span> <span class="tiny muted">(${nearest.category})</span></div>
        <div class="tiny muted">Origen: ${origenVisible}</div>
        <div class="tiny muted">${nearest.display}</div>
        <div style="margin-top:6px;">Distancia: <b>${kms(nearest.distanceMeters)} km</b></div>
        <div>Duración aprox.: <b>${fmtDur(nearest.durationSec)}</b></div>
        <div style="margin-top:8px;">
          <a target="_blank" rel="noopener" href="${gmUrl}">Abrir en Google Maps ➜</a>
        </div>`;
      $("#nearest").style.display = "block";
    } else {
      $("#nearest").innerHTML = `<span class="err">No hay rutas disponibles.</span>`;
      $("#nearest").style.display = "block";
    }

    // ====== render: ranking ======
    const rowsHtml = rows.map((r, idx) => {
      const linkAlias = r.url
        ? `<a href="${r.url}" target="_blank" rel="noopener">${r.alias}</a>`
        : r.alias;

      if (r.status === "OK") {
        return `<tr>
          <td>${String(idx+1).padStart(2,"0")}</td>
          <td><b>${linkAlias}</b> <span class="tiny muted">(${r.category})</span>
              <div class="tiny muted">${r.display}</div></td>
          <td>${kms(r.distanceMeters)} km</td>
          <td>~ ${fmtDur(r.durationSec)}</td>
        </tr>`;
      } else {
        return `<tr>
          <td>${String(idx+1).padStart(2,"0")}</td>
          <td><b>${linkAlias}</b> <span class="tiny muted">(${r.category})</span>
              <div class="tiny muted">${r.display}</div></td>
          <td colspan="2"><span class="err">${r.status}</span></td>
        </tr>`;
      }
    }).join("");

    const cats = [...document.querySelectorAll(".cat:checked")].map(c => c.value.toUpperCase());
    $("#ranking").innerHTML = `
      <h2>Ranking (por distancia)</h2>
      <div class="tiny muted" style="margin-bottom:6px;">Origen: ${origenVisible}</div>
      <table>
        <thead><tr><th>#</th><th>Destino</th><th>Distancia</th><th>Duración</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="tiny muted" style="margin-top:6px;">Categorías activas: ${cats.join(", ")}</div>`;
    $("#ranking").style.display = "block";
    $("#msg").textContent = "";
  });
});
