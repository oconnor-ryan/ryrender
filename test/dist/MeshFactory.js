import { Mesh } from "./PrivateRyRender.js";
export class MeshFactory {
    static makeUnitCube() {
        //facing toward +z, +x is right, -x is left
        var vertices = [
            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5 //bottom-right bottom
        ];
        var uv = [];
        var normals = [];
        var indices = [
            0, 2,
            2, 3,
            3, 1,
            1, 0,
            0, 4,
            4, 5,
            5, 1,
            7, 5,
            3, 7,
            2, 6,
            6, 7,
            4, 6
        ];
        return new Mesh("Cube", vertices, uv, normals, indices);
    }
    /*
        For Sphere Id and other mesh Ids where they can have different levels of detail,
        append the number of vertices to the name Sphere. For example, a sphere made with 5 vertices
        will have the id "Sphere5". A sphere made with 100 vertices is "Sphere100"
    */
    static makeUnitSphere(numSubdivisions) {
    }
}
