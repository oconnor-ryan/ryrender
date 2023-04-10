/*
    The collection of vertices, faces, uv coordinates, and normals of a model.
    Similar to the Geometry class from Three.js
*/
//should be immutable
export class Mesh {
    constructor(id, vertices, uv, normals, indices) {
        this.id = id;
        this.vertices = vertices;
        this.uv = uv;
        this.normals = normals;
        this.indices = indices;
    }
}
