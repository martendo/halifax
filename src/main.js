import * as THREE from "./three/three.module.js";
import { MapControls } from "./three/OrbitControls.js";
import global from "./global.js";

// Show a warning message if WebGL is not available
// Adapted from three.js's examples/jsm/WebGL.js
let hasWebGL = false;
try {
	const canvas = document.createElement("canvas");
	hasWebGL = !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
} catch {}

if (hasWebGL) {
	const scene = new THREE.Scene();
	global.scene = scene;
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	global.camera = camera;

	global.renderer = new THREE.WebGLRenderer({antialias: true});
	global.renderer.setPixelRatio(window.devicePixelRatio);
	global.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(global.renderer.domElement);

	const controls = new MapControls(camera, global.renderer.domElement);

	const axesHelper = new THREE.AxesHelper(10);
	scene.add(axesHelper);
	const gridHelper = new THREE.GridHelper(10);
	scene.add(gridHelper);

	const hemiLight = new THREE.HemisphereLight(0xfffff0, 0x006080, 1.5);
	scene.add(hemiLight);
	const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 5);
	scene.add(hemiLightHelper);
	const dirLight = new THREE.DirectionalLight(0xffff0e0, 0.5);
	dirLight.position.set(0, 30, 30);
	scene.add(dirLight);
	const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 5);
	scene.add(dirLightHelper);

	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshPhongMaterial({
		color: 0xff0000,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});
	const cube = new THREE.Mesh(geometry, material);
	scene.add(cube);
	const edges = new THREE.EdgesGeometry(geometry);
	const line = new THREE.LineSegments(edges);
	line.material.color.setHex(0xffffff);
	cube.add(line);

	camera.position.z = 5;
	controls.update();

	window.addEventListener("resize", updateViewportSize);

	global.render = function() {
		requestAnimationFrame(global.render);

		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;
		global.renderer.render(scene, camera);
	}
	global.render();
} else {
	const message = document.createElement("div");
	message.innerHTML = `<h1>WebGL Unavailable</h1>Your ${window.WebGLRenderingContext ? "graphics card" : "browser"} does not seem to support <a href="https://get.webgl.org/get-a-webgl-implementation/" target="_blank">WebGL</a>.`;
	document.body.appendChild(message);
}

function updateViewportSize() {
	global.camera.aspect = window.innerWidth / window.innerHeight;
	global.camera.updateProjectionMatrix();
	global.renderer.setSize(window.innerWidth, window.innerHeight);
}
