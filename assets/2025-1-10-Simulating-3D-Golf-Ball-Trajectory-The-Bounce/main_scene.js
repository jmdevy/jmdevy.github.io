import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { manageRendererSize } from './common.js';
import Course, {courseDimensions} from './course.js';

const simulationDiv = document.getElementById("simulationDiv");


// Main renderer and scene
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
simulationDiv.appendChild(renderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(45, 1, 1, 5000);
camera.position.set(-courseDimensions/4, 300, -courseDimensions/4);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(courseDimensions/2, 0, courseDimensions/2);

// Main scene
const scene = new THREE.Scene();
// const gridHelper = new THREE.GridHelper(600, 600);
// scene.add(gridHelper);

//Create a DirectionalLight and turn on shadows for the light
const light = new THREE.DirectionalLight( 0xffffff, 2 );
// light.shadow.mapSize.width = 512; // default
// light.shadow.mapSize.height = 512; // default
// light.shadow.camera.near = 0.5; // default
// light.shadow.camera.far = 500; // default
// light.position.set( 0, 1, 0 ); //default; light shining from top
// light.castShadow = true; // default false
scene.add( light )

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