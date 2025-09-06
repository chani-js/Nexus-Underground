// data.js - Version JSON optimisée
let siteData = null;

// Fonction pour charger les données JSON
async function loadSiteData() {
  try {
    const response = await fetch("data/data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    siteData = await response.json();
    console.log("Données JSON chargées avec succès");
    return siteData;
  } catch (error) {
    console.error("Erreur lors du chargement des données JSON:", error);
    // Fallback vers des données vides si le chargement échoue
    siteData = {
      vehicles: { mc: [], mafia: [], cartel: [], gang: [] },
      weapons: { pistols: [], rifles: [], explosives: [] },
      blackmarket: { drugs: [], contraband: [], documents: [] },
      services: { laundering: [] },
    };
    return siteData;
  }
}

// Fonction pour générer les étoiles
function generateStars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

// Fonction pour générer une carte de véhicule
function generateVehicleCard(vehicle) {
  const imageContent = vehicle.image.includes("img/")
    ? `<img src="${vehicle.image}" alt="${vehicle.name}">`
    : vehicle.image;

  return `
        <div class="car-card">
            <h3 class="car-name">${vehicle.name}</h3>
            <div class="car-image">${imageContent}</div>
            <div class="car-details">
                <div class="detail-item"><span class="detail-label">Vitesse:</span> ${generateStars(
                  vehicle.stats.vitesse
                )}</div>
                <div class="detail-item"><span class="detail-label">Accélération:</span> ${generateStars(
                  vehicle.stats.acceleration
                )}</div>
                <div class="detail-item"><span class="detail-label">Freinage:</span> ${generateStars(
                  vehicle.stats.freinage
                )}</div>
                <div class="detail-item"><span class="detail-label">Maniabilité:</span> ${generateStars(
                  vehicle.stats.maniabilite
                )}</div>
            </div>
            <div class="price">💰 ${vehicle.price}</div>
            <button class="contact-btn" onclick="contact('${
              vehicle.name
            }')">Contacter pour ce véhicule</button>
        </div>
    `;
}

// Fonction pour générer une carte d'arme
function generateWeaponCard(weapon) {
  const imageContent = weapon.image.includes("img/")
    ? `<img src="${weapon.image}" alt="${weapon.name}">`
    : weapon.image;

  const statsKeys = Object.keys(weapon.stats);
  const statsHTML = statsKeys
    .map((key) => {
      let label = key.charAt(0).toUpperCase() + key.slice(1);
      if (key === "degats") label = "Dégâts";
      if (key === "precision") label = "Précision";
      if (key === "portee") label = "Portée";

      const value =
        typeof weapon.stats[key] === "number"
          ? generateStars(weapon.stats[key])
          : weapon.stats[key];

      return `<div class="detail-item"><span class="detail-label">${label}:</span> ${value}</div>`;
    })
    .join("");

  return `
        <div class="car-card">
            <h3 class="car-name">${weapon.name}</h3>
            <div class="car-image">${imageContent}</div>
            <div class="car-details">
                ${statsHTML}
            </div>
            <div class="price">💰 ${weapon.price}</div>
            <button class="contact-btn" onclick="contact('${weapon.name}')">Contacter pour cette arme</button>
        </div>
    `;
}

// Fonction pour générer une carte de drogue (sans prix ni contact)
function generateDrugCard(drug) {
  const imageContent = drug.image.includes("img/")
    ? `<img src="${drug.image}" alt="${drug.name}">`
    : drug.image;

  const statsKeys = Object.keys(drug.stats);
  const statsHTML = statsKeys
    .map((key) => {
      let label = key.charAt(0).toUpperCase() + key.slice(1);
      if (key === "qualite") label = "Qualité";
      if (key === "purete") label = "Pureté";

      const value =
        typeof drug.stats[key] === "number"
          ? generateStars(drug.stats[key])
          : drug.stats[key];

      return `<div class="detail-item"><span class="detail-label">${label}:</span> ${value}</div>`;
    })
    .join("");

  return `
        <div class="car-card">
            <h3 class="car-name">${drug.name}</h3>
            <div class="car-image">${imageContent}</div>
            <div class="car-details">
                ${statsHTML}
            </div>
            <div class="resource-info">📋 Ressource à découvrir</div>
        </div>
    `;
}

// Fonction pour générer une carte de marché noir (autres que drogues)
function generateBlackmarketCard(item) {
  const imageContent = item.image.includes("img/")
    ? `<img src="${item.image}" alt="${item.name}">`
    : item.image;

  const statsKeys = Object.keys(item.stats);
  const statsHTML = statsKeys
    .map((key) => {
      let label = key.charAt(0).toUpperCase() + key.slice(1);
      if (key === "qualite") label = "Qualité";
      if (key === "purete") label = "Pureté";
      if (key === "quantite") label = "Quantité";
      if (key === "discretion") label = "Discrétion";
      if (key === "authenticite") label = "Authenticité";
      if (key === "delai") label = "Délai";
      if (key === "garantie") label = "Garantie";

      const value =
        typeof item.stats[key] === "number"
          ? generateStars(item.stats[key])
          : item.stats[key];

      return `<div class="detail-item"><span class="detail-label">${label}:</span> ${value}</div>`;
    })
    .join("");

  return `
        <div class="car-card">
            <h3 class="car-name">${item.name}</h3>
            <div class="car-image">${imageContent}</div>
            <div class="car-details">
                ${statsHTML}
            </div>
            <div class="price">💰 ${item.price}</div>
            <button class="contact-btn" onclick="contact('${item.name}')">Contacter pour ce produit</button>
        </div>
    `;
}

// Fonction pour générer une carte de service
function generateServiceCard(service) {
  const imageContent = service.image.includes("img/")
    ? `<img src="${service.image}" alt="${service.name}">`
    : service.image;

  const statsKeys = Object.keys(service.stats);
  const statsHTML = statsKeys
    .map((key) => {
      let label = key.charAt(0).toUpperCase() + key.slice(1);
      if (key === "capaciteMax") label = "Capacité max";
      if (key === "capaciteMin") label = "Capacité min";
      if (key === "delai") label = "Délai";
      if (key === "discretion") label = "Discrétion";

      const value =
        typeof service.stats[key] === "number"
          ? generateStars(service.stats[key])
          : service.stats[key];

      return `<div class="detail-item"><span class="detail-label">${label}:</span> ${value}</div>`;
    })
    .join("");

  return `
        <div class="car-card">
            <h3 class="car-name">${service.name}</h3>
            <div class="car-image">${imageContent}</div>
            <div class="car-details">
                ${statsHTML}
            </div>
            <div class="price">💰 ${service.price}</div>
            <button class="contact-btn" onclick="contact('${service.name}')">Contacter pour ce service</button>
        </div>
    `;
}

// Fonction pour initialiser tout le contenu
async function initializeContent() {
  // Attendre que les données soient chargées
  if (!siteData) {
    await loadSiteData();
  }

  // Vérifier que les données sont disponibles
  if (!siteData) {
    console.error("Impossible de charger les données");
    return;
  }

  // Véhicules
  Object.keys(siteData.vehicles).forEach((category) => {
    const container = document.querySelector(`#${category} .cars-grid`);
    if (container && siteData.vehicles[category]) {
      container.innerHTML = siteData.vehicles[category]
        .map(generateVehicleCard)
        .join("");
    }
  });

  // Armes
  Object.keys(siteData.weapons).forEach((category) => {
    const container = document.querySelector(`#${category} .cars-grid`);
    if (container && siteData.weapons[category]) {
      container.innerHTML = siteData.weapons[category]
        .map(generateWeaponCard)
        .join("");
    }
  });

  // Marché noir
  Object.keys(siteData.blackmarket).forEach((category) => {
    const container = document.querySelector(`#${category} .cars-grid`);
    if (container && siteData.blackmarket[category]) {
      // Traitement spécial pour les drogues
      if (category === "drugs") {
        container.innerHTML = siteData.blackmarket[category]
          .map(generateDrugCard)
          .join("");
      } else {
        container.innerHTML = siteData.blackmarket[category]
          .map(generateBlackmarketCard)
          .join("");
      }
    }
  });

  // Services
  Object.keys(siteData.services).forEach((category) => {
    const container = document.querySelector(`#${category} .cars-grid`);
    if (container && siteData.services[category]) {
      container.innerHTML = siteData.services[category]
        .map(generateServiceCard)
        .join("");
    }
  });

  console.log("Contenu initialisé avec succès");
}

// Fonction pour recharger les données (utile pour le développement)
async function reloadData() {
  console.log("Rechargement des données...");
  await loadSiteData();
  await initializeContent();
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOM chargé, initialisation des données...");
  await initializeContent();
});

// Précharger les données dès que possible
(async function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => {
      await loadSiteData();
    });
  } else {
    await loadSiteData();
  }
})();

// Export des fonctions pour pouvoir les utiliser depuis la console (développement)
window.reloadData = reloadData;
window.siteData = siteData;
