const API_URL = "";

// Variables i funcions del temporitzador (Iteració 7)
let temporitzador = null;
let segons = 0;

function iniciarTemps() {
  aturarTemps();
  segons = 0;
  const elTemps = document.getElementById("temps");
  if (elTemps) elTemps.textContent = segons;

  temporitzador = setInterval(() => {
    segons++;
    const el = document.getElementById("temps");
    if (el) el.textContent = segons;
  }, 1000);
}

function aturarTemps() {
  if (temporitzador) {
    clearInterval(temporitzador);
    temporitzador = null;
  }
}

// Estat global de la partida
let estat = {
  sessionId: null,
  preguntes: [],
  indexActual: 0,
  respostesTriades: []
};

// Selectors DOM: Navegació
const pantallaJoc = document.getElementById("pantallaJoc");
const pantallaAdmin = document.getElementById("pantallaAdmin");
const botoModeJoc = document.getElementById("botoModeJoc");
const botoModeAdmin = document.getElementById("botoModeAdmin");

// Selectors DOM: Joc
const seccioNom = document.getElementById("seccioNom");
const seccioBenvinguda = document.getElementById("seccioBenvinguda");
const zonaJoc = document.getElementById("zonaJoc");
const formulariNom = document.getElementById("formulariNom");
const inputNom = document.getElementById("inputNom");
const spanNomUsuari = document.getElementById("nomUsuari");
const botoEsborrar = document.getElementById("botoEsborrar");
const contenidorPartida = document.getElementById("partida");
const contenidorMarcador = document.getElementById("marcador");
const botoEnviar = document.getElementById("botoEnviar");

// Selectors DOM: Panell Admin
const formulariAdmin = document.getElementById("formulariAdmin");
const adminPreguntaId = document.getElementById("adminPreguntaId");
const adminTextPregunta = document.getElementById("adminTextPregunta");
const adminFitxerImatge = document.getElementById("adminFitxerImatge");
const adminResp0 = document.getElementById("adminResp0");
const adminResp1 = document.getElementById("adminResp1");
const adminResp2 = document.getElementById("adminResp2");
const adminResp3 = document.getElementById("adminResp3");
const adminCorrectIndex = document.getElementById("adminCorrectIndex");
const botoCancelEditar = document.getElementById("botoCancelEditar");
const titolFormAdmin = document.getElementById("titolFormAdmin");
const taulaPreguntesCos = document.getElementById("taulaPreguntesCos");

let imatgeActualEnEdicio = "";

// Normalització de rutes d'imatges
function formatImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

// Control de pestanyes (Joc / Admin)
if (botoModeJoc && botoModeAdmin) {
  botoModeJoc.addEventListener("click", () => {
    pantallaJoc.classList.remove("hidden");
    pantallaAdmin.classList.add("hidden");
    botoModeJoc.classList.add("active");
    botoModeAdmin.classList.remove("active");
  });

  botoModeAdmin.addEventListener("click", () => {
    pantallaJoc.classList.add("hidden");
    pantallaAdmin.classList.remove("hidden");
    botoModeAdmin.classList.add("active");
    botoModeJoc.classList.remove("active");
    carregarTotesLesPreguntes();
  });
}

// Gestió de sessió de l'usuari
function carregarEstatUsuari() {
  const nom = sessionStorage.getItem("nomUsuari");

  if (nom) {
    if (spanNomUsuari) spanNomUsuari.textContent = nom;
    if (seccioNom) seccioNom.classList.add("hidden");
    if (seccioBenvinguda) seccioBenvinguda.classList.remove("hidden");
    if (zonaJoc) zonaJoc.classList.remove("hidden");
    sollicitarPreguntes(10);
  } else {
    if (seccioNom) seccioNom.classList.remove("hidden");
    if (seccioBenvinguda) seccioBenvinguda.classList.add("hidden");
    if (zonaJoc) zonaJoc.classList.add("hidden");
  }
}

if (formulariNom) {
  formulariNom.addEventListener("submit", (e) => {
    e.preventDefault();
    const nom = inputNom.value.trim();
    if (nom) {
      sessionStorage.setItem("nomUsuari", nom);
      inputNom.value = "";
      carregarEstatUsuari();
    }
  });
}

if (botoEsborrar) {
  botoEsborrar.addEventListener("click", () => {
    sessionStorage.removeItem("nomUsuari");
    reiniciarEstatJoc();
    carregarEstatUsuari();
  });
}

function reiniciarEstatJoc() {
  aturarTemps();
  estat.sessionId = null;
  estat.preguntes = [];
  estat.indexActual = 0;
  estat.respostesTriades = [];
  const elTemps = document.getElementById("temps");
  if (elTemps) elTemps.textContent = "0";
  if (contenidorPartida) contenidorPartida.innerHTML = "";
  if (contenidorMarcador) contenidorMarcador.innerHTML = "";
  if (botoEnviar) botoEnviar.classList.add("hidden");
}

// Petició de preguntes a l'API
async function sollicitarPreguntes(quantitatEnter = 10) {
  try {
    if (contenidorPartida) {
      contenidorPartida.innerHTML = "<p>Carregant preguntes...</p>";
    }

    const res = await fetch(`${API_URL}/getPreguntes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantitat: quantitatEnter })
    });
    if (!res.ok) throw new Error(`HTTP: ${res.status}`);

    const data = await res.json();
    estat.sessionId = data.sessionId;
    const llista = data.preguntes || [];

    if (llista.length === 0) {
      if (contenidorPartida) {
        contenidorPartida.innerHTML = "<p>No hi ha preguntes disponibles a la base de dades.</p>";
      }
      return;
    }

    estat.preguntes = llista.map(p => ({
      ...p,
      imatge: formatImageUrl(p.imatge),
      respostes: typeof p.respostes === 'string' ? JSON.parse(p.respostes) : p.respostes
    }));

    estat.indexActual = 0;
    estat.respostesTriades = [];

    actualitzarMarcador();
    renderitzarPreguntaActual();
    iniciarTemps();
  } catch (err) {
    console.error("Error al carregar preguntes:", err);
    aturarTemps();
    if (contenidorPartida) {
      contenidorPartida.innerHTML = "<p>Error en carregar les preguntes de l'API.</p>";
    }
  }
}

function actualitzarMarcador() {
  if (contenidorMarcador && estat.preguntes.length > 0) {
    contenidorMarcador.innerHTML = `Pregunta ${estat.indexActual + 1} de ${estat.preguntes.length}`;
  }
}

// Renderitzat de targetes de preguntes
function renderitzarPreguntaActual() {
  if (!contenidorPartida) return;

  if (estat.indexActual >= estat.preguntes.length) {
    contenidorPartida.innerHTML = "<h2>Has completat totes les preguntes!</h2>";
    if (botoEnviar) botoEnviar.classList.remove("hidden");
    return;
  }

  const p = estat.preguntes[estat.indexActual];
  const botonsHTML = p.respostes.map((txt, idx) =>
    `<button type="button" onclick="triarOpcio(${idx})">${txt}</button>`
  ).join(' ');

  contenidorPartida.innerHTML = `
    <div class="pregunta">
      <h3>${p.pregunta}</h3>
      ${p.imatge ? `<img src="${p.imatge}" alt="Bandera"><br>` : ''}
      <div class="opcions">${botonsHTML}</div>
    </div>
  `;
}

function triarOpcio(indexEnter) {
  estat.respostesTriades.push(indexEnter);
  estat.indexActual++;

  if (estat.indexActual < estat.preguntes.length) {
    actualitzarMarcador();
  } else {
    aturarTemps();
  }
  renderitzarPreguntaActual();
}

// Enviament de respostes i resultat
if (botoEnviar) {
  botoEnviar.onclick = async function () {
    try {
      const res = await fetch(`${API_URL}/finalitza`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: estat.sessionId,
          respostesUsuari: estat.respostesTriades
        })
      });
      if (!res.ok) throw new Error(`HTTP: ${res.status}`);

      const resultat = await res.json();
      botoEnviar.classList.add("hidden");
      if (contenidorMarcador) contenidorMarcador.innerHTML = "";
      if (contenidorPartida) {
        contenidorPartida.innerHTML = `
          <h2>Partida finalitzada</h2>
          <p>Temps total: <strong>${segons} segons</strong></p>
          <p>Respostes totals: <strong>${resultat.total}</strong></p>
          <p>Respostes correctes: <strong>${resultat.correctes}</strong></p>
          <button type="button" class="btn-destacat" onclick="sollicitarPreguntes(10)">Tornar a jugar</button>
        `;
      }
    } catch (err) {
      console.error("Error al finalitzar:", err);
    }
  };
}

// Panell Admin: Llistar preguntes existents
async function carregarTotesLesPreguntes() {
  try {
    const res = await fetch(`${API_URL}/admin/preguntes`);
    if (!res.ok) throw new Error(`HTTP: ${res.status}`);

    const llista = await res.json();
    if (!taulaPreguntesCos) return;
    taulaPreguntesCos.innerHTML = "";

    llista.forEach(p => {
      const opcions = Array.isArray(p.respostes) ? p.respostes : JSON.parse(p.respostes);
      const imgSrc = formatImageUrl(p.imatge);
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${p.id}</td>
        <td>${imgSrc ? `<img src="${imgSrc}" class="thumb" alt="bandera">` : 'Sense imatge'}</td>
        <td>${p.pregunta}</td>
        <td>${opcions.join(" | ")}</td>
        <td>Opció ${p.correctIndex} (${opcions[p.correctIndex] || ''})</td>
        <td>
          <button type="button" onclick="iniciarEdicio(${p.id})">Editar</button>
          <button type="button" onclick="eliminarPregunta(${p.id})">Eliminar</button>
        </td>
      `;
      taulaPreguntesCos.appendChild(fila);
    });
  } catch (err) {
    console.error("Error carregant taula admin:", err);
  }
}

// Panell Admin: Crear o actualitzar pregunta
if (formulariAdmin) {
  formulariAdmin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = adminPreguntaId.value;
    const formData = new FormData();

    formData.append("pregunta", adminTextPregunta.value.trim());
    const arrayRespostes = [
      adminResp0.value.trim(),
      adminResp1.value.trim(),
      adminResp2.value.trim(),
      adminResp3.value.trim()
    ];
    formData.append("respostes", JSON.stringify(arrayRespostes));
    formData.append("correctIndex", adminCorrectIndex.value);

    if (adminFitxerImatge && adminFitxerImatge.files[0]) {
      formData.append("imatge", adminFitxerImatge.files[0]);
    } else if (id && imatgeActualEnEdicio) {
      formData.append("imatgeUrl", imatgeActualEnEdicio);
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/admin/preguntes/${id}` : `${API_URL}/admin/preguntes`;

    try {
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error("Error desant la pregunta");

      await res.json();
      netejarFormulariAdmin();
      carregarTotesLesPreguntes();
      alert(id ? "Pregunta actualitzada correctament!" : "Pregunta afegida correctament!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
}

// Panell Admin: Eliminar pregunta
async function eliminarPregunta(id) {
  if (!confirm(`Segur que vols eliminar la pregunta #${id}?`)) return;

  try {
    const res = await fetch(`${API_URL}/admin/preguntes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Error eliminant");

    await res.json();
    carregarTotesLesPreguntes();
  } catch (err) {
    alert("Error eliminant: " + err.message);
  }
}

// Panell Admin: Carregar dades al formulari per editar
async function iniciarEdicio(id) {
  try {
    const res = await fetch(`${API_URL}/admin/preguntes`);
    const llista = await res.json();
    const p = llista.find(item => Number(item.id) === Number(id));

    if (!p) {
      alert(`No s'ha trobat la pregunta amb ID ${id}`);
      return;
    }

    adminPreguntaId.value = p.id;
    adminTextPregunta.value = p.pregunta;
    const opcions = Array.isArray(p.respostes) ? p.respostes : JSON.parse(p.respostes);

    adminResp0.value = opcions[0] || '';
    adminResp1.value = opcions[1] || '';
    adminResp2.value = opcions[2] || '';
    adminResp3.value = opcions[3] || '';
    adminCorrectIndex.value = String(p.correctIndex);
    imatgeActualEnEdicio = p.imatge || '';

    titolFormAdmin.textContent = `Editar Pregunta #${p.id}`;
    botoCancelEditar.classList.remove("hidden");

    if (formulariAdmin) {
      formulariAdmin.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error("Error en preparar edició:", err);
    alert("Error en preparar l'edició: " + err.message);
  }
}

// Panell Admin: Buidar formulari
function netejarFormulariAdmin() {
  if (!formulariAdmin) return;
  adminPreguntaId.value = "";
  formulariAdmin.reset();
  if (adminFitxerImatge) adminFitxerImatge.value = "";
  adminTextPregunta.value = "De quin pais es aquesta bandera?";
  imatgeActualEnEdicio = "";
  titolFormAdmin.textContent = "Afegir pregunta a la BBDD";
  botoCancelEditar.classList.add("hidden");
}

if (botoCancelEditar) {
  botoCancelEditar.addEventListener("click", netejarFormulariAdmin);
}

// Mètodes globals per als atributs onclick
window.triarOpcio = triarOpcio;
window.sollicitarPreguntes = sollicitarPreguntes;
window.iniciarEdicio = iniciarEdicio;
window.eliminarPregunta = eliminarPregunta;

// Inici de l'aplicació
carregarEstatUsuari(); 