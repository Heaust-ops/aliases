import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import TPPCamera from "./TPPCamera";

class Base {
  constructor({ customInitFunc = false, ambientLight = 0x404040 } = {}) {
    this._Initialize({ ambientLight, customInitFunc });
  }

  _Initialize({ ambientLight, customInitFunc } = {}) {
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._renderer.domElement);

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

    if (customInitFunc) customInitFunc(this);

    this._RAF();
  }

  lockTPPCamera(target, offset = [-15, 20, -30], lookat = [0, 10, 50]) {
    this.addCamera({orbital: false});
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
        let vector = new THREE.Vector3();
        this._camera.getWorldDirection( vector );
        controls.target.set(... Object.values(vector));
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
    });

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
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load(param);
    this._scene.background = texture;
  }

  addCamera({
    from = [70, 20, 0],
    to = [0, 0, 0],
    fov = 60,
    aspect = 1920 / 1080,
    near = 1.0,
    far = 1000.0,
    orbital = true,
  } = {}) {
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

  addPlane({
    color = 0x808080,
    dimensions = [100, 100, 1, 1],
    pos = [0, 0, 0],
    castShadow = true,
    receiveShadow = true,
    rotationX = -Math.PI / 2,
    rotationY = 0,
    rotationZ = 0,
  } = {}) {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(...dimensions),
      new THREE.MeshStandardMaterial({ color })
    );
    plane.position.set(...pos);
    plane.castShadow = castShadow;
    plane.receiveShadow = receiveShadow;
    plane.rotation.x = rotationX;
    plane.rotation.y = rotationY;
    plane.rotation.z = rotationZ;
    this._scene.add(plane);
    return plane;
  }

  addBox({
    color = 0x202020,
    dimensions = [2, 2, 2],
    pos = [0, 2, 0],
    castShadow = true,
    receiveShadow = true,
  } = {}) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(...dimensions),
      new THREE.MeshStandardMaterial({ color })
    );
    box.position.set(...pos);
    box.castShadow = castShadow;
    box.receiveShadow = receiveShadow;
    this._scene.add(box);
    return box;
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  loadAnimatedFBXModelAndPlay(path, modelFile, animFile, pos = [0, 0, 0]) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
      fbx.scale.setScalar(0.1);
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

  loadGLTFModel(param) {
    const loader = new GLTFLoader();
    loader.load(param, (gltf) => {
      gltf.scene.traverse((c) => {
        c.castShadow = true;
      });
      this._scene.add(gltf.scene);
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
