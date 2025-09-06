// js/managers/navigation.js
// Gestionnaire de navigation entre onglets

import { elementCache, safeQuerySelectorAll } from '../utils/dom-utils.js';
import { uiManager } from './ui-manager.js';

/**
 * Gestionnaire de navigation entre les onglets
 */
export class NavigationManager {
  constructor() {
    this.activeMainTab = null;
    this.activeSubTab = null;
  }

  /**
   * Affiche un onglet principal et met à jour l'interface
   * @param {string} tabName - Nom de l'onglet à afficher
   * @param {Event} event - Événement déclenché
   */
  showMainTab(tabName, event = null) {
    if (event) {
      event.preventDefault();
    }

    // Mise à jour des états visuels
    this.updateTabStates('.main-tab-content', '.main-tab-button', tabName, event);
    
    // Activation du premier sous-onglet
    this.activateFirstSubTab(tabName);
    
    // Mise à jour de l'interface globale
    uiManager.updateAll(tabName);
    
    this.activeMainTab = tabName;
  }

  /**
   * Affiche un sous-onglet dans la section active
   * @param {string} tabName - Nom du sous-onglet à afficher
   * @param {Event} event - Événement déclenché
   */
  showSubTab(tabName, event = null) {
    if (event) {
      event.preventDefault();
    }

    const activeMainTab = document.querySelector('.main-tab-content.active');
    if (!activeMainTab) {
      console.warn('No active main tab found');
      return;
    }

    this.updateTabStates(
      '.sub-tab-content',
      '.sub-tab-button', 
      tabName,
      event,
      activeMainTab
    );

    this.activeSubTab = tabName;
  }

  /**
   * Met à jour les états des onglets (actif/inactif)
   * @param {string} contentSelector - Sélecteur pour les contenus
   * @param {string} buttonSelector - Sélecteur pour les boutons
   * @param {string} tabName - Nom de l'onglet à activer
   * @param {Event} event - Événement déclenché
   * @param {Element} container - Conteneur (défaut: document)
   */
  updateTabStates(contentSelector, buttonSelector, tabName, event, container = document) {
    // Désactivation de tous les éléments
    this.deactivateElements(container, contentSelector);
    this.deactivateElements(container, buttonSelector);

    // Activation du contenu ciblé
    const targetContent = elementCache.get(tabName);
    if (targetContent) {
      targetContent.classList.add('active');
    }

    // Activation du bouton correspondant
    if (event && event.target) {
      event.target.classList.add('active');
    }
  }

  /**
   * Désactive tous les éléments correspondant au sélecteur
   * @param {Element} container - Conteneur
   * @param {string} selector - Sélecteur CSS
   */
  deactivateElements(container, selector) {
    safeQuerySelectorAll(selector, container).forEach(element => {
      element.classList.remove('active');
    });
  }

  /**
   * Active le premier sous-onglet d'une section principale
   * @param {string} mainTabName - Nom de l'onglet principal
   */
  activateFirstSubTab(mainTabName) {
    const targetContent = elementCache.get(mainTabName);
    if (!targetContent) return;

    const firstSubTab = targetContent.querySelector('.sub-tab-button');
    const firstSubContent = targetContent.querySelector('.sub-tab-content');

    if (firstSubTab && firstSubContent) {
      // Réinitialisation des sous-onglets
      this.resetSubTabs(targetContent);
      
      // Activation du premier
      firstSubTab.classList.add('active');
      firstSubContent.classList.add('active');
      
      this.activeSubTab = firstSubContent.id;
    }
  }

  /**
   * Réinitialise tous les sous-onglets d'un conteneur
   * @param {Element} container - Conteneur
   */
  resetSubTabs(container) {
    safeQuerySelectorAll('.sub-tab-button', container).forEach(btn => 
      btn.classList.remove('active')
    );
    safeQuerySelectorAll('.sub-tab-content', container).forEach(content => 
      content.classList.remove('active')
    );
  }

  /**
   * Initialise les event listeners pour la navigation
   */
  initEventListeners() {
    document.addEventListener('click', this.handleTabClick.bind(this));
  }

  /**
   * Gestionnaire des clics sur les onglets
   * @param {Event} event - Événement click
   */
  handleTabClick(event) {
    const target = event.target;

    // Gestion des onglets principaux
    if (target.matches('.main-tab-button')) {
      const tabName = this.extractTabName(target, /showMainTab\('([^']+)'\)/);
      if (tabName) {
        this.showMainTab(tabName, event);
      }
    }
    
    // Gestion des sous-onglets
    else if (target.matches('.sub-tab-button')) {
      const tabName = this.extractTabName(target, /showSubTab\('([^']+)'\)/);
      if (tabName) {
        this.showSubTab(tabName, event);
      }
    }
  }

  /**
   * Extrait le nom de l'onglet depuis les attributs de l'élément
   * @param {Element} element - Élément DOM
   * @param {RegExp} regex - Expression régulière pour extraire le nom
   * @returns {string|null} - Nom de l'onglet ou null
   */
  extractTabName(element, regex) {
    // Priorité au data-tab si présent
    if (element.dataset.tab) {
      return element.dataset.tab;
    }
    
    // Fallback sur onclick attribute
    const onclick = element.getAttribute('onclick');
    if (onclick) {
      const match = onclick.match(regex);
      return match ? match[1] : null;
    }
    
    return null;
  }

  /**
   * Retourne l'onglet principal actif
   * @returns {string|null}
   */
  getActiveMainTab() {
    return this.activeMainTab;
  }

  /**
   * Retourne le sous-onglet actif
   * @returns {string|null}
   */
  getActiveSubTab() {
    return this.activeSubTab;
  }

  /**
   * Navigue vers un onglet spécifique
   * @param {string} mainTab - Onglet principal
   * @param {string} subTab - Sous-onglet (optionnel)
   */
  navigateTo(mainTab, subTab = null) {
    this.showMainTab(mainTab);
    
    if (subTab) {
      // Attendre que l'onglet principal soit activé
      setTimeout(() => {
        this.showSubTab(subTab);
      }, 50);
    }
  }
}

// Instance singleton
export const navigationManager = new NavigationManager();