// script.js - Version optimisée et modulaire

// Configuration et constantes
const CONFIG = {
  ANIMATION_DELAY: 100,
  PARTICLE_INTERVAL: 3000,
  RETRY_DELAY: 50,
  SCROLL_THRESHOLD: 150,
  THROTTLE_LIMIT: 100
};

const CATEGORIES = {
  VEHICLES: 'vehicles',
  WEAPONS: 'weapons',
  BLACKMARKET: 'blackmarket',
  SERVICES: 'services'
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
  }
};

// Utilitaires
const Utils = {
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
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
  
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
};

// Gestion de l'état de l'application
const AppState = {
  currentCategory: CATEGORIES.VEHICLES,
  isInitialized: false,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  
  setState(newState) {
    Object.assign(this, newState);
  },
  
  getCurrentCategory() {
    return this.currentCategory;
  }
};

// Configuration des contenus par catégorie
const CategoryConfig = {
  [CATEGORIES.VEHICLES]: {
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
  [CATEGORIES.WEAPONS]: {
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
  [CATEGORIES.BLACKMARKET]: {
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
  [CATEGORIES.SERVICES]: {
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

// Gestionnaire d'interface utilisateur
const UIManager = {
  updateHeader(category) {
    const config = CategoryConfig[category];
    if (!config) return false;
    
    return Utils.safeElementOperation('main-title', (titleEl) => {
      Utils.safeElementOperation('main-subtitle', (subtitleEl) => {
        titleEl.innerHTML = config.title;
        subtitleEl.innerHTML = config.subtitle;
        document.title = config.pageTitle;
        
        const pageTitle = ElementCache.get('page-title');
        if (pageTitle) {
          pageTitle.textContent = config.pageTitle;
        }
      });
    });
  },
  
  updateWarning(category) {
    const config = CategoryConfig[category];
    if (!config) return false;
    
    return Utils.safeElementOperation('warning-message', (warningEl) => {
      warningEl.innerHTML = config.warning;
    });
  },
  
  updateColors(category) {
    const config = CategoryConfig[category];
    if (!config) return false;
    
    const root = document.documentElement;
    const { colors } = config;
    
    try {
      root.style.setProperty('--primary-color', colors.primary);
      root.style.setProperty('--primary-shadow', colors.shadow);
      root.style.setProperty('--primary-hover', colors.hover);
      root.style.setProperty('--primary-gradient-start', colors.gradientStart);
      root.style.setProperty('--primary-gradient-end', colors.gradientEnd);
      return true;
    } catch (error) {
      console.error('Error updating colors:', error);
      return false;
    }
  },
  
  updateFooterContacts(category) {
    const config = CategoryConfig[category];
    if (!config) return false;
    
    const { contact } = config;
    const updates = [
      ['discord-contact', contact.discord],
      ['ingame-contact', contact.ingame],
      ['location-contact', contact.location],
      ['contact-description', contact.description]
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
  }
};

// Gestionnaire de navigation
const NavigationManager = {
  showMainTab(tabName, event) {
    if (event) {
      event.preventDefault();
    }
    
    // Mise à jour des contenus et boutons
    this.updateTabStates('.main-tab-content', '.main-tab-button', tabName, event);
    
    // Activation du premier sous-onglet
    const targetContent = ElementCache.get(tabName);
    if (targetContent) {
      const firstSubTab = targetContent.querySelector('.sub-tab-button');
      const firstSubContent = targetContent.querySelector('.sub-tab-content');
      
      if (firstSubTab && firstSubContent) {
        this.resetSubTabs(targetContent);
        firstSubTab.classList.add('active');
        firstSubContent.classList.add('active');
      }
    }
    
    // Mise à jour de l'interface
    UIManager.updateAll(tabName);
  },
  
  showSubTab(tabName, event) {
    if (event) {
      event.preventDefault();
    }
    
    const activeMainTab = document.querySelector('.main-tab-content.active');
    if (!activeMainTab) return;
    
    this.updateTabStates(
      '.sub-tab-content', 
      '.sub-tab-button', 
      tabName, 
      event,
      activeMainTab
    );
  },
  
  updateTabStates(contentSelector, buttonSelector, tabName, event, container = document) {
    // Désactiver tous les contenus et boutons
    container.querySelectorAll(contentSelector).forEach(content => {
      content.classList.remove('active');
    });
    
    container.querySelectorAll(buttonSelector).forEach(button => {
      button.classList.remove('active');
    });
    
    // Activer le contenu ciblé
    const targetContent = ElementCache.get(tabName);
    if (targetContent) {
      targetContent.classList.add('active');
    }
    
    // Activer le bouton correspondant
    if (event && event.target) {
      event.target.classList.add('active');
    }
  },
  
  resetSubTabs(container) {
    container.querySelectorAll('.sub-tab-button').forEach(btn => 
      btn.classList.remove('active')
    );
    container.querySelectorAll('.sub-tab-content').forEach(content => 
      content.classList.remove('active')
    );
  }
};

// Système de contact amélioré
const ContactManager = {
  createContactModal(itemName, contactInfo) {
    // Vérifier si un modal existe déjà
    const existingModal = document.querySelector('.contact-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'contact-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.setAttribute('aria-modal', 'true');
    
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
    
    const backdrop = modal.querySelector('.modal-backdrop');
    backdrop.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
    `;
    
    const content = modal.querySelector('.modal-content');
    content.style.cssText = `
      background: #1a1a1a; color: #e0e0e0; padding: 20px; border-radius: 10px; 
      max-width: 500px; width: 90%; position: relative; border: 2px solid var(--primary-color);
    `;
    
    // Gestion des événements
    const closeModal = () => {
      modal.remove();
      document.body.style.overflow = '';
    };
    
    modal.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });
    
    backdrop.addEventListener('click', closeModal);
    
    // Gestion du clavier
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Ajouter au DOM et gérer le focus
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    const firstButton = modal.querySelector('.modal-close');
    if (firstButton) {
      firstButton.focus();
    }
  },
  
  getContactInfo(itemName) {
    const category = AppState.getCurrentCategory();
    const config = CategoryConfig[category];
    
    if (!config) {
      return `Contact pour: ${itemName}\n\n📱 Discord: Gally\n💬 En jeu: Gally`;
    }
    
    const { contact } = config;
    const categoryLabels = {
      [CATEGORIES.VEHICLES]: 'vendeur',
      [CATEGORIES.WEAPONS]: "fournisseur d'armes",
      [CATEGORIES.BLACKMARKET]: 'dealer',
      [CATEGORIES.SERVICES]: 'fournisseur de services'
    };
    
    const label = categoryLabels[category] || 'vendeur';
    
    return `Vous souhaitez contacter le ${label} pour: ${itemName}\n\n📱 Discord: ${contact.discord}\n💬 En jeu: ${contact.ingame}\n📍 ${contact.location} - ${contact.description}`;
  }
};

// Système d'animation optimisé
const AnimationManager = {
  particlePool: [],
  maxParticles: 50,
  
  createParticle() {
    if (AppState.prefersReducedMotion) return;
    
    let particle = this.particlePool.pop();
    if (!particle) {
      particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed; width: 2px; height: 2px; 
        pointer-events: none; border-radius: 50%;
      `;
    }
    
    particle.style.background = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-color');
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.top = '-5px';
    particle.style.opacity = '0.5';
    
    document.body.appendChild(particle);
    
    this.animateParticle(particle);
  },
  
  animateParticle(particle) {
    let position = -5;
    const speed = Math.random() * 2 + 1;
    
    const animate = () => {
      position += speed;
      particle.style.top = position + 'px';
      
      if (position > window.innerHeight) {
        particle.remove();
        if (this.particlePool.length < this.maxParticles) {
          this.particlePool.push(particle);
        }
      } else {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  },
  
  animateCardsOnScroll: Utils.throttle(function() {
    if (AppState.prefersReducedMotion) return;
    
    const cards = document.querySelectorAll('.car-card');
    const windowHeight = window.innerHeight;
    
    cards.forEach(card => {
      const cardTop = card.getBoundingClientRect().top;
      
      if (cardTop < windowHeight - CONFIG.SCROLL_THRESHOLD) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }
    });
  }, CONFIG.THROTTLE_LIMIT),
  
  applyCardAnimations() {
    if (AppState.prefersReducedMotion) return;
    
    const cards = document.querySelectorAll('.car-card');
    cards.forEach(card => {
      if (!card.dataset.animated) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.dataset.animated = 'true';
      }
    });
  }
};

// Gestionnaire d'événements
const EventManager = {
  init() {
    // Event delegation pour les onglets
    document.addEventListener('click', this.handleTabClick.bind(this));
    
    // Scroll avec throttling
    window.addEventListener('scroll', AnimationManager.animateCardsOnScroll);
    
    // Gestion des préférences d'animation
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      AppState.setState({ prefersReducedMotion: e.matches });
    });
    
    // Particules à intervalles
    setInterval(() => AnimationManager.createParticle(), CONFIG.PARTICLE_INTERVAL);
  },
  
  handleTabClick(event) {
    if (event.target.matches('.main-tab-button')) {
      const tabName = event.target.dataset.tab || 
        event.target.getAttribute('onclick')?.match(/showMainTab\('([^']+)'\)/)?.[1];
      
      if (tabName) {
        NavigationManager.showMainTab(tabName, event);
      }
    } else if (event.target.matches('.sub-tab-button')) {
      const tabName = event.target.dataset.tab || 
        event.target.getAttribute('onclick')?.match(/showSubTab\('([^']+)'\)/)?.[1];
      
      if (tabName) {
        NavigationManager.showSubTab(tabName, event);
      }
    }
  }
};

// Initialisateur principal
const AppInitializer = {
  init() {
    if (AppState.isInitialized) return;
    
    // Initialisation immédiate
    UIManager.updateAll(CATEGORIES.VEHICLES);
    
    // Attendre le contenu généré
    setTimeout(() => {
      AnimationManager.applyCardAnimations();
      AnimationManager.animateCardsOnScroll();
    }, CONFIG.ANIMATION_DELAY);
    
    // Initialiser les événements
    EventManager.init();
    
    AppState.setState({ isInitialized: true });
  },
  
  retry() {
    const mainTitle = ElementCache.get('main-title');
    const mainSubtitle = ElementCache.get('main-subtitle');
    
    if (mainTitle && mainSubtitle) {
      this.init();
    } else {
      setTimeout(() => this.retry(), CONFIG.RETRY_DELAY);
    }
  }
};

// API publique (compatibilité avec l'ancien code)
window.showMainTab = (tabName, event) => NavigationManager.showMainTab(tabName, event);
window.showSubTab = (tabName, event) => NavigationManager.showSubTab(tabName, event);
window.showTab = (tabName, event) => NavigationManager.showSubTab(tabName, event);

window.contact = (itemName) => {
  const contactInfo = ContactManager.getContactInfo(itemName);
  
  // Utiliser modal au lieu d'alert pour une meilleure UX
  if (typeof ContactManager.createContactModal === 'function') {
    ContactManager.createContactModal(itemName, contactInfo);
  } else {
    alert(contactInfo); // Fallback
  }
};

// Initialisation
(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AppInitializer.retry());
  } else {
    AppInitializer.retry();
  }
})();

// Export pour debugging
window.AppDebug = {
  state: AppState,
  ui: UIManager,
  navigation: NavigationManager,
  animations: AnimationManager,
  clearCache: () => ElementCache.clear()
};