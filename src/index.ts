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
    
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      // Add click listener to lock controls on desktop
      document.addEventListener('click', () => {
        this.controls.lock();
      });
    } else {
      // On mobile, we'll create a start button and then remove it
      const startButton = document.createElement('div');
      startButton.style.position = 'absolute';
      startButton.style.top = '50%';
      startButton.style.left = '50%';
      startButton.style.transform = 'translate(-50%, -50%)';
      startButton.style.padding = '20px 40px';
      startButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      startButton.style.color = 'white';
      startButton.style.fontSize = '24px';
      startButton.style.fontWeight = 'bold';
      startButton.style.borderRadius = '10px';
      startButton.style.cursor = 'pointer';
      startButton.style.zIndex = '1000';
      startButton.textContent = 'TAP TO START';
      
      document.body.appendChild(startButton);
      
      startButton.addEventListener('touchstart', (event) => {
        event.preventDefault();
        startButton.style.display = 'none';
        // Force controls to be active on mobile
        this.controls.isLocked = true;
      });
    }
    
    // Initialize world first
    this.world = new World(this.scene);
    
    // Initialize player and give it wall references
    this.player = new Player(this.controls);
    this.player.setWalls(this.world.getWalls());
    
    // Initialize weapon and give it a reference to the world
    this.weapon = new Weapon(this.scene, this.camera, this.world);
    
    // Connect weapon and player for mobile controls
    this.weapon.setPlayer(this.player);
    
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
    
    // Update world (for moving targets)
    this.world.update(delta);
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Start the game when the window loads
window.onload = () => {
  new Game();
};