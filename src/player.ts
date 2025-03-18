import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { Vector3, Mesh, Raycaster, Object3D } from 'three';

export class Player {
  private controls: PointerLockControls;
  private moveForward: boolean = false;
  private moveBackward: boolean = false;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;
  private canJump: boolean = false;
  
  private velocity: Vector3 = new Vector3();
  private direction: Vector3 = new Vector3();
  private raycaster: Raycaster = new Raycaster();
  
  private movementSpeed: number = 10.0;
  private jumpHeight: number = 20.0;
  private playerRadius: number = 0.5; // Collision radius
  
  private walls: Mesh[] = [];
  
  // Mobile controls
  private isMobile: boolean = false;
  private joystickActive: boolean = false;
  private joystickPosition = { x: 0, y: 0 };
  private joystickStartPosition = { x: 0, y: 0 };
  private jumpButton: HTMLElement | null = null;
  private shootButton: HTMLElement | null = null;
  
  constructor(controls: PointerLockControls) {
    this.controls = controls;
    
    // Start position
    this.controls.getObject().position.set(0, 2, 0);
    
    // Check if device is mobile
    this.isMobile = this.checkMobile();
    
    // Add event listeners for movement
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Add mobile controls if on mobile device
    if (this.isMobile) {
      this.createMobileControls();
    }
  }
  
  private checkMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  private createMobileControls(): void {
    // Create container for mobile controls
    const mobileControlsContainer = document.createElement('div');
    mobileControlsContainer.style.position = 'absolute';
    mobileControlsContainer.style.bottom = '20px';
    mobileControlsContainer.style.left = '0';
    mobileControlsContainer.style.width = '100%';
    mobileControlsContainer.style.height = '180px';
    mobileControlsContainer.style.display = 'flex';
    mobileControlsContainer.style.justifyContent = 'space-between';
    mobileControlsContainer.style.pointerEvents = 'none';
    
    // Create joystick container
    const joystickContainer = document.createElement('div');
    joystickContainer.style.position = 'relative';
    joystickContainer.style.width = '120px';
    joystickContainer.style.height = '120px';
    joystickContainer.style.marginLeft = '20px';
    joystickContainer.style.borderRadius = '60px';
    joystickContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    joystickContainer.style.pointerEvents = 'auto';
    
    // Create joystick
    const joystick = document.createElement('div');
    joystick.style.position = 'absolute';
    joystick.style.width = '60px';
    joystick.style.height = '60px';
    joystick.style.borderRadius = '30px';
    joystick.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    joystick.style.top = '30px';
    joystick.style.left = '30px';
    joystick.style.pointerEvents = 'none';
    
    // Add joystick to container
    joystickContainer.appendChild(joystick);
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.marginRight = '20px';
    buttonContainer.style.gap = '10px';
    
    // Create jump button
    this.jumpButton = document.createElement('div');
    this.jumpButton.style.width = '70px';
    this.jumpButton.style.height = '70px';
    this.jumpButton.style.borderRadius = '35px';
    this.jumpButton.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
    this.jumpButton.style.display = 'flex';
    this.jumpButton.style.justifyContent = 'center';
    this.jumpButton.style.alignItems = 'center';
    this.jumpButton.style.pointerEvents = 'auto';
    this.jumpButton.innerHTML = '<span style="color: white; font-weight: bold;">JUMP</span>';
    
    // Create shoot button
    this.shootButton = document.createElement('div');
    this.shootButton.style.width = '70px';
    this.shootButton.style.height = '70px';
    this.shootButton.style.borderRadius = '35px';
    this.shootButton.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    this.shootButton.style.display = 'flex';
    this.shootButton.style.justifyContent = 'center';
    this.shootButton.style.alignItems = 'center';
    this.shootButton.style.pointerEvents = 'auto';
    this.shootButton.innerHTML = '<span style="color: white; font-weight: bold;">FIRE</span>';
    
    // Add buttons to container
    buttonContainer.appendChild(this.jumpButton);
    buttonContainer.appendChild(this.shootButton);
    
    // Add containers to main container
    mobileControlsContainer.appendChild(joystickContainer);
    mobileControlsContainer.appendChild(buttonContainer);
    
    // Add main container to document
    document.body.appendChild(mobileControlsContainer);
    
    // Add event listeners for joystick
    joystickContainer.addEventListener('touchstart', (event) => {
      this.joystickActive = true;
      const touch = event.touches[0];
      const rect = joystickContainer.getBoundingClientRect();
      this.joystickStartPosition = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
      event.preventDefault();
    });
    
    document.addEventListener('touchmove', (event) => {
      if (!this.joystickActive) return;
      const touch = event.touches[0];
      const rect = joystickContainer.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Calculate joystick position
      const centerX = joystickContainer.clientWidth / 2;
      const centerY = joystickContainer.clientHeight / 2;
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      
      // Calculate distance from center
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = joystickContainer.clientWidth / 2;
      
      // Normalize distance to 1
      const normalizedDistance = Math.min(distance / maxDistance, 1);
      
      // Calculate angle
      const angle = Math.atan2(deltaY, deltaX);
      
      // Calculate new position for joystick
      const newX = centerX + Math.cos(angle) * normalizedDistance * maxDistance;
      const newY = centerY + Math.sin(angle) * normalizedDistance * maxDistance;
      
      // Update joystick position
      joystick.style.left = `${newX - joystick.clientWidth / 2}px`;
      joystick.style.top = `${newY - joystick.clientHeight / 2}px`;
      
      // Update joystick position
      this.joystickPosition = {
        x: deltaX / maxDistance,
        y: deltaY / maxDistance
      };
      
      // Update movement
      this.moveForward = this.joystickPosition.y < -0.3;
      this.moveBackward = this.joystickPosition.y > 0.3;
      this.moveLeft = this.joystickPosition.x < -0.3;
      this.moveRight = this.joystickPosition.x > 0.3;
      
      event.preventDefault();
    });
    
    document.addEventListener('touchend', (event) => {
      if (this.joystickActive) {
        this.joystickActive = false;
        joystick.style.left = '30px';
        joystick.style.top = '30px';
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
      }
    });
    
    // Add event listener for jump button
    this.jumpButton.addEventListener('touchstart', (event) => {
      if (this.canJump === true) {
        this.velocity.y += this.jumpHeight;
      }
      this.canJump = false;
      event.preventDefault();
    });
    
    // Add touch swipe controls for camera rotation
    let lastX = 0;
    let lastY = 0;
    let isRotating = false;
    
    // Set up touch events for camera rotation (right side of screen)
    document.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      // Only handle touches on the right half of the screen for look controls
      if (touch.clientX > window.innerWidth / 2) {
        isRotating = true;
        lastX = touch.clientX;
        lastY = touch.clientY;
      }
    });
    
    document.addEventListener('touchmove', (event) => {
      if (!isRotating) return;
      
      const touch = event.touches[0];
      // Only handle touches on the right half of the screen for look controls
      if (touch.clientX > window.innerWidth / 2) {
        // Calculate delta
        const deltaX = touch.clientX - lastX;
        const deltaY = touch.clientY - lastY;
        
        // Rotate camera (similar to mouse rotation in PointerLockControls)
        this.controls.getObject().rotation.y -= deltaX * 0.01;
        
        // Store current position
        lastX = touch.clientX;
        lastY = touch.clientY;
        
        event.preventDefault();
      }
    });
    
    document.addEventListener('touchend', (event) => {
      isRotating = false;
    });
  }
  
  public setWalls(walls: Mesh[]): void {
    this.walls = walls;
  }
  
  private onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
        
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
        
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
        
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
        
      case 'Space':
        if (this.canJump === true) {
          this.velocity.y += this.jumpHeight;
        }
        this.canJump = false;
        break;
    }
  }
  
  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
        
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
        
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
        
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }
  
  public update(delta: number): void {
    if (this.controls.isLocked === true) {
      // Apply gravity
      this.velocity.y -= 9.8 * delta;
      
      // Get movement direction
      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize();
      
      // Move in the direction relative to where the player is facing
      if (this.moveForward || this.moveBackward) {
        this.velocity.z = -this.direction.z * this.movementSpeed;
      } else {
        this.velocity.z = 0;
      }
      
      if (this.moveLeft || this.moveRight) {
        this.velocity.x = -this.direction.x * this.movementSpeed;
      } else {
        this.velocity.x = 0;
      }
      
      // Calculate new position without applying it yet
      const cameraPosOld = this.controls.getObject().position.clone();
      const potentialMoveX = -this.velocity.x * delta;
      const potentialMoveZ = -this.velocity.z * delta;
      
      // Check for wall collisions on X axis
      if (potentialMoveX !== 0) {
        const cameraPosNew = cameraPosOld.clone();
        this.controls.getObject().position.copy(cameraPosNew);
        this.controls.moveRight(potentialMoveX);
        
        // If collision detected, revert position
        if (this.checkWallCollisions()) {
          this.controls.getObject().position.copy(cameraPosOld);
        }
      }
      
      // Check for wall collisions on Z axis
      if (potentialMoveZ !== 0) {
        const cameraPosNew = this.controls.getObject().position.clone();
        this.controls.getObject().position.copy(cameraPosNew);
        this.controls.moveForward(potentialMoveZ);
        
        // If collision detected, revert position
        if (this.checkWallCollisions()) {
          this.controls.getObject().position.copy(cameraPosOld);
        }
      }
      
      // Apply gravity
      this.controls.getObject().position.y += this.velocity.y * delta;
      
      // Simple ground collision detection
      if (this.controls.getObject().position.y < 2) {
        this.velocity.y = 0;
        this.controls.getObject().position.y = 2;
        this.canJump = true;
      }
    }
  }
  
  private checkWallCollisions(): boolean {
    if (this.walls.length === 0) return false;
    
    const playerPosition = this.controls.getObject().position.clone();
    
    // Check collision with each wall
    for (const wall of this.walls) {
      // Calculate distance to wall
      const wallPos = wall.position.clone();
      const distance = playerPosition.distanceTo(wallPos);
      
      // If close enough, do more precise collision detection
      if (distance < 6) { // 6 is just a rough estimate of maximum wall size + player radius
        // Cast rays in several directions around the player
        const rayDirections = [
          new Vector3(1, 0, 0),    // Right
          new Vector3(-1, 0, 0),   // Left
          new Vector3(0, 0, 1),    // Forward
          new Vector3(0, 0, -1),   // Backward
          new Vector3(0.7, 0, 0.7), // Diagonal forward-right
          new Vector3(0.7, 0, -0.7), // Diagonal backward-right
          new Vector3(-0.7, 0, 0.7), // Diagonal forward-left
          new Vector3(-0.7, 0, -0.7) // Diagonal backward-left
        ];
        
        for (const dir of rayDirections) {
          this.raycaster.set(playerPosition, dir.normalize());
          const intersects = this.raycaster.intersectObject(wall);
          
          if (intersects.length > 0 && intersects[0].distance < this.playerRadius) {
            return true; // Collision detected
          }
        }
      }
    }
    
    return false; // No collision
  }
}