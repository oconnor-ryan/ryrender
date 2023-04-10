export enum MaterialType {
    BASIC, 
    PHONG,
    CUSTOM,
}

/*
    Contains the information needed to render the shading of the model.
    Also determines how light is reflected, refracted, etc.
*/
export class Material {
    mtlDiffuse: number[] | readonly number[] = null;
    mtlAmbient: number[] | readonly number[] = null;
    mtlSpecular: number[] | readonly number[] = null;
    mtlShininess: number = null;
    texSample: number = null;
    type: MaterialType = null;

    constructor(type?: MaterialType, properties?: Object) {
        this.type = type === null ? MaterialType.BASIC : type;
        this.setMaterialPropertiesFromObject(properties);
    }


    setMaterialPropertiesFromObject(properties: Object) {
        if(properties === null || properties === undefined) {
            return;
        }
        var keys = Object.keys(properties);
        for(const name of keys) {
            if(this.hasOwnProperty(name) && !(this[name] instanceof Function)) {
                this[name] = properties[name];
            }
        }
    }

    copyNonNullValuesFrom(material: Material) {
        var keys = Object.keys(material);
        for(const name of keys) {
            if(this.hasOwnProperty(name) && !(this[name] instanceof Function) && material[name] != null) {
                this[name] = material[name];
            }
        }
    }
}
