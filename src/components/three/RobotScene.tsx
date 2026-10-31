import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * A 5-axis industrial arm, built from primitives so there is no model to
 * download. Club palette: ceramic-white shell, brand-blue (#0060F8) joint
 * housings, light-blue glow rings, gold gripper tips.
 *
 * Cost control: the scene only renders while visible (`active`), pixel ratio
 * is capped, there are no shadow maps, and reflections come from one PMREM
 * bake of three's built-in RoomEnvironment — no HDR file is fetched.
 */

export type RobotSceneProps = {
  variant: "hero" | "panel";
  active: boolean;
  /** 0→1 as the hero scrolls away; drives the camera dolly and arm sweep. */
  progress?: MotionValue<number>;
};

const PALETTE = {
  shell: "#e9eef6",
  brand: "#0a5cf0",
  brandEmissive: "#0b2f7a",
  glow: "#5aa8ff",
  metal: "#1b2536",
  gold: "#c9a13b",
  fog: "#08101d",
};

const RobotScene = ({ variant, active, progress }: RobotSceneProps) => {
  const { i18n } = useTranslation();
  // Mirror the composition in Arabic so the arm stays opposite the copy.
  const side = i18n.dir() === "rtl" ? -1 : 1;

  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const smallScreen = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      dpr={[1, smallScreen ? 1.5 : 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 35, position: [0, 2.4, 8.2], near: 0.1, far: 60 }}
      frameloop={!active ? "never" : reduced ? "demand" : "always"}
    >
      <Scene variant={variant} progress={progress} reduced={reduced} side={side} />
    </Canvas>
  );
};

export default RobotScene;

/* ------------------------------------------------------------------ scene */

type Pointer = { x: number; y: number; down: boolean };

const Scene = ({
  variant,
  progress,
  reduced,
  side,
}: {
  variant: "hero" | "panel";
  progress?: MotionValue<number>;
  reduced: boolean;
  side: number;
}) => {
  const { gl, scene, camera, size } = useThree();

  // One-time reflection probe from three's procedural room.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  // Window-level pointer: the canvas sits behind the page and takes no events.
  const pointer = useRef<Pointer>({ x: 0, y: 0, down: false });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const down = () => (pointer.current.down = true);
    const up = () => (pointer.current.down = false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  // Responsive framing, derived from the canvas size.
  const aspect = size.width / Math.max(size.height, 1);
  const portrait = aspect < 0.9;
  const dist = portrait ? 12.5 : variant === "panel" ? 9 : 9;
  const halfW = dist * Math.tan(THREE.MathUtils.degToRad(35 / 2)) * aspect;
  const armX = portrait ? 0.95 * side : side * Math.min(halfW * (variant === "panel" ? 0.62 : 0.6), 5.6);
  const armScale = portrait ? 0.82 : variant === "panel" ? 0.85 : 1;
  const lookY = portrait ? 3.6 : variant === "panel" ? 2.3 : 1.75;

  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const p = reduced ? 0 : progress?.get() ?? 0;
    const px = reduced ? 0 : pointer.current.x;
    const py = reduced ? 0 : pointer.current.y;
    const d = Math.min(dt, 0.05);

    // Scroll dollies in and rises; the pointer adds a little parallax.
    const ease = p * p * (3 - 2 * p); // smoothstep, so the move starts and lands softly
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px * 0.4 + armX * ease * 0.55 + side * ease * 1.6, 2.4, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, lookY + 0.65 + py * 0.25 + ease * 1.5, 2.4, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, dist - ease * 2.5, 2.4, d);
    look.set(armX * (0.12 + ease * 0.8), lookY + ease * 1.3, 0);
    camera.lookAt(look);
  });

  return (
    <>
      <fog attach="fog" args={[PALETTE.fog, dist + 3, dist + 16]} />
      <ambientLight intensity={0.25} />
      <hemisphereLight args={["#a8c8ff", "#0a1426", 0.75]} />
      {/* key */}
      <directionalLight position={[-4, 7, 6]} intensity={2.3} />
      {/* brand-blue rim from behind */}
      <directionalLight position={[6, 3, -5]} intensity={3.2} color="#3d8bff" />
      {/* cool fill near the arm */}
      <pointLight position={[armX + 1.6, 3.2, 2.6]} intensity={22} distance={10} color="#8cbcff" />

      <group position={[armX, 0, 0]} scale={armScale}>
        <Arm pointer={pointer} progress={progress} reduced={reduced} side={side} />
        <FloorGlow reduced={reduced} />
        <FloorGrid fade={variant === "panel" ? 9 : 11} />
      </group>
    </>
  );
};

/* -------------------------------------------------------------------- arm */

const Arm = ({
  pointer,
  progress,
  reduced,
  side,
}: {
  pointer: React.MutableRefObject<Pointer>;
  progress?: MotionValue<number>;
  reduced: boolean;
  side: number;
}) => {
  const mats = useMemo(
    () => ({
      shell: new THREE.MeshPhysicalMaterial({
        color: PALETTE.shell,
        roughness: 0.3,
        metalness: 0.08,
        clearcoat: 0.7,
        clearcoatRoughness: 0.18,
      }),
      brand: new THREE.MeshStandardMaterial({
        color: PALETTE.brand,
        roughness: 0.28,
        metalness: 0.45,
        emissive: PALETTE.brandEmissive,
        emissiveIntensity: 0.35,
      }),
      metal: new THREE.MeshStandardMaterial({ color: PALETTE.metal, roughness: 0.35, metalness: 0.9 }),
      glow: new THREE.MeshBasicMaterial({ color: PALETTE.glow, toneMapped: false }),
      gold: new THREE.MeshStandardMaterial({ color: PALETTE.gold, roughness: 0.3, metalness: 0.95 }),
    }),
    []
  );

  const geo = useMemo(
    () => ({
      upper: new RoundedBoxGeometry(0.36, 1.7, 0.42, 4, 0.12),
      fore: new RoundedBoxGeometry(0.28, 1.35, 0.32, 4, 0.1),
      palm: new RoundedBoxGeometry(0.44, 0.13, 0.24, 3, 0.04),
      finger: new RoundedBoxGeometry(0.07, 0.34, 0.16, 3, 0.025),
    }),
    []
  );

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
      Object.values(geo).forEach((g) => g.dispose());
    },
    [mats, geo]
  );

  const j1 = useRef<THREE.Group>(null); // base yaw
  const j2 = useRef<THREE.Group>(null); // shoulder pitch
  const j3 = useRef<THREE.Group>(null); // elbow pitch
  const j4 = useRef<THREE.Group>(null); // wrist pitch
  const j5 = useRef<THREE.Group>(null); // wrist roll
  const fL = useRef<THREE.Mesh>(null);
  const fR = useRef<THREE.Mesh>(null);
  const s = useRef({ yaw: 0.75 * side, sh: 0.25 * side, el: 0.68 * side, wr: 1.05 * side, roll: 0, grip: 0 });

  useFrame(({ clock }, dt) => {
    const d = Math.min(dt, 0.05);
    const t = reduced ? 0 : clock.elapsedTime;
    const p = reduced ? 0 : progress?.get() ?? 0;
    const px = reduced ? 0 : pointer.current.x;
    const py = reduced ? 0 : pointer.current.y;

    // Rest pose reaches diagonally toward the viewer and the page centre.
    // Idle drift, the cursor and scroll all layer on top of it.
    const yaw = side * (0.75 + Math.sin(t * 0.4) * 0.22 + p * 1.5) - px * 0.45;
    const sh = side * (0.25 + Math.sin(t * 0.55) * 0.07 - p * 0.15) + py * 0.12 * side;
    const el = side * (0.68 + Math.sin(t * 0.5 + 1.3) * 0.12 - p * 0.45) - py * 0.22 * side;
    const wr = side * (1.05 + Math.sin(t * 0.8 + 0.5) * 0.18);
    const roll = Math.sin(t * 0.6) * 1.1;
    const grip = pointer.current.down ? 1 : 0.5 + 0.5 * Math.sin(t * 1.1);

    const st = s.current;
    st.yaw = THREE.MathUtils.damp(st.yaw, yaw, 3, d);
    st.sh = THREE.MathUtils.damp(st.sh, sh, 3, d);
    st.el = THREE.MathUtils.damp(st.el, el, 3, d);
    st.wr = THREE.MathUtils.damp(st.wr, wr, 3, d);
    st.roll = THREE.MathUtils.damp(st.roll, roll, 3, d);
    st.grip = THREE.MathUtils.damp(st.grip, grip, 6, d);

    if (j1.current) j1.current.rotation.y = st.yaw;
    if (j2.current) j2.current.rotation.z = st.sh;
    if (j3.current) j3.current.rotation.z = st.el;
    if (j4.current) j4.current.rotation.z = st.wr;
    if (j5.current) j5.current.rotation.y = st.roll;
    const open = 0.09 + (1 - st.grip) * 0.08;
    if (fL.current) fL.current.position.x = -open;
    if (fR.current) fR.current.position.x = open;
  });

  return (
    <group>
      {/* base */}
      <mesh position={[0, 0.09, 0]} material={mats.metal}>
        <cylinderGeometry args={[0.62, 0.72, 0.18, 48]} />
      </mesh>
      <mesh position={[0, 0.185, 0]} material={mats.glow}>
        <torusGeometry args={[0.58, 0.012, 8, 64]} />
      </mesh>

      {/* J1 — turret */}
      <group ref={j1}>
        <mesh position={[0, 0.46, 0]} material={mats.shell}>
          <cylinderGeometry args={[0.42, 0.5, 0.56, 48]} />
        </mesh>
        <mesh position={[0, 0.77, 0]} material={mats.brand}>
          <cylinderGeometry args={[0.44, 0.44, 0.08, 48]} />
        </mesh>

        {/* J2 — shoulder */}
        <group ref={j2} position={[0, 0.98, 0]}>
          <JointHousing r={0.3} len={0.62} mats={mats} />
          <mesh geometry={geo.upper} material={mats.shell} position={[0, 0.85, 0]} />
          <mesh position={[0.185, 0.85, 0]} material={mats.glow}>
            <boxGeometry args={[0.012, 1.15, 0.05]} />
          </mesh>
          {/* cable loom */}
          <mesh position={[-0.21, 0.85, -0.17]} material={mats.metal}>
            <cylinderGeometry args={[0.035, 0.035, 1.45, 12]} />
          </mesh>

          {/* J3 — elbow */}
          <group ref={j3} position={[0, 1.7, 0]}>
            <JointHousing r={0.24} len={0.5} mats={mats} />
            <mesh geometry={geo.fore} material={mats.shell} position={[0, 0.68, 0]} />
            <mesh position={[0.145, 0.68, 0]} material={mats.glow}>
              <boxGeometry args={[0.012, 0.9, 0.04]} />
            </mesh>

            {/* J4 — wrist pitch */}
            <group ref={j4} position={[0, 1.36, 0]}>
              <JointHousing r={0.17} len={0.36} mats={mats} housing="metal" />

              {/* J5 — wrist roll + gripper */}
              <group ref={j5} position={[0, 0.12, 0]}>
                <mesh position={[0, 0.08, 0]} material={mats.brand}>
                  <cylinderGeometry args={[0.15, 0.15, 0.12, 32]} />
                </mesh>
                <mesh position={[0, 0.15, 0]} material={mats.glow}>
                  <torusGeometry args={[0.15, 0.01, 8, 40]} />
                </mesh>
                <mesh geometry={geo.palm} material={mats.metal} position={[0, 0.22, 0]} />
                <mesh ref={fL} geometry={geo.finger} material={mats.metal} position={[-0.12, 0.43, 0]}>
                  <mesh position={[0, 0.15, 0]} material={mats.gold}>
                    <boxGeometry args={[0.075, 0.06, 0.17]} />
                  </mesh>
                </mesh>
                <mesh ref={fR} geometry={geo.finger} material={mats.metal} position={[0.12, 0.43, 0]}>
                  <mesh position={[0, 0.15, 0]} material={mats.gold}>
                    <boxGeometry args={[0.075, 0.06, 0.17]} />
                  </mesh>
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

/** A joint drum lying along Z, with glowing rings on both faces. */
const JointHousing = ({
  r,
  len,
  mats,
  housing = "brand",
}: {
  r: number;
  len: number;
  mats: Record<"shell" | "brand" | "metal" | "glow" | "gold", THREE.Material>;
  housing?: "brand" | "metal";
}) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} material={mats[housing]}>
      <cylinderGeometry args={[r, r, len, 40]} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.metal}>
      <cylinderGeometry args={[r * 0.55, r * 0.55, len + 0.04, 32]} />
    </mesh>
    <mesh position={[0, 0, len / 2 + 0.004]} material={mats.glow}>
      <torusGeometry args={[r * 0.8, 0.012, 8, 48]} />
    </mesh>
    <mesh position={[0, 0, -len / 2 - 0.004]} material={mats.glow}>
      <torusGeometry args={[r * 0.8, 0.012, 8, 48]} />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------ floor */

/** Soft light pool under the base, plus a scan ring that pulses outward. */
const FloorGlow = ({ reduced }: { reduced: boolean }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(70,145,255,0.55)");
    grad.addColorStop(0.5, "rgba(0,96,248,0.16)");
    grad.addColorStop(1, "rgba(0,96,248,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);

  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (reduced || !ring.current || !ringMat.current) return;
    const k = (clock.elapsedTime % 3.2) / 3.2;
    ring.current.scale.setScalar(1 + k * 1.6);
    ringMat.current.opacity = 0.45 * (1 - k);
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[3.8, 3.8]} />
        <meshBasicMaterial
          map={tex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[0.78, 0.8, 64]} />
        <meshBasicMaterial
          ref={ringMat}
          color={PALETTE.glow}
          transparent
          opacity={reduced ? 0.25 : 0.45}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
};

/** Anti-aliased two-weight grid that fades out radially from the base. */
const FloorGrid = ({ fade }: { fade: number }) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uCell: { value: new THREE.Color("#1b4a92") },
          uSection: { value: new THREE.Color("#2f7bff") },
          uFade: { value: fade },
        },
        vertexShader: /* glsl */ `
          varying vec2 vPos;
          void main() {
            vPos = position.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uCell;
          uniform vec3 uSection;
          uniform float uFade;
          varying vec2 vPos;
          float line(vec2 p, float size, float width) {
            vec2 q = p / size;
            vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
            return 1.0 - min(min(g.x, g.y) / width, 1.0);
          }
          void main() {
            float cell = line(vPos, 0.5, 1.0);
            float sec = line(vPos, 2.5, 1.5);
            float fade = 1.0 - smoothstep(uFade * 0.25, uFade, length(vPos));
            float a = max(cell * 0.45, sec * 0.9) * fade;
            if (a < 0.01) discard;
            gl_FragColor = vec4(mix(uCell, uSection, sec), a);
          }
        `,
      }),
    [fade]
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <planeGeometry args={[fade * 2.2, fade * 2.2]} />
    </mesh>
  );
};
