import { SceneComponent } from "./PrivateRyRender.js";

export class Light extends SceneComponent {
    public diffuse: number[];
    public ambient: number[];
    public specular: number[];

    constructor(diffuse?: number[], ambient?: number[], specular?: number[]) {
        super();
        this.diffuse = diffuse;
        this.specular = specular;
        this.ambient = ambient;
    }
}

export class PointLight extends Light {
    public pos: number[];

    constructor(pos: number[], diffuse?: number[], ambient?: number[], specular?: number[]) {
        super(diffuse, ambient, specular);
        this.pos = pos;
    }
}

