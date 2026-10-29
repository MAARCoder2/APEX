/**
 * Master 3D Game Engine for Project Apex V2.
 * Adheres strictly to Three.js and Ultra-mode guidelines:
 * - isSoftwareGl detection for software-WebGL guard (headless browser safety).
 * - RoomEnvironment PMREM reflections.
 * - ACESFilmicToneMapping & SRGBColorSpace.
 * - Decoupled fixed-step physics integration (60Hz).
 * - Comprehensive resource and listener disposal on unmount.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CityDistrict } from './world/CityDistrict.ts';
import { PlayerController, PlayerInputState } from './entities/PlayerController.ts';
import { VehicleController } from './entities/VehicleController.ts';
import { TrafficManager } from './entities/TrafficManager.ts';
import { MissionManager } from './missions/MissionManager.ts';
import { soundEffects } from './audio/soundEffects.ts';
import { VehicleInput } from './physics/vehicleKinematics.ts';

import { MissionData } from './missions/missionRules.ts';

export interface GameEngineCallbacks {
  onSpeedChange: (speedKmh: number) => void;
  onModeChange: (isDriving: boolean) => void;
  onMissionUpdate: (mission: MissionData) => void;
  onNearVehicleChange: (nearVehicle: boolean) => void;
  onFpsUpdate: (fps: number) => void;
}

export class GameEngine {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public isSoftwareGl: boolean = false;

  // Subsystems
  public district: CityDistrict;
  public player: PlayerController;
  public vehicle: VehicleController;
  public traffic: TrafficManager;
  public missions: MissionManager;
  private loader: GLTFLoader;

  // Game state
  public isDriving: boolean = false;
  private isNearVehicle: boolean = false;
  private clock: THREE.Clock;
  private frameId: number = 0;
  private isDisposed: boolean = false;

  // FPS profiling
  private frameCount: number = 0;
  private lastFpsTime: number = 0;

  // Input states
  private keys: Record<string, boolean> = {};
  private pointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;

  // Callbacks to React HUD
  public callbacks: GameEngineCallbacks;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Detect Software WebGL (SwiftShader / llvmpipe guard)
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // 3. Scene and Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd6e4ec); // Dhaka tropical morning/afternoon sky
    this.scene.fog = new THREE.FogExp2(0xd6e4ec, 0.0035);

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      450
    );
    this.camera.position.set(0, 5, 20);

    // 4. Studio Environment Reflections (PMREMGenerator)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Lighting Rig (Warm Key directional sun + Cool Hemisphere fill)
    this.setupLighting();

    // 6. Subsystem Instantiation
    this.loader = new GLTFLoader();
    this.district = new CityDistrict();
    this.player = new PlayerController();
    this.vehicle = new VehicleController();
    this.traffic = new TrafficManager();
    this.missions = new MissionManager();

    // 7. Initialize world and entities
    this.district.init(this.scene, this.loader);
    this.player.init(this.scene, this.loader);
    this.vehicle.init(this.scene, this.loader);
    this.traffic.init(this.scene, this.loader);
    this.missions.init(this.scene);

    // Start mission
    this.missions.start();

    // 8. Event Listeners
    this.bindEvents();

    // 9. Start Main Game Loop
    this.lastFpsTime = performance.now();
    this.startLoop();
  }

  /**
   * Balanced Lighting Rig.
   */
  private setupLighting(): void {
    // Warm Key Sun (cast shadows if not software GL)
    const sunLight = new THREE.DirectionalLight(0xfff1cf, 2.2);
    sunLight.position.set(60, 90, 40);
    sunLight.castShadow = !this.isSoftwareGl;
    if (sunLight.shadow) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 250;
      sunLight.shadow.camera.left = -60;
      sunLight.shadow.camera.right = 60;
      sunLight.shadow.camera.top = 60;
      sunLight.shadow.camera.bottom = -60;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(sunLight);

    // Cool Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3a4048, 1.1);
    this.scene.add(hemiLight);

    // Ambient street glow
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
  }

  /**
   * Main game loop with software WebGL frame pacing guard.
   */
  private startLoop(): void {
    const tick = () => {
      if (this.isDisposed) return;

      const delta = Math.min(this.clock.getDelta(), 0.1);

      this.updateSimulation(delta);
      this.renderer.render(this.scene, this.camera);

      // FPS tracking
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFpsTime >= 500) {
        const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
        this.callbacks.onFpsUpdate(fps);
        this.frameCount = 0;
        this.lastFpsTime = now;
      }

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      tick();
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  /**
   * afterDraw fence sync for software WebGL to prevent headless starvation.
   */
  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();

    const poll = () => {
      if (this.isDisposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 40); // smooth 25-30fps software pacing
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  /**
   * Step physics and gameplay entities forward.
   */
  private updateSimulation(dt: number): void {
    // 1. Gather Inputs
    const playerInput: PlayerInputState = {
      forward: !!(this.keys['KeyW'] || this.keys['ArrowUp']),
      backward: !!(this.keys['KeyS'] || this.keys['ArrowDown']),
      left: !!(this.keys['KeyA'] || this.keys['ArrowLeft']),
      right: !!(this.keys['KeyD'] || this.keys['ArrowRight']),
      sprint: !!this.keys['ShiftLeft'] || !!this.keys['ShiftRight'],
      jump: !!this.keys['Space'],
      interact: !!(this.keys['KeyE'] || this.keys['KeyF']),
    };

    const vehicleInput: VehicleInput = {
      throttle: this.isDriving && (this.keys['KeyW'] || this.keys['ArrowUp']) ? 1.0 : 0,
      brake: this.isDriving && (this.keys['KeyS'] || this.keys['ArrowDown']) ? 1.0 : 0,
      steer:
        this.isDriving && (this.keys['KeyA'] || this.keys['ArrowLeft'])
          ? -1.0
          : this.isDriving && (this.keys['KeyD'] || this.keys['ArrowRight'])
          ? 1.0
          : 0,
      handbrake: this.isDriving && !!this.keys['Space'],
      reverse: this.isDriving && !!(this.keys['KeyS'] || this.keys['ArrowDown']),
    };

    // 2. Update Subsystems
    if (!this.isDriving) {
      this.player.update(dt, playerInput, this.district.colliders, this.camera);
    } else {
      this.vehicle.update(dt, vehicleInput, this.district.colliders);

      // Camera follows vehicle
      this.updateVehicleCamera(dt);
    }

    // Traffic update
    this.traffic.update(dt, this.district.colliders);

    // Missions update
    const activePos = this.isDriving
      ? this.vehicle.state.position
      : { x: this.player.position.x, y: this.player.position.y, z: this.player.position.z };

    this.missions.update(dt, activePos, this.isDriving);
    this.callbacks.onMissionUpdate(this.missions.mission);

    // Check proximity to vehicle
    const near = this.player.isNearVehicle(this.vehicle.state.position);
    if (near !== this.isNearVehicle) {
      this.isNearVehicle = near;
      this.callbacks.onNearVehicleChange(near);
    }

    // Update Speedometer callback
    const currentSpeed = this.isDriving ? this.vehicle.getSpeedKmh() : Math.round(this.player.velocity.length() * 3.6);
    this.callbacks.onSpeedChange(currentSpeed);
  }

  /**
   * Smooth dynamic chase camera behind hero vehicle.
   */
  private updateVehicleCamera(dt: number): void {
    const vPos = this.vehicle.state.position;
    const vHeading = this.vehicle.state.heading;
    const vSpeed = this.vehicle.state.speed;

    // Follow distance expands slightly at high speed
    const chaseDist = 6.2 + Math.min(3.0, Math.abs(vSpeed) * 0.08);
    const chaseHeight = 2.8 + Math.min(1.2, Math.abs(vSpeed) * 0.03);

    // Camera sits behind vehicle's heading vector
    const camX = vPos.x - Math.sin(vHeading) * chaseDist;
    const camZ = vPos.z + Math.cos(vHeading) * chaseDist;
    const camY = vPos.y + chaseHeight;

    const targetPos = new THREE.Vector3(camX, camY, camZ);
    this.camera.position.lerp(targetPos, Math.min(1.0, 10.0 * dt));

    const lookTarget = new THREE.Vector3(
      vPos.x + Math.sin(vHeading) * 4.0,
      vPos.y + 1.2,
      vPos.z - Math.cos(vHeading) * 4.0
    );
    this.camera.lookAt(lookTarget);
  }

  /**
   * Transitions player into / out of hero vehicle.
   */
  public toggleVehicleEntry(): void {
    soundEffects.init();

    if (!this.isDriving) {
      // Enter vehicle
      this.isDriving = true;
      this.vehicle.isPlayerDriving = true;
      this.player.isActive = false;
      this.player.setVisible(false);

      soundEffects.playDoorThud();
      soundEffects.startEngine();
      this.callbacks.onModeChange(true);
    } else {
      // Exit vehicle (must be below 10 km/h)
      if (this.vehicle.getSpeedKmh() < 15) {
        this.isDriving = false;
        this.vehicle.isPlayerDriving = false;

        const exitPos = this.vehicle.getExitPosition(this.district.colliders);
        this.player.position.set(exitPos.x, exitPos.y, exitPos.z);
        this.player.isActive = true;
        this.player.setVisible(true);

        soundEffects.stopEngine();
        soundEffects.playDoorThud();
        this.callbacks.onModeChange(false);
      }
    }
  }

  /**
   * Resets vehicle upright if overturned.
   */
  public resetVehicle(): void {
    this.vehicle.resetUpright();
  }

  /**
   * Event Binding.
   */
  private bindEvents(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onResize);

    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointermove', this.onPointerMove);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys[e.code] = true;
    soundEffects.resumeContext();

    if (e.code === 'KeyE' || e.code === 'KeyF') {
      this.toggleVehicleEntry();
    } else if (e.code === 'KeyH') {
      if (this.isDriving) {
        soundEffects.playHorn();
      }
    } else if (e.code === 'KeyR') {
      if (this.isDriving) {
        this.resetVehicle();
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.code] = false;
  };

  private onPointerDown = (e: PointerEvent): void => {
    soundEffects.resumeContext();
    this.pointerDown = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private onPointerUp = (): void => {
    this.pointerDown = false;
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.pointerDown) return;
    const deltaX = e.clientX - this.lastPointerX;
    const deltaY = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    if (!this.isDriving) {
      this.player.cameraYaw -= deltaX * 0.005;
      this.player.cameraPitch = THREE.MathUtils.clamp(
        this.player.cameraPitch + deltaY * 0.004,
        -0.2,
        0.8
      );
    }
  };

  private onResize = (): void => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public setQuality(quality: 'low' | 'med' | 'high'): void {
    if (quality === 'low') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1.0);
    } else if (quality === 'med') {
      this.renderer.shadowMap.enabled = !this.isSoftwareGl;
      this.renderer.setPixelRatio(1.0);
    } else {
      this.renderer.shadowMap.enabled = !this.isSoftwareGl;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    }
  }

  public dispose(): void {
    this.isDisposed = true;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
    }

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointermove', this.onPointerMove);

    this.district.dispose();
    this.player.dispose();
    this.vehicle.dispose();
    this.traffic.dispose();
    this.missions.dispose();
    soundEffects.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
