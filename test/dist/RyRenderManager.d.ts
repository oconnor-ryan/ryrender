import { Scene } from "./PrivateRyRender.js";
export declare class RyRenderManager {
    private updateRef;
    private lastLoop;
    private _isRunning;
    private userDefinedUpdateLoop;
    private readonly canvas;
    private renderer;
    private currentScene;
    constructor(canvas: HTMLCanvasElement, useBestGPU?: boolean);
    setScene(scene: Scene): void;
    updateRendererWithCacheData(): void;
    setClearColor(r: number, g: number, b: number, a: number): void;
    resizeViewport(): void;
    isRunning(): boolean;
    setUpdateLoop(func: Function): void;
    render(): void;
    startRenderLoop(): void;
    stopRenderLoop(): void;
    private update;
}
