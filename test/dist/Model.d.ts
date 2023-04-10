import { Mesh, Material, MaterialType, SceneComponent } from "./PrivateRyRender.js";
export declare class Model extends SceneComponent {
    mesh: Mesh;
    textureId: string;
    material: Material;
    private normMatrix;
    constructor(mesh: Mesh, matType: MaterialType, textureId: string);
    getNormalMatrix(): readonly number[];
}
