import { Material } from "./PrivateRyRender.js";
export class FileLoader {
    static async loadImage(file) {
        const resp = await FileLoader.getFile(file);
        if (resp == null) {
            return null;
        }
        var img = new Image();
        img.src = file;
        await img.decode(); //figure out how to check if image has successfully loaded
        if (!img.complete) {
            return null;
        }
        return img;
    }
    /*
        Loads the data from the .obj file to new Mesh object.

        Limitations:
            -There MUST be vertex, uv, and normal data. Missing one of these will cause loading function to fail.
            -All faces MUST be triangulated. No quad or n-gon faces will work in this function.
    */
    static async loadObj(file) {
        if (file.substring(file.lastIndexOf('.') + 1) !== "obj") {
            return null;
        }
        const resp = await FileLoader.getFile(file);
        if (resp == null) {
            return null;
        }
        const text = await resp.text();
        var tempVertices = [];
        var tempUV = [];
        var tempNormals = [];
        var vertIndices = [];
        var uvIndices = [];
        var normIndices = [];
        var lines = text.split("\n");
        lines.forEach(line => {
            line = line.trim();
            switch (line.substring(0, 2)) {
                case 'v ':
                    var vertex = line.substring(2).split(' ');
                    var v = [];
                    for (let i = 0; i < vertex.length; i++) {
                        v.push(Number(vertex[i]));
                    }
                    tempVertices.push(v);
                    break;
                case 'vn':
                    var normal = line.substring(3).split(' '); //must be substr(3) since "" gets added into array if sub(2) is called
                    var n = [];
                    for (let i = 0; i < normal.length; i++) {
                        n.push(Number(normal[i]));
                    }
                    tempNormals.push(n);
                    break;
                case 'vt':
                    var u = line.substring(3).split(' ');
                    var v = [];
                    for (let i = 0; i < u.length; i++) {
                        v.push(Number(u[i]));
                    }
                    tempUV.push(v);
                    break;
                case 'f ':
                    var poly = line.substring(2).split(' ');
                    poly.forEach(point => {
                        var v = point.split('/');
                        vertIndices.push(Number(v[0]) - 1);
                        uvIndices.push(Number(v[1]) - 1);
                        normIndices.push(Number(v[2]) - 1);
                    });
                    break;
            }
        });
        var vertices = [];
        var uv = [];
        var normals = [];
        var indices = [];
        for (let i = 0; i < vertIndices.length; i += 1) {
            indices.push(i);
            var vertex = tempVertices[vertIndices[i]];
            vertices.push(vertex[0], vertex[1], vertex[2]);
            var uv_vertex = tempUV[uvIndices[i]];
            uv.push(uv_vertex[0], uv_vertex[1]);
            var norm = tempNormals[normIndices[i]];
            normals.push(norm[0], norm[1], norm[2]);
        }
        return { vertices: vertices, uv: uv, normals: normals, indices: indices };
    }
    static async loadMTL(file) {
        if (file.substring(file.lastIndexOf('.') + 1) !== "mtl") {
            return null;
        }
        const resp = await FileLoader.getFile(file);
        if (resp == null) {
            return null;
        }
        var imgPath = null;
        var material = new Material();
        const text = await resp.text();
        const lines = text.split("\n");
        lines.forEach((str) => {
            switch (str.substring(0, 2)) {
                case "Ka": //ambient color 
                    var u = str.substring(3).split(' ');
                    var v = [];
                    for (let i = 0; i < u.length; i++) {
                        v.push(Number(u[i]));
                    }
                    material.mtlAmbient = v;
                    break;
                case "Kd": //diffuse color
                    var u = str.substring(3).split(' ');
                    var v = [];
                    for (let i = 0; i < u.length; i++) {
                        v.push(Number(u[i]));
                    }
                    material.mtlDiffuse = v;
                    break;
                case "Ks": //specular color
                    var u = str.substring(3).split(' ');
                    var v = [];
                    for (let i = 0; i < u.length; i++) {
                        v.push(Number(u[i]));
                    }
                    material.mtlSpecular = v;
                    break;
                case "Ns": //focus(shininess) of specular color
                    material.mtlShininess = Number(str.substring(3));
                    break;
                case "Ni": //optical density(refraction) ???
                    break;
                case "Ke": //emissive coefficient(how much light is emitted from material)
                    break;
                case "d ": //dissolve(transparency) between 0(transparent) and 1(opaque)
                    break;
                case "Tr": //non-transparency between 0(opaque) and 1(transparent) -- exact opposite of d
                    break;
                default:
                    if (str.substring(0, 5) === "illum") { //illumination model. Value of 1 = flat shading(no speculars), 2 = shading + specular highlights
                        var illum = Number(str.substring(5));
                        switch (illum) {
                            case 1:
                                material.mtlSpecular = [0.0, 0.0, 0.0];
                                break;
                        }
                    }
                    else if (str.substring(0, 6) === "map_Kd") { //file name of texture
                        if (str.lastIndexOf("\\") >= 6) {
                            imgPath = str.substring(str.lastIndexOf("\\") + 1);
                        }
                        else if (str.lastIndexOf("/") >= 6) {
                            imgPath = str.substring(str.lastIndexOf("/") + 1);
                        }
                        else {
                            imgPath = str.substring(7);
                        }
                        material.texSample = 0;
                        imgPath.trim();
                    }
                    break;
            }
        });
        return { mat: material, texPath: imgPath };
    }
    static async getFile(file) {
        const resp = await fetch(file);
        if (resp.status == 404) {
            console.error(`File \"${file}\" Not Found`);
            return null;
        }
        return resp;
    }
}
