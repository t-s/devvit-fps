import * as THREE from 'three';

export class World {
  private scene: THREE.Scene;
  private walls: THREE.Mesh[] = [];
  
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
  
  private createTargets(): void {
    // Create target geometry
    const targetGeometry = new THREE.BoxGeometry(1, 1, 1);
    const targetMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      roughness: 0.5,
      metalness: 0.5
    });
    
    // Create several targets at different positions
    const targetPositions = [
      new THREE.Vector3(-5, 1, -8),
      new THREE.Vector3(5, 1, -8),
      new THREE.Vector3(0, 3, -12),
      new THREE.Vector3(-10, 2, -5),
      new THREE.Vector3(10, 2, -5)
    ];
    
    targetPositions.forEach(position => {
      const target = new THREE.Mesh(targetGeometry, targetMaterial);
      target.position.copy(position);
      this.scene.add(target);
    });
  }
}