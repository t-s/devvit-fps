import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { Player } from './player';
import { World } from './world';
import { Weapon } from './weapon';

class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: PointerLockControls;
  private player: Player;
  private world: World;
  private weapon: Weapon;
  private clock: THREE.Clock;

  constructor() {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    
    // Initialize controls
    this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
    this.scene.add(this.controls.getObject());
    
    // Add click listener to lock controls
    document.addEventListener('click', () => {
      this.controls.lock();
    });
    
    // Initialize world first
    this.world = new World(this.scene);
    
    // Initialize player and give it wall references
    this.player = new Player(this.controls);
    this.player.setWalls(this.world.getWalls());
    
    // Initialize weapon
    this.weapon = new Weapon(this.scene, this.camera);
    
    // Set up lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    // Initialize clock for frame-rate independent movement
    this.clock = new THREE.Clock();
    
    // Add event listener for window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Start game loop
    this.animate();
  }
  
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    
    const delta = this.clock.getDelta();
    
    // Update player
    this.player.update(delta);
    
    // Update weapon
    this.weapon.update(delta);
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Start the game when the window loads
window.onload = () => {
  new Game();
};