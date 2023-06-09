import { Material, Light, Model } from "../PrivateRyRender.js";
export declare class WebGLManager {
    private readonly gl;
    private readonly oes;
    private readonly instanceExt;
    readonly useInstancing: boolean;
    private readonly MAX_ATTRIBUTES;
    private vaoCache;
    private shaderProgramCache;
    private uniformCache;
    private tex2dCache;
    private texCubeCache;
    private default2dTex;
    constructor(gl: WebGLRenderingContext);
    private initShaderPrograms;
    private addDefaultTexture;
    updateCaches(): void;
    hasVao(name: string): boolean;
    hasProgram(name: string): boolean;
    hasTexture2D(name: string): boolean;
    hasTextureCube(name: string): boolean;
    addVao(name: string, vertices: readonly number[], uv: readonly number[], normals: readonly number[], indices: readonly number[]): void;
    addInstancedVao(name: string, vertices: readonly number[], uv: readonly number[], normals: readonly number[], indices: readonly number[], maxInstances: number): void;
    addProgram(index: number, glslV: string, glslF: string): void;
    addTexture2D(name: string, image: HTMLImageElement): void;
    addTextureCube(name: string, ...images: HTMLImageElement[]): void;
    bindVao(name: string): void;
    bindProgram(material: Material): void;
    bindTexture2D(name: string): void;
    bindTextureCube(name: string): void;
    setModelUniforms(model: Model): void;
    setCameraUniforms(view: readonly number[], proj: readonly number[], cameraPos: readonly number[]): void;
    setLightUniforms(lights: readonly Light[]): void;
    private powOf2;
    private addAttribute;
}
