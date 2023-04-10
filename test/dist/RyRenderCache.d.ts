import { Material, Mesh, MaterialType, Model } from "./PrivateRyRender.js";
export declare class RyRenderCache {
    private static defaultModelMaterial;
    private static defaultTextureForMaterial;
    private static meshCache;
    private static materialCache;
    private static imageCache;
    static getMeshCache(): Readonly<{
        [fileName: string]: Mesh;
    }>;
    static getMaterialCache(): Readonly<{
        [fileName: string]: Material;
    }>;
    static getImageCache(): Readonly<{
        [fileName: string]: HTMLImageElement;
    }>;
    static createModelInstance(meshFile: string, texFile?: string, matType?: MaterialType): Model;
    static loadModelObjToCache(objFile: string, mtlFile: string, rootImgPath: string): Promise<boolean>;
    static loadMeshToCache(file: string): Promise<boolean>;
    static loadMaterialToCache(file: string, rootTextureDir?: string): Promise<boolean>;
    static loadImageToCache(imgPath: string): Promise<boolean>;
}
