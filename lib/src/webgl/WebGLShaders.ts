
export const MAX_LIGHTS = 4;


export const enum UniformName {
    MODEL = "model",
    PROJ = "projection",
    VIEW = "view",
    NORM_MAT = "normal_matrix",
    CAM_POS = "cameraPos",
    MTL_DIFFUSE = "material.diffuse",
    MTL_AMBIENT = "material.ambient",
    MTL_SPECULAR = "material.specular",
    MTL_SHINE = "material.shininess",
    TEX_SAMPLE = "texSample"
}

export const GLSL_V_BASIC: string = `
    #version 100
    precision mediump float;
    
    attribute vec3 a_pos;
    attribute vec2 a_uv;
    attribute vec3 a_normals;

    varying vec2 UV;

    uniform mat4 ${UniformName.MODEL};
    uniform mat4 ${UniformName.VIEW};
    uniform mat4 ${UniformName.PROJ};

    void main(void) {
        gl_Position = ${UniformName.PROJ} * ${UniformName.VIEW} * ${UniformName.MODEL} * vec4(a_pos,1.0);
        UV = a_uv;
    }
`;

export const GLSL_F_BASIC: string = `
    #version 100
    precision mediump float;

    varying vec2 UV;

    uniform sampler2D ${UniformName.TEX_SAMPLE};

    void main(void) {
        gl_FragColor = texture2D(${UniformName.TEX_SAMPLE}, UV);
    }
`;

export const GLSL_V_PHONG: string = `
    #version 100
    precision mediump float;
    
    attribute vec3 a_pos;
    attribute vec2 a_uv;
    attribute vec3 a_normals;

    varying vec2 UV;
    varying vec3 fragPos;
    varying vec3 normal;

    uniform mat4 ${UniformName.MODEL};
    uniform mat4 ${UniformName.VIEW};
    uniform mat4 ${UniformName.PROJ};
    uniform mat3 ${UniformName.NORM_MAT};

    void main(void) {
        gl_Position = ${UniformName.PROJ} * ${UniformName.VIEW} * ${UniformName.MODEL} * vec4(a_pos,1.0);
        UV = a_uv;
        fragPos = vec3(${UniformName.MODEL} * vec4(a_pos, 1.0));
        normal = ${UniformName.NORM_MAT} * a_normals;
    }
`;

export const GLSL_F_PHONG: string = `
    #version 100
    #define MAX_LIGHTS ${MAX_LIGHTS}
    precision mediump float;
    
    struct PointLight {
        vec3 pos;
        vec3 diffuse;
        vec3 ambient;
        vec3 specular;
    };

    struct Material {
        vec3 diffuse; //the main color
        vec3 ambient; //ambient color usually matches main diffuse color
        vec3 specular; //usually white
        float shininess; //between 0 and 1, affects specular color
    };

    //declare user-defined function first
    vec3 calcPhongShading(Material material, PointLight light, vec3 fragPos, vec3 cameraPos, vec3 normal);

    //function definitions
    vec3 calcPhongShading(Material material, 
                          PointLight light, 
                          vec3 fragPos, 
                          vec3 cameraPos, 
                          vec3 normal) {
        vec3 norm = normalize(normal);
        vec3 lightDir = normalize(light.pos - fragPos);
        float diffuseFactor = max(dot(norm, lightDir), 0.0);
        vec3 diffuse = light.diffuse * (diffuseFactor * material.diffuse);

        vec3 ambient = light.ambient * material.ambient;

        vec3 viewDir = normalize(cameraPos - fragPos);
        vec3 reflectDir = reflect(-lightDir, norm);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
        vec3 specular = light.specular * (spec * material.specular);

        return ambient + diffuse + specular;
    }

    varying vec2 UV;
    varying vec3 fragPos; //can only find in Frag shader since value is interperlated from value in vertex shader
    varying vec3 normal;

    uniform vec3 ${UniformName.CAM_POS};
    uniform Material material;
    uniform PointLight lights[MAX_LIGHTS];
    uniform int numLights;

    uniform sampler2D texSample;

    void main(void) {
        vec3 result = vec3(0.0);
        for(int i = 0; i < MAX_LIGHTS; i++) {
            if(i >= numLights) {break;} //needed since for loop can only compare constant values
            result += calcPhongShading(material, lights[i], fragPos, ${UniformName.CAM_POS}, normal);
        }
        gl_FragColor = texture2D(${UniformName.TEX_SAMPLE}, UV) * vec4(result, 1.0);
    }
`;

export const GLSL_V_BASIC_I: string = `
    #version 100
    precision mediump float;
    
    attribute vec3 a_pos;
    attribute vec2 a_uv;
    attribute vec3 a_normals;
    attribute mat4 model;

    varying vec2 UV;

    uniform mat4 ${UniformName.VIEW};
    uniform mat4 ${UniformName.PROJ};

    void main(void) {
        gl_Position = ${UniformName.PROJ} * ${UniformName.VIEW} * model * vec4(a_pos,1.0);
        UV = a_uv;
    }
`;

export const GLSL_V_PHONG_I: string = `
    #version 100
    precision mediump float;
    
    attribute vec3 a_pos;
    attribute vec2 a_uv;
    attribute vec3 a_normals;
    attribute mat4 model;
    attribute mat3 normal_matrix;

    varying vec2 UV;
    varying vec3 fragPos;
    varying vec3 normal;

    uniform mat4 ${UniformName.VIEW};
    uniform mat4 ${UniformName.PROJ};

    void main(void) {
        gl_Position = ${UniformName.PROJ} * ${UniformName.VIEW} * model * vec4(a_pos,1.0);
        UV = a_uv;
        fragPos = model * vec4(a_pos, 1.0));
        normal = normal_matrix * a_normals;
    }
`;