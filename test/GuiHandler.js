/*
    Handles layout of canvases used in webgl application.
    Handles what occurs when a user activates Fullscreen and PointerLock APIs
    Handles what is displayed when game is running/not running
*/
export class WebGLWindowHandler {
    //adds elements to page and creates styles
    constructor(pointerLockCallback = null, fullscreenCallback = null) {
        //constants
        this.WRAPPER_ID = "game_window";
        this.DEFAULT_WIDTH = 800;
        this.DEFAULT_HEIGHT = 600;
        this._isFullscreen = false;
        this._pointerLockActive = false;
        //Note, pointerLockChangeCallback take one boolean parameter. This parameter is true when pointerLock is active and false when
        //  it is turned off.
        this.pointerLockChangeCallback = null;
        //Note, fullscreenChangeCallback take 2 number parameters. These parameters are the new width and height of the canvases, respectively
        this.fullscreenChangeCallback = null;
        this.wrapper = null;
        this.gl_canvas = document.createElement("canvas");
        this.overlay_canvas = document.createElement("canvas");
        this.glContext = null;
        this.overlayContext = null;
        this.wrapper = document.getElementById(this.WRAPPER_ID);
        this.pointerLockChangeCallback = pointerLockCallback;
        this.fullscreenChangeCallback = fullscreenCallback;
        if (this.wrapper == null) {
            alert(`Element or div with id \"${this.WRAPPER_ID}\" was not found. Cannot run application!`);
            throw new Error(`Element or div with id \"${this.WRAPPER_ID}\" was not found. Cannot run application!`);
        }
        this.wrapper.style.textAlign = "center";
        this.wrapper.style.position = "relative";
        this.wrapper.style.width = "100%";
        this.wrapper.style.height = `${this.DEFAULT_HEIGHT + 10}px`;
        this.setCanvasToDefaultStyles();
        this.initFullscreenAPI();
        this.initPointerLockAPI();
        this.glContext = this.gl_canvas.getContext("webgl");
        this.overlayContext = this.overlay_canvas.getContext("2d");
        this.wrapper.appendChild(this.gl_canvas);
        this.wrapper.appendChild(this.overlay_canvas);
    }
    setCanvasToDefaultStyles() {
        this.wrapper.style.height = `${this.DEFAULT_HEIGHT + 10}px`;
        this.gl_canvas.style.position = 'absolute';
        this.overlay_canvas.style.position = 'absolute';
        this.gl_canvas.style.zIndex = '0';
        this.overlay_canvas.style.zIndex = '1';
        this.gl_canvas.style.border = '1px solid black';
        this.overlay_canvas.style.border = '1px solid black';
        this.gl_canvas.style.left = `calc(50% - ${this.DEFAULT_WIDTH / 2}px)`;
        this.overlay_canvas.style.left = `calc(50% - ${this.DEFAULT_WIDTH / 2}px)`;
        this.gl_canvas.style.width = `${this.DEFAULT_WIDTH}px`;
        this.gl_canvas.style.height = `${this.DEFAULT_HEIGHT}px`;
        this.gl_canvas.width = this.DEFAULT_WIDTH;
        this.gl_canvas.height = this.DEFAULT_HEIGHT;
        this.overlay_canvas.style.width = `${this.DEFAULT_WIDTH}px`;
        this.overlay_canvas.style.height = `${this.DEFAULT_HEIGHT}px`;
        this.overlay_canvas.width = this.DEFAULT_WIDTH;
        this.overlay_canvas.height = this.DEFAULT_HEIGHT;
    }
    initPointerLockAPI() {
        //@ts-expect-error
        this.overlay_canvas.requestPointerLock = this.overlay_canvas.requestPointerLock || this.overlay_canvas.mozRequestPointerLock || this.overlay_canvas.webkitRequestPointerLock;
        //@ts-expect-error
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
        this.overlay_canvas.onclick = this.overlay_canvas.requestPointerLock;
        document.addEventListener('pointerlockchange', this.pointerLockChange.bind(this), false);
        document.addEventListener('mozpointerlockchange', this.pointerLockChange.bind(this), false);
        document.addEventListener('webkitpointerlockchange', this.pointerLockChange.bind(this), false);
        document.addEventListener('pointerlockerror', this.pointerLockError.bind(this), false);
        document.addEventListener('mozpointerlockerror', this.pointerLockError.bind(this), false);
        document.addEventListener('webkitpointerlockerror', this.pointerLockError.bind(this), false);
    }
    pointerLockChange() {
        this._pointerLockActive = !this._pointerLockActive;
        if (this.pointerLockChangeCallback != null) {
            this.pointerLockChangeCallback.call(this, this._pointerLockActive);
        }
    }
    pointerLockError(err) {
        console.log(err);
    }
    initFullscreenAPI() {
        document.addEventListener("fullscreenchange", this.toggleFullscreen.bind(this));
        document.addEventListener("mozfullscreenchange", this.toggleFullscreen.bind(this));
        document.addEventListener("webkitfullscreenchange", this.toggleFullscreen.bind(this));
        document.addEventListener("msfullscreenchange", this.toggleFullscreen.bind(this));
        document.addEventListener("fullscreenerror", this.toFullScreenError.bind(this));
        document.addEventListener("webkitfullscreenerror", this.toFullScreenError.bind(this));
        document.addEventListener("msfullscreenerror", this.toFullScreenError.bind(this));
        document.addEventListener("mozfullscreenerror", this.toFullScreenError.bind(this));
    }
    //is called when element FAILS to switch to fullscreen mode (not vice versa)
    toFullScreenError() {
        this._isFullscreen = false;
        console.log("Fullscreen Failed!");
    }
    //called when element SUCCESSFULLY switches from fullscreen to normal or vise-versa
    toggleFullscreen(fs_element) {
        this._isFullscreen = !this._isFullscreen;
        if (this._isFullscreen) {
            //MUST do this first to adjust the resolution of the canvases
            this.wrapper.style.height = `${screen.height}px`;
            this.gl_canvas.style.height = `${screen.height}px`;
            this.gl_canvas.style.width = `${screen.width}px`;
            this.gl_canvas.style.top = "0";
            this.gl_canvas.style.left = "0";
            this.overlay_canvas.style.height = `${screen.height}px`;
            this.overlay_canvas.style.width = `${screen.width}px`;
            this.overlay_canvas.style.top = "0";
            this.overlay_canvas.style.left = "0";
            this.gl_canvas.width = screen.width;
            this.gl_canvas.height = screen.height;
            this.overlay_canvas.width = screen.width;
            this.overlay_canvas.height = screen.height;
        }
        else {
            this.setCanvasToDefaultStyles();
        }
        if (this.fullscreenChangeCallback != null) {
            this.fullscreenChangeCallback.call(this, this.gl_canvas.width, this.gl_canvas.height);
        }
    }
    setFullscreenEventCallback(callback) {
        this.fullscreenChangeCallback = callback;
    }
    setPointerEventCallback(callback) {
        this.pointerLockChangeCallback = callback;
    }
    getCanvasWidth() {
        return this.gl_canvas.width;
    }
    getCanvasHeight() {
        return this.gl_canvas.height;
    }
    isFullscreen() {
        return this._isFullscreen;
    }
    pointerLockActive() {
        return this._pointerLockActive;
    }
    getGLContext() {
        return this.glContext;
    }
    get2dContext() {
        return this.overlayContext;
    }
    fullscreen() {
        if (this.wrapper.requestFullscreen) {
            this.wrapper.requestFullscreen();
        }
        //@ts-expect-error
        else if (this.wrapper.mozRequestFullscreen) {
            this.wrapper.mozRequestFullscreen();
        }
        //@ts-expect-error
        else if (this.wrapper.webkitRequestFullscreen) {
            this.wrapper.webkitRequestFullscreen();
        }
        //@ts-expect-error
        else if (this.wrapper.msRequestFullscreen) {
            this.wrapper.msRequestFullscreen();
        }
    }
    endFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        //@ts-expect-error
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        //@ts-expect-error
        else if (document.mozExitFullscreen) {
            document.mozExitFullscreen();
        }
        //@ts-expect-error
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}
