export class Vector {
    //maybe change so that more than 2 vectors can be added at once
    static add(arr1, arr2, arrDest = null) {
        if (arr1.length != arr2.length) {
            throw new Error("Vector sizes do not match");
        }
        var des = arrDest != null ? arrDest : new Array(arr1.length);
        if (des.length > arr1.length) {
            des.splice(arr1.length - 1);
        }
        for (var i = 0; i < arr1.length; i++) {
            des[i] = arr1[i] + arr2[i];
        }
        return des;
    }
    static sub(arr1, arr2, arrDest = null) {
        if (arr1.length != arr2.length) {
            throw new Error("Vector sizes do not match");
        }
        var des = arrDest != null ? arrDest : new Array(arr1.length);
        if (des.length > arr1.length) {
            des.splice(arr1.length - 1);
        }
        for (var i = 0; i < arr1.length; i++) {
            des[i] = arr1[i] - arr2[i];
        }
        return des;
    }
    static dot(arr1, arr2) {
        if (arr1.length != arr2.length) {
            throw new Error("Vector lengths do not match!");
        }
        var sum = 0;
        for (var i = 0; i < arr1.length; i++) {
            sum += arr1[i] * arr2[i];
        }
        return sum;
    }
    static cross(arr1, arr2, arrDest = null) {
        if (arr1.length != arr2.length || arr1.length != 3) {
            throw new Error("Vector lengths must be a length of 3!");
        }
        var des = arrDest != null ? arrDest : new Array(arr1.length);
        if (des.length > arr1.length) {
            des.splice(arr1.length - 1);
        }
        des[0] = arr1[1] * arr2[2] - arr1[2] * arr2[1];
        des[1] = arr1[2] * arr2[0] - arr1[0] * arr2[2];
        des[2] = arr1[0] * arr2[1] - arr1[1] * arr2[0];
        return des;
    }
    static mult(arr, scalar) {
        for (var i = 0; i < arr.length; i++) {
            arr[i] *= scalar;
        }
    }
    static addScalar(arr, scalar) {
        for (var i = 0; i < arr.length; i++) {
            arr[i] += scalar;
        }
    }
    static getMag(arr) {
        var mag = 0;
        for (const num of arr) {
            mag += num * num;
        }
        return Math.sqrt(mag);
    }
    static isZero(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] != 0) {
                return false;
            }
        }
        return true;
    }
    static negate(arr) {
        Vector.mult(arr, -1);
    }
    static normalize(arr) {
        var mag = Vector.getMag(arr);
        if (mag == 0) {
            return;
        }
        for (var i = 0; i < arr.length; i++) {
            arr[i] /= mag;
        }
    }
    static setMag(arr, mag) {
        Vector.normalize(arr);
        Vector.mult(arr, mag);
    }
    static toString(arr, precision = -1) {
        if (arr.length == 0) {
            return "[Empty Vector]";
        }
        var str = "[";
        for (const num of arr) {
            var s = precision == -1 ? num + "" : num.toFixed(precision);
            str += s + ",";
        }
        str = str.substring(0, str.length - 1) + "]";
        return str;
    }
}
/*
    Because WebGL's matrices are stored in column-major order, this class will do that as well
    For example, the array for a 4x4 matrix is:
    |a[0] a[4] a[8]  a[12]|
    |a[1] a[5] a[9]  a[13]|
    |a[2] a[6] a[10] a[14]|
    |a[3] a[7] a[11] a[15]|

    
*/
class AbstractWebGLMatrix {
    constructor(arr = null) {
        this.arr = [];
        if (arr != null) {
            for (var i = 0; i < arr.length; i++) {
                this.arr[i] = arr[i];
            }
        }
    }
    setEqualTo(arr) {
        var a = this.cleanInput(arr);
        for (var i = 0; i < a.length; i++) {
            this.arr[i] = a[i];
        }
    }
    cleanInput(out) {
        var a;
        if (out instanceof AbstractWebGLMatrix) {
            a = out.arr;
        }
        else if (out.constructor === Array) {
            a = out;
        }
        if (a.length != this.arr.length) {
            throw new Error("Arrays not same size for operation!");
        }
        return a;
    }
    /*
        Note that all the methods in the AbstractWebGLMatrix keep the same reference to this.arr
        as it did when it was created via constructor/static factory method. Thus, the reference to this.arr can be
        passed to another object and all changes made to this.arr in this class will affect the reference in the other object.
        Note that since getArrayRef() is readonly, objects outside this class cannot modify this.arr.
        If this behavior is NOT desired and a mutable copy is needed, use getArrayCopy() instead.
    */
    getArrayRef() {
        return this.arr;
    }
    getArrayCopy() {
        return this.arr.slice();
    }
    add(m1) {
        var a = this.cleanInput(m1);
        for (var i = 0; i < this.arr.length; i++) {
            this.arr[i] += a[i];
        }
    }
    addAll(...matrices) {
        for (const mat of matrices) {
            this.add(mat);
        }
    }
    sub(m1) {
        var a = this.cleanInput(m1);
        for (var i = 0; i < this.arr.length; i++) {
            this.arr[i] -= a[i];
        }
    }
    subAll(...matrices) {
        for (const mat of matrices) {
            this.sub(mat);
        }
    }
    setAllToScalar(scalar) {
        for (var i = 0; i < this.arr.length; i++) {
            this.arr[i] = scalar;
        }
    }
    multScalar(scalar) {
        for (var i = 0; i < this.arr.length; i++) {
            this.arr[i] *= scalar;
        }
    }
    static toString(mat, rows, cols, precision = 20) {
        var str = "[\n";
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                str += mat.arr[c * rows + r].toFixed(precision) + " ";
            }
            str += "\n";
        }
        str += "]";
        return str;
    }
}
export class Mat4 extends AbstractWebGLMatrix {
    constructor(arr = null) {
        super(arr);
        if (arr == null) {
            Mat4.identity(this);
        }
        else if (arr.length != 16) {
            throw new Error("Array size incapatable with 4x4 matrix");
        }
    }
    static identity(out = null) {
        var mat = out == null ? new Mat4() : out;
        var o = mat.arr;
        o[0] = 1;
        o[1] = 0;
        o[2] = 0;
        o[3] = 0;
        o[4] = 0;
        o[5] = 1;
        o[6] = 0;
        o[7] = 0;
        o[8] = 0;
        o[9] = 0;
        o[10] = 1;
        o[11] = 0;
        o[12] = 0;
        o[13] = 0;
        o[14] = 0;
        o[15] = 1;
        if (out == null) {
            return mat;
        }
    }
    static orthographic(left, right, top, bottom, nearPlane, farPlane, out = null) {
        var o = out == null ? new Mat4() : out;
        o.arr[0] = 2 / (right - left);
        o.arr[1] = 0;
        o.arr[2] = 0;
        o.arr[3] = 0;
        o.arr[4] = 0;
        o.arr[5] = 2 / (top - bottom);
        o.arr[6] = 0;
        o.arr[7] = 0;
        o.arr[8] = 0;
        o.arr[9] = 0;
        o.arr[10] = -2 / (farPlane - nearPlane);
        o.arr[11] = 0;
        o.arr[12] = -(right + left) / (right - left);
        o.arr[13] = -(top + bottom) / (top - bottom);
        o.arr[14] = -(nearPlane + farPlane) / (farPlane - nearPlane);
        o.arr[15] = 1;
        if (out == null) {
            return o;
        }
    }
    static perspective(angle, aspect_ratio, nearPlane, farPlane, out = null) {
        var o = out == null ? new Mat4() : out;
        var s = 1 / (Math.tan(angle / 2) * aspect_ratio);
        var t = 1 / (Math.tan(angle / 2));
        var f = farPlane;
        var n = nearPlane;
        o.arr[0] = s;
        o.arr[1] = 0;
        o.arr[2] = 0;
        o.arr[3] = 0;
        o.arr[4] = 0;
        o.arr[5] = t;
        o.arr[6] = 0;
        o.arr[7] = 0;
        o.arr[8] = 0;
        o.arr[9] = 0;
        o.arr[10] = (-n - f) / (n - f);
        o.arr[11] = 1;
        o.arr[12] = 0;
        o.arr[13] = 0;
        o.arr[14] = 2 * f * n / (n - f);
        o.arr[15] = 0;
        if (out == null) {
            return o;
        }
    }
    static mult(out, m1, m2) {
        out.setEqualTo(m1);
        out.mult(m2);
    }
    static multAll(out, ...matrices) {
        if (matrices.length == 0) {
            return;
        }
        out.setEqualTo(matrices[0]);
        for (var i = 1; i < matrices.length; i++) {
            out.mult(matrices[i]);
        }
    }
    /*
        Note: Since this was tailored for WebGL and meant to reduce the number of calculations for matrix operations,
        this multiplication function is only able to be multiplied by other 4x4 matrices.
        For matrix multiplication that accepts any matrix size, use the Matrix class instead
    */
    mult(m1) {
        var b = m1.getArrayRef();
        var a = this.arr;
        var copy = new Array(16);
        copy[0] = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3];
        copy[1] = a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3];
        copy[2] = a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3];
        copy[3] = a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3];
        copy[4] = a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7];
        copy[5] = a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7];
        copy[6] = a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7];
        copy[7] = a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7];
        copy[8] = a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11];
        copy[9] = a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11];
        copy[10] = a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11];
        copy[11] = a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11];
        copy[12] = a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15];
        copy[13] = a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15];
        copy[14] = a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15];
        copy[15] = a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15];
        this.setEqualTo(copy);
    }
    multVector(vec) {
        var v = [];
        var m = this.arr;
        v[0] = m[0] * vec[0] + m[4] * vec[1] + m[8] * vec[2] + m[12] * vec[3];
        v[1] = m[1] * vec[0] + m[5] * vec[1] + m[9] * vec[2] + m[13] * vec[3];
        v[2] = m[2] * vec[0] + m[6] * vec[1] + m[10] * vec[2] + m[14] * vec[3];
        v[3] = m[3] * vec[0] + m[7] * vec[1] + m[11] * vec[2] + m[15] * vec[3];
        return v;
    }
    multAll(...matrices) {
        for (const mat of matrices) {
            this.mult(mat);
        }
    }
    transpose() {
        var a = new Array(16);
        a[0] = this.arr[0];
        a[1] = this.arr[4];
        a[2] = this.arr[8];
        a[3] = this.arr[12];
        a[4] = this.arr[1];
        a[5] = this.arr[5];
        a[6] = this.arr[9];
        a[7] = this.arr[13];
        a[8] = this.arr[2];
        a[9] = this.arr[6];
        a[10] = this.arr[10];
        a[11] = this.arr[14];
        a[12] = this.arr[3];
        a[13] = this.arr[7];
        a[14] = this.arr[11];
        a[15] = this.arr[15];
        this.setEqualTo(a);
    }
    getMat3(out = null) {
        var a = new Array(9);
        a[0] = this.arr[0];
        a[1] = this.arr[1];
        a[2] = this.arr[2];
        a[3] = this.arr[4];
        a[4] = this.arr[5];
        a[5] = this.arr[6];
        a[6] = this.arr[8];
        a[7] = this.arr[9];
        a[8] = this.arr[10];
        if (out == null) {
            var m = new Mat3(a);
            return m;
        }
        else {
            out.setEqualTo(a);
        }
    }
    //translates this matrix without creating a translation matrix
    translate(x, y, z) {
        this.arr[12] += this.arr[0] * x + this.arr[4] * y + this.arr[8] * z;
        this.arr[13] += this.arr[1] * x + this.arr[5] * y + this.arr[9] * z;
        this.arr[14] += this.arr[2] * x + this.arr[6] * y + this.arr[10] * z;
        this.arr[15] += this.arr[3] * x + this.arr[7] * y + this.arr[11] * z;
    }
    scale(x, y, z) {
        this.arr[0] *= x;
        this.arr[1] *= x;
        this.arr[2] *= x;
        this.arr[3] *= x;
        this.arr[4] *= y;
        this.arr[5] *= y;
        this.arr[6] *= y;
        this.arr[7] *= y;
        this.arr[8] *= z;
        this.arr[9] *= z;
        this.arr[10] *= z;
        this.arr[11] *= z;
    }
    setRotationAxis(angle, axis) {
        axis = axis.slice();
        Vector.normalize(axis);
        var x = axis[0];
        var y = axis[1];
        var z = axis[2];
        var c = Math.cos(angle);
        var c_1 = 1 - c;
        var s = Math.sin(angle);
        this.arr[0] = (c + x * x * c_1);
        this.arr[4] = (x * y * c_1 + z * s);
        this.arr[8] = (x * z * c_1 - y * s);
        this.arr[1] = (y * x * c_1 - z * s);
        this.arr[5] = (c + y * y * c_1);
        this.arr[9] = (y * z * c_1 + x * s);
        this.arr[2] = (z * x * c_1 + y * s);
        this.arr[6] = (z * y * c_1 - x * s);
        this.arr[10] = (c + z * z * c_1);
    }
    //FIXME: Try to make this more optimized by removing object creation
    rotateAlongAxis(angle, axis) {
        var temp = new Mat4();
        temp.setEqualTo(this.arr);
        //set translation column to zeros
        temp.arr[12] = 0;
        temp.arr[13] = 0;
        temp.arr[14] = 0;
        temp.setRotationAxis(angle, axis);
        this.mult(temp);
    }
    // note that inverse = (1/determinent) * (Transpose of Matrix of Cofactors)
    inv() {
        var a = this.arr;
        var newArr = new Array(16);
        //premultiplied values that are used multiple times
        var b1 = a[10] * a[15] - a[11] * a[14];
        var b2 = a[6] * a[11] - a[7] * a[10];
        var b3 = a[6] * a[15] - a[7] * a[14];
        var b4 = a[2] * a[11] - a[3] * a[10];
        var b5 = a[2] * a[15] - a[3] * a[14];
        var b6 = a[2] * a[7] - a[3] * a[6];
        var b7 = a[5] * a[11] - a[7] * a[9];
        var b8 = a[5] * a[15] - a[7] * a[13];
        var b9 = a[9] * a[15] - a[11] * a[13];
        var b10 = a[1] * a[11] - a[3] * a[9];
        var b11 = a[1] * a[15] - a[3] * a[13];
        var b12 = a[1] * a[7] - a[3] * a[5];
        var b13 = a[5] * a[10] - a[6] * a[9];
        var b14 = a[9] * a[14] - a[10] * a[13];
        var b15 = a[5] * a[14] - a[6] * a[13];
        var b16 = a[1] * a[10] - a[2] * a[9];
        var b17 = a[1] * a[14] - a[2] * a[13];
        var b18 = a[1] * a[6] - a[2] * a[5];
        //calculate 1st four elements of adjugate matrix
        newArr[0] = +(a[5] * b1 - a[9] * b3 + a[13] * b2);
        newArr[1] = -(a[1] * b1 - a[9] * b5 + a[13] * b4);
        newArr[2] = +(a[1] * b3 - a[5] * b5 + a[13] * b6);
        newArr[3] = -(a[1] * b2 - a[5] * b4 + a[9] * b6);
        //find the determinent
        var det = a[0] * newArr[0] + a[4] * newArr[1] + a[8] * newArr[2] + a[12] * newArr[3];
        if (det == 0) {
            throw new Error("Mat4 cannot be inverted!");
        }
        det = 1 / det;
        newArr[0] *= det; //calculates final value of 1st 4 elements multiplying by 1/determinent
        newArr[1] *= det;
        newArr[2] *= det;
        newArr[3] *= det;
        //calculates adjugate of newArr matrix and multiplies by 1/determinent
        newArr[4] = -(a[4] * b1 - a[8] * b3 + a[12] * b2) * det;
        newArr[5] = +(a[0] * b1 - a[8] * b5 + a[12] * b4) * det;
        newArr[6] = -(a[0] * b3 - a[4] * b5 + a[12] * b6) * det;
        newArr[7] = +(a[0] * b2 - a[4] * b4 + a[8] * b6) * det;
        newArr[8] = +(a[4] * b9 - a[8] * b8 + a[12] * b7) * det;
        newArr[9] = -(a[0] * b9 - a[8] * b11 + a[12] * b10) * det;
        newArr[10] = +(a[0] * b8 - a[4] * b11 + a[12] * b12) * det;
        newArr[11] = -(a[0] * b7 - a[4] * b10 + a[8] * b12) * det;
        newArr[12] = -(a[4] * b14 - a[8] * b15 + a[12] * b13) * det;
        newArr[13] = +(a[0] * b14 - a[8] * b17 + a[12] * b16) * det;
        newArr[14] = -(a[0] * b15 - a[4] * b17 + a[12] * b18) * det;
        newArr[15] = +(a[0] * b13 - a[4] * b16 + a[8] * b18) * det;
        this.setEqualTo(newArr);
    }
    toString(precision = 20) {
        return AbstractWebGLMatrix.toString(this, 4, 4, precision);
    }
}
/*
    Contains helper functions that reduce number of calculations for creating a model matrix.
    A model matrix is defined as:
        model = translation * rotation * scale
    First, the rotation matrix is multiplied by the scaling matrix.
    Then, the translation matrix is mutliplied by the resulting matrix to get the model matrix

    If sx, sy, and sz represent the scaling factor [sx sy sz],
    right, up, and foward represent the normalized orientation vectors for rotation, and
    x, y, and z represent the translation(position) of the model, then the model matrix is:

    Model Matrix (3d):
    _____________________________________________
    | sx * rightx | sy * upx | sz * fowardx | x |
    | sx * righty | sy * upy | sz * fowardy | y |
    | sx * rightz | sy * upz | sz * fowardz | z |
    |      0      |    0     |       0      | 1 |
    _____________________________________________

*/
export class ModelMat4 extends Mat4 {
    constructor(arr = null) {
        super(arr);
    }
    translate(x, y, z) {
        this.arr[12] += x;
        this.arr[13] += y;
        this.arr[14] += z;
    }
    scale(x, y, z) {
        this.arr[0] *= x;
        this.arr[1] *= x;
        this.arr[2] *= x;
        this.arr[4] *= y;
        this.arr[5] *= y;
        this.arr[6] *= y;
        this.arr[8] *= z;
        this.arr[9] *= z;
        this.arr[10] *= z;
    }
    setTranslation(x, y, z) {
        this.arr[12] = x;
        this.arr[13] = y;
        this.arr[14] = z;
        this.arr[15] = 1; //since mat4 model matrix is based off of translation * rotation * scale matrices
    }
    setRotationAxis(angle, axis) {
        var scale = this.getScaling(); //this is done to maintain translation and scaling components of this matrix
        super.setRotationAxis(angle, axis);
        this.arr[0] *= scale[0];
        this.arr[4] *= scale[1];
        this.arr[8] *= scale[2];
        this.arr[1] *= scale[0];
        this.arr[5] *= scale[1];
        this.arr[9] *= scale[2];
        this.arr[2] *= scale[0];
        this.arr[6] *= scale[1];
        this.arr[10] *= scale[2];
    }
    rotateAlongAxis(angle, axis) {
        super.rotateAlongAxis(angle, axis);
    }
    setScale(x, y, z) {
        var oldScale = this.getScaling();
        var ratioX = x / oldScale[0];
        var ratioY = y / oldScale[1];
        var ratioZ = z / oldScale[2];
        this.arr[0] *= ratioX;
        this.arr[1] *= ratioX;
        this.arr[2] *= ratioX;
        this.arr[4] *= ratioY;
        this.arr[5] *= ratioY;
        this.arr[6] *= ratioY;
        this.arr[8] *= ratioZ;
        this.arr[9] *= ratioZ;
        this.arr[10] *= ratioZ;
    }
    setRotationVectors(foward, right, up) {
        var scale = this.getScaling();
        Vector.normalize(foward);
        Vector.normalize(right);
        Vector.normalize(up);
        this.arr[0] = right[0] * scale[0];
        this.arr[1] = right[1] * scale[0];
        this.arr[2] = right[2] * scale[0];
        this.arr[4] = up[0] * scale[1];
        this.arr[5] = up[1] * scale[1];
        this.arr[6] = up[2] * scale[1];
        this.arr[8] = foward[0] * scale[2];
        this.arr[9] = foward[1] * scale[2];
        this.arr[10] = foward[2] * scale[2];
    }
    translateAlongVector(distance, vector) {
        Vector.setMag(vector, distance);
        var pos = Vector.add(this.getPos(), vector);
        this.setTranslation(pos[0], pos[1], pos[2]);
    }
    getPos(out = null) {
        var o = out == null ? new Array(3) : out;
        o[0] = this.arr[12];
        o[1] = this.arr[13];
        o[2] = this.arr[14];
        if (out == null) {
            return o;
        }
    }
    getScaling(out = null) {
        var o = out == null ? new Array(3) : out;
        o[0] = Math.hypot(this.arr[0], this.arr[1], this.arr[2]);
        o[1] = Math.hypot(this.arr[4], this.arr[5], this.arr[6]);
        o[2] = Math.hypot(this.arr[8], this.arr[9], this.arr[10]);
        if (out == null) {
            return o;
        }
    }
    //gets rotation vectors of current matrix
    getFowardVector(out = null) {
        var o = out == null ? new Array(3) : out;
        o[0] = this.arr[8];
        o[1] = this.arr[9];
        o[2] = this.arr[10];
        Vector.normalize(o);
        if (out == null) {
            return o;
        }
    }
    getRightVector(out = null) {
        var o = out == null ? new Array(3) : out;
        o[0] = this.arr[0];
        o[1] = this.arr[1];
        o[2] = this.arr[2];
        Vector.normalize(o);
        if (out == null) {
            return o;
        }
    }
    getUpVector(out = null) {
        var o = out == null ? new Array(3) : out;
        o[0] = this.arr[4];
        o[1] = this.arr[5];
        o[2] = this.arr[6];
        Vector.normalize(o);
        if (out == null) {
            return o;
        }
    }
    getNormalMatrix(out = null) {
        var o = out == null ? new Mat3() : out;
        this.getMat3(o);
        o.transpose();
        o.inv();
        if (out == null) {
            return o;
        }
    }
}
export class Mat3 extends AbstractWebGLMatrix {
    constructor(arr = null) {
        super(arr);
        if (arr == null) {
            Mat3.identity(this);
        }
        else if (arr.length != 9) {
            throw new Error("Array size incapatable with 3x3 matrix");
        }
    }
    static identity(out = null) {
        var m = out == null ? new Mat3() : out;
        var o = m.arr;
        o[0] = 1;
        o[1] = 0;
        o[2] = 0;
        o[3] = 0;
        o[4] = 1;
        o[5] = 0;
        o[6] = 0;
        o[7] = 0;
        o[8] = 1;
        if (out == null) {
            return m;
        }
    }
    /*
        Note: Since this was tailored for WebGL and meant to be somewhat optimized,
        this multiplication function is only able to be multiplied by 3x3 matrices.
        For matrix multiplication that accepts any matrix size, use the Matrix class instead
    */
    mult(m1) {
        var b = m1.arr;
        var a = this.arr;
        var copy = new Array(9);
        copy[0] = a[0] * b[0] + a[3] * b[1] + a[6] * b[2];
        copy[1] = a[1] * b[0] + a[4] * b[1] + a[7] * b[2];
        copy[2] = a[2] * b[0] + a[5] * b[1] + a[8] * b[2];
        copy[3] = a[0] * b[3] + a[3] * b[4] + a[6] * b[5];
        copy[4] = a[1] * b[3] + a[4] * b[4] + a[7] * b[5];
        copy[5] = a[2] * b[3] + a[5] * b[4] + a[8] * b[5];
        copy[6] = a[0] * b[6] + a[3] * b[7] + a[6] * b[8];
        copy[7] = a[1] * b[6] + a[4] * b[7] + a[7] * b[8];
        copy[8] = a[2] * b[6] + a[5] * b[7] + a[8] * b[8];
        this.setEqualTo(copy);
    }
    multVector(vec) {
        var v = [];
        var m = this.arr;
        v[0] = m[0] * vec[0] + m[3] * vec[1] + m[6] * vec[2];
        v[1] = m[1] * vec[0] + m[4] * vec[1] + m[7] * vec[2];
        v[2] = m[2] * vec[0] + m[5] * vec[1] + m[8] * vec[2];
        return v;
    }
    multAll(...matrices) {
        for (const mat of matrices) {
            this.mult(mat);
        }
    }
    transpose() {
        var a = new Array(9);
        a[0] = this.arr[0];
        a[1] = this.arr[3];
        a[2] = this.arr[6];
        a[3] = this.arr[1];
        a[4] = this.arr[4];
        a[5] = this.arr[7];
        a[6] = this.arr[2];
        a[7] = this.arr[5];
        a[8] = this.arr[8];
        this.setEqualTo(a);
    }
    // inv(M) = (1/determinent) * adj(M)
    inv() {
        var a = this.arr;
        var newArr = new Array(9);
        newArr[0] = a[4] * a[8] - a[5] * a[7];
        newArr[1] = a[2] * a[7] - a[1] * a[8];
        newArr[2] = a[1] * a[5] - a[2] * a[4];
        var det = a[0] * newArr[0] + a[3] * newArr[1] + a[6] * newArr[2];
        if (det == 0) {
            throw new Error("This 3x3 Matrix cannot be inverted!");
        }
        det = 1 / det;
        newArr[0] *= det;
        newArr[1] *= det;
        newArr[2] *= det;
        newArr[3] = (a[5] * a[6] - a[3] * a[8]) * det;
        newArr[4] = (a[0] * a[8] - a[2] * a[6]) * det;
        newArr[5] = (a[2] * a[3] - a[0] * a[5]) * det;
        newArr[6] = (a[3] * a[7] - a[4] * a[6]) * det;
        newArr[7] = (a[1] * a[6] - a[0] * a[7]) * det;
        newArr[8] = (a[0] * a[4] - a[1] * a[3]) * det;
        this.setEqualTo(newArr);
    }
    toString(precision = 20) {
        return AbstractWebGLMatrix.toString(this, 3, 3, precision);
    }
}
