"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const PANEL_W = 375;
const PANEL_H = 406; // half of the app's 812px design height
const APP_SRC = "/patient-app?embed=1";

// A single panel element with two stacked layers (screen + back cover).
// Which layer shows is toggled in JS based on fold angle, rather than
// relying on 3D depth-sorting of two separate CSS3D objects — CSS3D's
// coordinate flip makes backface-visibility unreliable for that.
function buildPanel(half: "top" | "bottom") {
  const outer = document.createElement("div");
  outer.style.position = "relative";
  outer.style.width = `${PANEL_W}px`;
  outer.style.height = `${PANEL_H}px`;
  outer.style.overflow = "hidden";
  outer.style.borderRadius = half === "top" ? "34px 34px 0 0" : "0 0 34px 34px";
  outer.style.boxShadow = "0 0 0 9px #0a0a0b, 0 30px 80px rgba(0,0,0,.55)";

  const screen = document.createElement("div");
  screen.style.position = "absolute";
  screen.style.inset = "0";
  screen.style.overflow = "hidden";
  screen.style.background = "#000";
  outer.appendChild(screen);

  const iframe = document.createElement("iframe");
  iframe.src = APP_SRC;
  iframe.style.width = `${PANEL_W}px`;
  iframe.style.height = `${PANEL_H * 2}px`;
  iframe.style.border = "0";
  iframe.style.marginTop = half === "top" ? "0px" : `-${PANEL_H}px`;
  iframe.setAttribute("scrolling", "no");
  screen.appendChild(iframe);

  const cover = document.createElement("div");
  cover.style.position = "absolute";
  cover.style.inset = "0";
  cover.style.display = "none";
  cover.style.background = "linear-gradient(160deg, #1c2622 0%, #0d1412 60%, #060908 100%)";
  cover.style.alignItems = half === "top" ? "flex-end" : "flex-start";
  cover.style.justifyContent = "center";
  cover.style.padding = "18px 0";
  cover.style.boxSizing = "border-box";

  const mark = document.createElement("div");
  mark.style.width = "42px";
  mark.style.height = "42px";
  mark.style.borderRadius = "12px";
  mark.style.background = "rgba(255,255,255,0.08)";
  mark.style.display = "flex";
  mark.style.alignItems = "center";
  mark.style.justifyContent = "center";
  mark.style.color = "rgba(255,255,255,0.55)";
  mark.style.fontFamily = "Inter, sans-serif";
  mark.style.fontWeight = "700";
  mark.style.fontSize = "18px";
  mark.textContent = "C";
  cover.appendChild(mark);
  outer.appendChild(cover);

  return { outer, screen, cover };
}

function buildHingeBar() {
  const bar = document.createElement("div");
  bar.style.width = `${PANEL_W - 18}px`;
  bar.style.height = "14px";
  bar.style.borderRadius = "7px";
  bar.style.background = "linear-gradient(180deg, #3a3f3d, #0c0e0d)";
  bar.style.boxShadow = "0 2px 6px rgba(0,0,0,.6)";
  return bar;
}

export default function DuoSimulator() {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const foldAngleRef = useRef(28);
  const autoFoldRef = useRef(false);

  const [foldAngle, setFoldAngle] = useState(28);
  const [autoFold, setAutoFold] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    foldAngleRef.current = foldAngle;
  }, [foldAngle]);

  useEffect(() => {
    autoFoldRef.current = autoFold;
  }, [autoFold]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !interactive;
      controlsRef.current.autoRotate = !interactive;
    }
  }, [interactive]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 1, 5000);
    camera.position.set(620, 200, 1180);

    const renderer = new CSS3DRenderer();
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 600;
    controls.maxDistance = 2200;
    controls.target.set(0, 0, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;
    controlsRef.current = controls;

    const phone = new THREE.Group();
    scene.add(phone);

    const bottomPanel = buildPanel("bottom");
    const bottomObject = new CSS3DObject(bottomPanel.outer);
    bottomObject.position.set(0, -PANEL_H / 2, 0);
    phone.add(bottomObject);

    const topPanel = buildPanel("top");
    const topObject = new CSS3DObject(topPanel.outer);
    phone.add(topObject);

    const hingeBar = new CSS3DObject(buildHingeBar());
    hingeBar.position.set(0, 0, 6);
    phone.add(hingeBar);

    let raf = 0;
    let t = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.016;

      if (autoFoldRef.current) {
        const angle = 90 + 85 * Math.sin(t * 0.6);
        foldAngleRef.current = angle;
        setFoldAngle(Math.round(angle));
      }

      // Rotate the top panel around the hinge line (y=0) by computing its
      // world position/rotation directly each frame, rather than nesting it
      // under a rotated parent Object3D — CSS3DRenderer bakes a Y-axis flip
      // into every object independently, which mirrors nested rotated
      // children instead of folding them correctly.
      const angleRad = THREE.MathUtils.degToRad(foldAngleRef.current);
      topObject.position.set(0, (PANEL_H / 2) * Math.cos(angleRad), (PANEL_H / 2) * Math.sin(angleRad));
      topObject.rotation.x = angleRad;

      const folded = foldAngleRef.current > 100;
      topPanel.screen.style.display = folded ? "none" : "block";
      topPanel.cover.style.display = folded ? "flex" : "none";

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0c0f0e]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-1 px-4 pt-6 text-center">
        <a href="/" className="pointer-events-auto text-[13px] font-medium text-white/70 hover:text-white hover:underline">← Back to clinician dashboard</a>
        <h1 className="mt-2 text-[22px] font-bold text-white">Continuum on iPhone Duo</h1>
        <p className="max-w-md text-[13px] text-white/60">Live prototype rendered on a foldable 3D device · drag to rotate · use the slider to fold</p>
      </div>

      <div ref={mountRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-4 px-4 pb-8">
        <div className="pointer-events-auto flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-[12px] font-medium text-white/70">
            <span>Fold: {Math.round(foldAngle)}°</span>
            <span>{foldAngle < 15 ? "Flat — continuous screen" : foldAngle > 150 ? "Closed" : "Folded"}</span>
          </div>
          <input
            type="range"
            min={0}
            max={175}
            value={Math.round(foldAngle)}
            disabled={autoFold}
            onChange={(event) => setFoldAngle(Number(event.target.value))}
            className="w-full accent-[var(--green)]"
          />
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setAutoFold((current) => !current)}
              className={`rounded-full px-4 py-2 text-[12px] font-semibold ${autoFold ? "bg-[var(--green)] text-white" : "bg-white/10 text-white"}`}
            >
              {autoFold ? "Stop auto-fold" : "Auto-fold demo"}
            </button>
            <button
              type="button"
              onClick={() => setInteractive((current) => !current)}
              className={`rounded-full px-4 py-2 text-[12px] font-semibold ${interactive ? "bg-[var(--green)] text-white" : "bg-white/10 text-white"}`}
            >
              {interactive ? "Rotation locked — tap the app" : "Unlock to interact with app"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
