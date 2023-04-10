import { SceneComponent } from "./PrivateRyRender.js";
export declare class Camera extends SceneComponent {
    private projection;
    private view;
    private _pos;
    private fov;
    viewStartX: number;
    viewStartY: number;
    viewWorldSpaceWidth: number;
    viewWorldSpaceHeight: number;
    isActive: boolean;
    private nearPlane;
    private farPlane;
    private isPerspective;
    constructor(viewportWidth: number, viewportHeight: number);
    get pos(): number[];
    setNormalizedViewport(x: number, y: number, width: number, height: number): void;
    setToPerspective(viewportWorldSpaceWidth: number, viewportWorldSpaceHeight: number, fov?: number, nearPlane?: number, farPlane?: number): void;
    setToOrthographic(viewportWorldSpaceWidth: number, viewportWorldSpaceHeight: number, nearPlane?: number, farPlane?: number): void;
    updateProjection(newViewportWidth: number, newViewportHeight: number): void;
    getProjection(): readonly number[];
    getView(): readonly number[];
}
