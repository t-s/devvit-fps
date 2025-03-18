import * as THREE from 'three';

export class Weapon {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private raycaster: THREE.Raycaster;
  private shootCooldown: number = 0;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    
    // Add event listener for shooting
    document.addEventListener('mousedown', this.shoot.bind(this));
    
    // Create crosshair
    this.createCrosshair();
  }
  
  private createCrosshair(): void {
    const crosshairElement = document.createElement('div');
    crosshairElement.style.position = 'absolute';
    crosshairElement.style.top = '50%';
    crosshairElement.style.left = '50%';
    crosshairElement.style.width = '20px';
    crosshairElement.style.height = '20px';
    crosshairElement.style.transform = 'translate(-50%, -50%)';
    crosshairElement.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="2" fill="white"/>
        <line x1="10" y1="0" x2="10" y2="8" stroke="white" stroke-width="1"/>
        <line x1="10" y1="12" x2="10" y2="20" stroke="white" stroke-width="1"/>
        <line x1="0" y1="10" x2="8" y2="10" stroke="white" stroke-width="1"/>
        <line x1="12" y1="10" x2="20" y2="10" stroke="white" stroke-width="1"/>
      </svg>
    `;
    document.body.appendChild(crosshairElement);
  }
  
  private shoot(): void {
    // Check for cooldown
    if (this.shootCooldown > 0) return;
    
    // Set cooldown
    this.shootCooldown = 0.5; // 500ms cooldown
    
    // Create muzzle flash effect
    this.createMuzzleFlash();
    
    // Set raycaster from camera
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    
    // Get all intersected objects
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    
    // Check if we hit anything
    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      
      // If hit a target (red box), make it disappear
      if (hitObject instanceof THREE.Mesh && 
          hitObject.material instanceof THREE.MeshStandardMaterial && 
          hitObject.material.color.getHex() === 0xff0000) {
        this.scene.remove(hitObject);
      }
    }
  }
  
  private createMuzzleFlash(): void {
    // Create light flash at camera position
    const flash = new THREE.PointLight(0xffffaa, 30, 3);
    
    // Position it slightly in front of the camera
    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);
    const flashPosition = new THREE.Vector3().copy(this.camera.position).add(
      cameraDirection.multiplyScalar(2)
    );
    flash.position.copy(flashPosition);
    
    // Add to scene
    this.scene.add(flash);
    
    // Remove after short duration
    setTimeout(() => {
      this.scene.remove(flash);
    }, 50);
  }
  
  public update(delta: number): void {
    // Update cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }
  }
}