import * as THREE from 'three';

export default class MeshBuilder{
    constructor(){
        // Setup ThreeJS mesh
        // https://threejs.org/docs/#api/en/objects/Mesh
        this.geometry = new THREE.BufferGeometry();    // https://threejs.org/docs/index.html#api/en/core/BufferGeometry
        this.vertices = [];                            // Will be made into https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array
        this.colors   = [];                            // Will also be made into a Float32Array later
        this.normals  = [];
        this.material = new THREE.MeshStandardMaterial({color: 0xffffff, vertexColors: true, flatShading: true});
    }

    #addVector3Vert(v, color, normal){
        this.vertices.push(v.x);
        this.vertices.push(v.y);
        this.vertices.push(v.z);

        this.normals.push(normal.x);
        this.normals.push(normal.y);
        this.normals.push(normal.z);

        let checkerMod = 1.0;
        if((parseInt(v.x) % 4 > 1) || (parseInt(v.z) % 4 > 1)){
            checkerMod = 0.95;
        }

        this.colors.push(color.r * checkerMod);
        this.colors.push(color.g * checkerMod);
        this.colors.push(color.b * checkerMod);
    }

    // Adds two triangles to create a non-indexed quad
    // Vertices are: https://threejs.org/docs/#api/en/math/Vector3
    // Colors are:   https://threejs.org/docs/#api/en/math/Color
    addQuad(v0, v1, v2, v3, color){
        let normal = new THREE.Vector3((v1.x - v0.x) * (v2.x - v0.x),
                                       (v1.y - v0.y) * (v2.y - v0.y),
                                       (v1.z - v0.z) * (v2.z - v0.z));
        normal = normal.normalize();

        // Following indexing from here: https://jayelinda.com/modelling-by-numbers-part-1a/#:~:text=direction%20as%20our%20normal%20(ie.%20up)
        // but don't use indices and just copy vertices instead
        this.#addVector3Vert(v0, color, normal);
        this.#addVector3Vert(v1, color, normal);
        this.#addVector3Vert(v2, color, normal);

        this.#addVector3Vert(v0, color, normal);
        this.#addVector3Vert(v2, color, normal);
        this.#addVector3Vert(v3, color, normal);
    }

    finish(){
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.vertices), 3));
        this.geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(this.normals), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));
        const mesh = new THREE.Mesh(this.geometry, this.material);
        return mesh;
    }
};