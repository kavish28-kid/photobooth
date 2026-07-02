import { useEffect, useRef } from "react";

export default function ParticleField(){
  const canvas = useRef(null);

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let renderer;
    const boot = async () => {
      const THREE = await import("three");
      if(disposed || !canvas.current) return;
      renderer = new THREE.WebGLRenderer({ canvas:canvas.current, alpha:true, antialias:true, powerPreference:"high-performance" });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      camera.position.z = 8;

      const geo = new THREE.BufferGeometry();
      const total = 340;
      const positions = new Float32Array(total * 3);
      for(let i = 0; i < total; i++){
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const points = new THREE.Points(geo, new THREE.PointsMaterial({ color:0x8b5cf6, size:0.045, transparent:true, opacity:0.72 }));
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.15, 0.018, 16, 120),
        new THREE.MeshBasicMaterial({ color:0x22d3ee, transparent:true, opacity:0.34 })
      );
      ring.position.set(4.4, 0.5, -2);
      ring.rotation.x = 1.1;
      scene.add(points, ring);

      let mx = 0, my = 0;
      const move = (event) => { mx = event.clientX / innerWidth - 0.5; my = event.clientY / innerHeight - 0.5; };
      const resize = () => {
        const w = canvas.current.clientWidth;
        const h = canvas.current.clientHeight;
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const animate = () => {
        points.rotation.y += 0.0008;
        points.rotation.x += 0.0002;
        ring.rotation.z += 0.0026;
        camera.position.x += (mx * 1.15 - camera.position.x) * 0.035;
        camera.position.y += (-my * 1.15 - camera.position.y) * 0.035;
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
        geo.dispose();
        points.material.dispose();
        ring.geometry.dispose();
        ring.material.dispose();
      };
    };
    boot();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      canvas.current?.cleanup?.();
      renderer?.dispose?.();
    };
  }, []);

  return <canvas className="particle-canvas" ref={canvas} aria-hidden="true" />;
}
