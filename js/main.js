// js/main.js - Version complète corrigée
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

// Fonction pour formater les prix avec la devise
function formatPrice(price) {
  if (!price) return "Prix sur demande";

  // Si le prix contient déjà une devise, le retourner tel quel
  if (
    typeof price === "string" &&
    (price.includes("$") || price.includes("€"))
  ) {
    return price;
  }

  // Si c'est un nombre, le formater avec la devise
  if (typeof price === "number") {
    return price.toLocaleString() + "$";
  }

  // Si c'est une chaîne de nombres, l'extraire et formater
  const numericPrice = price.toString().replace(/[^0-9]/g, "");
  if (numericPrice) {
    return parseInt(numericPrice).toLocaleString() + "$";
  }

  return price;
}

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
      blackmarket: {
        drugs: [],
        contraband: [],
        documents: [],
        vagos: [],
        catalyst: [],
      },
      services: { laundering: [] },
    };
    return siteData;
  }
}

// Fonction utilitaire pour construire le chemin d'image
function buildImagePath(imagePath) {
  if (!imagePath) return "";

  // Si le chemin commence déjà par "assets/" ou "http", l'utiliser tel quel
  if (imagePath.startsWith("assets/") || imagePath.startsWith("http")) {
    return imagePath;
  }

  // Sinon, ajouter le préfixe assets/img/
  return `assets/img/${imagePath}`;
}

// Fonction pour créer l'élément image
function createImageElement(imagePath, altText) {
  if (!imagePath) return '<div class="no-image">Image non disponible</div>';

  const fullPath = buildImagePath(imagePath);
  return `<img src="${fullPath}" alt="${altText}" loading="lazy" onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\\'image-error\\'>Image manquante</div>';">`;
}

// Fonction pour générer les étoiles - CORRIGÉE
function generateStars(rating) {
  // Vérification et normalisation de la valeur
  const normalizedRating = Math.max(0, Math.min(5, parseInt(rating) || 0));
  return "★".repeat(normalizedRating) + "☆".repeat(5 - normalizedRating);
}

// Fonction pour générer une carte de véhicule
function generateVehicleCard(vehicle) {
  if (!vehicle || !vehicle.name) {
    console.warn("Vehicle data is invalid:", vehicle);
    return "";
  }

  const imageContent = createImageElement(vehicle.image, vehicle.name);

  return `
    <div class="car-card">
      <h3 class="car-name">${vehicle.name}</h3>
      <div class="car-image">${imageContent}</div>
      <div class="car-details">
        <div class="detail-item"><span class="detail-label">Vitesse:</span> ${generateStars(
          vehicle.stats?.vitesse || 0
        )}</div>
        <div class="detail-item"><span class="detail-label">Accélération:</span> ${generateStars(
          vehicle.stats?.acceleration || 0
        )}</div>
        <div class="detail-item"><span class="detail-label">Freinage:</span> ${generateStars(
          vehicle.stats?.freinage || 0
        )}</div>
        <div class="detail-item"><span class="detail-label">Maniabilité:</span> ${generateStars(
          vehicle.stats?.maniabilite || 0
        )}</div>
      </div>
      <div class="price">💰 ${formatPrice(vehicle.price)}</div>
      <button class="contact-btn" onclick="contact('${
        vehicle.name
      }')">Contacter pour ce véhicule</button>
    </div>
  `;
}

// Fonction pour générer une carte d'arme
function generateWeaponCard(weapon) {
  if (!weapon || !weapon.name) {
    console.warn("Weapon data is invalid:", weapon);
    return "";
  }

  const imageContent = createImageElement(weapon.image, weapon.name);

  const statsKeys = Object.keys(weapon.stats || {});
  const statsHTML = statsKeys
    .map((key) => {
      let label = key.charAt(0).toUpperCase() + key.slice(1);
      if (key === "degats") label = "Dégâts";
      if (key === "precision") label = "Précision";
      if (key === "portee") label = "Portée";
      if (key === "compo") label = "Dégâts";
      if (key === "skin") label = "Précision";

      const value = weapon.stats[key];
      const displayValue =
        typeof value === "number" && value >= 0 && value <= 5
          ? generateStars(value)
          : value || "N/A";

      return `<div class="detail-item"><span class="detail-label">${label}:</span> ${displayValue}</div>`;
    })
    .join("");

  return `
    <div class="car-card">
      <h3 class="car-name">${weapon.name}</h3>
      <div class="car-image">${imageContent}</div>
      <div class="car-details">
        ${statsHTML}
      </div>
      <div class="price">💰 ${formatPrice(weapon.price)}</div>
      <button class="contact-btn" onclick="contact('${
        weapon.name
      }')">Contacter pour cette arme</button>
    </div>
  `;
}

// Fonction pour générer une carte de drogue (sans prix ni contact)
function generateDrugCard(drug) {
  if (!drug || !drug.name) {
    console.warn("Drug data is invalid:", drug);
    return "";
  }

  const imageContent = createImageElement(drug.image, drug.name);

  const statsKeys = Object.keys(drug.stats || {});
  const statsHTML = statsKeys
    .map((key) => {
      let label = key.charAt(0).toUpperCase() + key.slice(1);
      if (key === "qualite") label = "Qualité";
      if (key === "purete") label = "Pureté";

      const value = drug.stats[key];
      const displayValue =
        typeof value === "number" && value >= 0 && value <= 5
          ? generateStars(value)
          : value || "N/A";

      return `<div class="detail-item"><span class="detail-label">${label}:</span> ${displayValue}</div>`;
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
  if (!item || !item.name) {
    console.warn("Blackmarket item data is invalid:", item);
    return "";
  }

  const imageContent = createImageElement(item.image, item.name);

  const statsKeys = Object.keys(item.stats || {});
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

      const value = item.stats[key];
      const displayValue =
        typeof value === "number" && value >= 0 && value <= 5
          ? generateStars(value)
          : value || "N/A";

      return `<div class="detail-item"><span class="detail-label">${label}:</span> ${displayValue}</div>`;
    })
    .join("");

  return `
    <div class="car-card">
      <h3 class="car-name">${item.name}</h3>
      <div class="car-image">${imageContent}</div>
      <div class="car-details">
        ${statsHTML}
      </div>
     <div class="price">💰 ${formatPrice(item.price)}</div>
      <button class="contact-btn" onclick="contact('${
        item.name
      }')">Contacter pour ce produit</button>
    </div>
  `;
}

// Fonction pour générer une carte de service
function generateServiceCard(service) {
  if (!service || !service.name) {
    console.warn("Service data is invalid:", service);
    return "";
  }

  const imageContent = createImageElement(service.image, service.name);

  const statsKeys = Object.keys(service.stats || {});
  const statsHTML = statsKeys
    .map((key) => {
      let label = key.charAt(0).toUpperCase() + key.slice(1);
      if (key === "capaciteMax") label = "Capacité max";
      if (key === "capaciteMin") label = "Capacité min";
      if (key === "delai") label = "Délai";
      if (key === "discretion") label = "Discrétion";

      const value = service.stats[key];
      const displayValue =
        typeof value === "number" && value >= 0 && value <= 5
          ? generateStars(value)
          : value || "N/A";

      return `<div class="detail-item"><span class="detail-label">${label}:</span> ${displayValue}</div>`;
    })
    .join("");

  return `
    <div class="car-card">
      <h3 class="car-name">${service.name}</h3>
      <div class="car-image">${imageContent}</div>
      <div class="car-details">
        ${statsHTML}
      </div>
      <div class="price">💰 ${formatPrice(service.price)}</div>
      <button class="contact-btn" onclick="contact('${
        service.name
      }')">Contacter pour ce service</button>
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

  try {
    // Véhicules
    if (siteData.vehicles) {
      Object.keys(siteData.vehicles).forEach((category) => {
        const container = document.querySelector(`#${category} .cars-grid`);
        if (container && Array.isArray(siteData.vehicles[category])) {
          container.innerHTML = siteData.vehicles[category]
            .map(generateVehicleCard)
            .filter((card) => card) // Enlever les cartes vides
            .join("");
        }
      });
    }

    // Armes
    if (siteData.weapons) {
      Object.keys(siteData.weapons).forEach((category) => {
        const container = document.querySelector(`#${category} .cars-grid`);
        if (container && Array.isArray(siteData.weapons[category])) {
          container.innerHTML = siteData.weapons[category]
            .map(generateWeaponCard)
            .filter((card) => card)
            .join("");
        }
      });
    }

    // Marché noir
    if (siteData.blackmarket) {
      Object.keys(siteData.blackmarket).forEach((category) => {
        const container = document.querySelector(`#${category} .cars-grid`);
        if (container && Array.isArray(siteData.blackmarket[category])) {
          // Traitement spécial pour les drogues
          if (category === "drugs") {
            container.innerHTML = siteData.blackmarket[category]
              .map(generateDrugCard)
              .filter((card) => card)
              .join("");
          } else {
            container.innerHTML = siteData.blackmarket[category]
              .map(generateBlackmarketCard)
              .filter((card) => card)
              .join("");
          }
        }
      });
    }

    // Services
    if (siteData.services) {
      Object.keys(siteData.services).forEach((category) => {
        const container = document.querySelector(`#${category} .cars-grid`);
        if (container && Array.isArray(siteData.services[category])) {
          container.innerHTML = siteData.services[category]
            .map(generateServiceCard)
            .filter((card) => card)
            .join("");
        }
      });
    }

  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation du contenu:", error);
  }
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

      // Ajouter les styles pour les erreurs d'images
      this.addImageErrorStyles();

      this.isInitialized = true;
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation:", error);
    }
  }

  addImageErrorStyles() {
    if (!document.getElementById("image-error-styles")) {
      const style = document.createElement("style");
      style.id = "image-error-styles";
      style.textContent = `
        .no-image, .image-error {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 150px;
          background: rgba(40, 40, 40, 0.8);
          color: #888;
          font-size: 0.9em;
          text-align: center;
          border-radius: 5px;
          border: 1px dashed #555;
        }

        .car-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }
      `;
      document.head.appendChild(style);
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
