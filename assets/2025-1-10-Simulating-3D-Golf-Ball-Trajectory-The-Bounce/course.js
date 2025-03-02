import * as THREE from 'three';
import MeshBuilder from './mesh_builder.js';

const quadSize = 1.0;
const noiseXZScale = 0.005;
const noiseYScale = 10.0;
export const courseDimensions = 512;
const courseThicknessRadius = 15.0;


const TurfTypes = {
    Rough:          {index: 0, color: new THREE.Color(0.0, 0.1, 0.0)},
    Fairway:        {index: 1, color: new THREE.Color(0.0, 0.4, 0.0)},
    Green:          {index: 2, color: new THREE.Color(0.0, 0.9, 0.0)},
    Sand:           {index: 3, color: new THREE.Color(1.0, 0.82, 0.34)},
    FairwayFringe:  {index: 4, color: new THREE.Color(0.0, 0.3, 0.0)},
    GreenFringe:    {index: 5, color: new THREE.Color(0.0, 0.7, 0.0)}
}


export default class Course{
    constructor(){
        // Setup simple-noise noise
        // https://github.com/jwagner/simplex-noise.js?tab=readme-ov-file#2d
        this.noise = window.exports.createNoise2D(() => {return Math.random()});
        this.builder = new MeshBuilder();
        this.mesh = undefined;
        this.turf = [];   // Indices from `TurfTypes`

        this.#createCourse();
        this.#createMesh();
    }

    #fillCourseDataCircle(x, z, radius, turfTypeIndex){
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
                    this.turf[parseInt(x+ix)][parseInt(z+iz)] = turfTypeIndex;
                }
            }
        }
    }

    #fillTurf(turfType){
        // Init turf data
        for(let i=0; i<courseDimensions; i++){
            this.turf.push([]);
            for(let j=0; j<courseDimensions; j++){
                this.turf[i].push(turfType.index); // Fill course with "rough"
            }
        }
    }


    #outline(initialTurfTypeIndex, edgeTurfTypeIndex) {      
        for(let x=0; x<courseDimensions; x++){
            for(let z=0; z<courseDimensions; z++){
                if(this.turf[x][z] != initialTurfTypeIndex){
                    continue;
                }

                if((this.turf[x+1][z] != initialTurfTypeIndex && this.turf[x+1][z]   != edgeTurfTypeIndex) ||
                   (this.turf[x-1][z] != initialTurfTypeIndex && this.turf[x-1][z]   != edgeTurfTypeIndex) ||
                   (this.turf[x][z+1] != initialTurfTypeIndex && this.turf[x][z+1] != edgeTurfTypeIndex) ||
                   (this.turf[x][z-1] != initialTurfTypeIndex && this.turf[x][z-1] != edgeTurfTypeIndex)){
                    this.#fillCourseDataCircle(x, z, 2, edgeTurfTypeIndex)
                }
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

            // Adjust thickness of course as it is drawn
            const adjustedThickness = courseThicknessRadius * (0.5 + (0.5 + 0.5*this.noise(1000, i * 0.001))) * 1.5;

            // Draw a circle to fill in the course
            this.#fillCourseDataCircle(x, z, adjustedThickness, turfType.index);

            // Slowly changing direction of fairway
            courseDirection = this.noise(i * sensitivity, i * sensitivity) * 2;
        }

        return [x, z];
    }

    #createCourse(){
        // Fill with default data
        this.#fillTurf(TurfTypes.Rough);

        // Generate fairway
        const fairwayStartX = courseThicknessRadius*2;
        const fairwayStartZ = courseDimensions/2;

        const [x, z] = this.#generateCoursePath(fairwayStartX, fairwayStartZ, 0.65 * courseDimensions, 0.00015, TurfTypes.Fairway);
        this.#outline(TurfTypes.Fairway.index, TurfTypes.FairwayFringe.index);

        // Generate green
        this.#generateCoursePath(x, z, 75, 0.04, TurfTypes.Green);
        this.#outline(TurfTypes.Green.index, TurfTypes.GreenFringe.index);
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

                const turfType = TurfTypes[Object.keys(TurfTypes)[this.turf[x][z]]];
                this.builder.addQuad(v0, v1, v2, v3, turfType.color);
            }
        }

        // Construct the mesh from the vertices/positions
        this.mesh = this.builder.finish();
    }
};