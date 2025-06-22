/**
 * Main Application Entry Point
 */

import * as THREE from 'three';
import { SceneManager } from './initScene.js';
import { ProductCreator } from './createProduct.js';
import { LightingManager } from './addLighting.js';
import { InteractionManager } from './interaction.js';
import { CameraAnimator } from './cameraAnimation.js';

class App {
    constructor() {
        // Module instances
        this.sceneManager = null;
        this.productCreator = null;
        this.lightingManager = null;
        this.interactionManager = null;
        this.cameraAnimator = null;
        
        // Animation loop variables
        this.animationId = null;
        this.clock = new THREE.Clock();
        this.isRunning = false;
        
        // Initialize the application
        this.init();
    }
    
    async init() {
        try {
            console.log('Initializing 3D Product Viewer...');
            
            // Show loading screen
            this.showLoading();
            
            // Initialize modules in sequence
            await this.initializeModules();
            
            // Start the animation loop
            this.start();
            
            // Hide loading screen
            this.hideLoading();
            
            console.log('3D Product Viewer initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to load 3D viewer. Please refresh the page.');
        }
    }
    
    async initializeModules() {
        // Initialize scene manager
        this.sceneManager = new SceneManager();
        
        // Add a small delay to ensure DOM is ready
        await this.delay(100);
        
        // Initialize lighting
        this.lightingManager = new LightingManager(this.sceneManager.scene);
        
        // Add ground plane for shadows
        this.lightingManager.createGroundPlane();
        
        // Initialize product
        this.productCreator = new ProductCreator(this.sceneManager.scene);
        
        // Initialize interaction manager
        this.interactionManager = new InteractionManager(
            this.sceneManager.camera,
            this.sceneManager.scene,
            this.sceneManager.canvas,
            this.productCreator.getInteractiveParts()
        );
        
        // Initialize camera animator
        this.cameraAnimator = new CameraAnimator(
            this.sceneManager.camera,
            this.sceneManager.controls
        );
        
        // Add floating animation to the product
        this.productCreator.addFloatingAnimation();
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.clock.start();
        this.animate();
        
        console.log('Animation loop started');
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        console.log('Animation loop stopped');
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Schedule next frame
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Get time values
        const deltaTime = this.clock.getDelta() * 1000; // Convert to milliseconds
        const elapsedTime = this.clock.getElapsedTime() * 1000; // Convert to milliseconds
        
        // Update modules
        this.update(deltaTime, elapsedTime);
        
        // Render the scene
        this.render();
    }
    
    update(deltaTime, elapsedTime) {
        // Update scene controls
        this.sceneManager.update();
        
        // Update camera animation
        if (this.cameraAnimator) {
            this.cameraAnimator.update(deltaTime);
        }
        
        // Update product animations
        if (this.productCreator) {
            this.productCreator.updateFloating(elapsedTime);
        }
        
        // Update interaction animations
        if (this.interactionManager) {
            this.interactionManager.update(deltaTime);
        }
        
        // Update lighting (optional dynamic lighting)
        if (this.lightingManager) {
            this.lightingManager.updateLighting(elapsedTime);
        }
    }
    
    render() {
        if (this.sceneManager) {
            this.sceneManager.render();
        }
    }
    
    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
    }
    
    showError(message) {
        console.error(message);
        
        // Create error display
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
    }
    
    // Public methods for external control
    pauseAnimation() {
        this.stop();
    }
    
    resumeAnimation() {
        this.start();
    }
    
    resetView() {
        if (this.cameraAnimator) {
            this.cameraAnimator.resetCamera();
        }
    }
    
    toggleRotation() {
        if (this.cameraAnimator) {
            this.cameraAnimator.toggleAutoRotation();
        }
    }
    
    // Cleanup method
    destroy() {
        this.stop();
        
        if (this.interactionManager) {
            this.interactionManager.destroy();
        }
        
        if (this.cameraAnimator) {
            this.cameraAnimator.destroy();
        }
        
        console.log('Application destroyed');
    }
}

// Global app instance
let app = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.destroy();
    }
});

// Initialize the app when DOM loads
export { App }; 