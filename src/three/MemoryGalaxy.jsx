import { useEffect, useRef } from "react";

export default function MemoryGalaxy({ count = 0, memories = [] }){
  const canvas = useRef(null);
  useEffect(() => {
    let disposed = false, frame = 0, renderer;
    const boot = async () => {
      const THREE = await import("three");
      if(disposed || !canvas.current) return;
      renderer = new THREE.WebGLRenderer({ canvas:canvas.current, alpha:true, antialias:true, powerPreference:"high-performance" });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      camera.position.z = 12;
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(600 * 3);
      for(let i = 0; i < 600; i++){
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
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0x8888ff, size:0.05, transparent:true, opacity:0.7 }));
      scene.add(stars);
      const memTotal = Math.min(count, 200);
      const memGroup = new THREE.Group();
      const memPos = [];
      if(memTotal > 0){
        const memGeo = new THREE.BufferGeometry();
        const memArr = new Float32Array(memTotal * 3);
        for(let i = 0; i < memTotal; i++){
          const angle = (i / memTotal) * Math.PI * 2 + Math.random() * 0.3;
          const mr = 0.5 + Math.random() * 2.5;
          memArr[i * 3] = Math.cos(angle) * mr;
          memArr[i * 3 + 1] = (Math.random() - 0.5) * 2;
          memArr[i * 3 + 2] = Math.sin(angle) * mr;
          memPos.push({ x: memArr[i * 3], y: memArr[i * 3 + 1], z: memArr[i * 3 + 2] });
        }
        memGeo.setAttribute("position", new THREE.BufferAttribute(memArr, 3));
        memGroup.add(new THREE.Points(memGeo, new THREE.PointsMaterial({ color:0xffd700, size:0.15, transparent:true, opacity:0.9 })));

        if(memTotal > 1){
          const pairs = [];
          for(let i = 0; i < memTotal; i++)
            for(let j = i + 1; j < memTotal; j++)
              if(Math.hypot(memPos[i].x - memPos[j].x, memPos[i].y - memPos[j].y, memPos[i].z - memPos[j].z) < 2.5)
                pairs.push(memPos[i].x, memPos[i].y, memPos[i].z, memPos[j].x, memPos[j].y, memPos[j].z);
          if(pairs.length){
            const l = new THREE.BufferGeometry();
            l.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pairs), 3));
            memGroup.add(new THREE.LineSegments(l, new THREE.LineBasicMaterial({ color:0xffd700, transparent:true, opacity:0.12 })));
          }
        }
      }
      scene.add(memGroup);

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
        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };
      addEventListener("mousemove", move);
      addEventListener("resize", resize);
      resize();
      animate();
      canvas.current.cleanup = () => {
        removeEventListener("mousemove", move);
        removeEventListener("resize", resize);
        starGeo.dispose(); stars.material.dispose();
        renderer.dispose();
      };
    };
    boot();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      canvas.current?.cleanup?.();
    };
  }, [count, memories]);

  return <canvas className="galaxy-canvas" ref={canvas} aria-hidden="true" />;
}
