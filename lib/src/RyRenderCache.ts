import {Material, Mesh, MaterialType, Model, FileLoader} from "./PrivateRyRender.js";

export class RyRenderCache {

    //caches
    private static defaultModelMaterial: {[meshName: string] : string} = {};
    private static defaultTextureForMaterial: {[materialName: string] : string} = {};

    private static meshCache: {[fileName: string] : Mesh} = {};
    private static materialCache: {[fileName: string] : Material} = {};
    private static imageCache: {[fileName: string] : HTMLImageElement} = {};

    public static getMeshCache() : Readonly<{[fileName: string] : Mesh}> {
        return RyRenderCache.meshCache;
    }

    public static getMaterialCache() : Readonly<{[fileName: string] : Material}> {
        return RyRenderCache.materialCache;
    }

    public static getImageCache() : Readonly<{[fileName: string] : HTMLImageElement}> {
        return RyRenderCache.imageCache;
    }

    public static createModelInstance(meshFile: string, texFile?: string, matType: MaterialType = MaterialType.BASIC) {

        if(!RyRenderCache.meshCache.hasOwnProperty(meshFile)) {
            console.error(`Mesh for ${meshFile} has not been loaded into `+
                        "cache yet! Call loadMeshToCache first!");
            return null;
        }

        if(texFile === null && RyRenderCache.defaultTextureForMaterial.hasOwnProperty(RyRenderCache.defaultModelMaterial[meshFile])) {
            texFile = RyRenderCache.defaultTextureForMaterial[RyRenderCache.defaultModelMaterial[meshFile]];
        }

        var mesh = RyRenderCache.meshCache[meshFile];
        var model = new Model(mesh, matType, texFile);

        if(RyRenderCache.defaultModelMaterial.hasOwnProperty(meshFile)) {
            model.material.copyNonNullValuesFrom(RyRenderCache.materialCache[RyRenderCache.defaultModelMaterial[meshFile]]);
        }
        return model;
    }

    /*
        Note: This loads ALL data associated with this file to their respective caches.
    */
    public static async loadModelObjToCache(objFile: string, mtlFile: string, rootImgPath: string): Promise<boolean> {
        let hasMesh = RyRenderCache.meshCache.hasOwnProperty(objFile);
        let hasMaterial = RyRenderCache.materialCache.hasOwnProperty(mtlFile);

        if(!hasMesh) {
            if(!await RyRenderCache.loadMeshToCache(objFile)) {
                return false;
            }
        }
        if(!hasMaterial) {
            if(!await RyRenderCache.loadMaterialToCache(mtlFile, rootImgPath)) {
                return false;
            }
            RyRenderCache.defaultModelMaterial[objFile] = mtlFile; //add default material data to cache
        }
        return true;
    }

    public static async loadMeshToCache(file: string) : Promise<boolean> {
        if(RyRenderCache.meshCache.hasOwnProperty(file)) {
            console.log(`File ${file} has already been processed!`);
            return true;
        }

        var res = {vertices: null, uv: null, normals: null, indices: null};
        var ext = file.substring(file.lastIndexOf('.')+1);
        //figure out what file format to load
        switch(ext.toLowerCase()) {
            case "obj":
                res = await FileLoader.loadObj(file);
                break;
        }

        if(res != null) {
            RyRenderCache.meshCache[file] = new Mesh(file,res.vertices, res.uv, res.normals, res.indices);
            return true;
        }
        return false;
    }

    /*
        When including the rootTextureDir, the function also loads any images in the material file as a texture
    */
    public static async loadMaterialToCache(file: string, rootTextureDir?: string) {
        if(RyRenderCache.materialCache.hasOwnProperty(file)) {
            console.log(`File ${file} has already been processed!`);
            return true;
        }
        var mtlData = {mat: null, texPath: null};
        var ext = file.substring(file.lastIndexOf('.')+1);
        //check which file format to load
        switch(ext.toLowerCase()) {
            case "mtl":
                mtlData = await FileLoader.loadMTL(file);
                break;
        }

        //if file could not be loaded or read properly
        if(mtlData === null || mtlData.mat === null) {
            return false;
        }

        RyRenderCache.materialCache[file] = mtlData.mat;

        //if the user specified a root directory for their textures, the textures will be loaded as well
        if(rootTextureDir != null && mtlData.texPath !== null) {
            //append root path for texture to get full path
            var path = rootTextureDir + (rootTextureDir.endsWith("/") ? "" : "/") + mtlData.texPath;

            var loadTex = true;
            //if texture was already loaded, skip loading
            if(!RyRenderCache.imageCache.hasOwnProperty(path)) {
                loadTex = await RyRenderCache.loadImageToCache(path);
            }
            if(loadTex) {
                RyRenderCache.defaultTextureForMaterial[file] = path;
                return true;
            }
            return false;
 
        }
        return true;
    }

    //This only takes image files as input
    public static async loadImageToCache(imgPath: string) : Promise<boolean> {
        if(RyRenderCache.imageCache.hasOwnProperty(imgPath)) {
            console.log(`Image ${imgPath} has already been loaded!`);
            return true;
        }

        var img = await FileLoader.loadImage(imgPath);

        if(img != null) {
            RyRenderCache.imageCache[imgPath] = img;
            return true;
        }

        return false;
    }
}