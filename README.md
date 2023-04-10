# ryrender
A light-weight WebGL 1.0 library that allows users to easily insert 3D models into a WebGL context.

## Current Goals
### Most Prioritized Goals
    * Add dynamic and static lights
      * Static Lights are calculated on runtime and are not included in GLSL calculations. The final light value is passed
        to the GLSL shaders instead. These are much more efficient than dynamic lights, but are never updated in loop.
      * Dynamic lights are calculated during render loop and is calculated each frame in the GLSL shader. Allow for
      light to move and update the textures around them, but only 4 should be used at one time.

### Other Goals
    * Add instancing and particle system
    * Allow use of multiple shader programs for 1 mesh (use sampler2d output of program 1 and modify it in program 2)
    * Create shader program that is run once and another that runs per frame
    * Add Framebuffer for Post-Processing Effects.
    * Add Mesh subclasses for basic shapes, such as Cubes, Boxes, Spheres, and Cylinders.
    * Add shadows for all Material types
    * Add Custom Material Type that allows users to write their own GLSL.
    * For Cube Meshes only, finish implementing the TEXTURE_CUBE_MAP.
## List of Potential Ideas for RyRender:
    * Load 3D assets from .glb files
    * The user should easily swap between materials for a model instance using only an enum.
    * There should either be a predefined material for a cached model or default material that every model instance gets if the user does not define a material for that instance.
    * Textures should not be bound to a material. They should be their own thing and should make switching textures very easy.
    * Must be easy for multiple renderer instances to share data if using multiple canvases
    * There should be an option for basic dynamic lighting.
    * Should accept "baked" models.
    
    
