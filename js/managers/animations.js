// js/managers/animations.js
// Gestionnaire des animations et effets visuels

import { APP_CONFIG } from '../config/categories.js';
import { prefersReducedMotion, throttle } from '../utils/dom-utils.js';

/**
 * Gestionnaire des animations du site
 */
export class AnimationManager {
  constructor() {
    this.particlePool = [];
    this.maxParticles = 50;
    this.activeParticles = new Set();
    this.animationId = null;
    this.isInitialized = false;
  }

  /**
   * Initialise le gestionnaire d'animations
   */
  init() {
    if (this.isInitialized) return;

    this.setupScrollAnimations();
    this.startParticleSystem();
    this.setupCardAnimations();
    
    this.isInitialized = true;
  }

  /**
   * Configure les animations au scroll
   */
  setupScrollAnimations() {
    const throttledScrollHandler = throttle(() => {
      this.animateCardsOnScroll();
    }, APP_CONFIG.THROTTLE_LIMIT);

    window.addEventListener('scroll', throttledScrollHandler);
  }

  /**
   * Démarre le système de particules
   */
  startParticleSystem() {
    if (prefersReducedMotion()) return;

    setInterval(() => {
      this.createParticle();
    }, APP_CONFIG.PARTICLE_INTERVAL);
  }

  /**
   * Crée une nouvelle particule ou en réutilise une du pool
   */
  createParticle() {
    if (prefersReducedMotion()) return;
    if (this.activeParticles.size >= this.maxParticles) return;

    let particle = this.getParticleFromPool();
    if (!particle) {
      particle = this.createNewParticle();
    }

    this.setupParticle(particle);
    this.animateParticle(particle);
  }

  /**
   * Récupère une particule du pool ou en crée une nouvelle
   * @returns {HTMLElement} - Élément particule
   */
  getParticleFromPool() {
    return this.particlePool.pop() || null;
  }

  /**
   * Crée un nouvel élément particule
   * @returns {HTMLElement} - Nouvel élément particule
   */
  createNewParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    Object.assign(particle.style, {
      position: 'fixed',
      width: '2px',
      height: '2px',
      pointerEvents: 'none',
      borderRadius: '50%',
      zIndex: '1'
    });

    return particle;
  }

  /**
   * Configure les propriétés d'une particule
   * @param {HTMLElement} particle - Élément particule
   */
  setupParticle(particle) {
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-color') || '#ff4444';

    Object.assign(particle.style, {
      background: primaryColor,
      left: Math.random() * 100 + 'vw',
      top: '-5px',
      opacity: '0.5'
    });

    document.body.appendChild(particle);
    this.activeParticles.add(particle);
  }

  /**
   * Anime une particule
   * @param {HTMLElement} particle - Élément particule à animer
   */
  animateParticle(particle) {
    let position = -5;
    const speed = Math.random() * 2 + 1;
    const windowHeight = window.innerHeight;

    const animate = () => {
      position += speed;
      particle.style.top = position + 'px';

      if (position > windowHeight) {
        this.recycleParticle(particle);
      } else {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Recycle une particule dans le pool
   * @param {HTMLElement} particle - Particule à recycler
   */
  recycleParticle(particle) {
    if (particle.parentNode) {
      particle.parentNode.removeChild(particle);
    }
    
    this.activeParticles.delete(particle);
    
    if (this.particlePool.length < this.maxParticles) {
      this.particlePool.push(particle);
    }
  }

  /**
   * Anime les cartes lors du scroll
   */
  animateCardsOnScroll() {
    if (prefersReducedMotion()) return;

    const cards = document.querySelectorAll('.car-card');
    const windowHeight = window.innerHeight;

    cards.forEach(card => {
      if (card.dataset.animated === 'visible') return;

      const cardTop = card.getBoundingClientRect().top;
      
      if (cardTop < windowHeight - APP_CONFIG.SCROLL_THRESHOLD) {
        this.animateCardIn(card);
      }
    });
  }

  /**
   * Anime l'apparition d'une carte
   * @param {HTMLElement} card - Carte à animer
   */
  animateCardIn(card) {
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
    card.dataset.animated = 'visible';
  }

  /**
   * Applique les animations initiales aux cartes
   */
  setupCardAnimations() {
    if (prefersReducedMotion()) return;

    // Utiliser un délai pour s'assurer que les cartes sont créées
    setTimeout(() => {
      this.applyInitialCardStyles();
    }, APP_CONFIG.ANIMATION_DELAY);
  }

  /**
   * Applique les styles initiaux aux nouvelles cartes
   */
  applyInitialCardStyles() {
    const cards = document.querySelectorAll('.car-card:not([data-animated])');
    
    cards.forEach(card => {
      Object.assign(card.style, {
        opacity: '0',
        transform: 'translateY(50px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease'
      });
      
      card.dataset.animated = 'ready';
    });

    // Déclencher l'animation immédiatement pour les cartes visibles
    this.animateCardsOnScroll();
  }

  /**
   * Crée un effet de pulsation pour un élément
   * @param {HTMLElement} element - Élément à animer
   * @param {number} duration - Durée de l'animation en ms
   */
  pulseElement(element, duration = 600) {
    if (!element || prefersReducedMotion()) return;

    element.style.animation = `pulse ${duration}ms ease-in-out`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  }

  /**
   * Anime le changement de couleur d'un élément
   * @param {HTMLElement} element - Élément à animer
   * @param {string} fromColor - Couleur de départ
   * @param {string} toColor - Couleur d'arrivée
   * @param {number} duration - Durée en ms
   */
  animateColorChange(element, fromColor, toColor, duration = 300) {
    if (!element || prefersReducedMotion()) return;

    element.style.transition = `color ${duration}ms ease`;
    element.style.color = fromColor;
    
    requestAnimationFrame(() => {
      element.style.color = toColor;
    });
  }

  /**
   * Applique un effet de secousse à un élément
   * @param {HTMLElement} element - Élément à secouer
   */
  shakeElement(element) {
    if (!element || prefersReducedMotion()) return;

    element.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  }

  /**
   * Nettoie toutes les animations actives
   */
  cleanup() {
    // Arrêter toutes les particules
    this.activeParticles.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
    
    this.activeParticles.clear();
    this.particlePool = [];
    
    // Supprimer les event listeners
    window.removeEventListener('scroll', this.animateCardsOnScroll);
  }

  /**
   * Met en pause/reprend les animations
   * @param {boolean} paused - État de pause
   */
  setPaused(paused) {
    if (paused) {
      document.body.style.animationPlayState = 'paused';
    } else {
      document.body.style.animationPlayState = 'running';
    }
  }

  /**
   * Ajoute les keyframes CSS nécessaires
   */
  addAnimationStyles() {
    if (document.querySelector('#animation-styles')) return;

    const style = document.createElement('style');
    style.id = 'animation-styles';
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Initialise complètement le gestionnaire
   */
  fullInit() {
    this.addAnimationStyles();
    this.init();
  }
}

// Instance singleton
export const animationManager = new AnimationManager();