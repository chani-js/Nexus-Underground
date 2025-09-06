// js/utils/dom-utils.js
// Utilitaires pour manipulation DOM et optimisations

/**
 * Cache intelligent pour les éléments DOM
 */
export class ElementCache {
  constructor() {
    this.elements = new Map();
  }
  
  get(id) {
    if (!this.elements.has(id)) {
      const element = document.getElementById(id);
      if (element) {
        this.elements.set(id, element);
      }
    }
    return this.elements.get(id) || null;
  }
  
  clear() {
    this.elements.clear();
  }
  
  has(id) {
    return this.elements.has(id) && document.getElementById(id);
  }
}

/**
 * Instance globale du cache
 */
export const elementCache = new ElementCache();

/**
 * Exécute une opération sur un élément de manière sécurisée
 * @param {string} elementId - ID de l'élément
 * @param {function} operation - Fonction à exécuter
 * @returns {boolean|any} - Résultat de l'opération ou false si échec
 */
export function safeElementOperation(elementId, operation) {
  try {
    const element = elementCache.get(elementId);
    if (!element) {
      console.warn(`Element ${elementId} not found`);
      return false;
    }
    return operation(element);
  } catch (error) {
    console.error(`Error with element ${elementId}:`, error);
    return false;
  }
}

/**
 * Throttling pour optimiser les performances
 * @param {function} func - Fonction à throttler
 * @param {number} limit - Délai en ms
 * @returns {function} - Fonction throttlée
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debouncing pour les événements fréquents
 * @param {function} func - Fonction à debouncer
 * @param {number} wait - Délai d'attente en ms
 * @returns {function} - Fonction debouncée
 */
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Vérifie si l'utilisateur préfère les animations réduites
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Attend qu'un élément soit disponible dans le DOM
 * @param {string} elementId - ID de l'élément à attendre
 * @param {number} timeout - Timeout en ms (défaut: 5000)
 * @returns {Promise<Element|null>}
 */
export function waitForElement(elementId, timeout = 5000) {
  return new Promise((resolve) => {
    const element = elementCache.get(elementId);
    if (element) {
      resolve(element);
      return;
    }
    
    const startTime = Date.now();
    const checkElement = () => {
      const el = elementCache.get(elementId);
      if (el) {
        resolve(el);
      } else if (Date.now() - startTime > timeout) {
        console.warn(`Element ${elementId} not found within timeout`);
        resolve(null);
      } else {
        setTimeout(checkElement, 50);
      }
    };
    
    checkElement();
  });
}

/**
 * Sélecteur multiple sécurisé
 * @param {string} selector - Sélecteur CSS
 * @param {Element} container - Conteneur (défaut: document)
 * @returns {Element[]}
 */
export function safeQuerySelectorAll(selector, container = document) {
  try {
    return Array.from(container.querySelectorAll(selector));
  } catch (error) {
    console.error(`Error with selector ${selector}:`, error);
    return [];
  }
}

/**
 * Mise à jour de plusieurs éléments en une fois
 * @param {Array} updates - Array de [elementId, property, value]
 */
export function batchUpdateElements(updates) {
  updates.forEach(([elementId, property, value]) => {
    safeElementOperation(elementId, (element) => {
      if (property === 'textContent') {
        element.textContent = value;
      } else if (property === 'innerHTML') {
        element.innerHTML = value;
      } else if (property.startsWith('style.')) {
        const styleProp = property.replace('style.', '');
        element.style[styleProp] = value;
      } else {
        element[property] = value;
      }
    });
  });
}