import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --------------------------------------------------------
// SHADER DEFINITIONS
// --------------------------------------------------------

const vertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform float uScrollY;

  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
    i = mod289(i);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Subtle breathing constant movement
    float time = uTime * 0.15;
    
    // Large wave movement
    float elevation = sin(modelPosition.x * 0.3 + time) * 
                      sin(modelPosition.y * 0.2 + time) * 0.4;

    // Add noise for organic feel
    float noise = snoise(vec3(modelPosition.xy * 0.6, time * 0.5)) * 0.3;
    
    // Combine elevation
    elevation += noise;

    // Scroll influence - shift waves slightly as we scroll
    elevation += sin(uScrollY * 0.001 + modelPosition.x * 0.5) * 0.2;

    modelPosition.z += elevation;
    vElevation = elevation;

    gl_Position = projectionMatrix * viewMatrix * modelPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColorBase;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform vec3 uColorAccent;
  
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Base color
    vec3 color = uColorBase;

    // Create organic mix factor based on elevation
    float mixStrength = smoothstep(-0.6, 0.6, vElevation);
    
    // Primary mix (CipherGate Green)
    color = mix(color, uColorPrimary, mixStrength * 0.15); // Subtle tint

    // Secondary ripple lines
    float ripple = sin(vElevation * 10.0 + uTime * 0.5);
    float rippleLine = smoothstep(0.95, 1.0, ripple);
    
    // Add teal accents on ridges
    color = mix(color, uColorSecondary, rippleLine * 0.08);

    // Soft grain/noise to reduce banding and add texture
    float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    color += noise * 0.015;

    // Vignette for depth focus
    float dist = distance(vUv, vec2(0.5));
    float vignette = smoothstep(0.4, 1.0, dist);
    color = mix(color, uColorBase * 0.95, vignette * 0.5);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// --------------------------------------------------------
// MESH COMPONENTS
// --------------------------------------------------------

const LivingLayer = () => {
    const mesh = useRef();
    const { viewport } = useThree();

    // Uniforms
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uScrollY: { value: 0 },
            uColorBase: { value: new THREE.Color('#F8FAFC') },     // Slate-50/White substitute
            uColorPrimary: { value: new THREE.Color('#26D07C') },  // CipherGate Brand Green
            uColorSecondary: { value: new THREE.Color('#111111') }, // Teal
            uColorAccent: { value: new THREE.Color('#22C55E') },   // Accent
        }),
        []
    );

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
            // Smoothly interpolate scroll value if needed, or update from global scroll state
            mesh.current.material.uniforms.uScrollY.value = window.scrollY;
        }
    });

    return (
        <mesh ref={mesh} scale={[viewport.width * 1.5, viewport.height * 1.5, 1]} rotation={[-Math.PI * 0.1, 0, 0]}>
            <planeGeometry args={[1, 1, 128, 128]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                wireframe={false}
                transparent={true}
            />
        </mesh>
    );
};

const WireframeGrid = () => {
    // A subtle technical grid overlay
    return (
        <gridHelper
            args={[30, 30, 0x26D07C, 0xe2e8f0]}
            position={[0, 0, -2]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1, 1, 1]}
        >
            <meshBasicMaterial attach="material" transparent opacity={0.06} />
        </gridHelper>
    )
}

const FloatingParticles = () => {
    // "Data points" floating in the background
    const count = 30;
    const mesh = useRef();

    // Generate random positions
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 5;
            const speed = 0.02 + Math.random() * 0.05;
            temp.push({ x, y, z, speed, offset: Math.random() * Math.PI });
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.getElapsedTime();

        // Update instances manually or use a helper if we had lots. 
        // For 30 particles, we can just iterate ref children if we used individual meshes, 
        // but for performance, we should ideally use InstancedMesh. 
        // Given complexity, let's keep it simple with a group of small meshes for readability first.
    });

    return (
        <group ref={mesh}>
            {particles.map((p, i) => (
                <Particle key={i} {...p} />
            ))}
        </group>
    );
}

const Particle = ({ x, y, z, speed, offset }) => {
    const ref = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Float gently
        ref.current.position.y = y + Math.sin(time * speed + offset) * 1.5;
        ref.current.position.x = x + Math.cos(time * speed * 0.5 + offset) * 0.5;
        // Rotate slowly
        ref.current.rotation.x = time * 0.1;
        ref.current.rotation.z = time * 0.05;
    });

    return (
        <mesh ref={ref} position={[x, y, z]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshBasicMaterial color="#26D07C" transparent opacity={0.3} />
        </mesh>
    );
};


// --------------------------------------------------------
// SCENE WRAPPER
// --------------------------------------------------------

const GlobalBackground = () => {
    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: -10,
                    pointerEvents: 'none',
                    background: '#F8FAFC', // Fallback color
                }}
            >
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 45 }}
                    dpr={[1, 1.5]}
                    gl={{ alpha: true, antialias: true }}
                >
                    <ambientLight intensity={0.5} />

                    {/* Living Organic Layer */}
                    <LivingLayer />

                    {/* Technical Grid (Subtle) */}
                    <WireframeGrid />

                    {/* Floating Data Points */}
                    <FloatingParticles />

                </Canvas>
            </div>

            {/* CSS Overlay for extra softness/gradient fallback */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -9,
                    background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(255, 255, 255, 0.6) 100%)',
                    pointerEvents: 'none',
                }}
            />
        </>
    );
};

export default GlobalBackground;
