// ========= util =========
const $ = (sel) => document.querySelector(sel);
function kms(m){ return (m/1000).toFixed(3); }
function fmtDur(s){
  const m = Math.round(s/60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m/60), r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

// Función para animar la aparición de elementos
function animateElement(element, animationClass = 'fadeInUp') {
  element.style.display = 'block';
  element.style.animation = 'none';
  setTimeout(() => {
    element.style.animation = `${animationClass} 0.6s ease`;
  }, 10);
}

// Función para mostrar mensajes con animación
function showMessage(text, type = 'info') {
  const msg = $("#msg");
  msg.textContent = text;
  msg.className = 'tiny';
  if (type === 'error') msg.classList.add('err');
  if (type === 'success') msg.style.color = 'var(--celestial-dark)';
  msg.style.animation = 'fadeIn 0.3s ease';
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

// ========= botón GPS (icono celeste) =========
$("#btnGps").addEventListener("click", () => {
  const btn = $("#btnGps");
  const out = $("#gpsMsg");
  out.textContent = "";
  if (!("geolocation" in navigator)) {
    out.textContent = "❌ Este navegador no soporta geolocalización.";
    out.style.color = '#E53E3E';
    return;
  }
  btn.disabled = true;
  btn.style.opacity = '0.6';
  out.textContent = "📍 Obteniendo tu ubicación...";
  out.style.color = 'var(--celestial-dark)';

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    ORIGIN_GPS = { lat: +latitude.toFixed(6), lng: +longitude.toFixed(6) }; // guardado en memoria
    ORIGIN_LABEL = await reverseGeocode(ORIGIN_GPS.lat, ORIGIN_GPS.lng) || "Ubicación actual";
    // Confirmamos sin mostrar coords
    out.textContent = `✅ Ubicación establecida (${ORIGIN_LABEL})`;
    out.style.color = 'var(--celestial-dark)';
    out.style.animation = 'fadeIn 0.3s ease';
    btn.disabled = false;
    btn.style.opacity = '1';
  }, (err) => {
    btn.disabled = false;
    btn.style.opacity = '1';
    const map = {1:"❌ Permiso denegado.",2:"❌ Posición no disponible.",3:"❌ Tiempo de espera agotado."};
    out.textContent = map[err.code] || `❌ Error: ${err.message}`;
    out.style.color = '#E53E3E';
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
    origenVisible = `📍 GPS · ${ORIGIN_LABEL || "Ubicación actual"}`;
  } else {
    if (!originManual) { 
      showMessage("⚠️ Por favor, escribe un origen o usa el botón de ubicación.", 'error');
      return;
    }
    origins = [ originManual ];
    origenVisible = `📍 ${originManual}`;
  }

  // Categorías seleccionadas
  const cats = [...document.querySelectorAll(".cat:checked")].map(c => c.value.toUpperCase());

  // Filtrar lugares por categoría
  const selected = PLACES.filter(p => cats.includes(p.category));
  if (!selected.length) { 
    showMessage("⚠️ Por favor, selecciona al menos una categoría (JAC o JÓVENES).", 'error');
    return;
  }
  if (selected.length > 25) { 
    showMessage("⚠️ Máximo 25 destinos por llamada. Reduce las categorías seleccionadas.", 'error');
    return;
  }

  showMessage("🔍 Consultando rutas y calculando distancias...", 'info');
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
    if (status !== "OK") { 
      showMessage(`❌ Error al consultar rutas: ${status}`, 'error');
      return;
    }

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

      // Icono de categoría
      const categoryIcon = nearest.category === 'JAC' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';

      $("#nearest").innerHTML = `
        <h2>✨ Célula más cercana</h2>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          ${categoryIcon}
          <span class="ok" style="font-size:1.2rem;">${linkAlias}</span>
          <span class="tiny muted">(${nearest.category})</span>
        </div>
        <div class="tiny muted" style="margin-bottom:4px;">${origenVisible}</div>
        <div class="tiny muted" style="margin-bottom:12px;">📌 ${nearest.display}</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
          <div style="background:var(--celestial-lighter); padding:12px; border-radius:10px; text-align:center;">
            <div class="tiny muted">Distancia</div>
            <div style="font-size:1.3rem; font-weight:700; color:var(--celestial-dark);">${kms(nearest.distanceMeters)} km</div>
          </div>
          <div style="background:var(--celestial-lighter); padding:12px; border-radius:10px; text-align:center;">
            <div class="tiny muted">Duración aprox.</div>
            <div style="font-size:1.3rem; font-weight:700; color:var(--celestial-dark);">${fmtDur(nearest.durationSec)}</div>
          </div>
        </div>
        <div style="margin-top:16px;">
          <a target="_blank" rel="noopener" href="${gmUrl}" 
             style="display:inline-block; padding:12px 24px; background:var(--celestial-gradient); color:white; text-decoration:none; border-radius:50px; font-weight:600; box-shadow:var(--shadow-md); transition:all 0.3s ease;">
            🗺️ Ver ruta en Google Maps
          </a>
        </div>`;
      animateElement($("#nearest"));
    } else {
      $("#nearest").innerHTML = `<div style="text-align:center; padding:20px;"><span class="err" style="font-size:1.1rem;">❌ No hay rutas disponibles para los destinos seleccionados.</span></div>`;
      animateElement($("#nearest"));
    }

    // ====== render: ranking ======
    const rowsHtml = rows.map((r, idx) => {
      const linkAlias = r.url
        ? `<a href="${r.url}" target="_blank" rel="noopener">${r.alias}</a>`
        : r.alias;

      // Medalla para los primeros 3
      let medal = '';
      if (r.status === "OK") {
        if (idx === 0) medal = '🥇';
        else if (idx === 1) medal = '🥈';
        else if (idx === 2) medal = '🥉';
      }

      if (r.status === "OK") {
        return `<tr>
          <td style="text-align:center; font-size:1.1rem;">${medal || String(idx+1).padStart(2,"0")}</td>
          <td><b>${linkAlias}</b> <span class="tiny muted">(${r.category})</span>
              <div class="tiny muted" style="margin-top:4px;">📌 ${r.display}</div></td>
          <td style="font-weight:600; color:var(--celestial-dark);">${kms(r.distanceMeters)} km</td>
          <td style="font-weight:600; color:var(--celestial-dark);">⏱️ ${fmtDur(r.durationSec)}</td>
        </tr>`;
      } else {
        return `<tr style="opacity:0.6;">
          <td style="text-align:center;">${String(idx+1).padStart(2,"0")}</td>
          <td><b>${linkAlias}</b> <span class="tiny muted">(${r.category})</span>
              <div class="tiny muted" style="margin-top:4px;">📌 ${r.display}</div></td>
          <td colspan="2"><span class="err">${r.status}</span></td>
        </tr>`;
      }
    }).join("");

    $("#ranking").innerHTML = `
      <h2>📊 Ranking completo (ordenado por distancia)</h2>
      <div class="tiny muted" style="margin-bottom:12px;">${origenVisible}</div>
      <table>
        <thead><tr><th style="text-align:center;">#</th><th>Célula</th><th>Distancia</th><th>Duración</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="tiny muted" style="margin-top:12px; padding:10px; background:var(--celestial-lighter); border-radius:8px;">
        📋 Categorías mostradas: <b>${cats.join(", ")}</b>
      </div>`;
    
    setTimeout(() => animateElement($("#ranking")), 100);
    showMessage("✅ Búsqueda completada con éxito", 'success');
  });
});
