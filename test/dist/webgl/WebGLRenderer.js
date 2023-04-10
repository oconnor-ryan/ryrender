import { Model, WebGLManager } from "../PrivateRyRender.js";
export class WebGLRenderer {
    constructor(canvas, useBestGPU = true) {
        this.clearColor = [0.0, 0.0, 0.0, 1.0];
        let webglOptions;
        webglOptions = useBestGPU ? { powerPreference: 'high-performance' } : null;
        this.gl = canvas.getContext("webgl", webglOptions);
        if (this.gl == null) {
            let contexts = ["2d", "webgl2", "bitmaprenderer"];
            for (let i = 0; i < contexts.length; i++) {
                if (canvas.getContext(contexts[i]) != null) {
                    console.error(`Canvas is set to the ${contexts[i]}` +
                        "rendering context.");
                    break;
                }
            }
            return;
        }
        this.manager = new WebGLManager(this.gl);
        this.drawModelRef = this.drawModel.bind(this);
        this.gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.FRONT);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }
    setClearColor(r, g, b, a) {
        this.clearColor[0] = r;
        this.clearColor[1] = g;
        this.clearColor[2] = b;
        this.clearColor[3] = a;
    }
    //TODO: Sort Model[] so that there is an array of models for each Mesh
    // This means less calls to bindVao and helps with instanced rendering
    render(scene) {
        this.gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        var canWidth = this.gl.canvas.width;
        var canHeight = this.gl.canvas.height;
        this.manager.setLightUniforms(scene.lights);
        for (const cam of scene.cameras) {
            if (!cam.isActive) {
                continue;
            }
            this.manager.setCameraUniforms(cam.getView(), cam.getProjection(), cam.pos);
            var x = cam.viewStartX * canWidth;
            var y = cam.viewStartY * canHeight;
            var w = cam.viewWorldSpaceWidth * canWidth;
            var h = cam.viewWorldSpaceHeight * canHeight;
            this.gl.viewport(x, y, w, h);
            scene.useCompAsParameter(this.drawModelRef, true);
        }
    }
    //this is being used for Scene.useCompAsParameter, which is why this
    //checks SceneComponent parameter is a Model
    drawModel(model) {
        if (!(model instanceof Model)) {
            return;
        }
        this.manager.setModelUniforms(model);
        this.manager.bindVao(model.mesh.id);
        this.manager.bindProgram(model.material);
        this.manager.bindTexture2D(model.textureId);
        this.gl.drawElements(this.gl.TRIANGLES, model.mesh.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }
}
