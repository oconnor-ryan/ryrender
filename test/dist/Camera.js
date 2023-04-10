import { Mat4, SceneComponent } from "./PrivateRyRender.js";
export class Camera extends SceneComponent {
    constructor(viewportWidth, viewportHeight) {
        super();
        //for perspective projection
        this.fov = Math.PI / 4;
        //normalized viewport dimensions between 0 and 1
        this.viewStartX = 0;
        this.viewStartY = 0;
        this.viewWorldSpaceWidth = 0;
        this.viewWorldSpaceHeight = 0;
        this.isActive = true;
        this.nearPlane = 0.1;
        this.farPlane = 1000;
        this.isPerspective = true;
        this._pos = this.worldTransforms.getPos();
        this.projection = new Mat4();
        this.setToPerspective(viewportWidth, viewportHeight);
        this.view = new Mat4();
    }
    get pos() {
        this.worldTransforms.getPos(this._pos);
        return this._pos;
    }
    //Normalized means that ALL values are between 0 and 1
    setNormalizedViewport(x, y, width, height) {
        this.viewStartX = x;
        this.viewStartY = y;
        this.viewWorldSpaceWidth = width;
        this.viewWorldSpaceHeight = height;
    }
    setToPerspective(viewportWorldSpaceWidth, viewportWorldSpaceHeight, fov = this.fov, nearPlane = this.nearPlane, farPlane = this.farPlane) {
        this.fov = fov;
        var width = viewportWorldSpaceWidth * this.viewWorldSpaceWidth;
        var height = viewportWorldSpaceHeight * this.viewWorldSpaceHeight;
        this.nearPlane = nearPlane;
        this.farPlane = farPlane;
        this.isPerspective = true;
        var aspectRatio = width / height;
        Mat4.perspective(this.fov, aspectRatio, this.nearPlane, this.farPlane, this.projection);
    }
    setToOrthographic(viewportWorldSpaceWidth, viewportWorldSpaceHeight, nearPlane = this.nearPlane, farPlane = this.farPlane) {
        var width = viewportWorldSpaceWidth * this.viewWorldSpaceWidth;
        var height = viewportWorldSpaceHeight * this.viewWorldSpaceHeight;
        var left = this.viewStartX * viewportWorldSpaceWidth;
        var right = left + width;
        var bottom = this.viewStartY * viewportWorldSpaceHeight;
        var top = bottom + height;
        this.nearPlane = nearPlane;
        this.farPlane = farPlane;
        this.isPerspective = false;
        Mat4.orthographic(left, right, top, bottom, this.nearPlane, this.farPlane, this.projection);
    }
    updateProjection(newViewportWidth, newViewportHeight) {
        this.isPerspective ? this.setToPerspective(newViewportWidth, newViewportHeight) :
            this.setToOrthographic(newViewportWidth, newViewportHeight);
    }
    getProjection() {
        return this.projection.getArrayRef();
    }
    getView() {
        this.view.setEqualTo(this.worldTransforms);
        this.view.inv();
        return this.view.getArrayRef();
    }
}
