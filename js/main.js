// js/main.js - Version corrigée qui fonctionne
// Combinaison du système de données et de l'interface utilisateur

// Configuration et constantes
const CONFIG = {
  ANIMATION_DELAY: 100,
  PARTICLE_INTERVAL: 3000,
  RETRY_DELAY: 50,
  SCROLL_THRESHOLD: 150,
  THROTTLE_LIMIT: 100,
};

const CATEGORIES = {
  VEHICLES: "vehicles",
  WEAPONS: "weapons",
  BLACKMARKET: "blackmarket",
  SERVICES: "services",
};

// Configuration des contenus par catégorie
const CategoryConfig = {
  [CATEGORIES.VEHICLES]: {
    title: "🚗 MOTORS UNDERGROUND",
    subtitle: "Véhicules Premium - Transactions Discrètes",
    pageTitle: "Motors Underground - Véhicules Discrets",
    warning:
      "⚠️ <strong>RISQUE ÉLEVÉ:</strong> Ces véhicules peuvent être saisis et détruits par la police à tout moment.<br>⚠️ Full Custom 80000$.",
    colors: {
      primary: "#ff4444",
      shadow: "rgba(255, 68, 68, 0.3)",
      hover: "rgba(255, 68, 68, 0.2)",
      gradientStart: "#ff4444",
      gradientEnd: "#cc3333",
    },
    contact: {
      discord: "Gally_Vehicles",
      ingame: "Gally",
      location: "Zone industrielle",
      description: "Rendez-vous discrets uniquement",
    },
  },
  [CATEGORIES.WEAPONS]: {
    title: "🔫 SHADOW ARMORY",
    subtitle: "Arsenal Tactique - Commerce Confidentiel",
    pageTitle: "Shadow Armory - Arsenal Tactique",
    warning:
      "⚠️ <strong>DANGER EXTRÊME:</strong> Port d'armes illégal - Sanctions pénales lourdes en cas de contrôle. <br>⚠️ Armes modifiable sur demande 20,000$ par option.",
    colors: {
      primary: "#4488ff",
      shadow: "rgba(68, 136, 255, 0.3)",
      hover: "rgba(68, 136, 255, 0.2)",
      gradientStart: "#4488ff",
      gradientEnd: "#3366cc",
    },
    contact: {
      discord: "Shadow_Arms",
      ingame: "Shadow",
      location: "Entrepôt discret",
      description: "Localisation confidentielle",
    },
  },
  [CATEGORIES.BLACKMARKET]: {
    title: "💊 DARK MARKET",
    subtitle: "Marché Noir - Échanges Clandestins",
    pageTitle: "Dark Market - Marché Noir",
    warning:
      "⚠️ <strong>HAUTE SURVEILLANCE:</strong> Trafic de stupéfiants sous surveillance constante des autorités.",
    colors: {
      primary: "#aa44ff",
      shadow: "rgba(170, 68, 255, 0.3)",
      hover: "rgba(170, 68, 255, 0.2)",
      gradientStart: "#aa44ff",
      gradientEnd: "#8833cc",
    },
    contact: {
      discord: "Dark_Market",
      ingame: "DarkDealer",
      location: "Point de rendez-vous secret",
      description: "Contact par message privé",
    },
  },
  [CATEGORIES.SERVICES]: {
    title: "🏠 UNDERGROUND SERVICES",
    subtitle: "Services Illicites - Solutions Discrètes",
    pageTitle: "Underground Services - Services Illicites",
    warning:
      "⚠️ <strong>BLANCHIMENT:</strong> Opérations par tranches de 100K$ - Discrétion absolue requise.",
    colors: {
      primary: "#44ff88",
      shadow: "rgba(68, 255, 136, 0.3)",
      hover: "rgba(68, 255, 136, 0.2)",
      gradientStart: "#44ff88",
      gradientEnd: "#33cc66",
    },
    contact: {
      discord: "Underground_Services",
      ingame: "ServiceMan",
      location: "Bureau clandestin",
      description: "Adresse par message privé",
    },
  },
};

// Cache des éléments DOM
const ElementCache = {
  elements: new Map(),

  get(id) {
    if (!this.elements.has(id)) {
      const element = document.getElementById(id);
      if (element) {
        this.elements.set(id, element);
      }
    }
    return this.elements.get(id) || null;
  },

  clear() {
    this.elements.clear();
  },
};

// Utilitaires
const Utils = {
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  safeElementOperation(elementId, operation) {
    try {
      const element = ElementCache.get(elementId);
      if (!element) {
        console.warn(`Element ${elementId} not found`);
        return false;
      }
      return operation(element);
    } catch (error) {
      console.error(`Error with element ${elementId}:`, error);
      return false;
    }
  },
};

// Gestion de l'état de l'application
const AppState = {
  currentCategory: CATEGORIES.VEHICLES,
  isInitialized: false,
  prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches,

  setState(newState) {
    Object.assign(this, newState);
  },

  getCurrentCategory() {
    return this.currentCategory;
  },
};

// === GESTIONNAIRE DES DONNÉES ===
let siteData = null;

// Fonction pour charger les données JSON
async function loadSiteData() {
  try {
    const response = await fetch("data/data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    siteData = await response.json();
    return siteData;
  } catch (error) {
    console.error("❌ Erreur lors du chargement des données JSON:", error);
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
    ? `<img src="${vehicle.image}" alt="${vehicle.name}" loading="lazy">`
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

// === GESTIONNAIRE D'INTERFACE UTILISATEUR ===
const UIManager = {
  updateHeader(category) {
    const config = CategoryConfig[category];
    if (!config) return false;

    return Utils.safeElementOperation("main-title", (titleEl) => {
      Utils.safeElementOperation("main-subtitle", (subtitleEl) => {
        titleEl.innerHTML = config.title;
        subtitleEl.innerHTML = config.subtitle;
        document.title = config.pageTitle;

        const pageTitle = ElementCache.get("page-title");
        if (pageTitle) {
          pageTitle.textContent = config.pageTitle;
        }
      });
    });
  },

  updateWarning(category) {
    const config = CategoryConfig[category];
    if (!config) return false;

    return Utils.safeElementOperation("warning-message", (warningEl) => {
      warningEl.innerHTML = config.warning;
    });
  },

  updateColors(category) {
    const config = CategoryConfig[category];
    if (!config) return false;

    const root = document.documentElement;
    const { colors } = config;

    try {
      root.style.setProperty("--primary-color", colors.primary);
      root.style.setProperty("--primary-shadow", colors.shadow);
      root.style.setProperty("--primary-hover", colors.hover);
      root.style.setProperty("--primary-gradient-start", colors.gradientStart);
      root.style.setProperty("--primary-gradient-end", colors.gradientEnd);
      return true;
    } catch (error) {
      console.error("Error updating colors:", error);
      return false;
    }
  },

  updateFooterContacts(category) {
    const config = CategoryConfig[category];
    if (!config) return false;

    const { contact } = config;
    const updates = [
      ["discord-contact", contact.discord],
      ["ingame-contact", contact.ingame],
      ["location-contact", contact.location],
      ["contact-description", contact.description],
    ];

    return updates.every(([id, value]) =>
      Utils.safeElementOperation(id, (el) => {
        el.textContent = value;
      })
    );
  },

  updateAll(category) {
    this.updateHeader(category);
    this.updateWarning(category);
    this.updateColors(category);
    this.updateFooterContacts(category);
    AppState.setState({ currentCategory: category });
  },
};

// === GESTIONNAIRE DE NAVIGATION ===
const NavigationManager = {
  showMainTab(tabName, event) {
    if (event) {
      event.preventDefault();
    }

    // Mise à jour des contenus et boutons
    this.updateTabStates(
      ".main-tab-content",
      ".main-tab-button",
      tabName,
      event
    );

    // Activation du premier sous-onglet
    const targetContent = ElementCache.get(tabName);
    if (targetContent) {
      const firstSubTab = targetContent.querySelector(".sub-tab-button");
      const firstSubContent = targetContent.querySelector(".sub-tab-content");

      if (firstSubTab && firstSubContent) {
        this.resetSubTabs(targetContent);
        firstSubTab.classList.add("active");
        firstSubContent.classList.add("active");
      }
    }

    // Mise à jour de l'interface
    UIManager.updateAll(tabName);
  },

  showSubTab(tabName, event) {
    if (event) {
      event.preventDefault();
    }

    const activeMainTab = document.querySelector(".main-tab-content.active");
    if (!activeMainTab) return;

    this.updateTabStates(
      ".sub-tab-content",
      ".sub-tab-button",
      tabName,
      event,
      activeMainTab
    );
  },

  updateTabStates(
    contentSelector,
    buttonSelector,
    tabName,
    event,
    container = document
  ) {
    // Désactiver tous les contenus et boutons
    container.querySelectorAll(contentSelector).forEach((content) => {
      content.classList.remove("active");
    });

    container.querySelectorAll(buttonSelector).forEach((button) => {
      button.classList.remove("active");
    });

    // Activer le contenu ciblé
    const targetContent = ElementCache.get(tabName);
    if (targetContent) {
      targetContent.classList.add("active");
    }

    // Activer le bouton correspondant
    if (event && event.target) {
      event.target.classList.add("active");
    }
  },

  resetSubTabs(container) {
    container
      .querySelectorAll(".sub-tab-button")
      .forEach((btn) => btn.classList.remove("active"));
    container
      .querySelectorAll(".sub-tab-content")
      .forEach((content) => content.classList.remove("active"));
  },
};

// === GESTIONNAIRE DE CONTACT ===
const ContactManager = {
  getContactInfo(itemName) {
    const category = AppState.getCurrentCategory();
    const config = CategoryConfig[category];

    if (!config) {
      return `Contact pour: ${itemName}\n\n📱 Discord: Gally\n💬 En jeu: Gally`;
    }

    const { contact } = config;
    const categoryLabels = {
      [CATEGORIES.VEHICLES]: "vendeur",
      [CATEGORIES.WEAPONS]: "fournisseur d'armes",
      [CATEGORIES.BLACKMARKET]: "dealer",
      [CATEGORIES.SERVICES]: "fournisseur de services",
    };

    const label = categoryLabels[category] || "vendeur";

    return `Vous souhaitez contacter le ${label} pour: ${itemName}\n\n📱 Discord: ${contact.discord}\n💬 En jeu: ${contact.ingame}\n📍 ${contact.location} - ${contact.description}`;
  },

  createContactModal(itemName, contactInfo) {
    // Vérifier si un modal existe déjà
    const existingModal = document.querySelector(".contact-modal");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.className = "contact-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "modal-title");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
      <div class="modal-backdrop" aria-hidden="true"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modal-title">Contact pour: ${itemName}</h2>
          <button class="modal-close" aria-label="Fermer">&times;</button>
        </div>
        <div class="modal-body">
          <pre>${contactInfo}</pre>
        </div>
        <div class="modal-footer">
          <button class="modal-close-btn">Fermer</button>
        </div>
      </div>
    `;

    // Styles inline pour éviter les dépendances CSS
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      z-index: 10000; display: flex; align-items: center; justify-content: center;
    `;

    const backdrop = modal.querySelector(".modal-backdrop");
    backdrop.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
    `;

    const content = modal.querySelector(".modal-content");
    content.style.cssText = `
      background: #1a1a1a; color: #e0e0e0; padding: 20px; border-radius: 10px; 
      max-width: 500px; width: 90%; position: relative; border: 2px solid var(--primary-color);
    `;

    // Gestion des événements
    const closeModal = () => {
      modal.remove();
      document.body.style.overflow = "";
    };

    modal.querySelectorAll(".modal-close, .modal-close-btn").forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });

    backdrop.addEventListener("click", closeModal);

    // Gestion du clavier
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", handleKeyDown);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Ajouter au DOM et gérer le focus
    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    const firstButton = modal.querySelector(".modal-close");
    if (firstButton) {
      firstButton.focus();
    }
  },
};

// === FONCTION D'INITIALISATION DU CONTENU ===
async function initializeContent() {
  // Attendre que les données soient chargées
  if (!siteData) {
    await loadSiteData();
  }

  // Vérifier que les données sont disponibles
  if (!siteData) {
    console.error("❌ Impossible de charger les données");
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
}

// === INITIALISATION PRINCIPALE ===
class App {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Initialisation de l'interface par défaut
      UIManager.updateAll(CATEGORIES.VEHICLES);

      // Chargement et initialisation du contenu
      await initializeContent();

      // Configuration de l'API globale
      this.setupGlobalAPI();

      this.isInitialized = true;
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation:", error);
    }
  }

  setupGlobalAPI() {
    // API publique pour compatibilité avec l'ancien code
    window.showMainTab = (tabName, event) => {
      NavigationManager.showMainTab(tabName, event);
    };

    window.showSubTab = (tabName, event) => {
      NavigationManager.showSubTab(tabName, event);
    };

    window.contact = (itemName) => {
      const contactInfo = ContactManager.getContactInfo(itemName);
      ContactManager.createContactModal(itemName, contactInfo);
    };

    // API de debug
    window.AppDebug = {
      state: AppState,
      ui: UIManager,
      navigation: NavigationManager,
      data: siteData,
      reloadData: async () => {
        await loadSiteData();
        await initializeContent();
      },
    };
  }
}

// === POINT D'ENTRÉE PRINCIPAL ===
const app = new App();

// Initialisation
async function bootstrap() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => app.init());
  } else {
    await app.init();
  }
}

// Démarrage automatique
bootstrap().catch((error) => {
  console.error("💥 Erreur fatale au démarrage:", error);
});

// Exposition globale pour debugging
window.App = app;
