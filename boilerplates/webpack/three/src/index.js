import Base from "./lib/base";
import CharacterController from "./lib/CharacterController";

const base = new Base({
  customInitFunc: (parent) => {
    // Custom Init Function
  },
  debug: true,
});
base.frameRateDisplay();
const plane = base.addPlane({
  dimensions: [300, 300],
  color: "#223344",
  bumpMap: "./resources/texture/bump.jpg",
});
let boxes = [];
let coords = [];
let tmp = [base.random(-30, 30) * 3, 2, base.random(-30, 30) * 3];
const randBoxGroup = base.addDebugFolder("Random Boxes");
for (let i = 0; i < 50; i++) {
  while (coords.includes(tmp))
    tmp = [base.random(-30, 30) * 3, 5, base.random(-30, 30) * 3];
  coords.push(tmp);
  boxes.push(
    base.addBox({
      pos: tmp,
      color: base.randomColor(),
      bumpMap: "./resources/texture/bump.jpg",
      debugFolder: randBoxGroup
    })
  );
}

base.addAnimation(() => {
  boxes.forEach((box, index) => {
    box.rotation.x += Math.random() / 10;
    box.rotation.y += Math.random() / 10;
    box.position.y = Math.sin(Date.now() * (0.01 + index / 100000)) * 3 + 5;
  });
});

base.skybox([
  "./resources/skyboxes/skybox_px.jpg",
  "./resources/skyboxes/skybox_nx.jpg",
  "./resources/skyboxes/skybox_py.jpg",
  "./resources/skyboxes/skybox_ny.jpg",
  "./resources/skyboxes/skybox_pz.jpg",
  "./resources/skyboxes/skybox_nz.jpg",
]);

const light = base.addDirectionalLight({ from: [-100, 100, -200] });

const model = base.loadAnimatedFBXModel({
  CharacterController,
  path: "./resources/peasant/",
  character: "peasant_girl.fbx",
  size: 0.1,
  pos: [-10, 0, -10],
});

base.loadGLTFModel("./resources/thing.glb", [30, 0, 30]);

const tppcam = base.lockTPPCamera(model);

document.addEventListener(
  "keydown",
  (e) => {
    if (e.key == "f") {
      base.frameRateDisplay();
    }
  },
  false
);

base.addBufferGeometry({
  float32array: [1, 1, 1, 1, 10, 1, 10, 1, 1],
  color: "#223344",
});
