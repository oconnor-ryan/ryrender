import { SceneComponent } from "./PrivateRyRender.js";
export class Light extends SceneComponent {
    constructor(diffuse, ambient, specular) {
        super();
        this.diffuse = diffuse;
        this.specular = specular;
        this.ambient = ambient;
    }
}
export class PointLight extends Light {
    constructor(pos, diffuse, ambient, specular) {
        super(diffuse, ambient, specular);
        this.pos = pos;
    }
}
