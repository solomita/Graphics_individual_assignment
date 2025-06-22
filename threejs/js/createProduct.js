/**
 * Product Creation Module
 */

import * as THREE from 'three';

export class ProductCreator {
    constructor(scene) {
        this.scene = scene;
        this.productGroup = new THREE.Group();
        this.productParts = [];
        this.materials = this.createMaterials();
        
        this.createChair();
        this.scene.add(this.productGroup);
        
        console.log('Product created successfully');
    }
    
    createMaterials() {
        return {
            wood: new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                roughness: 0.8,
                metalness: 0.1
            }),
            cushion: new THREE.MeshStandardMaterial({
                color: 0x4169E1,
                roughness: 0.6,
                metalness: 0.0
            }),
            metal: new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.3,
                metalness: 0.7
            })
        };
    }
    
    createChair() {
        // Chair seat
        this.createSeat();
        
        // Chair back
        this.createBackrest();
        
        // Chair legs
        this.createLegs();
        
        // Chair arms
        this.createArmrests();
        
        // Position the entire chair at origin for proper rotation
        this.productGroup.position.set(0, 0, 0);
    }
    
    createSeat() {
        const seatGeometry = new THREE.BoxGeometry(2, 0.2, 2);
        const seat = new THREE.Mesh(seatGeometry, this.materials.cushion);
        
        seat.position.set(0, 1, 0);
        seat.castShadow = true;
        seat.receiveShadow = true;
        seat.userData = { name: 'Chair Seat', partType: 'seat' };
        
        this.productGroup.add(seat);
        this.productParts.push(seat);
    }
    
    createBackrest() {
        // Main backrest
        const backGeometry = new THREE.BoxGeometry(2, 2, 0.2);
        const backrest = new THREE.Mesh(backGeometry, this.materials.wood);
        
        backrest.position.set(0, 2, -0.9);
        backrest.castShadow = true;
        backrest.receiveShadow = true;
        backrest.userData = { name: 'Chair Backrest', partType: 'backrest' };
        
        this.productGroup.add(backrest);
        this.productParts.push(backrest);
        
        // Backrest support bars
        for (let i = -0.6; i <= 0.6; i += 0.4) {
            const barGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.5);
            const bar = new THREE.Mesh(barGeometry, this.materials.wood);
            
            bar.position.set(i, 1.75, -0.8);
            bar.castShadow = true;
            bar.userData = { name: 'Backrest Support', partType: 'support' };
            
            this.productGroup.add(bar);
            this.productParts.push(bar);
        }
    }
    
    createLegs() {
        const legPositions = [
            [-0.8, 0.5, -0.8],  // Back left
            [0.8, 0.5, -0.8],   // Back right
            [-0.8, 0.5, 0.8],   // Front left
            [0.8, 0.5, 0.8]     // Front right
        ];
        
        legPositions.forEach((position, index) => {
            const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1);
            const leg = new THREE.Mesh(legGeometry, this.materials.wood);
            
            leg.position.set(...position);
            leg.castShadow = true;
            leg.receiveShadow = true;
            leg.userData = { name: `Chair Leg ${index + 1}`, partType: 'leg' };
            
            this.productGroup.add(leg);
            this.productParts.push(leg);
        });
    }
    
    createArmrests() {
        const armPositions = [
            [-1.2, 1.4, 0],  // Left armrest
            [1.2, 1.4, 0]    // Right armrest
        ];
        
        armPositions.forEach((position, index) => {
            // Armrest top
            const armGeometry = new THREE.BoxGeometry(0.3, 0.1, 1.5);
            const armrest = new THREE.Mesh(armGeometry, this.materials.wood);
            
            armrest.position.set(...position);
            armrest.castShadow = true;
            armrest.receiveShadow = true;
            armrest.userData = { 
                name: `${index === 0 ? 'Left' : 'Right'} Armrest`, 
                partType: 'armrest' 
            };
            
            this.productGroup.add(armrest);
            this.productParts.push(armrest);
            
            // Armrest support
            const supportGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.8);
            const support = new THREE.Mesh(supportGeometry, this.materials.wood);
            
            support.position.set(position[0], 1.0, position[2]);
            support.castShadow = true;
            support.userData = { 
                name: `${index === 0 ? 'Left' : 'Right'} Armrest Support`, 
                partType: 'support' 
            };
            
            this.productGroup.add(support);
            this.productParts.push(support);
        });
    }
    
    // Method to get all interactive parts
    getInteractiveParts() {
        return this.productParts;
    }
    
    // Method to get the product group
    getProductGroup() {
        return this.productGroup;
    }
    
    // Method to add floating animation to the chair
    addFloatingAnimation() {
        this.productGroup.userData.originalY = this.productGroup.position.y;
        this.productGroup.userData.floating = true;
    }
    
    // Method to update floating animation
    updateFloating(time) {
        if (this.productGroup.userData.floating) {
            const originalY = this.productGroup.userData.originalY || 0;
            this.productGroup.position.y = originalY + Math.sin(time * 0.001) * 0.1;
        }
    }
    
    // Method to highlight a part
    highlightPart(part, highlight = true) {
        if (highlight) {
            part.material = part.material.clone();
            part.material.emissive = new THREE.Color(0x444444);
            part.classList?.add('highlighted');
        } else {
            // Reset to original material
            const partType = part.userData.partType;
            switch(partType) {
                case 'seat':
                    part.material = this.materials.cushion;
                    break;
                case 'leg':
                case 'backrest':
                case 'armrest':
                case 'support':
                    part.material = this.materials.wood;
                    break;
                default:
                    part.material = this.materials.wood;
            }
            part.classList?.remove('highlighted');
        }
    }
}

// ES6 export (already done above) 