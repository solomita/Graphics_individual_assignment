/**
 * Interaction Module
 */

import * as THREE from 'three';

export class InteractionManager {
    constructor(camera, scene, canvas, productParts) {
        this.camera = camera;
        this.scene = scene;
        this.canvas = canvas;
        this.productParts = productParts;
        
        // Raycasting setup
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // State management
        this.hoveredObject = null;
        this.selectedObject = null;
        this.originalMaterials = new Map();
        
        // UI elements
        this.partInfoPanel = document.getElementById('part-info');
        this.partNameElement = document.getElementById('part-name');
        this.closeInfoButton = document.getElementById('close-info');
        
        this.setupEventListeners();
        this.storeMaterials();
        
        console.log('Interaction manager initialized successfully');
    }
    
    setupEventListeners() {
        // Mouse move for hover effects
        this.canvas.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
        
        // Mouse click for selection
        this.canvas.addEventListener('click', (event) => {
            this.onMouseClick(event);
        });
        
        // Close info panel
        this.closeInfoButton.addEventListener('click', () => {
            this.hidePartInfo();
        });
        
        // Handle mouse leave to clear hover
        this.canvas.addEventListener('mouseleave', () => {
            this.clearHover();
        });
    }
    
    storeMaterials() {
        // Store original materials for restoration
        this.productParts.forEach(part => {
            this.originalMaterials.set(part.uuid, part.material.clone());
        });
    }
    
    onMouseMove(event) {
        this.updateMousePosition(event);
        this.handleHover();
    }
    
    onMouseClick(event) {
        this.updateMousePosition(event);
        this.handleClick();
    }
    
    updateMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    handleHover() {
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for intersections
        const intersects = this.raycaster.intersectObjects(this.productParts);
        
        if (intersects.length > 0) {
            const hoveredObject = intersects[0].object;
            
            if (this.hoveredObject !== hoveredObject) {
                // Clear previous hover
                this.clearHover();
                
                // Set new hover
                this.hoveredObject = hoveredObject;
                this.applyHoverEffect(hoveredObject);
                
                // Change cursor
                this.canvas.style.cursor = 'pointer';
            }
        } else {
            this.clearHover();
        }
    }
    
    handleClick() {
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for intersections
        const intersects = this.raycaster.intersectObjects(this.productParts);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            this.selectObject(clickedObject);
        } else {
            this.deselectObject();
        }
    }
    
    selectObject(object) {
        // Clear previous selection
        this.deselectObject();
        
        // Set new selection
        this.selectedObject = object;
        this.applySelectionEffect(object);
        this.showPartInfo(object);
        
        // Add pulse animation
        this.addPulseAnimation(object);
        
        console.log('Selected:', object.userData.name);
    }
    
    deselectObject() {
        if (this.selectedObject) {
            this.clearSelectionEffect(this.selectedObject);
            this.removePulseAnimation(this.selectedObject);
            this.selectedObject = null;
        }
        this.hidePartInfo();
    }
    
    applyHoverEffect(object) {
        if (object === this.selectedObject) return;
        
        // Create hover material with stronger effect
        const hoverMaterial = this.originalMaterials.get(object.uuid).clone();
        hoverMaterial.emissive = new THREE.Color(0x4444FF); // Blue glow
        hoverMaterial.emissiveIntensity = 0.4; // Stronger intensity
        
        object.material = hoverMaterial;
        
        // Add scale effect - make it slightly larger
        if (!object.userData.originalScale) {
            object.userData.originalScale = object.scale.clone();
        }
        object.scale.multiplyScalar(1.05); // 5% larger
        
        // Add hover animation flag
        object.userData.hovering = true;
        object.userData.hoverTime = 0;
    }
    
    applySelectionEffect(object) {
        // Create selection material with same color as hover
        const selectionMaterial = this.originalMaterials.get(object.uuid).clone();
        selectionMaterial.emissive = new THREE.Color(0x4444FF); // Blue glow (same as hover)
        selectionMaterial.emissiveIntensity = 0.5; // Slightly stronger than hover
        
        object.material = selectionMaterial;
        
        // Remove hover effects when selected
        if (object.userData.hovering) {
            object.userData.hovering = false;
        }
    }
    
    clearHover() {
        if (this.hoveredObject && this.hoveredObject !== this.selectedObject) {
            // Restore original material
            this.hoveredObject.material = this.originalMaterials.get(this.hoveredObject.uuid);
            
            // Restore original scale
            if (this.hoveredObject.userData.originalScale) {
                this.hoveredObject.scale.copy(this.hoveredObject.userData.originalScale);
            }
            
            // Clear hover animation
            this.hoveredObject.userData.hovering = false;
            
            this.hoveredObject = null;
        }
        
        // Reset cursor
        this.canvas.style.cursor = 'default';
    }
    
    clearSelectionEffect(object) {
        // Restore original material
        object.material = this.originalMaterials.get(object.uuid);
        
        // Restore original scale if it was modified
        if (object.userData.originalScale) {
            object.scale.copy(object.userData.originalScale);
        }
        
        // Clear any remaining animation flags
        object.userData.hovering = false;
    }
    
    addPulseAnimation(object) {
        // Store original scale
        if (!object.userData.originalScale) {
            object.userData.originalScale = object.scale.clone();
        }
        
        // Add pulse flag
        object.userData.pulsing = true;
        object.userData.pulseTime = 0;
    }
    
    removePulseAnimation(object) {
        if (object.userData.pulsing) {
            object.userData.pulsing = false;
            
            // Restore original scale
            if (object.userData.originalScale) {
                object.scale.copy(object.userData.originalScale);
            }
        }
    }
    
    updatePulseAnimations(deltaTime) {
        this.productParts.forEach(part => {
            // Handle selection pulse animation
            if (part.userData.pulsing) {
                part.userData.pulseTime += deltaTime;
                
                const pulseScale = 1 + Math.sin(part.userData.pulseTime * 0.01) * 0.05;
                const originalScale = part.userData.originalScale || new THREE.Vector3(1, 1, 1);
                
                part.scale.copy(originalScale).multiplyScalar(pulseScale);
                
                // Stop pulsing after a few cycles
                if (part.userData.pulseTime > 6280) { // ~2π * 1000
                    this.removePulseAnimation(part);
                }
            }
            
            // Handle hover breathing animation
            if (part.userData.hovering && !part.userData.pulsing) {
                part.userData.hoverTime += deltaTime;
                
                // Subtle breathing effect for hovered items
                const breathScale = 1.05 + Math.sin(part.userData.hoverTime * 0.005) * 0.01;
                const originalScale = part.userData.originalScale || new THREE.Vector3(1, 1, 1);
                
                part.scale.copy(originalScale).multiplyScalar(breathScale);
            }
        });
    }
    
    showPartInfo(object) {
        const partName = object.userData.name || 'Unknown Part';
        this.partNameElement.textContent = partName;
        this.partInfoPanel.classList.remove('hidden');
    }
    
    hidePartInfo() {
        this.partInfoPanel.classList.add('hidden');
    }
    
    // Method to be called in the animation loop
    update(deltaTime) {
        this.updatePulseAnimations(deltaTime);
    }
    
    // Method to clean up on destroy
    destroy() {
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.removeEventListener('click', this.onMouseClick);
        this.canvas.removeEventListener('mouseleave', this.clearHover);
        this.closeInfoButton.removeEventListener('click', this.hidePartInfo);
    }
}

// ES6 export (already done above) 