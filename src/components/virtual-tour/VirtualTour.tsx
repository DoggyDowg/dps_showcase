"use client";

import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Color, Box3, Vector3 } from 'three';
import { ACESFilmicToneMapping, SRGBColorSpace, EquirectangularReflectionMapping } from 'three/src/constants';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { useEffect, useRef } from 'react';

interface VirtualTourProps {
  modelPath: string;
  className?: string;
}

export default function VirtualTour({ modelPath, className = "" }: VirtualTourProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Store container reference for cleanup
    const container = containerRef.current;

    // Scene setup
    const scene = new Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new PerspectiveCamera(
      90,
      container.clientWidth / container.clientHeight,
      0.001,
      1000
    );
    camera.position.set(0.05, 0.05, 0.05);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    renderer.outputColorSpace = SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControlsImpl(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.01;
    controls.maxDistance = 5;
    controls.maxPolarAngle = Math.PI / 1.2;
    controlsRef.current = controls;

    // Lighting setup
    const ambientLight = new AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 8, 5);
    scene.add(directionalLight);

    const fillLight = new DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Environment map
    new RGBELoader()
      .setPath('/envmaps/')
      .load('royal_esplanade_1k.hdr', (texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = new Color(0xffffff);
      });

    // Clear any existing content
    while(scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Re-add lights after clearing
    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(fillLight);

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        // Center model
        const box = new Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new Vector3());
        gltf.scene.position.x -= center.x;
        gltf.scene.position.y -= center.y;
        gltf.scene.position.z -= center.z;

        // Scale model to reasonable size
        const size = box.getSize(new Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 20 / maxDim;
        gltf.scene.scale.setScalar(scale);

        scene.add(gltf.scene);

        // Position camera to start inside
        const distance = maxDim * 0.02;
        camera.position.set(distance, distance / 2, distance);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log('Loading progress:', percent, '%');
      },
      (error) => {
        console.error('Error loading model:', error instanceof Error ? error.message : 'Unknown error');
      }
    );

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    function handleResize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
      if (container?.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelPath]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`} />
  );
} 