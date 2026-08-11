import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CelestialInfo, SimulationPhase } from '../types';
import { AVAILABLE_HEIGHTS } from '../lib/physics';
import { RotateCcw, Compass } from 'lucide-react';

interface ThreeTowerCanvasProps {
  currentHeight: number; // Selected height (10, 20, 30, 40)
  currentAltitude: number; // Live altitude during fall (0 to currentHeight)
  phase: SimulationPhase;
  celestial: CelestialInfo;
  reducedMotion?: boolean;
  interactiveCamera?: boolean;
}

export const ThreeTowerCanvas: React.FC<ThreeTowerCanvasProps> = ({
  currentHeight,
  currentAltitude,
  phase,
  celestial,
  reducedMotion = false,
  interactiveCamera = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const capsuleGroupRef = useRef<THREE.Group | null>(null);
  const towerGroupRef = useRef<THREE.Group | null>(null);
  const brakeZoneGroupRef = useRef<THREE.Group | null>(null);
  const brakeCoilsRef = useRef<THREE.Mesh[]>([]);
  const fieldRingsRef = useRef<THREE.Mesh[]>([]);
  const brakeLightRef = useRef<THREE.PointLight | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const statusLedRef = useRef<THREE.Mesh | null>(null);
  const trailMeshRef = useRef<THREE.Mesh | null>(null);
  const markerLedsRef = useRef<{ height: number; mesh: THREE.Mesh }[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Dynamic theme refs & materials for switching without full scene rebuild
  const isLightModeRef = useRef<boolean>(false);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const pillarMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const trussMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Default camera angle state
  const defaultCameraState = { azimuth: Math.PI / 4, elevation: 0.28, distance: 38 };
  const cameraAngleRef = useRef({ ...defaultCameraState });
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  const resetCameraView = () => {
    cameraAngleRef.current = { ...defaultCameraState };
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const canvasTest = document.createElement('canvas');
      const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Detect theme mode from HTML root element
    const checkIsLight = () => document.documentElement.getAttribute('data-theme') === 'light';
    isLightModeRef.current = checkIsLight();

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Theme-dependent colors generator
    const getThemeColors = (isLight: boolean) => {
      let skyHex = isLight ? 0xeef2f6 : 0x070f1a;
      let fogDensity = isLight ? 0.007 : 0.011;

      // Celestial tinting
      if (celestial.id === 'moon') {
        skyHex = isLight ? 0xe2e8f0 : 0x050a14;
      } else if (celestial.id === 'mars') {
        skyHex = isLight ? 0xffedd5 : 0x180b06;
      } else if (celestial.id === 'jupiter') {
        skyHex = isLight ? 0xf3e8ff : 0x12071f;
      }

      return { skyHex, fogDensity };
    };

    const initialThemeColors = getThemeColors(isLightModeRef.current);
    scene.background = new THREE.Color(initialThemeColors.skyHex);
    scene.fog = new THREE.FogExp2(initialThemeColors.skyHex, initialThemeColors.fogDensity);

    // 2. Camera setup
    const isMobile = width < 640;
    const initialDistance = isMobile ? 48 : 38;
    defaultCameraState.distance = initialDistance;
    cameraAngleRef.current.distance = initialDistance;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lights Setup (Theme Aware - Doubled Intensities for Bright Clarity)
    const ambLight = new THREE.AmbientLight(
      isLightModeRef.current ? 0xffffff : 0xcbd5e1,
      isLightModeRef.current ? 1.6 : 1.3
    );
    ambientLightRef.current = ambLight;
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(
      isLightModeRef.current ? 0xffffff : 0x7dd3fc,
      isLightModeRef.current ? 2.8 : 2.4
    );
    dirLight.position.set(32, 68, 36);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    dirLightRef.current = dirLight;
    scene.add(dirLight);

    // Secondary rim fill light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, isLightModeRef.current ? 1.2 : 1.6);
    rimLight.position.set(-30, 40, -30);
    scene.add(rimLight);

    // Top Shaft Spotlight pointing directly down the drop shaft
    const shaftSpotLight = new THREE.SpotLight(
      isLightModeRef.current ? 0x0284c7 : 0x38bdf8,
      isLightModeRef.current ? 8.0 : 10.0,
      75,
      Math.PI / 6,
      0.3,
      1.0
    );
    shaftSpotLight.position.set(0, 50, 0);
    const shaftTarget = new THREE.Object3D();
    shaftTarget.position.set(0, 0, 0);
    scene.add(shaftTarget);
    shaftSpotLight.target = shaftTarget;
    shaftSpotLight.castShadow = true;
    scene.add(shaftSpotLight);

    // Dedicated Magnetic Braking Point Light (Violet / Amber Aura)
    const brakeLight = new THREE.PointLight(0xa855f7, 0, 28);
    brakeLight.position.set(0, currentHeight * 0.12, 0);
    brakeLightRef.current = brakeLight;
    scene.add(brakeLight);

    // 5. Ground / Base Pad
    const groundGeo = new THREE.CylinderGeometry(22, 24, 2, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isLightModeRef.current ? 0xcbd5e1 : 0x0f172a,
      roughness: 0.3,
      metalness: 0.7,
    });
    groundMeshRef.current = new THREE.Mesh(groundGeo, groundMat);
    groundMeshRef.current.position.y = -1;
    groundMeshRef.current.receiveShadow = true;
    scene.add(groundMeshRef.current);

    // Outer Glowing Ring on Base Pad
    const padRingGeo = new THREE.RingGeometry(13.5, 14.2, 64);
    const padRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(celestial.color),
      side: THREE.DoubleSide,
    });
    const padRing = new THREE.Mesh(padRingGeo, padRingMat);
    padRing.rotation.x = Math.PI / 2;
    padRing.position.y = 0.03;
    scene.add(padRing);

    // Base Grid
    const gridHelper = new THREE.GridHelper(
      90,
      45,
      isLightModeRef.current ? 0x0284c7 : 0x38bdf8,
      isLightModeRef.current ? 0x94a3b8 : 0x1e293b
    );
    gridHelper.position.y = 0.02;
    gridHelperRef.current = gridHelper;
    scene.add(gridHelper);

    // Pneumatic Buffer Shock Absorbers at Base
    const bufferGeo = new THREE.CylinderGeometry(0.85, 0.95, 1.8, 16);
    const bufferMat = new THREE.MeshStandardMaterial({
      color: isLightModeRef.current ? 0x475569 : 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    });
    [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].forEach(([x, z]) => {
      const buffer = new THREE.Mesh(bufferGeo, bufferMat);
      buffer.position.set(x, 0.9, z);
      scene.add(buffer);
    });

    // 6. Build 3D Open Cylindrical Drop Tower Structure
    const towerGroup = new THREE.Group();
    towerGroupRef.current = towerGroup;

    const towerMaxH = 46;
    const outerRadius = 5.2;
    const numColumns = 8;

    pillarMaterialsRef.current = [];
    trussMaterialsRef.current = [];

    // Main Column Steel Material (Medium Metallic Gray for visibility against dark bg)
    const columnMat = new THREE.MeshStandardMaterial({
      color: isLightModeRef.current ? 0x64748b : 0x475569,
      metalness: 0.88,
      roughness: 0.2,
    });
    pillarMaterialsRef.current.push(columnMat);

    // 8 Vertical Cylindrical Outer Framework Columns arranged in a circle
    const columnGeo = new THREE.CylinderGeometry(0.22, 0.22, towerMaxH, 16);
    const columnPositions: [number, number][] = [];

    for (let c = 0; c < numColumns; c++) {
      const angle = (c / numColumns) * Math.PI * 2;
      const x = Math.cos(angle) * outerRadius;
      const z = Math.sin(angle) * outerRadius;
      columnPositions.push([x, z]);

      const column = new THREE.Mesh(columnGeo, columnMat);
      column.position.set(x, towerMaxH / 2, z);
      column.castShadow = true;
      column.receiveShadow = true;
      towerGroup.add(column);

      // Base Mounting Foot Clamps
      const footGeo = new THREE.CylinderGeometry(0.5, 0.65, 0.7, 12);
      const footMat = new THREE.MeshStandardMaterial({
        color: isLightModeRef.current ? 0x475569 : 0x1e293b,
        metalness: 0.9,
      });
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(x, 0.35, z);
      towerGroup.add(foot);
    }

    // Circular Support Rings placed every 2.5m (Hollow Open Structure)
    const ringMat = new THREE.MeshStandardMaterial({
      color: isLightModeRef.current ? 0x475569 : 0x334155,
      metalness: 0.85,
      roughness: 0.25,
    });
    trussMaterialsRef.current.push(ringMat);

    const strutMat = new THREE.MeshStandardMaterial({
      color: isLightModeRef.current ? 0x64748b : 0x475569,
      metalness: 0.8,
      roughness: 0.35,
    });

    for (let y = 2.5; y <= towerMaxH; y += 2.5) {
      // Hollow Thin Circular Ring Torus
      const ringGeo = new THREE.TorusGeometry(outerRadius, 0.15, 12, 32);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(0, y, 0);
      towerGroup.add(ringMesh);

      // Subtle Glowing Cyan Accent Nodes on outer ring
      if (y % 5.0 === 0) {
        const accentGeo = new THREE.TorusGeometry(outerRadius + 0.06, 0.05, 8, 32);
        const accentMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.85,
        });
        const accentRing = new THREE.Mesh(accentGeo, accentMat);
        accentRing.rotation.x = Math.PI / 2;
        accentRing.position.set(0, y, 0);
        towerGroup.add(accentRing);
      }

      // Open Diagonal Truss Struts connecting adjacent columns
      if (y + 2.5 <= towerMaxH) {
        for (let c = 0; c < numColumns; c++) {
          const nextC = (c + 1) % numColumns;
          const [x1, z1] = columnPositions[c];
          const [x2, z2] = columnPositions[nextC];

          // Diagonal strut 1
          const strutLen = Math.sqrt(
            Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2) + Math.pow(2.5, 2)
          );
          const strutGeo = new THREE.CylinderGeometry(0.06, 0.06, strutLen, 8);
          const strut = new THREE.Mesh(strutGeo, strutMat);

          const midX = (x1 + x2) / 2;
          const midZ = (z1 + z2) / 2;
          strut.position.set(midX, y + 1.25, midZ);

          strut.lookAt(x2, y + 2.5, z2);
          strut.rotateX(Math.PI / 2);
          towerGroup.add(strut);
        }
      }
    }

    // 2 Polished Metallic Vertical Guide Rails running down the center shaft
    const railRadius = 0.15;
    const railDistFromCenter = 2.4;
    const railGeo = new THREE.CylinderGeometry(railRadius, railRadius, towerMaxH, 16);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Bright polished metallic silver/white
      metalness: 0.98,
      roughness: 0.02,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.12,
    });

    [-railDistFromCenter, railDistFromCenter].forEach((zVal) => {
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(0, towerMaxH / 2, zVal);
      towerGroup.add(rail);

      // Rail mounting brackets connecting to outer ring every 4m
      for (let y = 2; y <= towerMaxH; y += 4) {
        const bracketGeo = new THREE.CylinderGeometry(0.06, 0.06, outerRadius - railDistFromCenter, 8);
        const bracketMat = new THREE.MeshStandardMaterial({
          color: isLightModeRef.current ? 0x64748b : 0x475569,
          metalness: 0.85,
        });
        const bracket1 = new THREE.Mesh(bracketGeo, bracketMat);
        bracket1.rotation.x = Math.PI / 2;
        bracket1.position.set(0, y, (zVal + (zVal > 0 ? outerRadius : -outerRadius)) / 2);
        towerGroup.add(bracket1);
      }
    });

    // Physical Height Marker Plates & LED Indicator Ticks (10m, 20m, 30m, 40m)
    const markerLeds: { height: number; mesh: THREE.Mesh }[] = [];
    AVAILABLE_HEIGHTS.forEach((hVal) => {
      const markerPlateGeo = new THREE.BoxGeometry(1.6, 0.4, 0.15);
      const isSelected = hVal === currentHeight;
      const markerPlateMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x10b981 : isLightModeRef.current ? 0x64748b : 0x1e293b,
        roughness: 0.2,
        metalness: 0.6,
      });
      const markerPlate = new THREE.Mesh(markerPlateGeo, markerPlateMat);
      markerPlate.position.set(0, hVal, outerRadius + 0.1);
      towerGroup.add(markerPlate);

      // Glowing indicator tick node
      const tickGeo = new THREE.SphereGeometry(0.22, 12, 12);
      const tickMat = new THREE.MeshBasicMaterial({ color: isSelected ? 0x10b981 : 0x38bdf8 });
      const tickMesh = new THREE.Mesh(tickGeo, tickMat);
      tickMesh.position.set(1.0, hVal, outerRadius + 0.2);
      towerGroup.add(tickMesh);

      markerLeds.push({ height: hVal, mesh: tickMesh });
    });
    markerLedsRef.current = markerLeds;

    // Magnetic Eddy-Current Braking Zone (Bottom 25% of height)
    const brakeGroup = new THREE.Group();
    brakeZoneGroupRef.current = brakeGroup;
    const brakeH = currentHeight * 0.25;
    const coilCount = 6;
    const coils: THREE.Mesh[] = [];
    const fieldRings: THREE.Mesh[] = [];

    for (let i = 0; i < coilCount; i++) {
      const ringY = (brakeH / coilCount) * (i + 0.5);

      // Copper Braking Coil torus around guide area
      const ringGeo = new THREE.TorusGeometry(railDistFromCenter * 1.3, 0.22, 12, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xd97706, // Copper/bronze
        emissive: 0x78350f,
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(0, ringY, 0);
      brakeGroup.add(ringMesh);
      coils.push(ringMesh);

      // Concentric Electromagnetic Violet/Amber Field Aura Ring
      const fieldGeo = new THREE.TorusGeometry(railDistFromCenter * 1.8, 0.1, 8, 32);
      const fieldMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7, // Electromagnetic violet
        transparent: true,
        opacity: 0.4,
      });
      const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
      fieldMesh.rotation.x = Math.PI / 2;
      fieldMesh.position.set(0, ringY, 0);
      brakeGroup.add(fieldMesh);
      fieldRings.push(fieldMesh);
    }
    brakeCoilsRef.current = coils;
    fieldRingsRef.current = fieldRings;
    towerGroup.add(brakeGroup);

    // Particle Stream for Electromagnetic Flux during braking
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount; p++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = railDistFromCenter * 0.8 + Math.random() * railDistFromCenter;
      particlePositions[p * 3] = Math.cos(angle) * radius;
      particlePositions[p * 3 + 1] = Math.random() * brakeH;
      particlePositions[p * 3 + 2] = Math.sin(angle) * radius;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 0.35,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particleSystem;
    brakeGroup.add(particleSystem);

    // Top Head Release Crane Unit
    const headRingGeo = new THREE.TorusGeometry(outerRadius, 0.35, 12, 32);
    const headMat = new THREE.MeshStandardMaterial({
      color: isLightModeRef.current ? 0x334155 : 0x0f172a,
      metalness: 0.9,
      roughness: 0.1,
    });
    const headRing = new THREE.Mesh(headRingGeo, headMat);
    headRing.rotation.x = Math.PI / 2;
    headRing.position.set(0, towerMaxH + 0.5, 0);
    towerGroup.add(headRing);

    // Top Release Clamp Mechanism
    const clampGeo = new THREE.BoxGeometry(0.8, 0.6, 1.2);
    const clampMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
    const clampL = new THREE.Mesh(clampGeo, clampMat);
    clampL.position.set(-0.6, towerMaxH - 0.2, 0);
    const clampR = new THREE.Mesh(clampGeo, clampMat);
    clampR.position.set(0.6, towerMaxH - 0.2, 0);
    towerGroup.add(clampL);
    towerGroup.add(clampR);

    scene.add(towerGroup);

    // 7. Redesigned Large-Scale Scientific Payload Capsule
    const capsuleGroup = new THREE.Group();
    capsuleGroupRef.current = capsuleGroup;

    // Attached Travelling Light: PointLight traveling with capsule to illuminate inner steel framework
    const capsuleLight = new THREE.PointLight(0x00f5d4, 4.5, 36);
    capsuleLight.position.set(0, 0, 0);
    capsuleGroup.add(capsuleLight);

    // Aerodynamic High-Tech Cylinder Body (Bright Highly Reflective White/Silver Finish)
    const capBodyGeo = new THREE.CylinderGeometry(1.9, 2.0, 3.6, 32);
    const capBodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Highly reflective pure white/silver finish
      metalness: 0.95,
      roughness: 0.05,
      envMapIntensity: 2.0,
    });
    const capBody = new THREE.Mesh(capBodyGeo, capBodyMat);
    capBody.castShadow = true;
    capBody.receiveShadow = true;
    capsuleGroup.add(capBody);

    // Rounded Aerodynamic Top Dome
    const topDomeGeo = new THREE.SphereGeometry(1.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const topDomeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.95,
      roughness: 0.05,
    });
    const topDome = new THREE.Mesh(topDomeGeo, topDomeMat);
    topDome.position.y = 1.8;
    capsuleGroup.add(topDome);

    // Ultra-Bright Glowing Neon Cyan/Green Telemetry Core Glass Section (Beacon in the Dark)
    const coreGlassGeo = new THREE.CylinderGeometry(1.95, 1.95, 1.1, 32);
    const coreGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f5d4, // Neon cyan/green
      emissive: 0x00f5d4,
      emissiveIntensity: 2.2, // Intense glow beacon
      transparent: true,
      opacity: 0.9,
      roughness: 0.05,
      transmission: 0.85,
    });
    const coreGlass = new THREE.Mesh(coreGlassGeo, coreGlassMat);
    coreGlass.position.y = 0.1;
    capsuleGroup.add(coreGlass);

    // Internal Telemetry Sensor Core Node
    const sensorCoreGeo = new THREE.OctahedronGeometry(0.75, 2);
    const sensorCoreMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const sensorCore = new THREE.Mesh(sensorCoreGeo, sensorCoreMat);
    sensorCore.position.y = 0.1;
    capsuleGroup.add(sensorCore);

    // Status LED Indicator Node on Top Dome
    const ledGeo = new THREE.SphereGeometry(0.28, 12, 12);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const statusLed = new THREE.Mesh(ledGeo, ledMat);
    statusLed.position.set(0, 3.55, 0);
    statusLedRef.current = statusLed;
    capsuleGroup.add(statusLed);

    // Side-Rollers / Wheels visibly hugging the central vertical guide rails
    [-railDistFromCenter, railDistFromCenter].forEach((zPos) => {
      // Bracket arm extending out toward guide rail
      const armGeo = new THREE.BoxGeometry(0.35, 0.28, 0.7);
      const armMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.9,
      });

      // Upper and lower roller brackets
      [1.3, -1.3].forEach((yPos) => {
        const arm = new THREE.Mesh(armGeo, armMat);
        arm.position.set(0, yPos, zPos > 0 ? 2.1 : -2.1);
        capsuleGroup.add(arm);

        // Roller wheel hugging the guide rail
        const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheelMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.85,
          roughness: 0.15,
        });
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(0, yPos, zPos > 0 ? 2.4 : -2.4);
        capsuleGroup.add(wheel);
      });
    });

    // Top Lifting Hook Ring
    const hookGeo = new THREE.TorusGeometry(0.48, 0.11, 12, 24);
    const hookMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95 });
    const hook = new THREE.Mesh(hookGeo, hookMat);
    hook.position.y = 3.7;
    capsuleGroup.add(hook);

    // Flat Magnetic Reaction Plate at Bottom (Copper / Bronze Induction Disc)
    const plateGeo = new THREE.CylinderGeometry(2.05, 2.05, 0.35, 32);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Copper
      metalness: 0.95,
      roughness: 0.12,
      emissive: 0xb45309,
      emissiveIntensity: 0.35,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -1.98;
    capsuleGroup.add(plate);

    // Free Fall Restrained Motion Trail Mesh
    const trailGeo = new THREE.CylinderGeometry(1.8, 0.1, 6.0, 16);
    const trailMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const trailMesh = new THREE.Mesh(trailGeo, trailMat);
    trailMesh.position.y = 4.8;
    trailMeshRef.current = trailMesh;
    capsuleGroup.add(trailMesh);

    // Initial Position
    capsuleGroup.position.set(0, currentAltitude + 2.1, 0);
    scene.add(capsuleGroup);

    // 8. Dynamic Theme MutationObserver Handler
    const updateSceneTheme = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      isLightModeRef.current = isLight;

      const colors = getThemeColors(isLight);
      scene.background = new THREE.Color(colors.skyHex);
      scene.fog = new THREE.FogExp2(colors.skyHex, colors.fogDensity);

      if (groundMeshRef.current) {
        (groundMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(
          isLight ? 0xcbd5e1 : 0x0f172a
        );
      }

      if (ambientLightRef.current) {
        ambientLightRef.current.color.setHex(isLight ? 0xffffff : 0xcbd5e1);
        ambientLightRef.current.intensity = isLight ? 1.6 : 1.3;
      }

      if (dirLightRef.current) {
        dirLightRef.current.color.setHex(isLight ? 0xffffff : 0x7dd3fc);
        dirLightRef.current.intensity = isLight ? 2.8 : 2.4;
      }

      if (capBody) {
        (capBody.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
      }

      pillarMaterialsRef.current.forEach((mat) => {
        mat.color.setHex(isLight ? 0x64748b : 0x475569);
      });

      trussMaterialsRef.current.forEach((mat) => {
        mat.color.setHex(isLight ? 0x475569 : 0x334155);
      });
    };

    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateSceneTheme();
        }
      });
    });

    themeObserver.observe(document.documentElement, { attributes: true });

    // 9. Orbit Controls (Mouse & Touch)
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      if (!interactiveCamera) return;
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !interactiveCamera) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePositionRef.current.x;
      const deltaY = clientY - previousMousePositionRef.current.y;

      cameraAngleRef.current.azimuth -= deltaX * 0.005;
      cameraAngleRef.current.elevation = Math.max(
        0.05,
        Math.min(Math.PI / 2.3, cameraAngleRef.current.elevation + deltaY * 0.005)
      );

      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    domElement.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('touchstart', handleMouseDown, { passive: true });
    domElement.addEventListener('touchmove', handleMouseMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    // 10. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth || width;
      const newH = container.clientHeight || height;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);

      // Adjust camera distance for small screens
      const isSmall = newW < 640;
      const newDist = isSmall ? 62 : 50;
      defaultCameraState.distance = newDist;
      if (!isDraggingRef.current) {
        cameraAngleRef.current.distance = newDist;
      }
    };
    window.addEventListener('resize', handleResize);

    // 11. Render & Physics Visualization Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Smooth Orbit Camera math
      const { azimuth, elevation, distance } = cameraAngleRef.current;
      const targetY = phase === 'FREE_FALL' || phase === 'BRAKING'
        ? Math.max(7, capsuleGroup.position.y + 2)
        : Math.max(12, currentHeight * 0.55);

      const camX = distance * Math.cos(elevation) * Math.sin(azimuth);
      const camY = targetY + distance * Math.sin(elevation);
      const camZ = distance * Math.cos(elevation) * Math.cos(azimuth);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, Math.max(2, capsuleGroup.position.y - 1), 0);

      // State-Based Visual Updates
      // LED Status Light on Nose
      if (statusLedRef.current) {
        const mat = statusLedRef.current.material as THREE.MeshBasicMaterial;
        if (phase === 'FREE_FALL') {
          mat.color.setHex(0x10b981); // Neon Lime
        } else if (phase === 'BRAKING') {
          mat.color.setHex(0xf59e0b); // Amber
        } else if (phase === 'SAFE') {
          mat.color.setHex(0x10b981); // Green safe
        } else {
          mat.color.setHex(0x38bdf8); // Cyan standby
        }
      }

      // Free Fall Motion Trail
      if (trailMeshRef.current) {
        const tMat = trailMeshRef.current.material as THREE.MeshBasicMaterial;
        if (phase === 'FREE_FALL') {
          tMat.opacity = 0.45;
        } else {
          tMat.opacity = 0;
        }
      }

      // Magnetic Brake Coil & Field Lines Animation
      const isBraking = phase === 'BRAKING';
      brakeCoilsRef.current.forEach((coil) => {
        const mat = coil.material as THREE.MeshStandardMaterial;
        if (isBraking) {
          mat.emissiveIntensity = 0.9 + 0.3 * Math.sin(Date.now() * 0.02);
          mat.emissive.setHex(0xf59e0b); // Amber
        } else {
          mat.emissiveIntensity = 0.2;
          mat.emissive.setHex(0x78350f);
        }
      });

      // Electromagnetic Violet Field Rings
      fieldRingsRef.current.forEach((ring, idx) => {
        const mat = ring.material as THREE.MeshBasicMaterial;
        if (isBraking) {
          mat.opacity = 0.8;
          ring.scale.setScalar(1.0 + 0.15 * Math.sin(Date.now() * 0.015 + idx));
        } else {
          mat.opacity = 0.2;
          ring.scale.setScalar(1.0);
        }
      });

      // Electromagnetic Particle Stream
      if (particlesRef.current) {
        const pMat = particlesRef.current.material as THREE.PointsMaterial;
        if (isBraking) {
          pMat.opacity = 0.85;
          const pos = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
          for (let p = 0; p < particleCount; p++) {
            let yVal = pos.getY(p) + 0.15;
            if (yVal > brakeH) yVal = 0;
            pos.setY(p, yVal);
          }
          pos.needsUpdate = true;
        } else {
          pMat.opacity = 0;
        }
      }

      // Magnetic Point Light Intensity
      if (brakeLightRef.current) {
        if (isBraking) {
          brakeLightRef.current.intensity = 4.5 + Math.random() * 1.5;
        } else {
          brakeLightRef.current.intensity = 0;
        }
      }

      // Height Marker highlight when capsule is passing
      markerLedsRef.current.forEach(({ height: hVal, mesh }) => {
        const dist = Math.abs(capsuleGroup.position.y - hVal);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (dist < 2.0) {
          mat.color.setHex(0x10b981); // Neon Lime highlight
        } else if (hVal === currentHeight) {
          mat.color.setHex(0x10b981);
        } else {
          mat.color.setHex(0x38bdf8);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      themeObserver.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      domElement.removeEventListener('mousedown', handleMouseDown);
      domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('touchstart', handleMouseDown);
      domElement.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [celestial, reducedMotion, interactiveCamera, currentHeight]);

  // Sync position of capsule when altitude updates
  useEffect(() => {
    if (capsuleGroupRef.current) {
      capsuleGroupRef.current.position.y = currentAltitude + 2.1;
    }
  }, [currentAltitude]);

  if (!webGlSupported) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] text-center">
        <div className="text-4xl mb-3">🚀</div>
        <h3 className="text-lg font-bold font-display text-[var(--text-primary)] mb-2">2D Fall Visualization Active</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mb-4">
          WebGL rendering unavailable in this browser session. Showing optimized 2D physics altitude tracker.
        </p>
        <div className="w-24 h-64 bg-[var(--bg-surface-elevated)] rounded-xl border border-[var(--border-subtle)] relative overflow-hidden flex flex-col justify-between p-2">
          <div className="text-[10px] font-mono text-[var(--accent-lime)] text-center">{currentHeight}m Top</div>
          <div
            className="w-16 h-8 mx-auto bg-[var(--accent-lime)] rounded-md flex items-center justify-center font-mono text-xs font-bold text-[#070f1a] shadow-lg transition-all duration-75"
            style={{
              transform: `translateY(${-((currentAltitude / currentHeight) * 180 - 180)}px)`,
            }}
          >
            {currentAltitude.toFixed(1)}m
          </div>
          <div className="text-[10px] font-mono text-[var(--accent-cyan)] text-center">0m Base</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Overlay Badge in 3D canvas */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[var(--bg-surface)]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-mono shadow-md">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-lime)] animate-pulse" />
        <span className="text-[var(--text-secondary)]">DROP SHAFT:</span>
        <span className="text-[var(--text-primary)] font-bold">{currentHeight}m</span>
      </div>

      {/* Reset View Button */}
      <button
        onClick={resetCameraView}
        className="absolute top-3 right-3 z-10 bg-[var(--bg-surface)]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent-cyan)] hover:text-[var(--accent-lime)] hover:border-[var(--accent-lime)] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        title="Reset 3D Camera Position"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>RESET VIEW</span>
      </button>

      {/* Touch Orbit Guide */}
      <div className="absolute bottom-3 left-3 z-10 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface)]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] flex items-center gap-1 shadow-sm">
        <Compass className="w-3 h-3 text-[var(--accent-cyan)]" /> Touch / Drag to Orbit
      </div>
    </div>
  );
};

