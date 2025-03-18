import * as THREE from 'three';
import { World } from './world';
import { Player } from './player';

export class Weapon {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private world: World;
  private player: Player | null = null;
  private raycaster: THREE.Raycaster;
  private shootCooldown: number = 0;
  private isMobile: boolean = false;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, world: World) {
    this.scene = scene;
    this.camera = camera;
    this.world = world;
    this.raycaster = new THREE.Raycaster();
    
    // Check if device is mobile
    this.isMobile = this.checkMobile();
    
    // Add event listener for shooting (only for desktop)
    if (!this.isMobile) {
      document.addEventListener('mousedown', this.shoot.bind(this));
    }
    
    // Create crosshair
    this.createCrosshair();
  }
  
  public setPlayer(player: Player): void {
    this.player = player;
    
    // If we're on mobile, get access to the shoot button
    if (this.isMobile && player) {
      const shootButton = document.querySelector('div[style*="background-color: rgba(255, 0, 0"]');
      if (shootButton) {
        shootButton.addEventListener('touchstart', (event) => {
          this.shoot();
          event.preventDefault();
        });
      }
    }
  }
  
  private checkMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
      
      // If hit a target (red box), give it a new random position
      if (hitObject instanceof THREE.Mesh && 
          hitObject.material instanceof THREE.MeshStandardMaterial && 
          hitObject.material.color.getHex() === 0xff0000) {
        
        // Respawn target at a random position
        this.world.respawnTarget(hitObject);
        
        // Add a small animation to make the hit visible
        hitObject.scale.set(0.5, 0.5, 0.5); // Shrink it
        
        // Animate back to normal size
        setTimeout(() => {
          hitObject.scale.set(1, 1, 1);
        }, 200);
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