import {AnimationClip} from "./AnimationClip";
import {AnimationClipSnapshot} from "./AnimationClipSnapshot";
import {AnimationComponent} from "./AnimationComponent";
import {AnimationCurve} from "./AnimationCurve";
import {AnimationEvent} from "./AnimationEvent";
import {
	AnimationKeyableNum,
	AnimationKeyableVec,
	AnimationKeyableQuat,
	AnimationKeyableNumCubicSpline,
	AnimationKeyableVecCubicSpline,
	AnimationKeyableQuatCubicSpline
} from "./AnimationKeyable";
import {AnimationSession} from "./AnimationSession";
import {
	TargetPath,
	AnimationTarget
} from "./AnimationTarget";

Object.assign(window, {
	AnimationClip,
	AnimationClipSnapshot,
	AnimationComponent,
	AnimationCurve,
	AnimationEvent,
	AnimationKeyableNum,
	AnimationKeyableVec,
	AnimationKeyableQuat,
	AnimationKeyableNumCubicSpline,
	AnimationKeyableVecCubicSpline,
	AnimationKeyableQuatCubicSpline,
	AnimationSession,
	TargetPath,
	AnimationTarget
})
