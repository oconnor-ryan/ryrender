import {WebGLWindowHandler} from "./GuiHandler.js";

import * as RyRender from "./dist/index.js";


const CUBE_PATH = "./res/models/cube.obj";
const CUBE_MTL = "./res/models/cube.mtl";

const METAL_TEX = "./res/textures/metal_tex.jpg";

const BOMB_PATH = "./res/models/V1 Space Bomb.obj";

const SPACE_PATH = "./res/textures/space.jpg";

const MISSLE_PATH = "./res/models/Missle.obj";
const MISSLE_MTL = "./res/models/Missle.mtl";

class Controller {
    private keys: Set<string> = new Set();

    private keyupRef: EventListener;
    private keydownRef: EventListener;

    constructor() {
        this.keyupRef = this.keyup.bind(this);
        this.keydownRef = this.keydown.bind(this);

        window.addEventListener("keydown", this.keydownRef, false);
        window.addEventListener("keyup", this.keyupRef, false);
    }

    getKeyIter() : Readonly<IterableIterator<string>> {
        return this.keys.values();
    }

    keydown(e: KeyboardEvent) {
        if(!this.keys.has(e.key.toLowerCase())) {
            this.keys.add(e.key.toLowerCase());
        }
    }

    keyup(e: KeyboardEvent) {
        this.keys.delete(e.key.toLowerCase());
        //removes uppercase letters if user holds down button, hits caps lock, and releases button
        //this.keys.delete(e.key.toUpperCase()); 
    }
}

class RenderTest {
    private gui: WebGLWindowHandler;
    private ryrender: RyRender.RyRenderManager;

    private controller: Controller;

    private phongCube: RyRender.Model;
    private phongBomb: RyRender.Model;
    private missle: RyRender.Model;

    private sceneOrigin: RyRender.SceneComponent;

    private bunchOfModels: RyRender.Model[] = [];

    private camYaw = Math.PI/2;
    private camPitch = 0;

    private iter = 0;
    
    //test performance
    private fps = 0;
    private fpsDisplayCounter = 0;

    private colorBackgroundToggle = false;

    private scene: RyRender.Scene;
    
    constructor() {
        this.gui = new WebGLWindowHandler();
        this.controller = new Controller();

        var phongMaterial = new RyRender.Material(RyRender.MaterialType.PHONG);
        phongMaterial.mtlDiffuse = [1,1,1];
        phongMaterial.mtlAmbient = [1,1,1];
        phongMaterial.mtlSpecular = [1,1,1];
        phongMaterial.mtlShininess = 256;


        this.ryrender = new RyRender.RyRenderManager(this.gui.getGLContext().canvas);
        this.ryrender.setClearColor(0,0,0,1);
        this.ryrender.setUpdateLoop(this.update.bind(this));

        this.scene = new RyRender.Scene();
        this.ryrender.setScene(this.scene);
        

        let w = this.gui.getGLContext().canvas.width;
        let h = this.gui.getGLContext().canvas.height;

       //Note that width and height are in WORLD SPACE, not screen space
       // cam1.setToOrthographic(w/100, h/100, 0.1, 1000);

        this.gui.setFullscreenEventCallback(this.ryrender.resizeViewport.bind(this.ryrender));

        window.addEventListener("keydown", this.keyupForRenderer.bind(this), false);
        
        this.initRyRender().then((success) => {
            if(!success) {
                console.error("One or more files did not load!");
                return;
            }

            this.ryrender.updateRendererWithCacheData();

            this.phongCube = RyRender.RyRenderCache.createModelInstance(CUBE_PATH, SPACE_PATH, RyRender.MaterialType.PHONG);//loads from all caches under same file name
            this.phongCube.localTransforms.setTranslation(0,0,4);
            
            this.phongBomb = RyRender.RyRenderCache.createModelInstance(BOMB_PATH, null, RyRender.MaterialType.PHONG);
            this.phongBomb.localTransforms.setTranslation(-2,0,4);
            this.phongBomb.localTransforms.setScale(0.1,0.1,0.1);
            this.phongBomb.material.copyNonNullValuesFrom(phongMaterial);
            
            this.missle = RyRender.RyRenderCache.createModelInstance(MISSLE_PATH, null, RyRender.MaterialType.PHONG);//loads from all caches under same file name
            this.missle.localTransforms.setTranslation(2,0,4);
            this.missle.localTransforms.setScale(0.2,0.2,0.2);

            this.bunchOfModels.push(this.phongBomb, this.phongCube, this.missle);
            this.generateLotsOfCubes2();

            //set up the scene
            this.scene.add(new RyRender.PointLight([0,0,0], [0.7,0.7,0.7], [0.1,0.1,0.1], [1,1,1]));
            this.scene.add(new RyRender.PointLight([0,10,0], [0.9,0.0,0.0], [0.1,0.1,0.1], [1,1,1]));

            let cam = new RyRender.Camera(w,h);
            cam.setNormalizedViewport(0,0,1,1);
            cam.setToPerspective(w,h,Math.PI/4,0.1,1000);

            this.scene.add(cam);
            this.scene.add(this.phongBomb);

            this.sceneOrigin = new RyRender.SceneComponent();
            this.sceneOrigin.addComps(this.bunchOfModels);
            this.scene.add(this.sceneOrigin);

            this.ryrender.startRenderLoop();
        });
    }

    private async initRyRender() {

        var a = await RyRender.RyRenderCache.loadModelObjToCache(CUBE_PATH, CUBE_MTL, "./res/textures");
        var b = await RyRender.RyRenderCache.loadImageToCache(METAL_TEX);
        var c = await RyRender.RyRenderCache.loadMeshToCache(BOMB_PATH);
        var d = await RyRender.RyRenderCache.loadImageToCache(SPACE_PATH);
        var e = await RyRender.RyRenderCache.loadModelObjToCache(MISSLE_PATH, MISSLE_MTL, "./res/textures");

        console.log(a,b,c,d,e);
        
        return a && b && c && d && e; 
    }

    private generateLotsOfCubes2() {
        var xMin = -15;
        var xMax = 15;
        var yMin = -15;
        var yMax = 15;
        var zMin = -15;
        var zMax = 15;

        var scale = 0.5;

        //BENCHMARK:

        // 25 fps for PHONG material cubes at 8000 cubes
        // 60 fps for BASIC material cubes at 8000 cubes  
        // 10 fps for PHONG material cubes at 16000 cubes  
        // 40 fps for BASIC material cubes at 16000 cubes  


        for(var i = 0; i < 4000; i++) { 
            var x = ((xMax - xMin) / 2) * (Math.round(Math.random()) == 0 ? -1 : 1);
            var y = ((yMax - yMin) / 2) * (Math.round(Math.random()) == 0 ? -1 : 1);
            var z = ((zMax - zMin) / 2) * (Math.round(Math.random()) == 0 ? -1 : 1);

            var cube = RyRender.RyRenderCache.createModelInstance(CUBE_PATH, null, RyRender.MaterialType.PHONG);
            cube.localTransforms.setTranslation(x*Math.random(), y*Math.random(), z*Math.random());
            cube.localTransforms.setScale(scale, scale, scale);
            this.bunchOfModels.push(cube);
        }

    }

    keyupForRenderer(e: KeyboardEvent) {
        switch(e.key.toLowerCase()) {
            case "f":
                if(!this.gui.isFullscreen()) {
                    this.gui.fullscreen();
                }
                break;
            case "r":
                this.ryrender.isRunning() ? this.ryrender.stopRenderLoop() : this.ryrender.startRenderLoop();
                break;
            case "b":
                this.colorBackgroundToggle = !this.colorBackgroundToggle;
                if(this.colorBackgroundToggle) {
                    this.ryrender.setClearColor(0,0,1,1);
                } else {
                    this.ryrender.setClearColor(0,0,0,1);
                }
                break;
            case "m":
                for(const model of this.bunchOfModels) {
                    model.material.type = model.material.type === RyRender.MaterialType.BASIC ? RyRender.MaterialType.PHONG : RyRender.MaterialType.BASIC;
                }
                break;
        }
    }

    update(deltaTime: number) {        
        this.handleController(deltaTime);

        var camTransforms = this.scene.cameras[0].localTransforms;

        
        //FIXME: Tempory way to allow camera to rotate like an FPS camera (yaw and pitch)
        var foward: number[] = new Array(3);
        foward[0] = Math.cos(this.camYaw) * Math.cos(this.camPitch);
        foward[1] = Math.sin(this.camPitch);
        foward[2] = Math.sin(this.camYaw) * Math.cos(this.camPitch);
        RyRender.Vector.normalize(foward);
        var right = RyRender.Vector.cross([0,1,0], foward);
        var up = RyRender.Vector.cross(foward, right);
        camTransforms.setRotationVectors(foward, right, up);
        
        

        this.scene.lights[0].diffuse[0] = Math.sin(this.iter / 1);
        this.scene.lights[0].diffuse[1] = Math.sin(this.iter / 2);
        this.scene.lights[0].diffuse[2] = Math.cos(this.iter / 0.5);


        //Does not appear to do anything because the orientation of the cameras
        // are relative to the Scene. Thus, when the Scene, rotates, the cameras,
        // rotate the exact same way
        //this.scene.localTransforms.rotateAlongAxis(10*deltaTime, [0,1,0]);

        //this causes all objects in scene origin to revolve around position of
        //SceneOrigin
        this.sceneOrigin.localTransforms.rotateAlongAxis(deltaTime/10, [0,1,0]);

        for(let i = 0; i < this.bunchOfModels.length; i++) {
            this.bunchOfModels[i].localTransforms.rotateAlongAxis(deltaTime, [0,1,0]);
        }

        var ctx2 = this.gui.get2dContext();
        ctx2.clearRect(0,0,ctx2.canvas.width,ctx2.canvas.height);
        ctx2.fillStyle = "orange";
        ctx2.font = "12px Arial";
        var pos = this.scene.cameras[0].pos;
        ctx2.fillText("FPS = " + this.fps, 100,100);
        ctx2.fillText("Camera Pos = (" + pos[0].toFixed(2) + ", " + pos[1].toFixed(2) + ", "+ pos[2].toFixed(2) + ");", 100, 200);
        ctx2.fillText("Number of Rendered Instances = " + this.bunchOfModels.length, 100, 300);
        if(this.fpsDisplayCounter > 0.5) {
            this.fps = Math.round(1 / deltaTime);
            this.fpsDisplayCounter = -deltaTime;
        }
        

        this.fpsDisplayCounter += deltaTime;
        this.iter += deltaTime;
    }

    handleController(deltaTime: number) {
        var iter = this.controller.getKeyIter();
        let camTransforms = this.scene.cameras[0].localTransforms;
        for(const key of iter) {
            switch(key.toLowerCase()) {
                case "arrowright":
                    this.camYaw -= deltaTime;
                    break;
                case "arrowleft":
                    this.camYaw += deltaTime;
                    break;
                case "arrowup":
                    this.camPitch += deltaTime;
                    break;
                case "arrowdown":
                    this.camPitch -= deltaTime;
                    break;
                case "w":
                    camTransforms.translateAlongVector(3*deltaTime, camTransforms.getFowardVector());
                    break;
                case "s":
                    camTransforms.translateAlongVector(-3*deltaTime, camTransforms.getFowardVector());
                    break;
                case "a":
                    camTransforms.translateAlongVector(-3*deltaTime, camTransforms.getRightVector());
                    break;
                case "d":
                    camTransforms.translateAlongVector(3*deltaTime, camTransforms.getRightVector());
                    break;
                case " ":
                    camTransforms.translateAlongVector(3*deltaTime, camTransforms.getUpVector());
                    break;
                case "shift":
                    camTransforms.translateAlongVector(-3*deltaTime, camTransforms.getUpVector());
                    break;
            }
        }
        if(this.camPitch >= Math.PI/2) {
            this.camPitch = Math.PI/2 - 0.001;
        } else if(this.camPitch <= -Math.PI/2) {
            this.camPitch = -Math.PI/2 + 0.001;
        }
        if(this.camYaw >= 2*Math.PI) {
            this.camYaw = 0.001;
        } else if(this.camYaw < 0) {
            this.camYaw = 2*Math.PI - 0.001;;
        }
    }
}

window.onload = function() {
    new RenderTest();
}