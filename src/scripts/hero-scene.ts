import * as THREE from 'three';

const ACCENT = 0xe63946;
const MUTED = 0x71717a;
const DIM = 0x3f3f46;

export function initHeroScene(canvas: HTMLCanvasElement, container: HTMLElement) {
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const renderer = new THREE.WebGLRenderer({
		canvas,
		alpha: true,
		antialias: true,
		powerPreference: 'high-performance',
	});
	renderer.setClearColor(0x000000, 0);

	const scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x0a0a0b, 0.08);

	const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
	camera.position.set(0, 0, 5.2);

	const group = new THREE.Group();
	scene.add(group);

	const outerGeo = new THREE.IcosahedronGeometry(1.35, 2);
	const outerMat = new THREE.MeshBasicMaterial({
		color: ACCENT,
		wireframe: true,
		transparent: true,
		opacity: 0.72,
	});
	const outer = new THREE.Mesh(outerGeo, outerMat);
	group.add(outer);

	const innerGeo = new THREE.OctahedronGeometry(0.62, 0);
	const innerMat = new THREE.MeshBasicMaterial({
		color: MUTED,
		wireframe: true,
		transparent: true,
		opacity: 0.45,
	});
	const inner = new THREE.Mesh(innerGeo, innerMat);
	group.add(inner);

	const ringGeo = new THREE.TorusGeometry(1.85, 0.004, 8, 128);
	const ringMat = new THREE.MeshBasicMaterial({
		color: DIM,
		transparent: true,
		opacity: 0.55,
	});
	const ring = new THREE.Mesh(ringGeo, ringMat);
	ring.rotation.x = Math.PI / 2.4;
	group.add(ring);

	const particleCount = 96;
	const positions = new Float32Array(particleCount * 3);
	for (let i = 0; i < particleCount; i++) {
		const radius = 1.6 + Math.random() * 1.8;
		const theta = Math.random() * Math.PI * 2;
		const phi = Math.acos(2 * Math.random() - 1);
		positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
		positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
		positions[i * 3 + 2] = radius * Math.cos(phi);
	}
	const particleGeo = new THREE.BufferGeometry();
	particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	const particleMat = new THREE.PointsMaterial({
		color: MUTED,
		size: 0.028,
		transparent: true,
		opacity: 0.55,
		sizeAttenuation: true,
	});
	const particles = new THREE.Points(particleGeo, particleMat);
	group.add(particles);

	const nodeGeo = new THREE.SphereGeometry(0.028, 8, 8);
	const nodeMat = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 });
	const nodes: THREE.Mesh[] = [];
	const nodeAngles = [0, Math.PI * 0.66, Math.PI * 1.33];
	for (const angle of nodeAngles) {
		const node = new THREE.Mesh(nodeGeo, nodeMat);
		node.position.set(Math.cos(angle) * 2.1, Math.sin(angle * 1.4) * 0.35, Math.sin(angle) * 2.1);
		group.add(node);
		nodes.push(node);
	}

	let mouseX = 0;
	let mouseY = 0;
	const onMove = (event: MouseEvent) => {
		const rect = container.getBoundingClientRect();
		mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
		mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
	};
	container.addEventListener('mousemove', onMove);

	const clock = new THREE.Clock();
	let animationId = 0;
	let running = true;

	const resize = () => {
		const { width, height } = container.getBoundingClientRect();
		if (width === 0 || height === 0) return;
		renderer.setSize(width, height, false);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	};

	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(container);
	resize();

	const intersectionObserver = new IntersectionObserver(
		([entry]) => {
			running = entry.isIntersecting;
			if (running) animate();
		},
		{ threshold: 0.05 },
	);
	intersectionObserver.observe(container);

	const speed = prefersReducedMotion ? 0.08 : 1;

	function animate() {
		if (!running) return;
		animationId = requestAnimationFrame(animate);

		const elapsed = clock.getElapsedTime() * speed;

		outer.rotation.x = elapsed * 0.12 + mouseY * 0.18;
		outer.rotation.y = elapsed * 0.18 + mouseX * 0.22;
		inner.rotation.x = -elapsed * 0.22;
		inner.rotation.y = -elapsed * 0.28;
		ring.rotation.z = elapsed * 0.06;
		particles.rotation.y = elapsed * 0.04;
		particles.rotation.x = elapsed * 0.02;

		for (const [i, node] of nodes.entries()) {
			const offset = i * 1.2;
			node.position.y = Math.sin(elapsed * 1.4 + offset) * 0.28;
		}

		group.rotation.y += 0.0012 * speed;
		camera.position.x += (mouseX * 0.45 - camera.position.x) * 0.04;
		camera.position.y += (-mouseY * 0.35 - camera.position.y) * 0.04;
		camera.lookAt(0, 0, 0);

		renderer.render(scene, camera);
	}

	animate();

	return () => {
		running = false;
		cancelAnimationFrame(animationId);
		resizeObserver.disconnect();
		intersectionObserver.disconnect();
		container.removeEventListener('mousemove', onMove);
		outerGeo.dispose();
		outerMat.dispose();
		innerGeo.dispose();
		innerMat.dispose();
		ringGeo.dispose();
		ringMat.dispose();
		particleGeo.dispose();
		particleMat.dispose();
		nodeGeo.dispose();
		nodeMat.dispose();
		renderer.dispose();
	};
}
