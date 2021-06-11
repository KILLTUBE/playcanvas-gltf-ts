export class AnimationKeyableVecCubicSpline {
  type: AnimationKeyableType;
  time: number;
  value: pc.Vec3;
  inTangent: pc.Vec3;
  outTangent: pc.Vec3;

  constructor(time: number, value: pc.Vec3, inTangent: pc.Vec3, outTangent: pc.Vec3) {
    this.type       = AnimationKeyableType.VEC_CUBICSCPLINE;
    this.time       = time       || 0.0;
    this.value      = value      || new pc.Vec3();
    this.inTangent  = inTangent  || new pc.Vec3();
    this.outTangent = outTangent || new pc.Vec3();
  }

  clone() {
    return new AnimationKeyableVecCubicSpline(this.time, this.value.clone(), this.inTangent.clone(), this.outTangent.clone());
  }

  copy(other: AnimationKeyableVecCubicSpline) {
    this.time = other.time;
    this.value.copy(other.value);
    this.inTangent.copy(other.inTangent);
    this.outTangent.copy(other.outTangent);
    return this;
  }


  cubicHermite(from: AnimationKeyableVecCubicSpline, to: AnimationKeyableVecCubicSpline, alpha: number) {
    var g = to.time - from.time;
    this.value.x = AnimationCurve.cubicHermite(g * from.outTangent.x, from.value.x, g * to.inTangent.x, to.value.x, alpha);
    this.value.y = AnimationCurve.cubicHermite(g * from.outTangent.y, from.value.y, g * to.inTangent.y, to.value.y, alpha);
    this.value.z = AnimationCurve.cubicHermite(g * from.outTangent.z, from.value.z, g * to.inTangent.z, to.value.z, alpha);
  }
}
