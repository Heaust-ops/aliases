import * as THREE from "three";

class TPPCamera {
  constructor(camera, target, offset, lookat) {
    this._target = target;
    this._camera = camera;
    this._offset = offset;
    this._lookat = lookat;

    this._currentPosition = new THREE.Vector3();
    this._currentLookat = new THREE.Vector3();
}

_CalculateIdeal(arr) {
    const ideal = new THREE.Vector3(...arr);
    ideal.applyQuaternion(this._target.Rotation);
    ideal.add(this._target.Position);
    return ideal;
}

Update(timeElapsed) {
    const idealOffset = this._CalculateIdeal(this._offset);
    const idealLookat = this._CalculateIdeal(this._lookat);
    
    const t = 1.0 - Math.pow(0.001, timeElapsed) || 0.05;
    
    this._currentPosition.lerp(idealOffset, t);
    this._currentLookat.lerp(idealLookat, t);
    this._camera.position.copy(this._currentPosition);
    this._camera.lookAt(this._currentLookat);
  }
}

export default TPPCamera;