import {
    MaterialType, 
    WebGLUniformHandler, 
    Material, 
    Light, 
    PointLight, 
    Model, 
    RyRenderCache,
    GLSL_F_BASIC,
    GLSL_F_PHONG,
    GLSL_V_BASIC,
    GLSL_V_PHONG,
    UniformName,
    MAX_LIGHTS
} from "../PrivateRyRender.js";

export class WebGLManager {
    private readonly gl: WebGLRenderingContext;
    private readonly oes: OES_vertex_array_object;
    private readonly instanceExt: ANGLE_instanced_arrays;
    public readonly useInstancing: boolean;
    private readonly MAX_ATTRIBUTES: number;

    private vaoCache: {[name:string] : WebGLVertexArrayObject} = {};
    private shaderProgramCache: WebGLProgram[] = [];
    private uniformCache: WebGLUniformHandler[] = [];
    private tex2dCache: {[name: string] : WebGLTexture} = {};
    private texCubeCache: {[name: string] : WebGLTexture} = {};

    private default2dTex: WebGLTexture;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;

        console.log("Supported Extensions", this.gl.getSupportedExtensions());
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        console.log(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL));
        console.log(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
        //16 on Safari with Mac M1
        this.MAX_ATTRIBUTES = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        console.log("Max Vertex Attributes= " + this.MAX_ATTRIBUTES);

        this.oes = gl.getExtension('OES_vertex_array_object');
        this.instanceExt = gl.getExtension('ANGLE_instanced_arrays');
        this.useInstancing = this.instanceExt != null;
        this.initShaderPrograms();
        this.addDefaultTexture();
    }

    private initShaderPrograms() {
        this.addProgram(MaterialType.BASIC, GLSL_V_BASIC, GLSL_F_BASIC);
        this.addProgram(MaterialType.PHONG, GLSL_V_PHONG, GLSL_F_PHONG);
    }

    private addDefaultTexture() {
        var gl = this.gl;
        this.default2dTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.default2dTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    updateCaches() {
        var meshEntries = Object.entries(RyRenderCache.getMeshCache());
        for(const [name, mesh] of meshEntries) {
            if(!this.hasVao(name)) {
                this.addVao(name, mesh.vertices, mesh.uv, mesh.normals, mesh.indices);
            }
        }
        var imgEntries = Object.entries(RyRenderCache.getImageCache());
        for(const [name, img] of imgEntries) {
            if(!this.hasTexture2D(name)) {
                this.addTexture2D(name, img);
            }
        }
    }

    hasVao(name: string) {
        return this.vaoCache.hasOwnProperty(name);
    }
    hasProgram(name: string) {
        return this.shaderProgramCache.hasOwnProperty(name);
    }
    hasTexture2D(name: string) {
        return this.tex2dCache.hasOwnProperty(name);
    }
    hasTextureCube(name: string) {
        return this.texCubeCache.hasOwnProperty(name);
    }

    addVao(name: string, 
           vertices: readonly number[], 
           uv: readonly number[], 
           normals: readonly number[], 
           indices: readonly number[]) {

        if(this.vaoCache.hasOwnProperty(name)) {
            console.log(`VAO "${name}" is already loaded!`);
            return;
        } 
        var gl = this.gl;
        var oes = this.oes;

        var vao = oes.createVertexArrayOES();
        oes.bindVertexArrayOES(vao);

        var indexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.addAttribute(vertices, 0, 3);
        this.addAttribute(uv, 1, 2);
        this.addAttribute(normals, 2, 3);

        oes.bindVertexArrayOES(null);

        this.vaoCache[name] = vao;
    }

    /*TODO: Since instanced vaos are only called once, the uniforms of each model
        using the VAO MUST be the SAME. Thus, all models under that VAO must have 
        the same material and texture. If a material or texture is changed, that
        change applies to all models. Figure out how to deal with this.
        (Should there be an instanced vao for each Mesh, Material, Texture combo?)
        For the question above, maybe have the WebGLManager figure out when to 
        use instanced rendering and when to use normal rendering.

    */
    addInstancedVao(name: string, 
                    vertices: readonly number[], 
                    uv: readonly number[], 
                    normals: readonly number[], 
                    indices: readonly number[],
                    maxInstances: number) {

        if(this.vaoCache.hasOwnProperty(name)) {
            console.log(`VAO "${name}" is already loaded!`);
            return;
        } 
        var gl = this.gl;
        var oes = this.oes;
        var inst = this.instanceExt;

        var vao = oes.createVertexArrayOES();
        oes.bindVertexArrayOES(vao);

        var indexBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.addAttribute(vertices, 0, 3);
        this.addAttribute(uv, 1, 2);
        this.addAttribute(normals, 2, 3);

        let instanceBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
        //16 because 4x4 matrix stores 16 floats
        gl.bufferData(gl.ARRAY_BUFFER, maxInstances * 16, gl.DYNAMIC_DRAW);

        //A mat4 attribute takes up 4 attribute slots, one for each vec4 in the matrix
        for(let i = 0; i < 4; i++) {
            let loc = 3 + i;
            let bytesPerMatrix = 4 * 4;
            let offsetBtwMatrixColumns = i * 16; //size is in bytes
            gl.enableVertexAttribArray(loc);
            //4 floats per vec4, 4 bytes per 32-bit float
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, offsetBtwMatrixColumns);
            inst.vertexAttribDivisorANGLE(loc, 1); //move 1 offset per instance
        }

        oes.bindVertexArrayOES(null);

        this.vaoCache[name] = vao;
    }

    addProgram(index: number, glslV: string, glslF: string) {
        if(index != this.shaderProgramCache.length) { //may cause issues
            console.log(`Program at index "${index}" is already loaded!`);
            return;
        }
        var gl = this.gl;

        var shaderV = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shaderV, glslV);
        gl.compileShader(shaderV);

        var shaderF = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shaderF, glslF);
        gl.compileShader(shaderF);

        if(gl.getError() != 0) {
            console.log(gl.getError());
        }

        var program = gl.createProgram();
        gl.attachShader(program, shaderV);
        gl.attachShader(program, shaderF);
        gl.linkProgram(program);

        gl.deleteShader(shaderV);
        gl.deleteShader(shaderF);

        this.shaderProgramCache.push(program);

        this.uniformCache.push(new WebGLUniformHandler(gl, program));
    }

    addTexture2D(name: string, image: HTMLImageElement) {
        if(this.tex2dCache.hasOwnProperty(name)) {
            console.log(`Texture "${name}" is already loaded!`);
            return;
        } 
        if(image === null || !image.complete) {
            console.error(`Unable to read image at ${image.src}`);
            return;
        }
        var gl = this.gl;

        var texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
 
        if(this.powOf2(image.width) && this.powOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        this.tex2dCache[name] = texture;
    }

    addTextureCube(name: string, ...images: HTMLImageElement[]) {
        if(this.texCubeCache.hasOwnProperty(name)) {
            console.log(`Texture "${name}" is already loaded!`);
            return;
        } 
        var numImages = 0;
        for(const image of images) {
            if(image === null || !image.complete) {
                console.error(`Unable to read image at ${image.src}`);
                return;
            } else if(image.width != image.height) {
                console.error(`Image at ${image.src} must be square (aka: width == height)!`);
                return;
            }
            numImages++;
        }
        if(numImages != 1 && numImages != 6) {
            console.error(`There must be 1 or 6 images in parameters, not ${numImages}!`);
            return;
        }
        var gl = this.gl;

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        var allImgPwr2 = true;

        for(var i = 0; i < 6; i++) {
            var img = images.length == 1 ? images[0] : images[i];
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            //only check width since all images must be square
            allImgPwr2 = allImgPwr2 ? this.powOf2(img.width) : false; 
        }

        if(allImgPwr2) {
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        } else {
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
        
        this.texCubeCache[name] = texture;
    }

    bindVao(name: string) {
        if(!this.vaoCache.hasOwnProperty(name)) {
            console.error(`Invalid vao ${name} !`);
            return;
        }
        this.oes.bindVertexArrayOES(this.vaoCache[name]);
    }

    bindProgram(material: Material) {
        if(material.type < 0 || material.type >= this.shaderProgramCache.length) {
            console.error(`Invalid shader program ${material.type}`);
            return;
        }
        this.gl.useProgram(this.shaderProgramCache[material.type]);

        var uHandler = this.uniformCache[material.type];
        //Note: uHandler.set already checks if uniform exists
        uHandler.setIfExists(UniformName.MTL_AMBIENT, material.mtlAmbient);
        uHandler.setIfExists(UniformName.MTL_DIFFUSE, material.mtlDiffuse);
        uHandler.setIfExists(UniformName.MTL_SPECULAR, material.mtlSpecular);
        uHandler.setIfExists(UniformName.MTL_SHINE, material.mtlShininess);
        uHandler.setIfExists(UniformName.TEX_SAMPLE, material.texSample);

        uHandler.bind(this.gl);
    }

    bindTexture2D(name: string) {
        if(name === null) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.default2dTex);
            return;
        }
        if(!this.tex2dCache.hasOwnProperty(name)) {
            console.error(`Invalid texture ${name} ! `);
            return;
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex2dCache[name]);
    }

    bindTextureCube(name: string) {
        if(!this.texCubeCache.hasOwnProperty(name)) {
            console.error("Invalid texture name!");
            return;
        }
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texCubeCache[name]);
    }

    setModelUniforms(model: Model) {
        var uHandler = this.uniformCache[model.material.type];
        uHandler.setIfExists(UniformName.MODEL, model.worldTransforms.getArrayRef());
        if(uHandler.has(UniformName.NORM_MAT)) {uHandler.set(UniformName.NORM_MAT, model.getNormalMatrix());}
    }

    setCameraUniforms(view: readonly number[], proj: readonly number[], cameraPos: readonly number[]) {
        for(const uHandler of this.uniformCache) {
            uHandler.setIfExists(UniformName.VIEW, view);
            uHandler.setIfExists(UniformName.PROJ, proj);
            uHandler.setIfExists(UniformName.CAM_POS, cameraPos);
        }
    }

    setLightUniforms(lights: readonly Light[]) {
        for(const uHandler of this.uniformCache) {
            //if shader program has light properties
            if(uHandler.has("lights[0].diffuse")) {
                uHandler.set('numLights', lights.length);
                let i = 0;
                for(;i < lights.length; i++) {
                    let light = lights[i];
                    uHandler.set(`lights[${i}].diffuse`, light.diffuse);
                    uHandler.set(`lights[${i}].ambient`, light.ambient);
                    uHandler.set(`lights[${i}].specular`, light.specular);
                    if(light instanceof PointLight) {
                        uHandler.set(`lights[${i}].pos`, light.pos);
                    }
                }
                for(; i < MAX_LIGHTS; i++) {
                    uHandler.set(`lights[${i}].diffuse`, [0,0,0]);
                    uHandler.set(`lights[${i}].ambient`, [0,0,0]);
                    uHandler.set(`lights[${i}].specular`, [0,0,0]);
                    uHandler.set(`lights[${i}].pos`, [0,0,0]);
                }

            } 
        }
    }

    private powOf2(value: number) {
        return (value & (value-1)) == 0;
    }

    private addAttribute(data: readonly number[], location: number, valuesPerVertex: number) {
        var gl = this.gl;
        var buff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buff);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.vertexAttribPointer(location, valuesPerVertex, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(location);
    }
}