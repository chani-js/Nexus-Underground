// js/config/categories.js
// Configuration centralisée des catégories du site

export const CATEGORY_TYPES = {
  VEHICLES: 'vehicles',
  WEAPONS: 'weapons',
  BLACKMARKET: 'blackmarket',
  SERVICES: 'services'
};

export const CATEGORY_CONFIG = {
  [CATEGORY_TYPES.VEHICLES]: {
    title: "🚗 MOTORS UNDERGROUND",
    subtitle: "Véhicules Premium - Transactions Discrètes",
    pageTitle: "Motors Underground - Véhicules Discrets",
    warning: "⚠️ <strong>RISQUE ÉLEVÉ:</strong> Ces véhicules peuvent être saisis et détruits par la police à tout moment.<br>⚠️ Full Custom 80000$.",
    colors: {
      primary: "#ff4444",
      shadow: "rgba(255, 68, 68, 0.3)",
      hover: "rgba(255, 68, 68, 0.2)",
      gradientStart: "#ff4444",
      gradientEnd: "#cc3333"
    },
    contact: {
      discord: "Gally_Vehicles",
      ingame: "Gally",
      location: "Zone industrielle",
      description: "Rendez-vous discrets uniquement"
    }
  },
  
  [CATEGORY_TYPES.WEAPONS]: {
    title: "🔫 SHADOW ARMORY",
    subtitle: "Arsenal Tactique - Commerce Confidentiel",
    pageTitle: "Shadow Armory - Arsenal Tactique",
    warning: "⚠️ <strong>DANGER EXTRÊME:</strong> Port d'armes illégal - Sanctions pénales lourdes en cas de contrôle. <br>⚠️ Armes modifiable sur demande 20,000$ par option.",
    colors: {
      primary: "#4488ff",
      shadow: "rgba(68, 136, 255, 0.3)",
      hover: "rgba(68, 136, 255, 0.2)",
      gradientStart: "#4488ff",
      gradientEnd: "#3366cc"
    },
    contact: {
      discord: "Shadow_Arms",
      ingame: "Shadow",
      location: "Entrepôt discret",
      description: "Localisation confidentielle"
    }
  },
  
  [CATEGORY_TYPES.BLACKMARKET]: {
    title: "💊 DARK MARKET",
    subtitle: "Marché Noir - Échanges Clandestins",
    pageTitle: "Dark Market - Marché Noir",
    warning: "⚠️ <strong>HAUTE SURVEILLANCE:</strong> Trafic de stupéfiants sous surveillance constante des autorités.",
    colors: {
      primary: "#aa44ff",
      shadow: "rgba(170, 68, 255, 0.3)",
      hover: "rgba(170, 68, 255, 0.2)",
      gradientStart: "#aa44ff",
      gradientEnd: "#8833cc"
    },
    contact: {
      discord: "Dark_Market",
      ingame: "DarkDealer",
      location: "Point de rendez-vous secret",
      description: "Contact par message privé"
    }
  },
  
  [CATEGORY_TYPES.SERVICES]: {
    title: "🏠 UNDERGROUND SERVICES",
    subtitle: "Services Illicites - Solutions Discrètes",
    pageTitle: "Underground Services - Services Illicites",
    warning: "⚠️ <strong>BLANCHIMENT:</strong> Opérations par tranches de 100K$ - Discrétion absolue requise.",
    colors: {
      primary: "#44ff88",
      shadow: "rgba(68, 255, 136, 0.3)",
      hover: "rgba(68, 255, 136, 0.2)",
      gradientStart: "#44ff88",
      gradientEnd: "#33cc66"
    },
    contact: {
      discord: "Underground_Services",
      ingame: "ServiceMan",
      location: "Bureau clandestin",
      description: "Adresse par message privé"
    }
  }
};

export const APP_CONFIG = {
  ANIMATION_DELAY: 100,
  PARTICLE_INTERVAL: 3000,
  RETRY_DELAY: 50,
  SCROLL_THRESHOLD: 150,
  THROTTLE_LIMIT: 100
};