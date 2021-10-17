import * as THREE from "./three/three.module.js";
import global from "./global.js";

function initDie() {
    const scene = new THREE.Scene();
    global.scene = scene;

    const light = new THREE.DirectionalLight(0xfff8f0);
    light.position.set(1, 1, 2);
    scene.add(light);
    const lightHelper = new THREE.DirectionalLightHelper(light);
    scene.add(lightHelper);

    const material = new THREE.MeshLambertMaterial({color: 0x8080a0});
    const geometry = new THREE.IcosahedronGeometry();
    const die = new THREE.Mesh(geometry, material);
    scene.add(die);

    global.render = function() {
        requestAnimationFrame(global.render);

        global.renderer.render(scene, global.camera);
    };
}

export { initDie };
