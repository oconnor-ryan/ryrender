/*
    The collection of vertices, faces, uv coordinates, and normals of a model.
    Similar to the Geometry class from Three.js
*/

//should be immutable
export class Mesh {
    readonly id: string; //acts as a unique id

    readonly vertices: number[];
    readonly uv: number[];
    readonly normals: number[];
    readonly indices: number[];

    constructor(id: string, vertices: number[], uv: number[], normals: number[], indices: number[]) {
        this.id = id;
        this.vertices = vertices;
        this.uv = uv;
        this.normals = normals;
        this.indices = indices;
    }
}