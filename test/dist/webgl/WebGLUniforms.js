/*TODO: Figure out whether or not to get rid of WebGLUniform class.
Most of the processing time is spent binding the nonarray uniforms to the Handler
and then binding it to the program. Maybe the arrays should be bound directly to the
program.

*/
export class WebGLUniformHandler {
    constructor(gl, program) {
        this.program = program;
        this.uniforms = this.createUniformList(gl);
        this.keys = Object.keys(this.uniforms);
    }
    setUniformsFromObject(uniforms) {
        for (const name of this.keys) {
            if (uniforms.hasOwnProperty(name)) {
                this.uniforms[name].value = uniforms[name];
            }
        }
    }
    setUniformsFromHandler(uHandler) {
        for (const name of this.keys) {
            if (uHandler.uniforms.hasOwnProperty(name) && uHandler.uniforms[name].type == this.uniforms[name].type) {
                this.uniforms[name].value = uHandler.uniforms[name].value;
            }
        }
    }
    has(name) {
        return this.uniforms.hasOwnProperty(name);
    }
    set(name, value) {
        this.uniforms[name].value = value;
    }
    setIfExists(name, value) {
        if (this.has(name)) {
            this.uniforms[name].value = value;
            return true;
        }
        return false;
    }
    //Note: Using @ts-ignore in switch statement since uniform.value can be a number | number[] | boolean.
    //This type issue is solved because the switch statement checks the WebGL type in the Uniform interface
    // As long as the user sets the uniform's value to match the data type of the uniform, the uniforms will
    // be set correctly.
    bind(gl) {
        for (var i = 0; i < this.keys.length; i++) {
            var uniform = this.uniforms[this.keys[i]];
            if (uniform == null) {
                console.error(`Uniform at ${this.keys[i]} is NULL, all uniforms must not be null!`);
                return;
            }
            switch (uniform.type) {
                case gl.FLOAT:
                    //@ts-ignore
                    gl.uniform1f(uniform.location, uniform.value);
                    break;
                case gl.INT:
                    //@ts-ignore
                    gl.uniform1i(uniform.location, uniform.value);
                    break;
                case gl.INT_VEC2:
                    //@ts-ignore
                    gl.uniform2iv(uniform.location, uniform.value);
                    break;
                case gl.INT_VEC3:
                    //@ts-ignore
                    gl.uniform3iv(uniform.location, uniform.value);
                    break;
                case gl.INT_VEC4:
                    //@ts-ignore
                    gl.uniform4iv(uniform.location, uniform.value);
                    break;
                case gl.FLOAT_VEC2:
                    //@ts-ignore
                    gl.uniform2fv(uniform.location, uniform.value);
                    break;
                case gl.FLOAT_VEC3:
                    //@ts-ignore
                    gl.uniform3fv(uniform.location, uniform.value);
                    break;
                case gl.FLOAT_VEC4:
                    //@ts-ignore
                    gl.uniform4fv(uniform.location, uniform.value);
                    break;
                case gl.FLOAT_MAT2:
                    //@ts-ignore
                    gl.uniformMatrix2fv(uniform.location, false, uniform.value);
                    break;
                case gl.FLOAT_MAT3:
                    //@ts-ignore
                    gl.uniformMatrix3fv(uniform.location, false, uniform.value);
                    break;
                case gl.FLOAT_MAT4:
                    //@ts-ignore
                    gl.uniformMatrix4fv(uniform.location, false, uniform.value);
                    break;
            }
        }
    }
    createUniformList(gl) {
        var uniforms = {};
        var numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (var i = 0; i < numUniforms; i++) {
            var data = gl.getActiveUniform(this.program, i);
            uniforms[data.name] = {
                location: gl.getUniformLocation(this.program, data.name),
                type: data.type,
                value: null
            };
        }
        return uniforms;
    }
}
