"use client";

import { useEffect, useRef, useState } from 'react';

interface Props {
  modelPath: string;
}

export default function ClientThreeViewer({ modelPath }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('Preparing viewer...');

  useEffect(() => {
    let mounted = true;
    let frameId: number;

    async function init() {
      try {
        if (!containerRef.current) return;

        setLoadingStatus('Loading 3D environment...');
        console.log('Loading Three.js modules...');

        // Dynamically import Three.js and related modules
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');

        if (!mounted) return;
        console.log('Modules loaded successfully');
        setLoadingStatus('Setting up scene...');

        // Initialize scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Initialize camera with better default FOV
        const camera = new THREE.PerspectiveCamera(
          65, // Wider FOV for better viewing
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          1000
        );
        camera.position.set(0, 2, 5);

        // Initialize renderer with proper pixel ratio and better performance settings
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for better performance
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        containerRef.current.appendChild(renderer.domElement);

        // Enhanced lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Add hemisphere light for better ambient illumination
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
        scene.add(hemiLight);

        // Load model
        const loader = new GLTFLoader();
        console.log('Loading model:', modelPath);
        
        loader.load(
          modelPath,
          (gltf) => {
            if (!mounted) return;
            console.log('Model loaded successfully');

            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Center the model
            gltf.scene.position.sub(center);
            scene.add(gltf.scene);

            // Position camera inside the model
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            const cameraDistance = maxDim * 0.4; // Reduced distance to be more "inside" the model
            
            // Position camera at a point inside the model
            camera.position.set(
              cameraDistance * 0.3, // Closer to center on X
              maxDim * 0.2,        // Slightly elevated on Y
              cameraDistance * 0.3  // Closer to center on Z
            );
            camera.lookAt(new THREE.Vector3(0, maxDim * 0.1, 0)); // Look slightly upward

            // Initialize controls with enhanced settings
            const controls = new OrbitControls(camera, renderer.domElement);
            controlsRef.current = controls;

            // Enhanced controls configuration
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.rotateSpeed = 0.8;
            controls.panSpeed = 0.8;
            controls.zoomSpeed = 1.2;
            controls.minDistance = maxDim * 0.1;
            controls.maxDistance = maxDim * 2;
            controls.maxPolarAngle = Math.PI * 0.85;
            controls.target.set(0, maxDim * 0.1, 0); // Set target slightly above ground
            controls.update();

            // Double click to reset view
            let lastClickTime = 0;
            renderer.domElement.addEventListener('click', (event) => {
              const currentTime = new Date().getTime();
              if (currentTime - lastClickTime < 300) { // Double click threshold
                resetView();
              }
              lastClickTime = currentTime;
            });

            // Double tap for mobile
            renderer.domElement.addEventListener('touchend', (event) => {
              const currentTime = new Date().getTime();
              if (currentTime - lastClickTime < 300) {
                resetView();
                event.preventDefault(); // Prevent zoom
              }
              lastClickTime = currentTime;
            });

            function resetView() {
              if (!controls) return;
              
              controls.reset();
              camera.position.set(
                cameraDistance * 0.3,
                maxDim * 0.2,
                cameraDistance * 0.3
              );
              camera.lookAt(new THREE.Vector3(0, maxDim * 0.1, 0));
              controls.update();
            }

            // Animation loop with smooth controls
            function animate() {
              if (!mounted) return;
              frameId = requestAnimationFrame(animate);
              controls.update();
              renderer.render(scene, camera);
            }
            animate();

            // Enhanced resize handler
            function handleResize() {
              if (!containerRef.current || !mounted) return;
              
              const width = containerRef.current.clientWidth;
              const height = containerRef.current.clientHeight;
              
              camera.aspect = width / height;
              camera.updateProjectionMatrix();
              renderer.setSize(width, height, false);
              renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }

            window.addEventListener('resize', handleResize);
            handleResize(); // Initial resize

            setIsLoading(false);
          },
          (progress) => {
            setLoadingStatus('Loading 3D model...');
          },
          (error) => {
            console.error('Error loading model:', error);
            setError(`Failed to load 3D model: ${error.message}`);
            setIsLoading(false);
          }
        );

      } catch (err) {
        console.error('Setup error:', err);
        if (mounted) {
          setError(`Failed to initialize 3D viewer: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, [modelPath]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-red-50">
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-2">{loadingStatus}</div>
            <div className="text-sm text-white/80">Please wait...</div>
          </div>
        </div>
      )}
    </div>
  );
} 