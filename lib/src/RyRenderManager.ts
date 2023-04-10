import {
    WebGLRenderer, 
    Scene
} from "./PrivateRyRender.js";

// TODO: Add some sort of Scene class so that models and lights are not stored in the manager

/*
    NOTE: Only one canvas/WebGL context per RyRenderManager
*/
export class RyRenderManager {
    //requestAnimationFrame callback and variables
    private updateRef: FrameRequestCallback;
    private lastLoop: number = null;
    private _isRunning: boolean = false;
    private userDefinedUpdateLoop: Function;

    //context and canvas
    private readonly canvas: HTMLCanvasElement;
    private renderer: WebGLRenderer;

    private currentScene: Scene = null;

    constructor(canvas: HTMLCanvasElement, useBestGPU: boolean = true) {
        if(canvas == null) {
            console.error("Canvas is null. An HTMLCanvasElement must be an "+ 
                          "argument in this constructor.");
            return;
        }
        this.canvas = canvas;
        this.renderer = new WebGLRenderer(this.canvas, useBestGPU); 
        
        this.updateRef = this.update.bind(this);
    }

    public setScene(scene: Scene) {
        this.currentScene = scene;
    }

    public updateRendererWithCacheData() {
        this.renderer.manager.updateCaches();
    }

    public setClearColor(r: number, g: number, b: number, a: number) {
        this.renderer.setClearColor(r,g,b,a);
    }
    
    public resizeViewport() {
        for(const cam of this.currentScene.cameras) {
            cam.updateProjection(this.canvas.width, this.canvas.height);
        }
    }

    public isRunning() : boolean {
        return this._isRunning;
    }

    public setUpdateLoop(func: Function) {
        this.userDefinedUpdateLoop = func;
    }

    public render() {
        if(!this._isRunning) {
            window.requestAnimationFrame(this.updateRef);
        }
    }

    public startRenderLoop() {
        if(!this._isRunning) {
            this.lastLoop = null;
            this._isRunning = true;
            window.requestAnimationFrame(this.updateRef);
        }
    }

    public stopRenderLoop() {
        this._isRunning = false;
    }

    private update(animFrameTimeMillis: number) {
        if(this.lastLoop == null) {
            this.lastLoop = animFrameTimeMillis;
        }
        var deltaTime = (animFrameTimeMillis - this.lastLoop) / 1000; //in seconds
        this.lastLoop = animFrameTimeMillis;

        if(this.userDefinedUpdateLoop != null) {
            this.userDefinedUpdateLoop.call(this, deltaTime);
        }

        this.currentScene.updateAll();
        
        this.renderer.render(this.currentScene);

        if(this._isRunning) {
            window.requestAnimationFrame(this.updateRef);
        }
    }
}