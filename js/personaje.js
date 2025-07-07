import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js";
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, glbModel, mixer;
let pointLight1, pointLight2;
let rotationDirection = 1; 
let maxRotationY = Math.PI / 2;
let minRotationY = -Math.PI / 9;
let rotationSpeed = 0.009;
const clock = new THREE.Clock();

function init() {
    createScene();
    createCamera();
    createRenderer();
    addLights();

    loadGLBModel(
        'https://cdn.glitch.global/6b5021b0-f96c-4372-90cb-f39cc26e34e3/soap2.glb?v=1751854741333', 
        -6, -0.3, -1.2,    
        2.3, 2.6, 2.5,           
        0, 0, 0       
    );

    setupEventListeners();
    animate();
}

function createScene() {
    scene = new THREE.Scene();
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x000000, 0);
    document.getElementById('glb-model').appendChild(renderer.domElement);
}

function addLights() {
    pointLight1 = new THREE.PointLight(0xffffff, 3, 100);
    pointLight1.position.set(0, 0, 7);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

   
}

function loadGLBModel(url, posx=0, posy=0, posz=0, sizeX=1, sizeY=1, sizeZ=1, rotx=0, roty=0, rotz=0) {
    const loader = new GLTFLoader();
    loader.load(url, function (gltf) {
        glbModel = gltf.scene;
        glbModel.scale.set(sizeX, sizeY, sizeZ);
        glbModel.rotation.set(rotx, roty, rotz);
        glbModel.position.set(posx, posy, posz);

        glbModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.material.transparent = false;
                node.material.opacity = 1;
                node.material.depthWrite = true;
            }
        });

        scene.add(glbModel);

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(glbModel);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }

    }, undefined, function (error) {
        console.error('Error al cargar el archivo GLB:', error);
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (glbModel) {
        glbModel.rotation.y += rotationSpeed * rotationDirection;

        if (glbModel.rotation.y >= maxRotationY) {
            rotationDirection = -1;
        } else if (glbModel.rotation.y <= minRotationY) {
            rotationDirection = 1;
        }
    }

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    vector.unproject(camera);

    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    pointLight2.position.copy(pos);
}

function setupEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
}

init();
