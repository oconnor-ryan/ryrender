import { ModelMat4, Camera, Light } from "./PrivateRyRender.js";
export declare class SceneComponent {
    private _worldTransforms;
    private _localTransforms;
    private parent;
    private children;
    constructor();
    get worldTransforms(): Readonly<ModelMat4>;
    get localTransforms(): ModelMat4;
    add(component: SceneComponent): void;
    addComps(components: SceneComponent[]): void;
    remove(component: SceneComponent): void;
    removeComps(components: SceneComponent[]): void;
    updateWorldTransforms(updateParents: boolean, updateChildren: boolean): void;
    useCompAsParameter(func: Function, addChildrenToFunc: boolean): void;
}
export declare class Scene extends SceneComponent {
    private cameraList;
    private lightList;
    constructor();
    updateAll(): void;
    add(component: SceneComponent): void;
    remove(component: SceneComponent): void;
    get lights(): readonly Light[];
    get cameras(): readonly Camera[];
}
