interface WebGLUniform {
    readonly location: WebGLUniformLocation;
    readonly type: number;
    value: number | number[] | boolean | readonly number[];
}
export declare class WebGLUniformHandler {
    readonly program: WebGLProgram;
    readonly uniforms: {
        [name: string]: WebGLUniform;
    };
    readonly keys: string[];
    constructor(gl: WebGLRenderingContext, program: WebGLProgram);
    setUniformsFromObject(uniforms: Object): void;
    setUniformsFromHandler(uHandler: WebGLUniformHandler): void;
    has(name: string): boolean;
    set(name: string, value: number | number[] | boolean | readonly number[]): void;
    setIfExists(name: string, value: number | number[] | boolean | readonly number[]): boolean;
    bind(gl: WebGLRenderingContext): void;
    private createUniformList;
}
export {};
