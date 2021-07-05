import { AnimationKeyableNum } from "./AnimationKeyableNum";
import { AnimationKeyableVec } from "./AnimationKeyableVec";
import { AnimationKeyableQuat } from "./AnimationKeyableQuat";
import { AnimationKeyableNumCubicSpline } from "./AnimationKeyableNumCubicSpline";
import { AnimationKeyableVecCubicSpline } from "./AnimationKeyableVecCubicSpline";
import { AnimationKeyableQuatCubicSpline } from "./AnimationKeyableQuatCubicSpline";

export enum AnimationKeyableType {
  NUM               = 0,
  VEC2              = 1,
  VEC               = 2, // todo: rename to VEC3
  VEC4              = 3,
  QUAT              = 4,
  NUM_CUBICSCPLINE  = 5,
  VEC2_CUBICSCPLINE = 6,
  VEC_CUBICSCPLINE  = 7, // todo: rename to VEC3_CUBICSPLINE
  VEC4_CUBICSCPLINE = 8,
  QUAT_CUBICSCPLINE = 9,
}

export interface AnimationKeyable {
  type: AnimationKeyableType;
  time: number;
  _cacheKeyIdx?: number;
  clone(): AnimationKeyable;
  copy(other: AnimationKeyable): AnimationKeyable;
}

export function new_AnimationKeyable(type: AnimationKeyableType, time?: number, value?: BlendValue, inTangent?: BlendValue, outTangent?: BlendValue): AnimationKeyable {
  switch (type) {
    case AnimationKeyableType.NUM:
      return new AnimationKeyableNum(time, value);
    case AnimationKeyableType.VEC:
      return new AnimationKeyableVec(time, value);
    case AnimationKeyableType.QUAT:
      return new AnimationKeyableQuat(time, value);
    case AnimationKeyableType.NUM_CUBICSCPLINE:
      return new AnimationKeyableNumCubicSpline(time, value, inTangent, outTangent);
    case AnimationKeyableType.VEC_CUBICSCPLINE:
      return new AnimationKeyableVecCubicSpline(time, value, inTangent, outTangent);
    case AnimationKeyableType.QUAT_CUBICSCPLINE:
      return new AnimationKeyableQuatCubicSpline(time, value, inTangent, outTangent);
  }
  console.log("new_AnimationKeyable> unknown type: ", type, time, value, inTangent, outTangent);
}

export function AnimationKeyable_linearBlendValue(value1: SingleDOF, value2: SingleDOF, p: number) {
  var valRes;

  if (typeof value1 === "number" && typeof value2 === "number") {
    return (1 - p) * value1 + p * value2;
  }

  if ((value1 instanceof pc.Vec3 && value2 instanceof pc.Vec3) ||
     (value1 instanceof pc.Vec2 && value2 instanceof pc.Vec2)  ||
     (value1 instanceof pc.Vec4 && value2 instanceof pc.Vec4)) {
    valRes = value1.clone();
    valRes.lerp(value1, value2, p);
    return valRes;
  }

  if (value1 instanceof pc.Quat && value2 instanceof pc.Quat) {
    valRes = value1.clone();
    valRes.slerp(value1, value2, p);
    return valRes;
  }
  return null;
}
