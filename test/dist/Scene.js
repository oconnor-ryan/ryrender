import { ModelMat4, Mat4, Camera, Light } from "./PrivateRyRender.js";
/*
    TODO: Note that for purely 2d games(no 3d models), a ModelMat3 can be used.
    Figure out how to implement this.
*/
// Model, Camera, and Lights should extend from this class
/*
    SceneComponent is a tree node that contains a local space and a world space.
    The local space is the transforms of the component RELATIVE to its parent
    (aka if the parent was considered the origin). The world space is calculated
    based on the local spaces of the components above the current component.
    The world space is used to render the component at the correct location,
    orientation, and scale.

    Example: Comp1 is a parent of Comp2. Comp1's local matrix indicates that it
    is at position (1,2,3), while Comp2's local matrix sets itself at (3,2,1),
    RELATIVE to Comp1. Since Comp1 has no parent, its world position is (1,2,3).
    Since Comp2 has Comp1 as a parent, its world position is actually (4,4,4).
*/
export class SceneComponent {
    constructor() {
        this.parent = null;
        this.children = [];
        this._worldTransforms = new ModelMat4();
        this._localTransforms = new ModelMat4();
    }
    get worldTransforms() {
        return this._worldTransforms;
    }
    get localTransforms() {
        return this._localTransforms;
    }
    //should check if component was already added in different part of the scene
    add(component) {
        if (component === this || component instanceof Scene) {
            return;
        }
        this.children.push(component);
        component.parent = this;
    }
    addComps(components) {
        for (let i = 0; i < components.length; i++) {
            this.add(components[i]);
        }
    }
    remove(component) {
        let index = this.children.indexOf(component);
        if (index >= 0) {
            //remove child and set its parent to null
            this.children.splice(index, 1)[0].parent = null;
        }
    }
    removeComps(components) {
        for (let i = 0; i < components.length; i++) {
            this.remove(components[i]);
        }
    }
    //This is a recursive function! Do not make trees deeper than 500!
    updateWorldTransforms(updateParents, updateChildren) {
        if (updateParents && this.parent !== null) {
            this.parent.updateWorldTransforms(true, false); //updates the world matrix of ALL Parents in tree above this object
        }
        if (this.parent === null) {
            this.worldTransforms.setEqualTo(this.localTransforms);
        }
        else {
            Mat4.multAll(this._worldTransforms, this.parent.worldTransforms, this.localTransforms); //multiply updated parent's world matrix by local matrix
        }
        if (updateChildren) {
            for (const child of this.children) {
                child.updateWorldTransforms(false, true);
            }
        }
    }
    //FIXME: Not sure if I want to keep this
    useCompAsParameter(func, addChildrenToFunc) {
        func(this);
        if (addChildrenToFunc) {
            for (const child of this.children) {
                child.useCompAsParameter(func, addChildrenToFunc);
            }
        }
    }
}
/*
    Scene class acts as the root of the tree of SceneCompoents. When
    the scene is updated, it converts the local space of every component
    to world space, allowing them to be at its correct location.
*/
export class Scene extends SceneComponent {
    //assume rest are models
    constructor() {
        super(); //default transforms are identity matrices
        /*
        These lists are kept so that the Scene tree does not have to be transversed
        each rendering call. This can save time if there are 1000s of nodes in the tree
        */
        this.cameraList = [];
        this.lightList = [];
    }
    updateAll() {
        this.updateWorldTransforms(false, true);
    }
    add(component) {
        super.add(component);
        if (component instanceof Camera) {
            this.cameraList.push(component);
        }
        else if (component instanceof Light) {
            this.lightList.push(component);
        }
    }
    remove(component) {
        super.remove(component);
        if (component instanceof Camera) {
            this.cameraList.splice(this.cameraList.indexOf(component), 1);
        }
        else if (component instanceof Light) {
            this.lightList.splice(this.lightList.indexOf(component), 1);
        }
    }
    get lights() {
        return this.lightList;
    }
    get cameras() {
        return this.cameraList;
    }
}
