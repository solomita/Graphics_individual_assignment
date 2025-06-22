/**
 * Lighting Module
 */

import * as THREE from 'three';

export class LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.lights = {};
        
        this.setupLighting();
        console.log('Lighting initialized successfully');
    }
    
    setupLighting() {
        // Ambient light for general illumination
        this.createAmbientLight();
        
        // Main directional light (sun-like)
        this.createDirectionalLight();
        
        // Fill light to reduce harsh shadows
        this.createFillLight();
        
        // Hemisphere light for better color balance
        this.createHemisphereLight();
    }
    
    createAmbientLight() {
        this.lights.ambient = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.lights.ambient);
    }
    
    createDirectionalLight() {
        this.lights.directional = new THREE.DirectionalLight(0xffffff, 1.0);
        
        // Position the light
        this.lights.directional.position.set(5, 10, 5);
        this.lights.directional.target.position.set(0, 0, 0);
        
        // Enable shadows
        this.lights.directional.castShadow = true;
        
        // Configure shadow properties
        this.lights.directional.shadow.mapSize.width = 2048;
        this.lights.directional.shadow.mapSize.height = 2048;
        this.lights.directional.shadow.camera.near = 0.5;
        this.lights.directional.shadow.camera.far = 50;
        
        // Set shadow camera bounds
        const shadowSize = 10;
        this.lights.directional.shadow.camera.left = -shadowSize;
        this.lights.directional.shadow.camera.right = shadowSize;
        this.lights.directional.shadow.camera.top = shadowSize;
        this.lights.directional.shadow.camera.bottom = -shadowSize;
        
        // Add soft shadows
        this.lights.directional.shadow.radius = 5;
        this.lights.directional.shadow.blurSamples = 25;
        
        this.scene.add(this.lights.directional);
        this.scene.add(this.lights.directional.target);
    }
    
    createFillLight() {
        this.lights.fill = new THREE.DirectionalLight(0x87CEEB, 0.3);
        
        // Position from opposite side for fill lighting
        this.lights.fill.position.set(-3, 5, -3);
        this.lights.fill.target.position.set(0, 0, 0);
        
        this.scene.add(this.lights.fill);
        this.scene.add(this.lights.fill.target);
    }
    
    createHemisphereLight() {
        // Sky color and ground color for natural lighting
        this.lights.hemisphere = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.6);
        this.lights.hemisphere.position.set(0, 20, 0);
        
        this.scene.add(this.lights.hemisphere);
    }
    
    // Method to create a ground plane for shadows
    createGroundPlane() {
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 1.0,
            metalness: 0.0
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        
        this.scene.add(ground);
        return ground;
    }
    
    // Method to animate lights (optional)
    updateLighting(time) {
        // Disable automatic light movement to prevent shadow rotation
        // Uncomment below for dynamic lighting effects:
        // if (this.lights.directional) {
        //     const angle = time * 0.0005;
        //     this.lights.directional.position.x = Math.cos(angle) * 8;
        //     this.lights.directional.position.z = Math.sin(angle) * 8;
        // }
    }
    
    // Method to adjust lighting intensity
    setLightingIntensity(intensity) {
        if (this.lights.directional) {
            this.lights.directional.intensity = intensity;
        }
        if (this.lights.fill) {
            this.lights.fill.intensity = intensity * 0.3;
        }
    }
    
    // Method to toggle shadows
    toggleShadows(enabled) {
        if (this.lights.directional) {
            this.lights.directional.castShadow = enabled;
        }
    }
    
    // Debug helper to visualize light positions
    addLightHelpers() {
        if (this.lights.directional) {
            const dirLightHelper = new THREE.DirectionalLightHelper(this.lights.directional, 1);
            this.scene.add(dirLightHelper);
            
            const dirLightShadowHelper = new THREE.CameraHelper(this.lights.directional.shadow.camera);
            this.scene.add(dirLightShadowHelper);
        }
        
        if (this.lights.hemisphere) {
            const hemisphereLightHelper = new THREE.HemisphereLightHelper(this.lights.hemisphere, 1);
            this.scene.add(hemisphereLightHelper);
        }
    }
}

// ES6 export (already done above) 