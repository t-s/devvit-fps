import * as THREE from 'three';

export class World {
  private scene: THREE.Scene;
  private walls: THREE.Mesh[] = [];
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createGround();
    this.createWalls();
    this.createTargets();
  }
  
  public getWalls(): THREE.Mesh[] {
    return this.walls;
  }
  
  private createGround(): void {
    // Create a large flat ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    
    // Rotate the ground to be horizontal
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
  }
  
  private createWalls(): void {
    // Create some wall geometry
    const wallGeometry = new THREE.BoxGeometry(10, 5, 1);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xaaaaaa,
      roughness: 0.7,
      metalness: 0.1
    });
    
    // Create walls at different positions
    const wallConfigs = [
      { position: new THREE.Vector3(-8, 2.5, -10), rotation: new THREE.Euler(0, 0, 0) },
      { position: new THREE.Vector3(8, 2.5, -10), rotation: new THREE.Euler(0, 0, 0) },
      { position: new THREE.Vector3(0, 2.5, -15), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
      { position: new THREE.Vector3(-15, 2.5, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
      { position: new THREE.Vector3(15, 2.5, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0) }
    ];
    
    wallConfigs.forEach(config => {
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      wallMesh.position.copy(config.position);
      wallMesh.rotation.copy(config.rotation);
      
      // Set the wall's userData for collision detection
      wallMesh.userData.isWall = true;
      
      // Store wall in the walls array
      this.walls.push(wallMesh);
      
      this.scene.add(wallMesh);
    });
  }
  
  private targets: THREE.Mesh[] = [];
  
  private createTargets(): void {
    // Create target geometry
    const targetGeometry = new THREE.BoxGeometry(1, 1, 1);
    const targetMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      roughness: 0.5,
      metalness: 0.5
    });
    
    // Number of targets to create
    const targetCount = 10;
    
    // Play area boundaries
    const bounds = {
      minX: -12, maxX: 12,
      minY: 2, maxY: 5,
      minZ: -12, maxZ: -2
    };
    
    // Create random targets
    for (let i = 0; i < targetCount; i++) {
      const target = new THREE.Mesh(targetGeometry, targetMaterial);
      
      // Set a random initial position
      this.randomizeTargetPosition(target, bounds);
      
      // Check for wall collisions and reposition if needed
      let attempts = 0;
      while (this.checkTargetWallCollision(target) && attempts < 10) {
        this.randomizeTargetPosition(target, bounds);
        attempts++;
      }
      
      // Store targets in the targets array
      this.targets.push(target);
      this.scene.add(target);
    }
  }
  
  private randomizeTargetPosition(target: THREE.Mesh, bounds: any): void {
    // Generate random position within bounds
    const x = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
    const y = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
    const z = Math.random() * (bounds.maxZ - bounds.minZ) + bounds.minZ;
    
    target.position.set(x, y, z);
  }
  
  // Method to expose to other classes for respawning targets
  public respawnTarget(target: THREE.Mesh): void {
    // Play area boundaries
    const bounds = {
      minX: -12, maxX: 12,
      minY: 2, maxY: 5,
      minZ: -12, maxZ: -2
    };
    
    // Set a random position
    this.randomizeTargetPosition(target, bounds);
    
    // Check for wall collisions and reposition if needed
    let attempts = 0;
    while (this.checkTargetWallCollision(target) && attempts < 10) {
      this.randomizeTargetPosition(target, bounds);
      attempts++;
    }
  }
  
  public update(delta: number): void {
    // Move the targets up and down
    this.targets.forEach((target, index) => {
      // Store original position in case we need to revert due to collision
      const originalPosition = target.position.clone();
      
      // Different oscillation speeds for each target
      const speed = 0.5 + (index * 0.2);
      target.position.y += Math.sin(Date.now() * 0.001 * speed) * 0.02;
      
      // Ensure targets never touch the floor - keep them at least 1.5 units above
      if (target.position.y - 0.5 < 1.5) {
        target.position.y = 2.0;
      }
      
      // Check for wall collisions after position change
      if (this.checkTargetWallCollision(target)) {
        // If collision detected, revert to original position
        target.position.copy(originalPosition);
      }
      
      // Add some rotation
      target.rotation.x += delta * 0.5;
      target.rotation.y += delta * 0.3;
    });
  }
  
  private checkTargetWallCollision(target: THREE.Mesh): boolean {
    // The size of target cubes (half-width)
    const targetRadius = 0.5;
    
    // Check collision with each wall
    for (const wall of this.walls) {
      // Calculate distance to wall
      const distance = target.position.distanceTo(wall.position);
      
      // If close enough, do more precise collision detection
      if (distance < 8) { // Conservative estimate to check nearby walls
        // Cast rays in 6 directions (along each axis)
        const rayDirections = [
          new THREE.Vector3(1, 0, 0),   // Right
          new THREE.Vector3(-1, 0, 0),  // Left
          new THREE.Vector3(0, 1, 0),   // Up
          new THREE.Vector3(0, -1, 0),  // Down
          new THREE.Vector3(0, 0, 1),   // Forward
          new THREE.Vector3(0, 0, -1)   // Backward
        ];
        
        for (const dir of rayDirections) {
          this.raycaster.set(target.position, dir);
          const intersects = this.raycaster.intersectObject(wall);
          
          if (intersects.length > 0 && intersects[0].distance < targetRadius + 0.1) {
            return true; // Collision detected
          }
        }
      }
    }
    
    return false; // No collision
  }
}