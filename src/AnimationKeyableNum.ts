import { AnimationKeyable, AnimationKeyableType } from "./AnimationKeyable";

export class AnimationKeyableNum implements AnimationKeyable {
  type: AnimationKeyableType;
  time: number;
  value: number;

  constructor(time?: number, value?: number) {
    this.type  = AnimationKeyableType.NUM;
    this.time  = time  || 0.0;
    this.value = value || 0.0;
  }

  clone() {
    return new AnimationKeyableNum(this.time, this.value);
  }

  copy(other: AnimationKeyableNum) {
    this.time = other.time;
    this.value = other.value;
    return this;
  }

  linearBlend(from: AnimationKeyableNum, to: AnimationKeyableNum, alpha: number) {
    this.value = (1.0 - alpha) * from.value + alpha * to.value;
  }
}
