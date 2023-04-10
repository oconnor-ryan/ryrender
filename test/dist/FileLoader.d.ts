import { Material } from "./PrivateRyRender.js";
export declare class FileLoader {
    static loadImage(file: string): Promise<HTMLImageElement>;
    static loadObj(file: string): Promise<{
        vertices: number[];
        uv: number[];
        normals: number[];
        indices: number[];
    }>;
    static loadMTL(file: string): Promise<{
        mat: Material;
        texPath: string;
    }>;
    private static getFile;
}
