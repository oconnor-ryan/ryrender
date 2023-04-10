import { WebGLManager, Scene } from "../PrivateRyRender.js";
export declare class WebGLRenderer {
    private readonly gl;
    readonly manager: WebGLManager;
    private clearColor;
    private drawModelRef;
    constructor(canvas: HTMLCanvasElement, useBestGPU?: boolean);
    setClearColor(r: number, g: number, b: number, a: number): void;
    render(scene: Scene): void;
    private drawModel;
}
