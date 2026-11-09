const references = [
  {
    id: "trama",
    number: "01",
    title: "Textura em foco",
    category: "Texturas",
    image: "assets/editorial-rail.jpg",
    alt: "Peças de roupa conceituais em tons creme, areia, jeans e ameixa em um cabideiro",
    description: "Um estudo visual de materiais, volumes e superfícies que podem inspirar uma escolha. A imagem é ilustrativa e não mostra produtos confirmados pela Invista.",
    short: "Uma leitura próxima de trama, toque e forma."
  },
  {
    id: "camadas",
    number: "02",
    title: "Camadas naturais",
    category: "Combinações",
    image: "assets/campaign-street.jpg",
    alt: "Duas mulheres adultas em combinações contemporâneas de tons neutros, fotografia conceitual",
    description: "Uma inspiração sobre como sobrepor peças e misturar texturas em uma composição cotidiana. A combinação não representa um look ou estoque real da loja.",
    short: "Sobreposições leves, com contrastes discretos."
  },
  {
    id: "tons",
    number: "03",
    title: "Neutros em movimento",
    category: "Tons",
    image: "assets/lookbook-portrait.jpg",
    alt: "Mulher adulta em blusa de tricô creme e saia ameixa, imagem gerada para referência visual",
    description: "Uma referência de paleta que aproxima tons claros de um acento ameixa. Imagem gerada para este estudo, sem vínculo com peças ou marcas comercializadas pela Invista.",
    short: "Tons claros com um acento de cor."
  }
];

const designs = ["editorial", "loja", "lookbook"];
const tabButtons = [...document.querySelectorAll("[data-design-choice]")];
const designViews = [...document.querySelectorAll("[data-design-view]")];
const dialog = document.querySelector("#reference-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogKicker = document.querySelector("#dialog-kicker");
const copyButton = document.querySelector("#copy-inquiry");
const copyStatus = document.querySelector("#copy-status");
let currentReference = null;
let lastTrigger = null;

function cardMarkup(reference, mode = "editorial") {
  const modeClass = mode === "direct" ? "direct-card" : "editorial-card";
  return `
    <article class="inspiration-card ${modeClass}" data-reference-card="${reference.id}">
      <button class="reference-open" type="button" data-open-ref="${reference.id}" aria-label="Abrir detalhes da inspiração: ${reference.title}">
        <span class="card-image"><img src="${reference.image}" alt="${reference.alt}" loading="lazy"><span class="card-number">REF. ${reference.number} · ILUSTRATIVA</span></span>
        <span class="card-meta"><span>${reference.category}</span><span>0${reference.number}</span></span>
        <span class="card-title">${reference.title}</span>
        <span class="card-desc">${reference.short}</span>
        <span class="card-action">Ver inspiração ↗</span>
      </button>
    </article>`;
}

function renderCards() {
  document.querySelector("#editorial-cards").innerHTML = references.map(item => cardMarkup(item)).join("");
  document.querySelector("#direct-cards").innerHTML = references.map(item => cardMarkup(item, "direct")).join("");
  document.querySelector("#lookbook-rail").innerHTML = references.map((item, index) => `
    <button class="lookbook-pick" type="button" data-scene-index="${index}" aria-pressed="${index === 0}">
      <img src="${item.image}" alt="" loading="lazy"><span><small>0${index + 1} · ${item.category}</small>${item.title}</span>
    </button>`).join("");
  renderFilters();
  refreshCatalog();
}

function renderFilters() {
  const categories = ["Todas", ...new Set(references.map(item => item.category))];
  const filterList = document.querySelector("#filter-list");
  filterList.innerHTML = categories.map((category, index) => `
    <button class="filter-chip" type="button" data-filter="${category}" aria-pressed="${index === 0}">${category}</button>`).join("");
}

function setDesign(design, { focus = false } = {}) {
  if (!designs.includes(design)) return;
  document.documentElement.dataset.design = design;
  tabButtons.forEach(button => {
    const active = button.dataset.designChoice === design;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && focus) button.focus();
  });
  designViews.forEach(view => {
    const active = view.dataset.designView === design;
    view.hidden = !active;
    view.setAttribute("aria-hidden", String(!active));
  });
  document.querySelectorAll("[data-collection-target]").forEach(section => section.removeAttribute("id"));
  document.querySelector(`[data-design-view="${design}"] [data-collection-target]`)?.setAttribute("id", "colecao");
}

function openReference(id, trigger) {
  const reference = references.find(item => item.id === id);
  if (!reference) return;
  currentReference = reference;
  lastTrigger = trigger || document.activeElement;
  dialogImage.src = reference.image;
  dialogImage.alt = reference.alt;
  dialogTitle.textContent = reference.title;
  dialogDescription.textContent = reference.description;
  dialogKicker.textContent = `INSPIRAÇÃO ILUSTRATIVA · ${reference.category.toUpperCase()}`;
  copyStatus.textContent = "";
  dialog.showModal();
}

function inquiryText(reference) {
  return `Oi, tudo bem? Vi uma referência visual chamada “${reference.title}” e queria saber se vocês têm algo parecido ou podem me ajudar a encontrar opções.`;
}

async function copyInquiry() {
  if (!currentReference) return;
  const text = inquiryText(currentReference);
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = "Pergunta copiada. Abra o WhatsApp da loja e cole na conversa.";
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.className = "visually-hidden";
    document.body.append(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    copyStatus.textContent = copied ? "Pergunta copiada. Abra o WhatsApp da loja e cole na conversa." : text;
  }
}

function refreshCatalog() {
  const query = document.querySelector("#reference-search").value.trim().toLocaleLowerCase("pt-BR");
  const activeFilter = document.querySelector('.filter-chip[aria-pressed="true"]')?.dataset.filter || "Todas";
  let visible = 0;
  document.querySelectorAll("#direct-cards [data-reference-card]").forEach(card => {
    const reference = references.find(item => item.id === card.dataset.referenceCard);
    const matchesQuery = !query || `${reference.title} ${reference.category} ${reference.short}`.toLocaleLowerCase("pt-BR").includes(query);
    const matchesFilter = activeFilter === "Todas" || reference.category === activeFilter;
    card.hidden = !(matchesQuery && matchesFilter);
    if (!card.hidden) visible += 1;
  });
  document.querySelector("#catalog-count").textContent = `${visible} ${visible === 1 ? "referência" : "referências"} conceituais`;
  document.querySelector("#empty-state").hidden = visible > 0;
}

let activeScene = 0;
function setScene(index) {
  activeScene = (index + references.length) % references.length;
  const item = references[activeScene];
  const image = document.querySelector("#lookbook-image");
  image.classList.add("is-changing");
  window.setTimeout(() => {
    image.src = item.image;
    image.alt = item.alt;
    image.classList.remove("is-changing");
  }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 100);
  document.querySelector("#lookbook-counter").textContent = `0${activeScene + 1} / 0${references.length}`;
  document.querySelector("#lookbook-kicker").textContent = `${item.category.toUpperCase()} · 0${activeScene + 1}`;
  document.querySelector("#lookbook-title").innerHTML = [
    "Textura<br><em>para observar.</em>",
    "Camadas<br><em>em encontro.</em>",
    "Neutros<br><em>em movimento.</em>"
  ][activeScene];
  document.querySelector("#lookbook-description").textContent = item.short;
  document.querySelector(".scene-copy [data-open-ref]")?.setAttribute("data-open-ref", item.id);
  document.querySelector(".scene-copy .button")?.setAttribute("aria-label", `Explorar a referência ${item.title}`);
  document.querySelectorAll(".lookbook-pick").forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.sceneIndex) === activeScene)));
}

tabButtons.forEach(button => button.addEventListener("click", () => setDesign(button.dataset.designChoice)));
document.querySelector(".direction-picker").addEventListener("keydown", event => {
  const current = tabButtons.indexOf(document.activeElement);
  if (current < 0) return;
  let next = current;
  if (event.key === "ArrowRight") next = (current + 1) % tabButtons.length;
  else if (event.key === "ArrowLeft") next = (current - 1 + tabButtons.length) % tabButtons.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = tabButtons.length - 1;
  else return;
  event.preventDefault();
  setDesign(tabButtons[next].dataset.designChoice, { focus: true });
});

document.addEventListener("click", event => {
  const openButton = event.target.closest("[data-open-ref]");
  if (openButton) openReference(openButton.dataset.openRef, openButton);
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    document.querySelectorAll("[data-filter]").forEach(button => button.setAttribute("aria-pressed", String(button === filter)));
    refreshCatalog();
  }
  const scene = event.target.closest("[data-scene-index]");
  if (scene) setScene(Number(scene.dataset.sceneIndex));
});

document.querySelector("#reference-search").addEventListener("input", refreshCatalog);
document.querySelector("#lookbook-prev").addEventListener("click", () => setScene(activeScene - 1));
document.querySelector("#lookbook-next").addEventListener("click", () => setScene(activeScene + 1));
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener("close", () => { if (lastTrigger?.isConnected) lastTrigger.focus(); });
copyButton.addEventListener("click", copyInquiry);

document.querySelectorAll('a[href="#explorar"], a[href="#colecao"], a[href="#referencias"]').forEach(link => {
  link.addEventListener("click", event => {
    const targetId = link.getAttribute("href").slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });
});

renderCards();
setDesign("editorial");
setScene(0);
