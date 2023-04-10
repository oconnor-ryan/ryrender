import { Mat3, Material, SceneComponent } from "./PrivateRyRender.js";
/*
    The combination of the Mesh, Material, and Texture data in the cache.
    Each model contains all the necessary data to be rendered.
*/
export class Model extends SceneComponent {
    constructor(mesh, matType, textureId) {
        super();
        this.normMatrix = null;
        this.normMatrix = new Mat3();
        this.mesh = mesh;
        this.material = new Material(matType);
        this.textureId = textureId;
    }
    getNormalMatrix() {
        this.worldTransforms.getNormalMatrix(this.normMatrix);
        return this.normMatrix.getArrayRef();
    }
}
