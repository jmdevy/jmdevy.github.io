import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { manageRendererSize } from './common.js';
import Course from './course.js';

const simulationDiv = document.getElementById("simulationDiv");


// Main renderer and scene
const renderer = new THREE.WebGLRenderer();
simulationDiv.appendChild(renderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(45, 1, 1, 5000);
camera.position.set(256, 100, 256);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Main scene
const scene = new THREE.Scene();
// const gridHelper = new THREE.GridHelper(600, 600);
// scene.add(gridHelper);

const course = new Course();
scene.add(course.mesh);


function render(){
    // Check viewport on page
    manageRendererSize(renderer, camera, renderer.domElement, undefined, 500);

    // Update controls
    controls.update();

    // Render the main scene
    renderer.clear();
    renderer.render(scene, camera);
}


renderer.setAnimationLoop( render );