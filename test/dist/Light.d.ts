import { SceneComponent } from "./PrivateRyRender.js";
export declare class Light extends SceneComponent {
    diffuse: number[];
    ambient: number[];
    specular: number[];
    constructor(diffuse?: number[], ambient?: number[], specular?: number[]);
}
export declare class PointLight extends Light {
    pos: number[];
    constructor(pos: number[], diffuse?: number[], ambient?: number[], specular?: number[]);
}
