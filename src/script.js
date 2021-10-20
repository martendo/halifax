import * as THREE from "./three/three.module.js";

// Show a warning message if WebGL is not available
// Adapted from three.js's examples/jsm/WebGL.js
let hasWebGL = false;
try {
	const canvas = document.createElement("canvas");
	hasWebGL = !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
} catch {}

if (hasWebGL) {
	const LERP_DONE_DISTANCE = 0.0001;
	const SELECT_SCALE = new THREE.Vector3(1.4, 1.4, 1.4);
	const DESELECT_SCALE = new THREE.Vector3(1, 1, 1);
	const LIGHT_FIRE_COLOR = new THREE.Color(0xff0000);

	let lerps = [];

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	const renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const geometry = new THREE.IcosahedronGeometry();
	const material = new THREE.MeshLambertMaterial({
		color: 0xa0a0a0,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});
	const die = new THREE.Mesh(geometry, material);
	die.enterFunc = function() {
		lerps = lerps.filter((lerp) => lerp.vector !== die.scale && lerp.vector !== dirLight);
		// Brighten spotlight and enlarge die
		lerps.push({
			vector: dirLight,
			prop: "intensity",
			target: 0.8,
			alpha: 0.25,
		}, {
			vector: die.scale,
			target: SELECT_SCALE,
			alpha: 0.15,
		});
	};
	die.leaveFunc = function() {
		lerps = lerps.filter((lerp) => lerp.vector !== die.scale && lerp.vector !== dirLight);
		// Dim light and shrink die
		lerps.push({
			vector: dirLight,
			prop: "intensity",
			target: 0.5,
			alpha: 0.25,
		}, {
			vector: die.scale,
			target: DESELECT_SCALE,
			alpha: 0.15,
		});
	};
	die.rotation.speed = 0.005;
	die.clickFunc = function() {
		// Spin
		die.rotation.speed = Math.random() * (0.5 - 0.25) + 0.25;
		lerps = lerps.filter((lerp) => lerp.vector !== die.rotation.speed);
		// Slow the spin and turn the light reddish over time
		lerps.push({
			vector: die.rotation,
			prop: "speed",
			target: 0,
			alpha: 0.05,
		}, {
			vector: dirLight.color,
			target: LIGHT_FIRE_COLOR,
			alpha: 0.01,
		});
	};
	scene.add(die);
	const edges = new THREE.EdgesGeometry(geometry);
	const line = new THREE.LineSegments(edges);
	line.material.color.setHex(0x000000);
	die.add(line);

	const hemiLight = new THREE.HemisphereLight(0xfffff0, 0x606060, 0.5);
	const dirLight = new THREE.DirectionalLight(0xffff0e0, 0.5);
	dirLight.position.set(1, 1, 2);
	scene.add(hemiLight, dirLight);

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
	renderer.domElement.addEventListener("click", function(event) {
		if (intObj && intObj.clickFunc) {
			intObj.clickFunc();
		}
	});

	let render = function() {
		requestAnimationFrame(render);

		die.rotation.x += die.rotation.speed;
		die.rotation.y += die.rotation.speed;

		raycaster.setFromCamera(pointer, camera);
		const intersects = raycaster.intersectObjects(scene.children, false);
		if (intersects.length) {
			const newIntObj = intersects[0].object;
			if (intObj != newIntObj) {
				// Intersecting a new object
				if (intObj && intObj.leaveFunc) {
					intObj.leaveFunc();
				}
				intObj = newIntObj;
				if (intObj.enterFunc) {
					intObj.enterFunc();
				}
			}
		} else {
			if (intObj && intObj.leaveFunc) {
				intObj.leaveFunc();
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
			let vector = lerp.vector;
			if (lerp.prop) {
				vector = vector[lerp.prop];
			}
			if (typeof vector == "number") {
				vector += (lerp.target - vector) * lerp.alpha;
				if (Math.abs(lerp.target - vector) < LERP_DONE_DISTANCE) {
					// Lerp is pretty much finished -> remove it
					lerps.splice(i, 1);
					vector = lerp.target;
				}
				if (lerp.prop) {
					lerp.vector[lerp.prop] = vector;
				} else {
					lerp.vector = vector;
				}
			} else {
				vector.lerp(lerp.target, lerp.alpha);
				let distance;
				if (vector instanceof THREE.Color) {
					distance = lerp.target.getHex() == vector.getHex() ? 0 : 1;
				} else {
					distance = vector.distanceTo(lerp.target)
				}
				if (distance < LERP_DONE_DISTANCE) {
					// Lerp is pretty much finished -> remove it
					lerps.splice(i, 1);
					vector.copy(lerp.target);
				}
			}
		}
	}
} else {
	const message = document.createElement("div");
	message.innerHTML = `<h1>WebGL Unavailable</h1>Your ${window.WebGLRenderingContext ? "graphics card" : "browser"} does not seem to support <a href="https://get.webgl.org/get-a-webgl-implementation/" target="_blank">WebGL</a>.`;
	document.body.appendChild(message);
}
