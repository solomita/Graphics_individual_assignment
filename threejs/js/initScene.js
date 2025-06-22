/**
 * Scene Initialization Module
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.canvas = null;
        
        this.init();
    }
    
    init() {
        // Get canvas element
        this.canvas = document.getElementById('three-canvas');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0xcccccc, 10, 50);
        
        // Set up camera
        this.setupCamera();
        
        // Set up renderer
        this.setupRenderer();
        
        // Set up controls
        this.setupControls();
        
        // Handle window resize
        this.setupResizeHandler();
        
        console.log('Scene initialized successfully');
    }
    
    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        
        // Position camera for optimal product viewing
        this.camera.position.set(5, 3, 5);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,
            alpha: true 
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enable shadows
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set tone mapping for better colors
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        
        // Set background color
        this.renderer.setClearColor(0xf0f0f0, 0);
    }
    
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.canvas);
        
        // Configure controls
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        
        // Set limits
        this.controls.minDistance = 3;
        this.controls.maxDistance = 15;
        this.controls.maxPolarAngle = Math.PI / 1.5; // Allow looking down more
        this.controls.minPolarAngle = Math.PI / 6;   // Prevent looking too far up
        
        // Set target to center of scene (where the chair is)
        this.controls.target.set(0, 1, 0); // Slightly elevated to match chair center
        this.controls.update();
        
        console.log('OrbitControls initialized with target:', this.controls.target);
    }
    
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            // Update camera aspect ratio
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            
            // Update renderer size
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }
    
    // Method to get camera's initial position for reset
    getInitialCameraPosition() {
        return new THREE.Vector3(5, 3, 5);
    }
    
    // Method to reset camera to initial position
    resetCamera() {
        const initialPos = this.getInitialCameraPosition();
        this.camera.position.copy(initialPos);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
    
    // Method to update controls (called in animation loop)
    update() {
        if (this.controls) {
            this.controls.update();
        }
    }
    
    // Method to render the scene
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

// ES6 export (already done above) 