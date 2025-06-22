/**
 * Camera Animation Module
 */

import * as THREE from 'three';

export class CameraAnimator {
    constructor(camera, controls, target = new THREE.Vector3(0, 1, 0)) {
        this.camera = camera;
        this.controls = controls;
        this.target = target;
        
        // Animation state
        this.isAutoRotating = true;
        this.rotationSpeed = 30; // degrees per second (0.5 RPM)
        this.radius = 7; // distance from target
        this.height = 3; // camera height
        
        // Polar coordinates (angle in radians)
        this.initialAngle = this.calculateInitialAngle();
        this.currentAngle = this.initialAngle;
        
        // User interaction tracking
        this.userInteracting = false;
        this.interactionTimeout = null;
        this.resumeDelay = 3000; // Resume auto-rotation after 3 seconds of no interaction
        this.wasAutoRotatingBeforeInteraction = false;
        
        // Mouse state tracking
        this.isMouseDown = false;
        this.isDragging = false;
        
        // Time tracking for smooth rotation
        this.lastTime = 0;
        
        // UI elements
        this.toggleButton = document.getElementById('toggle-rotation');
        this.resetButton = document.getElementById('reset-camera');
        
        this.setupEventListeners();
        this.setupControlsListeners();
        this.setupMouseListeners();
        
        // Store initial camera state
        this.storeInitialState();
        
        console.log('Camera animator initialized successfully');
        console.log('Initial angle:', this.initialAngle, 'Initial radius:', this.radius);
    }
    
    calculateInitialAngle() {
        // Calculate current angle based on camera position relative to target
        const dx = this.camera.position.x - this.target.x;
        const dz = this.camera.position.z - this.target.z;
        return Math.atan2(dz, dx);
    }
    
    storeInitialState() {
        // Store initial camera position for reset
        this.initialPosition = this.camera.position.clone();
        this.initialRadius = this.camera.position.distanceTo(this.target);
        this.initialHeight = this.camera.position.y;
        
        // Update current state
        this.radius = this.initialRadius;
        this.height = this.initialHeight;
        
        console.log('Initial state stored:', {
            position: this.initialPosition,
            radius: this.initialRadius,
            height: this.initialHeight
        });
    }
    
    setupEventListeners() {
        // Store bound methods
        this.boundToggleRotation = () => this.toggleAutoRotation();
        this.boundResetCamera = () => this.resetCamera();
        
        // Toggle rotation button
        this.toggleButton.addEventListener('click', this.boundToggleRotation);
        
        // Reset camera button
        this.resetButton.addEventListener('click', this.boundResetCamera);
        
        console.log('Button event listeners attached');
    }
    
    setupControlsListeners() {
        // Store bound methods to ensure proper removal
        this.boundInteractionStart = () => this.onUserInteractionStart();
        this.boundInteractionEnd = () => this.onUserInteractionEnd();
        this.boundInteractionChange = () => this.onUserInteractionChange();
        
        // Listen for user interactions with controls
        this.controls.addEventListener('start', this.boundInteractionStart);
        this.controls.addEventListener('end', this.boundInteractionEnd);
        this.controls.addEventListener('change', this.boundInteractionChange);
    }
    
    setupMouseListeners() {
        // Get the canvas element for mouse events
        this.canvas = this.controls.domElement;
        
        // Store bound methods for proper cleanup
        this.boundMouseDown = (event) => this.onMouseDown(event);
        this.boundMouseMove = (event) => this.onMouseMove(event);
        this.boundMouseUp = (event) => this.onMouseUp(event);
        this.boundMouseLeave = (event) => this.onMouseLeave(event);
        
        // Add mouse event listeners
        this.canvas.addEventListener('mousedown', this.boundMouseDown);
        this.canvas.addEventListener('mousemove', this.boundMouseMove);
        this.canvas.addEventListener('mouseup', this.boundMouseUp);
        this.canvas.addEventListener('mouseleave', this.boundMouseLeave);
        
        console.log('Mouse event listeners added');
    }
    
    onMouseDown(event) {
        // Only handle left mouse button (button 0)
        if (event.button !== 0) return;
        
        this.isMouseDown = true;
        this.isDragging = false;
        
        // Only pause auto-rotation if it's currently active
        if (this.isAutoRotating) {
            this.wasAutoRotatingBeforeInteraction = true;
            this.isAutoRotating = false;
            this.userInteracting = true;
            
            // Clear any existing timeout
            if (this.interactionTimeout) {
                clearTimeout(this.interactionTimeout);
                this.interactionTimeout = null;
            }
            
            // Enable controls and update UI
            this.controls.enabled = true;
            this.toggleButton.textContent = 'Resume Rotation';
            this.toggleButton.classList.add('user-interacting');
            
            console.log('Mouse down - auto-rotation paused');
        }
    }
    
    onMouseMove(event) {
        if (this.isMouseDown) {
            this.isDragging = true;
            
            // Clear any resume timeout while actively dragging
            if (this.interactionTimeout) {
                clearTimeout(this.interactionTimeout);
                this.interactionTimeout = null;
            }
        }
    }
    
    onMouseUp(event) {
        if (event.button !== 0) return;
        
        this.isMouseDown = false;
        
        // Only handle resume if user was interacting
        if (this.userInteracting && this.wasAutoRotatingBeforeInteraction) {
            // Start timer to resume auto-rotation
            this.interactionTimeout = setTimeout(() => {
                this.userInteracting = false;
                this.isDragging = false;
                this.isAutoRotating = true;
                this.updateCurrentAngle();
                this.toggleButton.textContent = 'Pause Rotation';
                this.toggleButton.classList.remove('user-interacting');
                
                console.log('Mouse up - auto-rotation resumed after delay');
            }, this.resumeDelay);
            
            console.log('Mouse up - resume timer started');
        }
    }
    
    onMouseLeave(event) {
        // Treat mouse leave as mouse up
        if (this.isMouseDown) {
            this.onMouseUp({ button: 0 });
        }
    }
    
    onUserInteractionStart() {
        // Only handle interaction if auto-rotation is enabled
        if (!this.isAutoRotating) return;
        
        this.userInteracting = true;
        
        // Clear any existing timeout
        if (this.interactionTimeout) {
            clearTimeout(this.interactionTimeout);
            this.interactionTimeout = null;
        }
        
        // Temporarily pause auto-rotation during interaction
        this.wasAutoRotatingBeforeInteraction = this.isAutoRotating;
        this.isAutoRotating = false;
        
        // Update current position when user starts interacting
        this.updateCurrentAngle();
        
        // Enable controls for user interaction
        this.controls.enabled = true;
        
        // Update button text and visual state
        this.toggleButton.textContent = 'Resume Rotation';
        this.toggleButton.classList.add('user-interacting');
        
        console.log('User interaction started - auto-rotation paused');
    }
    
    onUserInteractionEnd() {
        // Only handle if user was actually interacting
        if (!this.userInteracting) return;
        
        console.log('User interaction ended - setting resume timer');
        
        // Set timeout to resume auto-rotation after delay
        this.interactionTimeout = setTimeout(() => {
            this.userInteracting = false;
            
                         if (this.wasAutoRotatingBeforeInteraction) {
                 // Resume auto-rotation
                 this.isAutoRotating = true;
                 this.updateCurrentAngle(); // Sync current position
                 this.toggleButton.textContent = 'Pause Rotation';
                 this.toggleButton.classList.remove('user-interacting');
                 console.log('Auto-rotation resumed after user inactivity');
             }
        }, this.resumeDelay);
    }
    
    onUserInteractionChange() {
        // Clear resume timeout on continued interaction
        if (this.userInteracting && this.interactionTimeout) {
            clearTimeout(this.interactionTimeout);
            this.interactionTimeout = null;
            console.log('User still interacting - cleared resume timer');
        }
        
        // Update current angle when user moves camera
        if (this.userInteracting) {
            this.updateCurrentAngle();
        }
    }
    
    updateCurrentAngle() {
        const dx = this.camera.position.x - this.target.x;
        const dz = this.camera.position.z - this.target.z;
        this.currentAngle = Math.atan2(dz, dx);
        this.radius = Math.sqrt(dx * dx + dz * dz);
        this.height = this.camera.position.y;
        
        console.log('Updated current angle:', this.currentAngle, 'radius:', this.radius);
    }
    
    shouldResumeAutoRotation() {
        // Only resume if auto-rotation was originally enabled before interaction
        return this.wasAutoRotatingBeforeInteraction;
    }
    
    toggleAutoRotation() {
        console.log('Toggle button clicked, current state:', this.isAutoRotating);
        
        // Clear any interaction timeout when manually toggling
        if (this.interactionTimeout) {
            clearTimeout(this.interactionTimeout);
            this.interactionTimeout = null;
        }
        
        // Reset user interaction state
        this.userInteracting = false;
        
        if (this.isAutoRotating) {
            this.pauseAutoRotation();
            this.toggleButton.textContent = 'Resume Rotation';
            console.log('Auto-rotation manually paused');
        } else {
            this.resumeAutoRotation();
            this.toggleButton.textContent = 'Pause Rotation';
            console.log('Auto-rotation manually resumed');
        }
        
        // Store the manual override state
        this.wasAutoRotatingBeforeInteraction = this.isAutoRotating;
    }
    
    pauseAutoRotation() {
        this.isAutoRotating = false;
        this.updateCurrentAngle();
        
        // Re-enable controls immediately when paused
        this.controls.enabled = true;
        
        // Remove user interaction styling if present
        this.toggleButton.classList.remove('user-interacting');
        
        console.log('Auto-rotation paused, controls enabled');
    }
    
    resumeAutoRotation() {
        this.isAutoRotating = true;
        this.updateCurrentAngle();
        console.log('Auto-rotation resumed');
    }
    
    resetCamera() {
        console.log('Resetting camera to initial position');
        
        // Animate to initial position
        this.animateToPosition(this.initialPosition, () => {
            this.currentAngle = this.initialAngle;
            this.radius = this.initialRadius;
            this.height = this.initialHeight;
            this.controls.target.copy(this.target);
            this.controls.update();
            console.log('Camera reset complete');
        });
    }
    
    animateToPosition(targetPosition, onComplete) {
        const startPosition = this.camera.position.clone();
        const duration = 1000; // 1 second
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Interpolate position
            this.camera.position.lerpVectors(startPosition, targetPosition, easeOut);
            this.camera.lookAt(this.target);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        };
        
        animate();
    }
    
    update(deltaTime) {
        // Get current time for consistent rotation speed
        const currentTime = performance.now();
        
        if (this.isAutoRotating && !this.userInteracting && !this.isMouseDown) {
            // Auto-rotation mode - disable controls to prevent conflicts
            this.controls.enabled = false;
            
            // Use deltaTime-based rotation for smooth animation
            const rotationRadians = (this.rotationSpeed * Math.PI / 180) * (deltaTime / 1000);
            this.currentAngle += rotationRadians;
            
            // Calculate new camera position using polar coordinates
            // X-Z plane rotation around Y-axis
            const x = this.target.x + Math.cos(this.currentAngle) * this.radius;
            const z = this.target.z + Math.sin(this.currentAngle) * this.radius;
            const y = this.height;
            
            // Update camera position
            this.camera.position.set(x, y, z);
            
            // Always look at the target (product center)
            this.camera.lookAt(this.target);
            
            // Debug logging every 2 seconds
            if (currentTime - this.lastTime > 2000) {
                console.log('Auto-rotating camera:', {
                    angle: (this.currentAngle * 180 / Math.PI).toFixed(1) + '°',
                    position: { x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) },
                    radius: this.radius.toFixed(2),
                    userInteracting: this.userInteracting,
                    isMouseDown: this.isMouseDown,
                    isDragging: this.isDragging
                });
                this.lastTime = currentTime;
            }
        } else {
            // Manual control mode - enable controls
            this.controls.enabled = true;
            
            // Update controls normally
            this.controls.update();
        }
    }
    
    // Method to set rotation speed
    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }
    
    // Method to set camera distance
    setRadius(radius) {
        this.radius = radius;
    }
    
    // Method to set camera height
    setHeight(height) {
        this.height = height;
    }
    
    // Method to get current state
    getState() {
        return {
            isAutoRotating: this.isAutoRotating,
            angle: this.currentAngle,
            angleDegrees: (this.currentAngle * 180 / Math.PI),
            radius: this.radius,
            height: this.height,
            userInteracting: this.userInteracting,
            isMouseDown: this.isMouseDown,
            isDragging: this.isDragging,
            target: this.target
        };
    }
    
    // Clean up method
    destroy() {
        if (this.interactionTimeout) {
            clearTimeout(this.interactionTimeout);
        }
        
        // Remove button event listeners
        this.toggleButton.removeEventListener('click', this.boundToggleRotation);
        this.resetButton.removeEventListener('click', this.boundResetCamera);
        
        // Remove controls event listeners
        this.controls.removeEventListener('start', this.boundInteractionStart);
        this.controls.removeEventListener('end', this.boundInteractionEnd);
        this.controls.removeEventListener('change', this.boundInteractionChange);
        
        // Remove mouse event listeners
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.boundMouseDown);
            this.canvas.removeEventListener('mousemove', this.boundMouseMove);
            this.canvas.removeEventListener('mouseup', this.boundMouseUp);
            this.canvas.removeEventListener('mouseleave', this.boundMouseLeave);
        }
        
        console.log('Camera animator destroyed with all event listeners removed');
    }
}

// ES6 export (already done above) 