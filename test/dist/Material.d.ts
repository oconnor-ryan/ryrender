export declare enum MaterialType {
    BASIC = 0,
    PHONG = 1,
    CUSTOM = 2
}
export declare class Material {
    mtlDiffuse: number[] | readonly number[];
    mtlAmbient: number[] | readonly number[];
    mtlSpecular: number[] | readonly number[];
    mtlShininess: number;
    texSample: number;
    type: MaterialType;
    constructor(type?: MaterialType, properties?: Object);
    setMaterialPropertiesFromObject(properties: Object): void;
    copyNonNullValuesFrom(material: Material): void;
}
