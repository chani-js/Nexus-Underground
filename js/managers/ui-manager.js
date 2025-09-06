// js/managers/ui-manager.js
// Gestionnaire de l'interface utilisateur

import { CATEGORY_CONFIG } from '../config/categories.js';
import { batchUpdateElements, safeElementOperation } from '../utils/dom-utils.js';

/**
 * Gestionnaire principal de l'interface utilisateur
 */
export class UIManager {
  constructor() {
    this.currentCategory = null;
  }

  /**
   * Met à jour le header (titre et sous-titre)
   * @param {string} category - Catégorie sélectionnée
   * @returns {boolean} - Succès de l'opération
   */
  updateHeader(category) {
    const config = CATEGORY_CONFIG[category];
    if (!config) {
      console.warn(`Category config not found: ${category}`);
      return false;
    }

    const updates = [
      ['main-title', 'innerHTML', config.title],
      ['main-subtitle', 'innerHTML', config.subtitle],
      ['page-title', 'textContent', config.pageTitle]
    ];

    batchUpdateElements(updates);
    document.title = config.pageTitle;
    
    return true;
  }

  /**
   * Met à jour le message d'avertissement
   * @param {string} category - Catégorie sélectionnée
   * @returns {boolean} - Succès de l'opération
   */
  updateWarning(category) {
    const config = CATEGORY_CONFIG[category];
    if (!config) return false;

    return safeElementOperation('warning-message', (element) => {
      element.innerHTML = config.warning;
    });
  }

  /**
   * Met à jour les couleurs CSS du site
   * @param {string} category - Catégorie sélectionnée
   * @returns {boolean} - Succès de l'opération
   */
  updateColors(category) {
    const config = CATEGORY_CONFIG[category];
    if (!config) return false;

    try {
      const root = document.documentElement;
      const { colors } = config;
      
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
  }

  /**
   * Met à jour les informations de contact dans le footer
   * @param {string} category - Catégorie sélectionnée
   * @returns {boolean} - Succès de l'opération
   */
  updateFooterContacts(category) {
    const config = CATEGORY_CONFIG[category];
    if (!config) return false;

    const { contact } = config;
    const updates = [
      ['discord-contact', 'textContent', contact.discord],
      ['ingame-contact', 'textContent', contact.ingame],
      ['location-contact', 'textContent', contact.location],
      ['contact-description', 'textContent', contact.description]
    ];

    batchUpdateElements(updates);
    return true;
  }

  /**
   * Met à jour tous les éléments de l'interface pour une catégorie
   * @param {string} category - Catégorie sélectionnée
   */
  updateAll(category) {
    if (this.currentCategory === category) return;

    const operations = [
      () => this.updateHeader(category),
      () => this.updateWarning(category), 
      () => this.updateColors(category),
      () => this.updateFooterContacts(category)
    ];

    // Exécution de toutes les mises à jour
    const results = operations.map(op => {
      try {
        return op();
      } catch (error) {
        console.error('Error in UI update operation:', error);
        return false;
      }
    });

    // Log des erreurs éventuelles
    const failedOperations = results.filter(result => !result).length;
    if (failedOperations > 0) {
      console.warn(`${failedOperations} UI operations failed for category: ${category}`);
    }

    this.currentCategory = category;
  }

  /**
   * Réinitialise l'interface à la catégorie par défaut
   */
  reset() {
    this.currentCategory = null;
  }

  /**
   * Retourne la catégorie actuelle
   * @returns {string|null}
   */
  getCurrentCategory() {
    return this.currentCategory;
  }

  /**
   * Vérifie si une catégorie est valide
   * @param {string} category - Catégorie à vérifier
   * @returns {boolean}
   */
  isValidCategory(category) {
    return category && CATEGORY_CONFIG.hasOwnProperty(category);
  }
}

// Instance singleton
export const uiManager = new UIManager();