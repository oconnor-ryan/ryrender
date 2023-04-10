export declare class Vector {
    static add(arr1: number[], arr2: number[], arrDest?: number[]): number[];
    static sub(arr1: number[], arr2: number[], arrDest?: number[]): number[];
    static dot(arr1: number[], arr2: number[]): number;
    static cross(arr1: number[], arr2: number[], arrDest?: number[]): number[];
    static mult(arr: number[], scalar: number): void;
    static addScalar(arr: number[], scalar: number): void;
    static getMag(arr: number[]): number;
    static isZero(arr: number[]): boolean;
    static negate(arr: number[]): void;
    static normalize(arr: number[]): void;
    static setMag(arr: number[], mag: number): void;
    static toString(arr: number[], precision?: number): string;
}
declare class AbstractWebGLMatrix {
    protected arr: number[];
    constructor(arr?: number[]);
    setEqualTo(arr: readonly number[] | Readonly<AbstractWebGLMatrix>): void;
    protected cleanInput(out: Readonly<AbstractWebGLMatrix> | readonly number[]): number[];
    getArrayRef(): readonly number[];
    getArrayCopy(): number[];
    add(m1: AbstractWebGLMatrix | number[]): void;
    addAll(...matrices: Array<AbstractWebGLMatrix | number[]>): void;
    sub(m1: AbstractWebGLMatrix | number[]): void;
    subAll(...matrices: Array<AbstractWebGLMatrix | number[]>): void;
    setAllToScalar(scalar: number): void;
    multScalar(scalar: number): void;
    static toString(mat: AbstractWebGLMatrix, rows: number, cols: number, precision?: number): string;
}
export declare class Mat4 extends AbstractWebGLMatrix {
    constructor(arr?: number[]);
    static identity(out?: Mat4): void | Mat4;
    static orthographic(left: number, right: number, top: number, bottom: number, nearPlane: number, farPlane: number, out?: Mat4): Mat4;
    static perspective(angle: number, aspect_ratio: number, nearPlane: number, farPlane: number, out?: Mat4): Mat4;
    static mult(out: Mat4, m1: Mat4, m2: Mat4): void;
    static multAll(out: Mat4, ...matrices: Array<Readonly<Mat4>>): void;
    mult(m1: Readonly<Mat4>): void;
    multVector(vec: number[]): number[];
    multAll(...matrices: Array<Readonly<Mat4>>): void;
    transpose(): void;
    getMat3(out?: Mat3): Mat3 | void;
    translate(x: number, y: number, z: number): void;
    scale(x: number, y: number, z: number): void;
    setRotationAxis(angle: number, axis: number[]): void;
    rotateAlongAxis(angle: number, axis: number[]): void;
    inv(): void;
    toString(precision?: number): string;
}
export declare class ModelMat4 extends Mat4 {
    constructor(arr?: number[]);
    translate(x: number, y: number, z: number): void;
    scale(x: number, y: number, z: number): void;
    setTranslation(x: number, y: number, z: number): void;
    setRotationAxis(angle: number, axis: number[]): void;
    rotateAlongAxis(angle: number, axis: number[]): void;
    setScale(x: number, y: number, z: number): void;
    setRotationVectors(foward: number[], right: number[], up: number[]): void;
    translateAlongVector(distance: number, vector: number[]): void;
    getPos(out?: number[]): number[];
    getScaling(out?: number[]): number[] | void;
    getFowardVector(out?: number[]): number[];
    getRightVector(out?: number[]): number[];
    getUpVector(out?: number[]): number[];
    getNormalMatrix(out?: Mat3): Mat3;
}
export declare class Mat3 extends AbstractWebGLMatrix {
    constructor(arr?: number[]);
    static identity(out?: Mat3): void | Mat3;
    mult(m1: Mat3): void;
    multVector(vec: number[]): number[];
    multAll(...matrices: Array<Mat3>): void;
    transpose(): void;
    inv(): void;
    toString(precision?: number): string;
}
export {};
