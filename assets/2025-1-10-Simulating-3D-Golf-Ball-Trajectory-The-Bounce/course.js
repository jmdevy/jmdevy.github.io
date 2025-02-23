import * as THREE from 'three';


const quadSize = 1.0;
const noiseXZScale = 0.005;
const noiseYScale = 10.0;
const courseSize = 512;
const courseThicknessRadius = 15.0;


const Turf = [
    {id: "rough",           color: new THREE.Color(0.0, 0.1, 0.0)},
    {id: "fairway",         color: new THREE.Color(0.0, 0.4, 0.0)},
    {id: "green",           color: new THREE.Color(0.0, 0.9, 0.0)},
    {id: "sand",            color: new THREE.Color(1.0, 0.82, 0.34)},
    {id: "fairway_fringe",  color: new THREE.Color(0.0, 0.3, 0.0)},
    {id: "green_fringe",    color: new THREE.Color(0.0, 0.7, 0.0)}
];


class MeshBuilder{
    constructor(){
        // Setup ThreeJS mesh
        // https://threejs.org/docs/#api/en/objects/Mesh
        this.geometry = new THREE.BufferGeometry();    // https://threejs.org/docs/index.html#api/en/core/BufferGeometry
        this.vertices = [];                            // Will be made into https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array
        this.colors   = [];                            // Will also be made into a Float32Array later
        this.material = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: true});
    }

    #addVector3Vert(v, color){
        this.vertices.push(v.x);
        this.vertices.push(v.y);
        this.vertices.push(v.z);

        this.colors.push(color.r);
        this.colors.push(color.g);
        this.colors.push(color.b);
    }

    // Adds two triangles to create a non-indexed quad
    // Vertices are: https://threejs.org/docs/#api/en/math/Vector3
    // Colors are:   https://threejs.org/docs/#api/en/math/Color
    addQuad(v0, v1, v2, v3, color){
        // Following indexing from here: https://jayelinda.com/modelling-by-numbers-part-1a/#:~:text=direction%20as%20our%20normal%20(ie.%20up)
        // but don't use indices and just copy vertices instead
        this.#addVector3Vert(v0, color);
        this.#addVector3Vert(v1, color);
        this.#addVector3Vert(v2, color);

        this.#addVector3Vert(v0, color);
        this.#addVector3Vert(v2, color);
        this.#addVector3Vert(v3, color);
    }

    finish(){
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));
        const mesh = new THREE.Mesh(this.geometry, this.material);
        return mesh;
    }
};


export default class Course{
    constructor(){
        // Setup simple-noise noise
        // https://github.com/jwagner/simplex-noise.js?tab=readme-ov-file#2d
        this.noise = window.exports.createNoise2D();
        this.builder = new MeshBuilder();
        this.mesh = undefined;
        this.course = [];

        this.#createCourse();
        this.#createMesh();
    }

    #generateInitialCourse(){
        // Init course data
        for(let i = 0; i < courseSize; i++){
            this.course.push([]);
            for(let j = 0; j < courseSize; j++){
                // this.course[i].push(parseInt(Math.random() * Turf.length - 1));
                this.course[i].push(0); // Fill course with "rough"
            }
        }
    }

    #generateCourseBlob(x, z, turfTypeIndex){

    }

    #generateCourseFairway(x, z){
        // Set an initial course relative direction and position
        let courseDirection = 0.0;
        let coursePosition = new THREE.Vector2(0.0, 0.0)
    }

    #createCourse(){
        this.#generateInitialCourse();
        this.#generateCourseFairway();

        // // Generate 1/3 the total allow size of course origin path points
        // for(let i=0; i<courseSize/3; i++){
        //     coursePosition.add(new THREE.Vector2(Math.cos(courseDirection), Math.sin(courseDirection)))

        //     for(let y=-courseThicknessRadius; y<courseThicknessRadius; y++){
        //         for(let x=-courseThicknessRadius; x<courseThicknessRadius; x++){
        //             const distance = Math.sqrt((x*x) + (y*y));

        //             if(courseThicknessRadius - distance <= 1.0){
        //                 this.course[parseInt(courseSize/2 + coursePosition.x + x)][parseInt(courseSize/2 + coursePosition.y + y)] = 3;
        //             }else{
        //                 if(Math.sqrt((x*x) + (y*y)) <= courseThicknessRadius){
        //                     this.course[parseInt(courseSize/2 + coursePosition.x + x)][parseInt(courseSize/2 + coursePosition.y + y)] = 1;
        //                 }
        //             }

                    
        //         }
        //     }

        //     courseDirection += this.noise(0, i * 0.01);
        // }
    }

    #createMesh(){
        // Index by quad
        for(let z=0; z<courseSize; z++){
            for(let x=0; x<courseSize; x++){
                const v0x = x;
                const v0z = z;
                const v0y = this.noise(v0x * noiseXZScale, v0z * noiseXZScale) * noiseYScale;

                const v1x = x;
                const v1z = z+quadSize;
                const v1y = this.noise(v1x * noiseXZScale, v1z * noiseXZScale) * noiseYScale;

                const v2x = x+quadSize;
                const v2z = z+quadSize;
                const v2y = this.noise(v2x *noiseXZScale, v2z * noiseXZScale) * noiseYScale;

                const v3x = x+quadSize;
                const v3z = z;
                const v3y = this.noise(v3x * noiseXZScale, v3z * noiseXZScale) * noiseYScale;

                const v0 = new THREE.Vector3(v0x, v0y, v0z);
                const v1 = new THREE.Vector3(v1x, v1y, v1z);
                const v2 = new THREE.Vector3(v2x, v2y, v2z);
                const v3 = new THREE.Vector3(v3x, v3y, v3z);

                const color = Turf[this.course[x][z]].color;

                this.builder.addQuad(v0, v1, v2, v3, color);
            }
        }

        // Construct the mesh from the vertices/positions
        this.mesh = this.builder.finish();
    }
};