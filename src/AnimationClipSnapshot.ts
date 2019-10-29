import { AnimationKeyable, AnimationKeyable_linearBlendValue } from "./AnimationKeyable";

// *===============================================================================================================
// * class AnimationClipSnapshot: animation clip slice (pose) at a particular time
// * member
// *	   curveKeyable: the collection of evaluated keyables on curves at a particular time
// * e.g.: for an "walking" clip of a character, at time 1s, AnimationClipSnapshot corresponds to
// *	   evaluated keyables that makes a arm-swing pose
// *===============================================================================================================

export class AnimationClipSnapshot {
	curveKeyable: AnimationKeyable[];

	constructor() {
		this.curveKeyable = [];
	}

	copy(shot: AnimationClipSnapshot) {
		if (!shot)
			return this;
		this.curveKeyable = [];
		for (var i = 0; i < shot.curveKeyable.length; i ++) {
			this.curveKeyable[i] = shot.curveKeyable[i].clone();
		}
		return this;
	}

	clone() {
		var cloned = new AnimationClipSnapshot().copy(this);
		return cloned;
	}

	static linearBlend(shot1: AnimationClipSnapshot, shot2: AnimationClipSnapshot, p: number): AnimationClipSnapshot {
		if (!shot1 || !shot2)
			return null;

		if (p === 0) return shot1;
		if (p === 1) return shot2;

		var resShot = new AnimationClipSnapshot();
		resShot.copy(shot1);
		for (var i = 0; i < shot2.curveKeyable.length; i ++) {
			var cname = i;
			if (shot1.curveKeyable[cname] && shot2.curveKeyable[cname]) {
				var resKey = AnimationKeyable_linearBlendValue(shot1.curveKeyable[cname], shot2.curveKeyable[cname], p);
				resShot.curveKeyable[cname] = resKey;
			} else if (shot1.curveKeyable[cname])
				resShot.curveKeyable[cname] = shot1.curveKeyable[cname];
			else if (shot2.curveKeyable[cname])
				resShot.curveKeyable[cname] = shot2.curveKeyable[cname];
		}
		return resShot;
	}

	/**
	 * @summary static function: linear blending except for step curve
	 */

	static linearBlendExceptStep(shot1: AnimationClipSnapshot, shot2: AnimationClipSnapshot, p: number, animCurveMap: AnimationCurveMap): AnimationClipSnapshot {
		if (!shot1 || !shot2) {
			return null;
		}

		if (p === 0) {
			return shot1;
		}

		if (p === 1) {
			return shot2;
		}

		var resShot = new AnimationClipSnapshot();
		resShot.copy(shot1);
		for (var i = 0; i < shot2.curveKeyable.length; i ++) {
			var cname = i;
			if (shot1.curveKeyable[cname] && shot2.curveKeyable[cname]) {
				if (animCurveMap[cname] && animCurveMap[cname].type === AnimationCurveType.STEP) {
					if (p > 0.5) resShot.curveKeyable[cname] = shot2.curveKeyable[cname];
					else resShot.curveKeyable[cname] = shot1.curveKeyable[cname];
				} else {
					var resKey = AnimationKeyable.linearBlend(shot1.curveKeyable[cname], shot2.curveKeyable[cname], p);
					resShot.curveKeyable[cname] = resKey;
				}
			} else if (shot1.curveKeyable[cname])
				resShot.curveKeyable[cname] = shot1.curveKeyable[cname];
			else if (shot2.curveKeyable[cname])
				resShot.curveKeyable[cname] = shot2.curveKeyable[cname];
		}
		return resShot;
	}
}
