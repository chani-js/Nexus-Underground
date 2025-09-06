// js/managers/data-manager.js
// Gestionnaire des données et génération des cartes

/**
 * Gestionnaire des données du site
 */
export class DataManager {
  constructor() {
    this.siteData = null;
    this.isLoaded = false;
  }

  /**
   * Charge les données depuis le fichier JSON
   */
  async loadSiteData() {
    try {
      const response = await fetch("data/data.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.siteData = await response.json();
      this.isLoaded = true;
      return this.siteData;
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données JSON:", error);
      this.siteData = this.getFallbackData();
      this.isLoaded = true;
      return this.siteData;
    }
  }

  /**
   * Données de secours en cas d'échec de chargement
   */
  getFallbackData() {
    return {
      vehicles: { mc: [], mafia: [], cartel: [], gang: [] },
      weapons: { pistols: [], rifles: [], explosives: [] },
      blackmarket: { drugs: [], contraband: [], documents: [] },
      services: { laundering: [] },
    };
  }

  /**
   * Génère les étoiles pour les ratings
   */
  generateStars(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  /**
   * Génère une carte de véhicule
   */
  generateVehicleCard(vehicle) {
    const imageContent = vehicle.image.includes("img/")
      ? `<img src="${vehicle.image}" alt="${vehicle.name}" loading="lazy">`
      : vehicle.image;

    return `
      <div class="car-card">
        <h3 class="car-name">${vehicle.name}</h3>
        <div class="car-image">${imageContent}</div>
        <div class="car-details">
          <div class="detail-item"><span class="detail-label">Vitesse:</span> ${this.generateStars(
            vehicle.stats.vitesse
          )}</div>
          <div class="detail-item"><span class="detail-label">Accélération:</span> ${this.generateStars(
            vehicle.stats.acceleration
          )}</div>
          <div class="detail-item"><span class="detail-label">Freinage:</span> ${this.generateStars(
            vehicle.stats.freinage
          )}</div>
          <div class="detail-item"><span class="detail-label">Maniabilité:</span> ${this.generateStars(
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

  /**
   * Génère une carte d'arme
   */
  generateWeaponCard(weapon) {
    const imageContent = weapon.image.includes("img/")
      ? `<img src="${weapon.image}" alt="${weapon.name}" loading="lazy">`
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
            ? this.generateStars(weapon.stats[key])
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

  /**
   * Génère une carte de drogue (sans prix ni contact)
   */
  generateDrugCard(drug) {
    const imageContent = drug.image.includes("img/")
      ? `<img src="${drug.image}" alt="${drug.name}" loading="lazy">`
      : drug.image;

    const statsKeys = Object.keys(drug.stats);
    const statsHTML = statsKeys
      .map((key) => {
        let label = key.charAt(0).toUpperCase() + key.slice(1);
        if (key === "qualite") label = "Qualité";
        if (key === "purete") label = "Pureté";

        const value =
          typeof drug.stats[key] === "number"
            ? this.generateStars(drug.stats[key])
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

  /**
   * Génère une carte de marché noir (autres que drogues)
   */
  generateBlackmarketCard(item) {
    const imageContent = item.image.includes("img/")
      ? `<img src="${item.image}" alt="${item.name}" loading="lazy">`
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
            ? this.generateStars(item.stats[key])
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

  /**
   * Génère une carte de service
   */
  generateServiceCard(service) {
    const imageContent = service.image.includes("img/")
      ? `<img src="${service.image}" alt="${service.name}" loading="lazy">`
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
            ? this.generateStars(service.stats[key])
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

  /**
   * Initialise tout le contenu des cartes
   */
  async initializeContent() {
    if (!this.isLoaded) {
      await this.loadSiteData();
    }

    if (!this.siteData) {
      console.error("❌ Impossible de charger les données");
      return false;
    }

    let success = true;

    // Véhicules
    Object.keys(this.siteData.vehicles).forEach((category) => {
      const container = document.querySelector(`#${category} .cars-grid`);
      if (container && this.siteData.vehicles[category]) {
        container.innerHTML = this.siteData.vehicles[category]
          .map((vehicle) => this.generateVehicleCard(vehicle))
          .join("");
      } else if (this.siteData.vehicles[category]?.length > 0) {
        console.warn(`Container not found for vehicles.${category}`);
        success = false;
      }
    });

    // Armes
    Object.keys(this.siteData.weapons).forEach((category) => {
      const container = document.querySelector(`#${category} .cars-grid`);
      if (container && this.siteData.weapons[category]) {
        container.innerHTML = this.siteData.weapons[category]
          .map((weapon) => this.generateWeaponCard(weapon))
          .join("");
      } else if (this.siteData.weapons[category]?.length > 0) {
        console.warn(`Container not found for weapons.${category}`);
        success = false;
      }
    });

    // Marché noir
    Object.keys(this.siteData.blackmarket).forEach((category) => {
      const container = document.querySelector(`#${category} .cars-grid`);
      if (container && this.siteData.blackmarket[category]) {
        if (category === "drugs") {
          container.innerHTML = this.siteData.blackmarket[category]
            .map((drug) => this.generateDrugCard(drug))
            .join("");
        } else {
          container.innerHTML = this.siteData.blackmarket[category]
            .map((item) => this.generateBlackmarketCard(item))
            .join("");
        }
      } else if (this.siteData.blackmarket[category]?.length > 0) {
        console.warn(`Container not found for blackmarket.${category}`);
        success = false;
      }
    });

    // Services
    Object.keys(this.siteData.services).forEach((category) => {
      const container = document.querySelector(`#${category} .cars-grid`);
      if (container && this.siteData.services[category]) {
        container.innerHTML = this.siteData.services[category]
          .map((service) => this.generateServiceCard(service))
          .join("");
      } else if (this.siteData.services[category]?.length > 0) {
        console.warn(`Container not found for services.${category}`);
        success = false;
      }
    });

    if (success) {
      console.log("✅ Contenu des cartes initialisé avec succès");
    } else {
      console.warn("⚠️ Certains conteneurs de cartes non trouvés");
    }

    return success;
  }

  /**
   * Recharge les données et régénère le contenu
   */
  async reloadData() {
    this.isLoaded = false;
    this.siteData = null;
    return await this.initializeContent();
  }

  /**
   * Retourne les données chargées
   */
  getData() {
    return this.siteData;
  }

  /**
   * Vérifie si les données sont chargées
   */
  isDataLoaded() {
    return this.isLoaded && this.siteData !== null;
  }
}

// Instance singleton
export const dataManager = new DataManager();
