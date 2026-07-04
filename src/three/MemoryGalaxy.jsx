import { useEffect, useRef } from "react";

export default function MemoryGalaxy({ count = 0, memories = [], onSelect, active = true }) {
  const canvas = useRef(null);

  useEffect(() => {
    if (!active || !canvas.current) return;
    let disposed = false, frame = 0, renderer, raycaster, mouse;
    const boot = async () => {
      const THREE = await import("three");
      if (disposed || !canvas.current) return;
      renderer = new THREE.WebGLRenderer({ canvas: canvas.current, alpha: true, antialias: true, powerPreference: "high-performance" });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      camera.position.z = 12;
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(600 * 3);
      for (let i = 0; i < 600; i++) {
        const r = Math.cbrt(Math.random()) * 15;
        const theta = Math.random() * Math.PI * 2;
        const arm = (i % 3) * (Math.PI * 2 / 3);
        const a = theta + r * 0.3 + arm;
        const phi = Math.acos(2 * Math.random() - 1);
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(a);
        starPos[i * 3 + 1] = r * Math.cos(phi) * 0.5;
        starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(a);
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      const sizeArr = new Float32Array(600);
      for (let i = 0; i < 600; i++) sizeArr[i] = 0.03 + Math.random() * 0.06;
      starGeo.setAttribute("size", new THREE.BufferAttribute(sizeArr, 1));
      const starMat = new THREE.PointsMaterial({ color: 0x8888ff, size: 0.05, transparent: true, opacity: 0.7, sizeAttenuation: true });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      const memTotal = Math.min(count, 200);
      const memGroup = new THREE.Group();
      const memPos = [];
      const memSprites = [];

      if (memTotal > 0) {
        for (let i = 0; i < memTotal; i++) {
          const angle = (i / memTotal) * Math.PI * 2 + Math.random() * 0.3;
          const mr = 0.5 + Math.random() * 2.5;
          const x = Math.cos(angle) * mr;
          const y = (Math.random() - 0.5) * 2;
          const z = Math.sin(angle) * mr;
          memPos.push({ x, y, z });

          const spriteMap = new THREE.CanvasTexture(generateStarTexture(THREE));
          const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, transparent: true, opacity: 0.9, color: 0xffd700 });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.position.set(x, y, z);
          sprite.scale.set(0.3, 0.3, 1);
          sprite.userData = { index: i };
          memGroup.add(sprite);
          memSprites.push(sprite);
        }

        if (memTotal > 1) {
          const pairs = [];
          for (let i = 0; i < memTotal; i++)
            for (let j = i + 1; j < memTotal; j++)
              if (Math.hypot(memPos[i].x - memPos[j].x, memPos[i].y - memPos[j].y, memPos[i].z - memPos[j].z) < 2.5)
                pairs.push(memPos[i].x, memPos[i].y, memPos[i].z, memPos[j].x, memPos[j].y, memPos[j].z);
          if (pairs.length) {
            const l = new THREE.BufferGeometry();
            l.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pairs), 3));
            memGroup.add(new THREE.LineSegments(l, new THREE.LineBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.12 })));
          }
        }
      }
      scene.add(memGroup);

      const handleClick = (e) => {
        if (!canvas.current || memSprites.length === 0) return;
        const rect = canvas.current.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(memSprites);
        if (hits.length > 0 && onSelect) {
          onSelect(hits[0].object.userData.index);
        }
      };

      let mx = 0, my = 0;
      const move = (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
      const resize = () => {
        const w = canvas.current.clientWidth, h = canvas.current.clientHeight;
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const animate = () => {
        memGroup.rotation.y += 0.002;
        stars.rotation.y += 0.0005;
        camera.position.x += (mx * 0.8 - camera.position.x) * 0.03;
        camera.position.y += (-my * 0.8 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
        const t = Date.now() * 0.001;
        const sizes = starGeo.attributes.size.array;
        for (let i = 0; i < sizes.length; i++) {
          sizes[i] = (0.03 + Math.random() * 0.01) + Math.sin(t * (1 + (i % 7)) + i) * 0.015;
        }
        starGeo.attributes.size.needsUpdate = true;
        memSprites.forEach((s, i) => {
          const pulse = 0.85 + Math.sin(t * (1.5 + (i % 3) * 0.7) + i * 0.7) * 0.15;
          const scl = 0.3 * pulse;
          s.scale.set(scl, scl, 1);
          s.material.opacity = 0.6 + pulse * 0.4;
        });
        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };
      addEventListener("mousemove", move);
      addEventListener("resize", resize);
      canvas.current.addEventListener("click", handleClick);
      resize();
      animate();
      canvas.current.cleanup = () => {
        removeEventListener("mousemove", move);
        removeEventListener("resize", resize);
        canvas.current?.removeEventListener("click", handleClick);
        starGeo.dispose(); stars.material.dispose();
      };
    };
    boot();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      canvas.current?.cleanup?.();
      renderer?.dispose?.();
    };
  }, [count, memories, onSelect, active]);

  function generateStarTexture(THREE) {
    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,215,0,1)");
    grad.addColorStop(0.3, "rgba(255,215,0,0.6)");
    grad.addColorStop(1, "rgba(255,215,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return canvas;
  }

  return <canvas className="galaxy-canvas" ref={canvas} aria-hidden="true" style={{ cursor: count > 0 ? "pointer" : "default" }} />;
}
