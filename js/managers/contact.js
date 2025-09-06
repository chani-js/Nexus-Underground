// js/managers/contact.js
// Gestionnaire du système de contact

import { CATEGORY_CONFIG, CATEGORY_TYPES } from '../config/categories.js';
import { uiManager } from './ui-manager.js';

/**
 * Gestionnaire du système de contact
 */
export class ContactManager {
  constructor() {
    this.modalActive = false;
  }

  /**
   * Génère les informations de contact pour un item
   * @param {string} itemName - Nom de l'item
   * @returns {string} - Informations de contact formatées
   */
  getContactInfo(itemName) {
    const category = uiManager.getCurrentCategory();
    const config = CATEGORY_CONFIG[category];
    
    if (!config) {
      return `Contact pour: ${itemName}\n\n📱 Discord: Gally\n💬 En jeu: Gally`;
    }

    const { contact } = config;
    const categoryLabels = {
      [CATEGORY_TYPES.VEHICLES]: 'vendeur',
      [CATEGORY_TYPES.WEAPONS]: "fournisseur d'armes", 
      [CATEGORY_TYPES.BLACKMARKET]: 'dealer',
      [CATEGORY_TYPES.SERVICES]: 'fournisseur de services'
    };

    const label = categoryLabels[category] || 'vendeur';
    
    return `Vous souhaitez contacter le ${label} pour: ${itemName}\n\n📱 Discord: ${contact.discord}\n💬 En jeu: ${contact.ingame}\n📍 ${contact.location} - ${contact.description}`;
  }

  /**
   * Crée et affiche un modal de contact accessible
   * @param {string} itemName - Nom de l'item
   * @param {string} contactInfo - Informations de contact
   */
  createContactModal(itemName, contactInfo) {
    // Vérifier si un modal existe déjà
    if (this.modalActive) {
      this.closeExistingModal();
    }

    const modal = this.buildModalElement(itemName, contactInfo);
    this.setupModalEvents(modal);
    this.displayModal(modal);
  }

  /**
   * Construit l'élément modal avec accessibilité
   * @param {string} itemName - Nom de l'item
   * @param {string} contactInfo - Informations de contact
   * @returns {HTMLElement} - Élément modal
   */
  buildModalElement(itemName, contactInfo) {
    const modal = document.createElement('div');
    modal.className = 'contact-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.setAttribute('aria-modal', 'true');
    modal.tabIndex = -1;

    modal.innerHTML = `
      <div class="modal-backdrop" aria-hidden="true"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modal-title">Contact pour: ${this.escapeHtml(itemName)}</h2>
          <button class="modal-close" aria-label="Fermer le modal" type="button">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <pre class="contact-info">${this.escapeHtml(contactInfo)}</pre>
        </div>
        <div class="modal-footer">
          <button class="modal-close-btn btn-primary" type="button">Fermer</button>
        </div>
      </div>
    `;

    this.applyModalStyles(modal);
    return modal;
  }

  /**
   * Applique les styles CSS au modal
   * @param {HTMLElement} modal - Élément modal
   */
  applyModalStyles(modal) {
    const styles = {
      modal: `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
        z-index: 10000; display: flex; align-items: center; justify-content: center;
        animation: modalFadeIn 0.3s ease;
      `,
      backdrop: `
        position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
        background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
      `,
      content: `
        background: #1a1a1a; color: #e0e0e0; padding: 0; border-radius: 10px; 
        max-width: 500px; width: 90%; position: relative; 
        border: 2px solid var(--primary-color);
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        transform: scale(1); animation: modalSlideIn 0.3s ease;
      `,
      header: `
        padding: 20px; border-bottom: 1px solid #333;
        display: flex; justify-content: space-between; align-items: center;
      `,
      body: `padding: 20px;`,
      footer: `
        padding: 20px; border-top: 1px solid #333;
        display: flex; justify-content: flex-end;
      `,
      closeBtn: `
        background: none; border: none; color: #e0e0e0; 
        font-size: 24px; cursor: pointer; padding: 0;
        width: 30px; height: 30px; display: flex;
        align-items: center; justify-content: center;
        border-radius: 50%; transition: background 0.3s;
      `,
      primaryBtn: `
        background: var(--primary-color); color: white; border: none;
        padding: 10px 20px; border-radius: 5px; cursor: pointer;
        font-weight: bold; transition: all 0.3s;
      `
    };

    modal.style.cssText = styles.modal;
    modal.querySelector('.modal-backdrop').style.cssText = styles.backdrop;
    modal.querySelector('.modal-content').style.cssText = styles.content;
    modal.querySelector('.modal-header').style.cssText = styles.header;
    modal.querySelector('.modal-body').style.cssText = styles.body;
    modal.querySelector('.modal-footer').style.cssText = styles.footer;
    modal.querySelector('.modal-close').style.cssText = styles.closeBtn;
    modal.querySelector('.modal-close-btn').style.cssText = styles.primaryBtn;

    // Ajouter les animations CSS si elles n'existent pas
    this.addModalAnimations();
  }

  /**
   * Ajoute les animations CSS pour le modal
   */
  addModalAnimations() {
    if (document.querySelector('#modal-animations')) return;

    const style = document.createElement('style');
    style.id = 'modal-animations';
    style.textContent = `
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes modalSlideIn {
        from { transform: scale(0.8) translateY(-50px); opacity: 0; }
        to { transform: scale(1) translateY(0); opacity: 1; }
      }
      .modal-close:hover {
        background: rgba(255,255,255,0.1);
      }
      .modal-close-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      }
      .contact-info {
        white-space: pre-wrap;
        font-family: inherit;
        margin: 0;
        line-height: 1.6;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Configure les événements du modal
   * @param {HTMLElement} modal - Élément modal
   */
  setupModalEvents(modal) {
    const closeModal = () => this.closeModal(modal);
    
    // Boutons de fermeture
    modal.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    // Clic sur backdrop
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

    // Gestion du clavier
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'Tab') {
        this.trapFocus(e, modal);
      }
    };

    modal.addEventListener('keydown', handleKeyDown);
    modal.removeKeydownListener = () => {
      modal.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Piège le focus dans le modal pour l'accessibilité
   * @param {KeyboardEvent} e - Événement clavier
   * @param {HTMLElement} modal - Élément modal
   */
  trapFocus(e, modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  /**
   * Affiche le modal et gère le focus
   * @param {HTMLElement} modal - Élément modal
   */
  displayModal(modal) {
    // Sauvegarder l'élément actif
    this.previousActiveElement = document.activeElement;
    
    // Ajouter au DOM
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Focus sur le modal
    setTimeout(() => {
      const firstButton = modal.querySelector('.modal-close');
      if (firstButton) {
        firstButton.focus();
      }
    }, 100);

    this.modalActive = true;
  }

  /**
   * Ferme le modal actuel
   * @param {HTMLElement} modal - Élément modal à fermer
   */
  closeModal(modal) {
    if (!this.modalActive) return;

    // Animation de fermeture
    modal.style.animation = 'modalFadeIn 0.2s ease reverse';
    
    setTimeout(() => {
      // Nettoyage
      if (modal.removeKeydownListener) {
        modal.removeKeydownListener();
      }
      
      modal.remove();
      document.body.style.overflow = '';
      
      // Restaurer le focus
      if (this.previousActiveElement) {
        this.previousActiveElement.focus();
      }
      
      this.modalActive = false;
    }, 200);
  }

  /**
   * Ferme le modal existant s'il y en a un
   */
  closeExistingModal() {
    const existingModal = document.querySelector('.contact-modal');
    if (existingModal) {
      this.closeModal(existingModal);
    }
  }

  /**
   * Échappe les caractères HTML pour éviter les injections
   * @param {string} text - Texte à échapper
   * @returns {string} - Texte échappé
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Gère l'affichage du contact (modal ou fallback)
   * @param {string} itemName - Nom de l'item
   */
  showContact(itemName) {
    const contactInfo = this.getContactInfo(itemName);
    
    try {
      this.createContactModal(itemName, contactInfo);
    } catch (error) {
      console.error('Error creating modal:', error);
      // Fallback vers alert
      alert(contactInfo);
    }
  }
}

// Instance singleton
export const contactManager = new ContactManager();