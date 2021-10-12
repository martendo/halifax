import * as THREE from "https://cdn.skypack.dev/three@0.133.1";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";

let renderer;
let scene;
let camera;
let cube;

export function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);

	const axesHelper = new THREE.AxesHelper(10);
	scene.add(axesHelper);
	const gridHelper = new THREE.GridHelper(10);
	scene.add(gridHelper);

	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshBasicMaterial({
		color: 0xff0000,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});
	cube = new THREE.Mesh(geometry, material);
	scene.add(cube);
	const edges = new THREE.EdgesGeometry(geometry);
	const line = new THREE.LineSegments(edges);
	line.material.color.setHex(0xffffff);
	cube.add(line);

	camera.position.z = 5;
	controls.update();

	animate();
}

function animate() {
	requestAnimationFrame(animate);

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	renderer.render(scene, camera);
}
