export var MaterialType;
(function (MaterialType) {
    MaterialType[MaterialType["BASIC"] = 0] = "BASIC";
    MaterialType[MaterialType["PHONG"] = 1] = "PHONG";
    MaterialType[MaterialType["CUSTOM"] = 2] = "CUSTOM";
})(MaterialType || (MaterialType = {}));
/*
    Contains the information needed to render the shading of the model.
    Also determines how light is reflected, refracted, etc.
*/
export class Material {
    constructor(type, properties) {
        this.mtlDiffuse = null;
        this.mtlAmbient = null;
        this.mtlSpecular = null;
        this.mtlShininess = null;
        this.texSample = null;
        this.type = null;
        this.type = type === null ? MaterialType.BASIC : type;
        this.setMaterialPropertiesFromObject(properties);
    }
    setMaterialPropertiesFromObject(properties) {
        if (properties === null || properties === undefined) {
            return;
        }
        var keys = Object.keys(properties);
        for (const name of keys) {
            if (this.hasOwnProperty(name) && !(this[name] instanceof Function)) {
                this[name] = properties[name];
            }
        }
    }
    copyNonNullValuesFrom(material) {
        var keys = Object.keys(material);
        for (const name of keys) {
            if (this.hasOwnProperty(name) && !(this[name] instanceof Function) && material[name] != null) {
                this[name] = material[name];
            }
        }
    }
}
