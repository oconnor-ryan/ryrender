import { WebGLRenderer } from "./PrivateRyRender.js";
// TODO: Add some sort of Scene class so that models and lights are not stored in the manager
/*
    NOTE: Only one canvas/WebGL context per RyRenderManager
*/
export class RyRenderManager {
    constructor(canvas, useBestGPU = true) {
        this.lastLoop = null;
        this._isRunning = false;
        this.currentScene = null;
        if (canvas == null) {
            console.error("Canvas is null. An HTMLCanvasElement must be an " +
                "argument in this constructor.");
            return;
        }
        this.canvas = canvas;
        this.renderer = new WebGLRenderer(this.canvas, useBestGPU);
        this.updateRef = this.update.bind(this);
    }
    setScene(scene) {
        this.currentScene = scene;
    }
    updateRendererWithCacheData() {
        this.renderer.manager.updateCaches();
    }
    setClearColor(r, g, b, a) {
        this.renderer.setClearColor(r, g, b, a);
    }
    resizeViewport() {
        for (const cam of this.currentScene.cameras) {
            cam.updateProjection(this.canvas.width, this.canvas.height);
        }
    }
    isRunning() {
        return this._isRunning;
    }
    setUpdateLoop(func) {
        this.userDefinedUpdateLoop = func;
    }
    render() {
        if (!this._isRunning) {
            window.requestAnimationFrame(this.updateRef);
        }
    }
    startRenderLoop() {
        if (!this._isRunning) {
            this.lastLoop = null;
            this._isRunning = true;
            window.requestAnimationFrame(this.updateRef);
        }
    }
    stopRenderLoop() {
        this._isRunning = false;
    }
    update(animFrameTimeMillis) {
        if (this.lastLoop == null) {
            this.lastLoop = animFrameTimeMillis;
        }
        var deltaTime = (animFrameTimeMillis - this.lastLoop) / 1000; //in seconds
        this.lastLoop = animFrameTimeMillis;
        if (this.userDefinedUpdateLoop != null) {
            this.userDefinedUpdateLoop.call(this, deltaTime);
        }
        this.currentScene.updateAll();
        this.renderer.render(this.currentScene);
        if (this._isRunning) {
            window.requestAnimationFrame(this.updateRef);
        }
    }
}
