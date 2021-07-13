import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import TPPCamera from "./TPPCamera";
import * as dat from "dat.gui";
import gsap from "gsap";

class Base {
  constructor({
    customInitFunc = false,
    ambientLight = 0x404040,
    debug = false,
  } = {}) {
    this._Initialize({ ambientLight, customInitFunc, debug });
  }

  _Initialize({ ambientLight, customInitFunc, debug } = {}) {
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._renderer.domElement);
    this._aspect = "w/h";

    window.addEventListener(
      "resize",
      () => {
        this._OnWindowResize();
      },
      false
    );

    this._scene = new THREE.Scene();
    this._animations = [];

    const light = new THREE.AmbientLight(ambientLight);
    this._scene.add(light);
    this._mixers = [];
    this._steps = [];
    this._attrs = [];
    this._frameRateDisplay = document.getElementById("frame-rate");
    this._frameRateDisplayContainer = document.getElementById(
      "frame-rate-container"
    );
    this._textureLoader = new THREE.TextureLoader();
    this._cubeTextureLoader = new THREE.CubeTextureLoader();

    this._debug = debug;
    if (this._debug) this._gui = new dat.GUI({ width: 400 });

    if (customInitFunc) customInitFunc(this);

    this._RAF();
  }

  addDebugFolder(name = "generic" + this.random(0, 10000), parent = this._gui) {
    return parent.addFolder(name);
  }

  debugBasicMesh({
    debugMesh = false,
    debug = true,
    color = "#223344",
    debugName = "genericMesh" + this.random(0, 10000),
    debugPosMin = [-100, -100, -100],
    debugPosMax = [100, 100, 100],
    debugRotMin = [-Math.PI, -Math.PI, -Math.PI],
    debugRotMax = [Math.PI, Math.PI, Math.PI],
    debugPosStep = 0.01,
    debugRotStep = 0.01,
    debugFolder = this._gui,
  } = {}) {
    if (debug && this._debug && debugMesh) {
      const folder = debugFolder.addFolder(debugName);
      const parameters = {
        color,
        spinX: () => {
          gsap.to(debugMesh.rotation, {
            duration: 1,
            x: debugMesh.rotation.x + Math.PI * 2,
          });
        },
        spinY: () => {
          gsap.to(debugMesh.rotation, {
            duration: 1,
            y: debugMesh.rotation.y + Math.PI * 2,
          });
        },
        spinZ: () => {
          gsap.to(debugMesh.rotation, {
            duration: 1,
            z: debugMesh.rotation.z + Math.PI * 2,
          });
        },
      };
      folder
        .add(debugMesh.position, "x")
        .min(debugPosMin[0])
        .max(debugPosMax[0])
        .step(
          debugPosStep.constructor === Array ? debugPosStep[0] : debugPosStep
        )
        .name("pos-x");
      folder
        .add(debugMesh.position, "y")
        .min(debugPosMin[1])
        .max(debugPosMax[1])
        .step(
          debugPosStep.constructor === Array ? debugPosStep[1] : debugPosStep
        )
        .name("pos-y");
      folder
        .add(debugMesh.position, "z")
        .min(debugPosMin[2])
        .max(debugPosMax[2])
        .step(
          debugPosStep.constructor === Array ? debugPosStep[2] : debugPosStep
        )
        .name("pos-z");
      folder
        .add(debugMesh.rotation, "x")
        .min(debugRotMin[0])
        .max(debugRotMax[0])
        .step(
          debugRotStep.constructor === Array ? debugRotStep[0] : debugRotStep
        )
        .name("rot-x");
      folder
        .add(debugMesh.rotation, "y")
        .min(debugRotMin[1])
        .max(debugRotMax[1])
        .step(
          debugRotStep.constructor === Array ? debugRotStep[1] : debugRotStep
        )
        .name("rot-y");
      folder
        .add(debugMesh.rotation, "z")
        .min(debugRotMin[2])
        .max(debugRotMax[2])
        .step(
          debugRotStep.constructor === Array ? debugRotStep[2] : debugRotStep
        )
        .name("rot-z");
      folder.add(debugMesh, "visible");
      if (debugMesh.material) folder.add(debugMesh.material, "wireframe");
      folder.add(parameters, "spinX");
      folder.add(parameters, "spinY");
      folder.add(parameters, "spinZ");
      if (debugMesh.material) folder.addColor(parameters, "color").onChange(() => {
        debugMesh.material.color.set(parameters.color);
      });
    }
  }

  random(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  randomColor() {
    let color = "#";
    for (let i = 0; i < 6; i++) {
      const random = Math.random();
      const bit = (random * 16) | 0;
      color += bit.toString(16);
    }
    return color;
  }

  lockTPPCamera(
    target,
    cameraParams = {},
    offset = [-15, 20, -30],
    lookat = [0, 10, 50]
  ) {
    this.addCamera({ ...cameraParams, orbital: false });
    this._TPPCamera = new TPPCamera(this._camera, target, offset, lookat);
    return this.addStep((t, parent) => {
      parent._TPPCamera.Update(t);
    });
  }

  unlockTPPCamera(key, orbital = true) {
    this.removeStep(key);
    if (orbital) {
      const controls = new OrbitControls(
        this._camera,
        this._renderer.domElement
      );
      controls.update();
    }
  }

  loadAnimatedFBXModel({
    CharacterController,
    path,
    character = "character.fbx",
    walk = "walk.fbx",
    run = "run.fbx",
    idle = "idle.fbx",
    dance = "dance.fbx",
    size = 0.1,
    pos = [0, 0, 0],
  } = {}) {
    this._controls = new CharacterController({
      path,
      camera: this._camera,
      scene: this._scene,
      character,
      walk,
      run,
      idle,
      dance,
      size,
      pos,
    });

    // console.log(this._controls.position)

    return this._controls;
  }

  execute(func) {
    func(this);
  }

  addDirectionalLight({
    color = 0xffffff,
    from = [100, 100, 100],
    to = [0, 0, 0],
  } = {}) {
    let light = new THREE.DirectionalLight(color);
    light.position.set(...from);
    light.target.position.set(...to);
    light.castShadow = true;
    light.shadow.bias = -0.01;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 1.0;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = 200;
    light.shadow.camera.right = -200;
    light.shadow.camera.top = 200;
    light.shadow.camera.bottom = -200;
    this._scene.add(light);
    return light;
  }

  skybox(param) {
    // param will be an array of image paths
    const texture = this._cubeTextureLoader.load(param);
    this._scene.background = texture;
  }

  addCamera({
    from = [70, 20, 0],
    to = [0, 0, 0],
    fov = 60,
    aspect = "w/h",
    near = 1.0,
    far = 1000.0,
    orbital = true,
  } = {}) {
    this._aspect = aspect;
    if (aspect == "w/h") aspect = window.innerWidth / window.innerHeight;
    if (aspect == "h/w") aspect = window.innerHeight / window.innerWidth;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(...from);
    if (orbital) {
      const controls = new OrbitControls(
        this._camera,
        this._renderer.domElement
      );
      controls.target.set(...to);
      controls.update();
    }
    return this._camera;
  }

  addAnimation(f) {
    this._animations.push(f);
    return this._animations.length - 1; // the id or index of the function
  }

  removeAnimation(id) {
    // index of function in the array
    this._animations.splice(id, 1);
  }

  addBufferGeometry({
    float32array = [0, 0, 0, 0, 1, 0, 1, 0, 0],
    vertexLength = 3,
    color = 0x808080,
    pos = [0, 0, 0],
    castShadow = true,
    receiveShadow = true,
    rotationX = 0,
    rotationY = 0,
    rotationZ = 0,
    map = false,
    bumpMap = false,
    normalMap = false,
    wireframe = false,
  } = {}) {
    const positionArray = new Float32Array(
      float32array.map((e, i) => {
        return e + pos[i % 3];
      })
    );
    const positionsAttribute = new THREE.BufferAttribute(
      positionArray,
      vertexLength
    );
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", positionsAttribute);
    const a = map ? { map: this._textureLoader.load(map) } : {};
    const b = bumpMap
      ? { bumpMap: this._textureLoader.load(bumpMap) }
      : {};
    const c = normalMap
      ? { normalMap: this._textureLoader.load(normalMap) }
      : {};
    const d = map ? {} : { color: color };
    const meshParams = { ...a, ...b, ...c, ...d, wireframe };
    const bufferMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial(meshParams)
    );
    bufferMesh.position.set(...pos);
    bufferMesh.castShadow = castShadow;
    bufferMesh.receiveShadow = receiveShadow;
    bufferMesh.rotation.x = rotationX;
    bufferMesh.rotation.y = rotationY;
    bufferMesh.rotation.z = rotationZ;
    this._scene.add(bufferMesh);
    return bufferMesh;
  }

  addPlane({
    color = 0x808080,
    dimensions = [100, 100],
    segments = [1, 1],
    pos = [0, 0, 0],
    castShadow = true,
    receiveShadow = true,
    rotationX = -Math.PI / 2,
    rotationY = 0,
    rotationZ = 0,
    map = false,
    bumpMap = false,
    normalMap = false,
    wireframe = false,
    debug = true,
    debugName = "plane" + this.random(0, 10000),
    debugPosMin = [-100, -100, -100],
    debugPosMax = [100, 100, 100],
    debugRotMin = [-Math.PI, -Math.PI, -Math.PI],
    debugRotMax = [Math.PI, Math.PI, Math.PI],
    debugPosStep = 0.01,
    debugRotStep = 0.01,
    debugFolder = this._gui,
  } = {}) {
    const a = map ? { map: this._textureLoader.load(map) } : {};
    const b = bumpMap
      ? { bumpMap: this._textureLoader.load(bumpMap) }
      : {};
    const c = normalMap
      ? { normalMap: this._textureLoader.load(normalMap) }
      : {};
    const d = map ? {} : { color: color };
    const meshParams = { ...a, ...b, ...c, ...d, wireframe };
    const plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(...dimensions, ...segments),
      new THREE.MeshStandardMaterial(meshParams)
    );
    plane.position.set(...pos);
    plane.castShadow = castShadow;
    plane.receiveShadow = receiveShadow;
    plane.rotation.x = rotationX;
    plane.rotation.y = rotationY;
    plane.rotation.z = rotationZ;
    this._scene.add(plane);

    /**
     * Debug
     */
    this.debugBasicMesh({
      debugMesh: plane,
      debug,
      color,
      debugName,
      debugPosMin,
      debugPosMax,
      debugRotMin,
      debugRotMax,
      debugPosStep,
      debugRotStep,
      debugFolder,
    });

    return plane;
  }

  addBox({
    color = 0x202020,
    dimensions = [2, 2, 2],
    segments = [1, 1, 1],
    pos = [0, 2, 0],
    castShadow = true,
    receiveShadow = true,
    rotationX = 0,
    rotationY = 0,
    rotationZ = 0,
    map = false,
    bumpMap = false,
    normalMap = false,
    wireframe = false,
    debug = true,
    debugName = "box" + this.random(0, 10000),
    debugPosMin = [-100, -100, -100],
    debugPosMax = [100, 100, 100],
    debugRotMin = [-Math.PI, -Math.PI, -Math.PI],
    debugRotMax = [Math.PI, Math.PI, Math.PI],
    debugPosStep = 0.01,
    debugRotStep = 0.01,
    debugFolder = this._gui,
  } = {}) {
    const a = map ? { map: this._textureLoader.load(map) } : {};
    const b = bumpMap
      ? { bumpMap: this._textureLoader.load(bumpMap) }
      : {};
    const c = normalMap
      ? { normalMap: this._textureLoader.load(normalMap) }
      : {};
    const d = map ? {} : { color: color };
    const meshParams = { ...a, ...b, ...c, ...d, wireframe };
    const box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(...dimensions, ...segments),
      new THREE.MeshStandardMaterial(meshParams)
    );
    box.position.set(...pos);
    box.castShadow = castShadow;
    box.receiveShadow = receiveShadow;
    box.rotation.x = rotationX;
    box.rotation.y = rotationY;
    box.rotation.z = rotationZ;
    this._scene.add(box);

    /**
     * Debug
     */
     this.debugBasicMesh({
      debugMesh: box,
      debug,
      color,
      debugName,
      debugPosMin,
      debugPosMax,
      debugRotMin,
      debugRotMax,
      debugPosStep,
      debugRotStep,
      debugFolder,
    });

    return box;
  }

  _OnWindowResize() {
    if (this._aspect == "w/h")
      this._camera.aspect = window.innerWidth / window.innerHeight;
    else if (this._aspect == "h/w")
      this._camera.aspect = window.innerHeight / window.innerWidth;
    else this._camera.aspect = this._aspect;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  loadAnimatedFBXModelAndPlay(
    path,
    modelFile,
    animFile,
    pos = [0, 0, 0],
    size = 0.1
  ) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
      fbx.scale.setScalar(size);
      fbx.traverse((c) => {
        c.castShadow = true;
      });
      fbx.position.copy(new THREE.Vector3(...pos));

      const anim = new FBXLoader();
      anim.setPath(path);
      anim.load(animFile, (anim) => {
        const m = new THREE.AnimationMixer(fbx);
        this._mixers.push(m);
        const idle = m.clipAction(anim.animations[0]);
        idle.play();
      });
      this._scene.add(fbx);
    });
  }

  loadGLTFModel(modelPath, pos = [0, 0, 0], size = 1) {
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
      gltf.scene.scale.set(size, size, size);
      gltf.scene.traverse((c) => {
        c.castShadow = true;
      });
      gltf.scene.position.copy(new THREE.Vector3(...pos));
      this._scene.add(gltf.scene);
      this.debugBasicMesh({
        debugMesh: gltf.scene,
        debug: true,
        debugName: "GLTFModel" + this.random(0,10000),
      });
    });
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      // Recursively Render
      this._renderer.render(this._scene, this._camera);
      this._RAF();

      // Play Animations
      if (this._animations.length !== 0) {
        this._animations.forEach((f) => {
          f(this);
        });
      }
      // Step
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  addAttr(f) {
    this._attrs.push(f);
    return this._attrs.length - 1; // Id or index of the Step
  }

  removeAttr(id) {
    this._attrs.splice(id, 1);
  }

  getAttr(key) {
    return this._attrs[key];
  }

  addStep(f) {
    this._steps.push(f);
    if (f.length < 1) {
      console.log("Function must contain at require 1 arg: Time Elapsed (s)");
      console.log("addAnimation may be what you're looking for");
      return;
    }
    return this._steps.length - 1; // Id or index of the Step
  }

  removeStep(id) {
    this._steps.splice(id, 1);
  }

  frameRateDisplay(toggle = "toggle") {
    const frameratestep = (t) => {
      if (Math.floor(Date.now() / 1000) % 2 == 0)
        this._frameRateDisplay.innerHTML = "frame rate: " + Math.floor(1 / t);
    };
    if (toggle == "toggle") {
      if (this._frameRateDisplayContainer.style.display == "none") {
        this._frameRateDisplayContainer.style.display = "block";
        this._frameRateDisplayKey = this.addStep(frameratestep);
        return;
      }
      if (
        this._frameRateDisplayContainer.style.display == "block" ||
        this._frameRateDisplayKey === undefined
      ) {
        this._frameRateDisplayContainer.style.display = "none";
        this.removeStep(this._frameRateDisplayKey);
        this._frameRateDisplayKey = undefined;
        return;
      }
    }
    if (toggle == "enable") {
      if (this._frameRateDisplayContainer.style.display == "none") return;
      this._frameRateDisplayContainer.style.display = "block";
      this._frameRateDisplayKey = this.addStep(frameratestep);
      return;
    }
    if (toggle == "disable") {
      if (
        this._frameRateDisplayContainer.style.display == "block" ||
        this._frameRateDisplayKey === undefined
      )
        return;
      this._frameRateDisplayContainer.style.display = "none";
      this.removeStep(this._frameRateDisplayKey);
      this._frameRateDisplayKey = undefined;
      return;
    }
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map((m) => m.update(timeElapsedS));
    }

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }

    if (this._steps.length !== 0) {
      this._steps.forEach((f) => {
        if (f.length == 1) f(timeElapsedS);
        if (f.length == 2) f(timeElapsedS, this);
      });
    }
  }
}

export default Base;
