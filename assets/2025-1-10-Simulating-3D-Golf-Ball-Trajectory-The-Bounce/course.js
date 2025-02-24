import * as THREE from 'three';


const quadSize = 1.0;
const noiseXZScale = 0.005;
const noiseYScale = 10.0;
const courseDimensions = 512;
const courseThicknessRadius = 15.0;


const TurfTypes = {
    Rough:          {index: 0, color: new THREE.Color(0.0, 0.1, 0.0)},
    Fairway:        {index: 1, color: new THREE.Color(0.0, 0.4, 0.0)},
    Green:          {index: 2, color: new THREE.Color(0.0, 0.9, 0.0)},
    Sand:           {index: 3, color: new THREE.Color(1.0, 0.82, 0.34)},
    FairwayFringe:  {index: 4, color: new THREE.Color(0.0, 0.3, 0.0)},
    GreenFringe:    {index: 5, color: new THREE.Color(0.0, 0.7, 0.0)}
}


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
        this.courseData = [];   // Indices from `TurfTypes`

        this.#createCourse();
        this.#createMesh();
    }

    #fillCourseDataCircle(x, z, radius, turfType){
        for(let iz=-radius; iz<radius; iz++){
            for(let ix=-radius; ix<radius; ix++){
                const distance = Math.sqrt((ix*ix) + (iz*iz));

                if(x+ix < 0 || x+ix >= courseDimensions){
                    continue;
                }

                if(z+iz < 0 || z+iz >= courseDimensions){
                    continue;
                }

                if(distance <= radius){
                    this.courseData[parseInt(x+ix)][parseInt(z+iz)] = turfType.index;
                }
            }
        }
    }

    #fillCourseData(turfType){
        // Init course data
        for(let i=0; i<courseDimensions; i++){
            this.courseData.push([]);
            for(let j=0; j<courseDimensions; j++){
                this.courseData[i].push(turfType.index); // Fill course with "rough"
            }
        }
    }

    #generateCoursePath(x, z, iterations, sensitivity, turfType){
        // Set an initial course relative direction
        let courseDirection = 0.0;

        for(let i=0; i<iterations; i++){
            // Progress position in direction
            x += Math.cos(courseDirection);
            z += Math.sin(courseDirection);

            this.#fillCourseDataCircle(x, z, courseThicknessRadius, turfType);

            // Slowing change direction of fairway
            courseDirection += this.noise(0, i * sensitivity);
        }

        return [x, z];
    }

    #createCourse(){
        this.#fillCourseData(TurfTypes.Rough);
        const [x, z] = this.#generateCoursePath(courseThicknessRadius*2, courseDimensions/2, 0.85 * courseDimensions, 0.000003, TurfTypes.Fairway);
        this.#generateCoursePath(x, z, 50, 0.004, TurfTypes.Green);
    }

    #createMesh(){
        // Index by quad
        for(let z=0; z<courseDimensions; z++){
            for(let x=0; x<courseDimensions; x++){
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

                const turfType = TurfTypes[Object.keys(TurfTypes)[this.courseData[x][z]]];
                this.builder.addQuad(v0, v1, v2, v3, turfType.color);
            }
        }

        // Construct the mesh from the vertices/positions
        this.mesh = this.builder.finish();
    }
};