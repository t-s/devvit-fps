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
  
  constructor(controls: PointerLockControls) {
    this.controls = controls;
    
    // Start position
    this.controls.getObject().position.set(0, 2, 0);
    
    // Add event listeners for movement
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
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