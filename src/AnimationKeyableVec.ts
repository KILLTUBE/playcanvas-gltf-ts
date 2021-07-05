import { AnimationKeyable, AnimationKeyableType } from "./AnimationKeyable";

export class AnimationKeyableVec implements AnimationKeyable {
  type: AnimationKeyableType;
  time: number;
  value: pc.Vec3;

  constructor(time: number, value: pc.Vec3) {
    this.type  = AnimationKeyableType.VEC;
    this.time  = time  || 0.0;
    this.value = value || new pc.Vec3();
  }

  clone() {
    return new AnimationKeyableVec(this.time, this.value.clone());
  }

  copy(other: AnimationKeyableVec) {
    this.time = other.time;
    this.value.copy(other.value);
    return this;
  }

  linearBlend(from: AnimationKeyableVec, to: AnimationKeyableVec, alpha: number) {
    this.value.lerp(from.value, to.value, alpha);
  }
}
