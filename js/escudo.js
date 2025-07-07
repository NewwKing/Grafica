import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js";
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';

// Variables globales
let scene, camera, renderer, glbModel, pointLight1, pointLight2;
let rotationDirection = 1; // 1 = derecha, -1 = izquierda
let maxRotationY = Math.PI / 4; // 45 grados en radianes
let minRotationY = -Math.PI / 9; // -45 grados
let rotationSpeed = 0.009;
// Función principal para inicializar la escena
function init() {
    createScene();
    createCamera();
    createRenderer();
    addLights();

    loadGLBModel(
        'https://cdn.glitch.global/6b5021b0-f96c-4372-90cb-f39cc26e34e3/base_basic_shaded.glb?v=1751844688369', 
        -3.2, -0.3, -1.2,    
        2.5, 2.5, 2.5,           
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
    // Primera luz
    pointLight1 = new THREE.PointLight(0xffffff, 1, 100);
    pointLight1.position.set(0, 0, 7);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    // Segunda luz para el cursor
    pointLight2 = new THREE.PointLight(0xffffff, 30, 100);
    pointLight2.castShadow = true;
    scene.add(pointLight2);
}

// Función para cargar el archivo GLB
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
                // Asegurar que el material es transparente y no tiene fondo
                node.material.transparent = false;
                node.material.opacity = 1; // Asegura que el objeto en sí sea completamente visible
                node.material.depthWrite = true; // Evita problemas con el orden de dibujado
            }
        });
        scene.add(glbModel);
    }, undefined, function (error) {
        console.error('Error al cargar el archivo GLB:', error);
    });
}

// Función de animación
function animate() {
    requestAnimationFrame(animate);

    if (glbModel) {
        glbModel.rotation.y += rotationSpeed * rotationDirection;

        if (glbModel.rotation.y >= maxRotationY) {
            rotationDirection = -1; // Cambia dirección a la izquierda
        } else if (glbModel.rotation.y <= minRotationY) {
            rotationDirection = 1; // Cambia dirección a la derecha
        }
    }

    renderer.render(scene, camera);
}

// Actualizar el renderizador al cambiar el tamaño de la ventana
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Actualizar la posición de la luz al mover el ratón
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

// Configurar los eventos
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
}

// Inicializar la aplicación
init();


