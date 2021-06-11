export class AnimationKeyableNumCubicSpline {
  type: AnimationKeyableType;
  time: number;
  value: number;
  inTangent: number;
  outTangent: number;

  constructor(time: number, value: number, inTangent: number, outTangent: number) {
    this.type       = AnimationKeyableType.NUM_CUBICSCPLINE;
    this.time       = time       || 0.0;
    this.value      = value      || 0.0;
    this.inTangent  = inTangent  || 0.0;
    this.outTangent = outTangent || 0.0;
  }

  clone() {
    return new AnimationKeyableNumCubicSpline(this.time, this.value, this.inTangent, this.outTangent);
  }

  copy(other: AnimationKeyableNumCubicSpline) {
    this.time = other.time;
    this.value = other.value;
    this.inTangent = other.inTangent;
    this.outTangent = other.outTangent;
    return this;
  }

  cubicHermite(from: AnimationKeyableNumCubicSpline, to: AnimationKeyableNumCubicSpline, alpha: number) {
    var g = to.time - from.time;
    this.value = AnimationCurve.cubicHermite(g * from.outTangent, from.value, g * to.inTangent, to.value, alpha);
  }
}
