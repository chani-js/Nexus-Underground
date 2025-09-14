// Script de conversion pour optimiser le JSON
// Convertit l'ancien format vers le nouveau format optimisé

class DataConverter {
  constructor() {
    this.idCounters = {
      vehicles: { mc: 1, mafia: 1, cartel: 1, gang: 1 },
      weapons: { pistols: 1, rifles: 1, explosives: 1 },
      blackmarket: { drugs: 1, contraband: 1, documents: 1, vagos: 1, catalyst: 1 },
      services: { laundering: 1 }
    };
  }

  /**
   * Convertit l'ancien JSON vers le nouveau format
   */
  convertData(oldData) {
    const newData = {
      config: {
        baseImageUrl: "assets/img/",
        currency: "USD",
        version: "1.0.0"
      },
      vehicles: {},
      weapons: {},
      blackmarket: {},
      services: {}
    };

    // Conversion des véhicules
    Object.keys(oldData.vehicles).forEach(category => {
      newData.vehicles[category] = oldData.vehicles[category].map(vehicle => 
        this.convertVehicle(vehicle, category)
      );
    });

    // Conversion des armes
    Object.keys(oldData.weapons).forEach(category => {
      newData.weapons[category] = oldData.weapons[category].map(weapon => 
        this.convertWeapon(weapon, category)
      );
    });

    // Conversion du marché noir
    Object.keys(oldData.blackmarket).forEach(category => {
      newData.blackmarket[category] = oldData.blackmarket[category].map(item => 
        this.convertBlackmarketItem(item, category)
      );
    });

    // Conversion des services
    Object.keys(oldData.services).forEach(category => {
      newData.services[category] = oldData.services[category].map(service => 
        this.convertService(service, category)
      );
    });

    return newData;
  }

  /**
   * Convertit un véhicule
   */
  convertVehicle(vehicle, category) {
    return {
      id: this.generateId('vehicles', category),
      name: vehicle.name,
      image: this.cleanImagePath(vehicle.image),
      stats: {
        vitesse: vehicle.stats.vitesse,
        acceleration: vehicle.stats.acceleration,
        freinage: vehicle.stats.freinage,
        maniabilite: vehicle.stats.maniabilite
      },
      price: this.convertPrice(vehicle.price),
      category: this.getVehicleCategory(vehicle.name),
      availability: "available"
    };
  }

  /**
   * Convertit une arme
   */
  convertWeapon(weapon, category) {
    const converted = {
      id: this.generateId('weapons', category),
      name: weapon.name,
      image: this.cleanImagePath(weapon.image),
      stats: this.normalizeWeaponStats(weapon.stats),
      price: this.convertPrice(weapon.price),
      category: this.getWeaponCategory(weapon.name, category),
      availability: "available"
    };

    return converted;
  }

  /**
   * Convertit un item du marché noir
   */
  convertBlackmarketItem(item, category) {
    const converted = {
      id: this.generateId('blackmarket', category),
      name: item.name,
      image: this.cleanImagePath(item.image),
      stats: this.normalizeBlackmarketStats(item.stats, category),
      category: this.getBlackmarketCategory(item.name, category),
      availability: "available"
    };

    // Ajouter le prix seulement s'il existe
    if (item.price) {
      converted.price = this.convertPrice(item.price);
    }

    return converted;
  }

  /**
   * Convertit un service
   */
  convertService(service, category) {
    return {
      id: this.generateId('services', category),
      name: service.name,
      image: this.cleanImagePath(service.image),
      stats: this.normalizeServiceStats(service.stats),
      price_percentage: this.convertPercentage(service.price),
      category: this.getServiceCategory(service.name),
      availability: "available"
    };
  }

  /**
   * Génère un ID unique
   */
  generateId(section, category) {
    const prefix = section === 'weapons' && category === 'pistols' ? 'pistol' :
                  section === 'weapons' && category === 'rifles' ? 'rifle' :
                  section === 'weapons' && category === 'explosives' ? 'explosive' :
                  section === 'blackmarket' && category === 'drugs' ? 'drug' :
                  section === 'blackmarket' && category === 'contraband' ? 'contraband' :
                  section === 'blackmarket' && category === 'documents' ? 'document' :
                  section === 'services' && category === 'laundering' ? 'service' :
                  category;

    const id = `${prefix}_${String(this.idCounters[section][category]).padStart(3, '0')}`;
    this.idCounters[section][category]++;
    return id;
  }

  /**
   * Nettoie le chemin de l'image
   */
  cleanImagePath(imagePath) {
    return imagePath.replace('assets/img/', '');
  }

  /**
   * Convertit le prix de string vers number
   */
  convertPrice(priceString) {
    if (!priceString) return null;
    return parseInt(priceString.replace(/[^0-9]/g, ''));
  }

  /**
   * Convertit le pourcentage
   */
  convertPercentage(percentString) {
    if (!percentString) return null;
    return parseInt(percentString.replace('%', ''));
  }

  /**
   * Normalise les stats des armes
   */
  normalizeWeaponStats(stats) {
    const normalized = {};
    
    Object.keys(stats).forEach(key => {
      const value = stats[key];
      
      // Normaliser les clés
      let normalizedKey = key;
      if (key === 'compo') normalizedKey = 'degats';
      if (key === 'skin') normalizedKey = 'precision';
      
      // Normaliser les valeurs
      if (key === 'quantite') {
        normalized[normalizedKey] = this.extractNumber(value);
      } else {
        normalized[normalizedKey] = value;
      }
    });

    return normalized;
  }

  /**
   * Normalise les stats du marché noir
   */
  normalizeBlackmarketStats(stats, category) {
    const normalized = {};
    
    Object.keys(stats).forEach(key => {
      let normalizedKey = key.toLowerCase();
      let value = stats[key];
      
      // Normaliser certaines valeurs
      if (key === 'Format') {
        normalizedKey = 'format';
        value = value.toLowerCase();
      }
      if (key === 'Description') {
        normalizedKey = 'description';
      }
      if (key === 'degre' && value) {
        value = this.extractNumber(value);
      }
      if (key === 'quantite') {
        value = this.extractNumber(value);
      }
      
      normalized[normalizedKey] = value;
    });

    return normalized;
  }

  /**
   * Normalise les stats des services
   */
  normalizeServiceStats(stats) {
    const normalized = {};
    
    Object.keys(stats).forEach(key => {
      let normalizedKey = key;
      let value = stats[key];
      
      // Convertir les capacités en nombres
      if (key === 'capaciteMax' || key === 'capaciteMin') {
        normalizedKey = key.replace('capacite', 'capacite_').toLowerCase();
        value = this.convertPrice(value);
      }
      
      normalized[normalizedKey] = value;
    });

    return normalized;
  }

  /**
   * Extrait un nombre d'une chaîne
   */
  extractNumber(str) {
    if (typeof str === 'number') return str;
    if (!str) return null;
    const match = str.toString().match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  /**
   * Détermine la catégorie d'un véhicule
   */
  getVehicleCategory(name) {
    const lowercaseName = name.toLowerCase();
    
    if (lowercaseName.includes('harley') || lowercaseName.includes('softail') || 
        lowercaseName.includes('dyna') || lowercaseName.includes('sanchez') ||
        lowercaseName.includes('cliffhanger')) {
      return 'motorcycle';
    }
    if (lowercaseName.includes('cognoscenti') || lowercaseName.includes('goldwing')) {
      return 'luxury';
    }
    if (lowercaseName.includes('tailgater') || lowercaseName.includes('kuruma')) {
      return 'sedan';
    }
    if (lowercaseName.includes('dubsta')) {
      return 'suv';
    }
    if (lowercaseName.includes('windsor')) {
      return 'coupe';
    }
    if (lowercaseName.includes('tornado') || lowercaseName.includes('chino')) {
      return 'lowrider';
    }
    if (lowercaseName.includes('dominator') || lowercaseName.includes('buccaneer') || 
        lowercaseName.includes('faction')) {
      return 'muscle';
    }
    if (lowercaseName.includes('outlaw')) {
      return 'truck';
    }
    if (lowercaseName.includes('toros')) {
      return 'sports';
    }
    if (lowercaseName.includes('kamacho')) {
      return 'offroad';
    }
    if (lowercaseName.includes('manana')) {
      return 'compact';
    }
    
    return 'vehicle';
  }

  /**
   * Détermine la catégorie d'une arme
   */
  getWeaponCategory(name, section) {
    const lowercaseName = name.toLowerCase();
    
    if (section === 'explosives') {
      if (lowercaseName.includes('grenade')) return 'grenade';
      if (lowercaseName.includes('c4') || lowercaseName.includes('bomb')) return 'explosive';
      if (lowercaseName.includes('molotov')) return 'incendiary';
    }
    
    if (section === 'rifles') {
      if (lowercaseName.includes('sniper')) return 'sniper';
      if (lowercaseName.includes('smg')) return 'smg';
      if (lowercaseName.includes('assault')) return 'assault';
      if (lowercaseName.includes('shotgun')) return 'shotgun';
    }
    
    if (section === 'pistols') {
      if (lowercaseName.includes('revolver')) return 'revolver';
      if (lowercaseName.includes('shotgun')) return 'shotgun';
      if (lowercaseName.includes('flare') || lowercaseName.includes('stun')) return 'special';
      return 'pistol';
    }
    
    return section.slice(0, -1); // Enlève le 's' final
  }

  /**
   * Détermine la catégorie d'un item du marché noir
   */
  getBlackmarketCategory(name, section) {
    if (section === 'drugs') {
      const lowercaseName = name.toLowerCase();
      if (lowercaseName.includes('weed') || lowercaseName.includes('beuh')) return 'cannabis';
      if (lowercaseName.includes('coke') || lowercaseName.includes('meth') || 
          lowercaseName.includes('blue')) return 'stimulant';
      if (lowercaseName.includes('lsd') || lowercaseName.includes('champi')) return 'hallucinogen';
      if (lowercaseName.includes('krokodil')) return 'opiate';
      return 'special';
    }
    
    if (section === 'contraband') {
      if (name.toLowerCase().includes('cagoule')) return 'disguise';
      return 'tool';
    }
    
    if (section === 'documents') {
      if (name.toLowerCase().includes('tracker') || name.toLowerCase().includes('gps')) return 'tracking';
      return 'electronics';
    }
    
    if (section === 'vagos') {
      if (name.toLowerCase().includes('gilet')) return 'protection';
      if (name.toLowerCase().includes('chaise')) return 'furniture';
      return 'tool';
    }
    
    if (section === 'catalyst') {
      if (name.toLowerCase().includes('eau de vie')) return 'spirit';
      return 'equipment';
    }
    
    return section;
  }

  /**
   * Détermine la catégorie d'un service
   */
  getServiceCategory(name) {
    if (name.toLowerCase().includes('aether')) return 'money_laundering';
    return 'service';
  }
}

// Fonction principale d'utilisation
async function convertDataFile(inputFile = 'data.json', outputFile = 'data-optimized.json') {
  try {
    const converter = new DataConverter();
    
    // Lire le fichier original
    const oldData = JSON.parse(await fetch(inputFile).then(r => r.text()));
    
    // Convertir
    const newData = converter.convertData(oldData);
    
    // Sauvegarder (ou afficher)
    console.log('Nouveau format:', JSON.stringify(newData, null, 2));
    
    return newData;
  } catch (error) {
    console.error('Erreur lors de la conversion:', error);
    return null;
  }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataConverter, convertDataFile };
}

// Utilisation directe en browser
if (typeof window !== 'undefined') {
  window.DataConverter = DataConverter;
  window.convertDataFile = convertDataFile;
}