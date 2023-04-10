import {Mesh, ModelMat4, Mat3, Material, MaterialType, SceneComponent} from "./PrivateRyRender.js";

/*
    The combination of the Mesh, Material, and Texture data in the cache.
    Each model contains all the necessary data to be rendered.
*/ 
export class Model extends SceneComponent {
    public mesh: Mesh;
    public textureId: string;
    public material: Material;

    private normMatrix: Mat3 = null;
    
    constructor(mesh: Mesh, matType: MaterialType, textureId: string) {
        super();
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