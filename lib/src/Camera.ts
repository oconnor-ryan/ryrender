import {ModelMat4, Mat4, SceneComponent} from "./PrivateRyRender.js";

export class Camera extends SceneComponent {
    private projection: Mat4;
    private view: Mat4; 
    private _pos: number[];

    //for perspective projection
    private fov = Math.PI/4;

    //normalized viewport dimensions between 0 and 1
    public viewStartX = 0;
    public viewStartY = 0;
    public viewWorldSpaceWidth = 0;
    public viewWorldSpaceHeight = 0;

    public isActive = true;

    private nearPlane = 0.1;
    private farPlane = 1000;

    private isPerspective = true;

    constructor(viewportWidth: number, viewportHeight: number) {
        super();
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
    setNormalizedViewport(x: number, y: number, width: number, height: number) {
        this.viewStartX = x;
        this.viewStartY = y;
        this.viewWorldSpaceWidth = width;
        this.viewWorldSpaceHeight = height;

    }

    setToPerspective(viewportWorldSpaceWidth: number,
                     viewportWorldSpaceHeight: number,
                     fov: number = this.fov, 
                     nearPlane: number = this.nearPlane, 
                     farPlane: number = this.farPlane) {
        this.fov = fov;
        var width = viewportWorldSpaceWidth * this.viewWorldSpaceWidth;
        var height = viewportWorldSpaceHeight * this.viewWorldSpaceHeight;
        this.nearPlane = nearPlane;
        this.farPlane = farPlane;
        this.isPerspective = true;
        var aspectRatio = width / height;
        Mat4.perspective(this.fov, aspectRatio, this.nearPlane, this.farPlane, this.projection);
    }

    setToOrthographic(viewportWorldSpaceWidth: number,
                      viewportWorldSpaceHeight: number,
                      nearPlane: number = this.nearPlane, 
                      farPlane: number = this.farPlane) { 

        var width = viewportWorldSpaceWidth * this.viewWorldSpaceWidth;
        var height = viewportWorldSpaceHeight * this.viewWorldSpaceHeight;
        var left = this.viewStartX * viewportWorldSpaceWidth;
        var right = left + width;
        var bottom = this.viewStartY * viewportWorldSpaceHeight;
        var top = bottom + height;
        this.nearPlane = nearPlane;
        this.farPlane = farPlane;
        this.isPerspective = false;
        Mat4.orthographic(left,right,top,bottom,this.nearPlane, this.farPlane, this.projection);
    }

    updateProjection(newViewportWidth: number, newViewportHeight: number) {
        this.isPerspective ? this.setToPerspective(newViewportWidth, newViewportHeight) :
                             this.setToOrthographic(newViewportWidth, newViewportHeight);
    }

    getProjection() : readonly number[] {
        return this.projection.getArrayRef();
    }

    getView() : readonly number[] {
        this.view.setEqualTo(this.worldTransforms);
        this.view.inv();
        return this.view.getArrayRef();
    }
}