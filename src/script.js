import * as THREE from "./three/three.module.js";

// Show a warning message if WebGL is not available
// Adapted from three.js's examples/jsm/WebGL.js
let hasWebGL = false;
try {
	const canvas = document.createElement("canvas");
	hasWebGL = !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
} catch {}

if (hasWebGL) {
	const LERP_DONE_DISTANCE = 0.001;
	const SELECT_LERP = [new THREE.Vector3(1.4, 1.4, 1.4), 0.15];
	const DESELECT_LERP = [new THREE.Vector3(1, 1, 1), 0.15];

	let lerps = [];

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	const renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const hemiLight = new THREE.HemisphereLight(0xfffff0, 0x606060, 0.5);
	scene.add(hemiLight);
	const dirLight = new THREE.DirectionalLight(0xffff0e0, 0.5);
	dirLight.position.set(1, 1, 2);
	scene.add(dirLight);

	const geometry = new THREE.IcosahedronGeometry();
	const material = new THREE.MeshLambertMaterial({
		color: 0xff0000,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});
	const die = new THREE.Mesh(geometry, material);
	scene.add(die);
	const edges = new THREE.EdgesGeometry(geometry);
	const line = new THREE.LineSegments(edges);
	line.material.color.setHex(0x000000);
	die.add(line);

	camera.position.z = 3;

	window.addEventListener("resize", updateViewportSize);

	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2(10, 10);
	window.addEventListener("mousemove", function(event) {
		// Convert coordinates to [-1.0, 1.0]
		pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
	});
	let intObj = null;
	window.addEventListener("click", function(event) {
		if (intObj && intObj.clickFunc) {
			intObj.clickFunc();
		}
	});

	let render = function() {
		requestAnimationFrame(render);

		die.rotation.x += 0.005;
		die.rotation.y += 0.005;

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
					lerps = lerps.filter((lerp) => lerp.uuid !== intObj.uuid);
					const lerp = {
						vector: intObj.scale,
						args: SELECT_LERP,
						uuid: intObj.uuid,
					};
					intObj.lerp = lerp;
					lerps.push(lerp);
				}
			}
		} else {
			if (intObj) {
				// Restore intersect object's colour
				intObj.material.color.setHex(intObj.prevColor);
				// Lerp scale
				lerps = lerps.filter((lerp) => lerp.uuid !== intObj.uuid);
				const lerp = {
					vector: intObj.scale,
					args: DESELECT_LERP,
					uuid: intObj.uuid,
				};
				intObj.lerp = lerp;
				lerps.push(lerp);
			}
			// Not intersecting any objects
			intObj = null;
		}

		updateLerps();

		renderer.render(scene, camera);
	};
	render();

	function updateViewportSize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function updateLerps() {
		for (let i = lerps.length - 1; i >= 0; i--) {
			const lerp = lerps[i];
			lerp.vector.lerp(...lerp.args);
			if (lerp.vector.distanceTo(lerp.args[0]) < LERP_DONE_DISTANCE) {
				// Lerp is pretty much finished -> remove it
				lerps.splice(i, 1);
				lerp.vector.copy(lerp.args[0]);
			}
		}
	}
} else {
	const message = document.createElement("div");
	message.innerHTML = `<h1>WebGL Unavailable</h1>Your ${window.WebGLRenderingContext ? "graphics card" : "browser"} does not seem to support <a href="https://get.webgl.org/get-a-webgl-implementation/" target="_blank">WebGL</a>.`;
	document.body.appendChild(message);
}
