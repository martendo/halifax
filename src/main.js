import * as THREE from "./three/three.module.js";
import { MapControls } from "./three/OrbitControls.js";
import global from "./global.js";
import { initDie } from "./die.js";

const LERP_DONE_DISTANCE = 0.001;

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
	camera.layers.enableAll();
	global.camera = camera;

	global.renderer = new THREE.WebGLRenderer({antialias: true});
	global.renderer.setPixelRatio(window.devicePixelRatio);
	global.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(global.renderer.domElement);

	const controls = new MapControls(camera, global.renderer.domElement);

	const axesHelper = new THREE.AxesHelper(10);
	axesHelper.layers.set(1);
	scene.add(axesHelper);
	const gridHelper = new THREE.GridHelper(10);
	gridHelper.layers.set(1);
	scene.add(gridHelper);

	const hemiLight = new THREE.HemisphereLight(0xfffff0, 0x006080, 1.5);
	scene.add(hemiLight);
	const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 5);
	hemiLightHelper.layers.set(1);
	scene.add(hemiLightHelper);
	const dirLight = new THREE.DirectionalLight(0xffff0e0, 0.5);
	dirLight.position.set(0, 30, 30);
	scene.add(dirLight);
	const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 5);
	dirLightHelper.layers.set(1);
	scene.add(dirLightHelper);

	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshPhongMaterial({
		color: 0xff0000,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});
	const cube = new THREE.Mesh(geometry, material);
	cube.clickFunc = function() {
		initDie();
	};
	scene.add(cube);
	const edges = new THREE.EdgesGeometry(geometry);
	const line = new THREE.LineSegments(edges);
	line.material.color.setHex(0xffffff);
	cube.add(line);

	camera.position.z = 5;
	controls.update();

	window.addEventListener("resize", updateViewportSize);

	const raycaster = new THREE.Raycaster();
	raycaster.layers.set(0);
	const pointer = new THREE.Vector2();
	window.addEventListener("mousemove", function(event) {
		// Convert coordinates to [-1.0, 1.0]
		pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
	});
	let intObj = null;
	const SELECT_LERP = [new THREE.Vector3(1.5, 1.5, 1.5), 0.15];
	const DESELECT_LERP = [new THREE.Vector3(1, 1, 1), 0.15];
	window.addEventListener("click", function(event) {
		if (intObj && intObj.clickFunc) {
			intObj.clickFunc();
		}
	});

	global.render = function() {
		requestAnimationFrame(global.render);

		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;

		raycaster.setFromCamera(pointer, camera);
		const intersects = raycaster.intersectObjects(scene.children, false);
		if (intersects.length) {
			const newIntObj = intersects[0].object;
			if (intObj != newIntObj) {
				// Intersecting a new object
				if (intObj) {
					// Restore intersect object's colour
					intObj.material.color.setHex(intObj.prevColor);
				}
				if (newIntObj.material.emissive) {
					// Colour the new object
					intObj = newIntObj;
					intObj.prevColor = intObj.material.color.getHex();
					intObj.material.color.setHex(0xff4020);
					// Lerp scale
					global.lerps = global.lerps.filter((lerp) => lerp.uuid !== intObj.uuid);
					const lerp = {
						vector: intObj.scale,
						args: SELECT_LERP,
						uuid: intObj.uuid,
					};
					intObj.lerp = lerp;
					global.lerps.push(lerp);
				}
			}
		} else {
			if (intObj) {
				// Restore intersect object's colour
				intObj.material.color.setHex(intObj.prevColor);
				// Lerp scale
				global.lerps = global.lerps.filter((lerp) => lerp.uuid !== intObj.uuid);
				const lerp = {
					vector: intObj.scale,
					args: DESELECT_LERP,
					uuid: intObj.uuid,
				};
				intObj.lerp = lerp;
				global.lerps.push(lerp);
			}
			// Not intersecting any objects
			intObj = null;
		}

		updateLerps();

		global.renderer.render(scene, camera);
	};
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

function updateLerps() {
	for (let i = global.lerps.length - 1; i >= 0; i--) {
		const lerp = global.lerps[i];
		lerp.vector.lerp(...lerp.args);
		if (lerp.vector.distanceTo(lerp.args[0]) < LERP_DONE_DISTANCE) {
			// Lerp is pretty much finished -> remove it
			global.lerps.splice(i, 1);
			lerp.vector.copy(lerp.args[0]);
		}
	}
}
