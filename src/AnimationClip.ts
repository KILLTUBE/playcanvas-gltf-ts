import { AnimationCurveType, AnimationCurve } from "./AnimationCurve";
import { AnimationClipSnapshot } from "./AnimationClipSnapshot";
import { AnimationSession } from "./AnimationSession";
import { AnimationTarget, TargetPath } from "./AnimationTarget";
import { AnimationEventCallback } from "./AnimationEvent";
import { new_AnimationKeyable, AnimationKeyableType } from "./AnimationKeyable";

/**
 * @param name name of this animation clip
 * @param animCurves an array of curves in the clip, each curve corresponds to one channel along timeline
 * @summary
 * e.g.: for an animation clip of a character, name = "walk"
 * each joint has one curve with keys on timeline, thus animCurves stores curves of all joints
 */

export class AnimationClip {
	static count = 0;
	name: string;
	duration: number;
    animCurves: AnimationCurve[];
    animTargets: AnimationTarget[];
    session: AnimationSession;
    root: pc.GraphNode;

	constructor(root?: pc.GraphNode) {
		AnimationClip.count ++;
		this.name = "clip" + AnimationClip.count.toString();
		this.duration = 0;
		this.animCurves = [];
		this.animTargets = [];
		this.root = null;
		if (root) {
			this.root = root;
			this.constructFromRoot(root);
		}
		this.session = new AnimationSession(this);
	}

	get isPlaying(): boolean {
		return this.session.isPlaying;
	}

	set isPlaying(isPlaying: boolean) {
		this.session.isPlaying = isPlaying;
	}

	get loop(): boolean {
		return this.session.loop;
	}

	set loop(loop: boolean) {
		this.session.loop = loop;
	}

	get bySpeed(): number {
		return this.session.bySpeed;
	}

	set bySpeed(bySpeed: number) {
		this.session.bySpeed = bySpeed;
	}

	copy(clip: AnimationClip): AnimationClip {
		this.name = clip.name;
		this.duration = clip.duration;
		this.loop = clip.loop;

		// copy curves
		this.animCurves.length = 0;

		for (var i = 0, len = clip.animCurves.length; i < len; i++) {
			var curve = clip.animCurves[i];
			this.addCurve(curve.clone());
		}

		var n = clip.animTargets.length;
		this.animTargets.length = n;

		for (var i=0; i<n; i++) {
			var target = clip.animTargets[i];
			this.animTargets[i] = target.clone();
		}

		return this;
	}

	clone() {
		return new AnimationClip().copy(this);
	}

	updateDuration() {
		this.duration = 0;
		for (var i = 0, len = this.animCurves.length; i < len; i++) {
			var curve = this.animCurves[i];
			this.duration = Math.max(this.duration, curve.duration);
		}
	}

	showAt(time: number, fadeDir: number, fadeBegTime: number, fadeEndTime: number, fadeTime: number) {
		this.session.showAt(time, fadeDir, fadeBegTime, fadeEndTime, fadeTime);
	}

	blendToTarget(snapshot: AnimationClipSnapshot, p: number) {
		this.session.blendToTarget(snapshot, p);
	}

	updateToTarget(snapshot: AnimationClipSnapshot) {
		this.session.updateToTarget(snapshot);
	}

	getAnimTargets(): AnimationTarget[] {
		return this.animTargets;
	}

	resetSession() {
		this.session.playable = this;
		this.session.animTargets = this.getAnimTargets();
		this.session.isPlaying = true;
		this.session.begTime = 0;
		this.session.endTime = this.duration;
		this.session.curTime = 0;
		this.session.bySpeed = 1;
		this.session.loop = true;
	}

	play() {
		this.session.play(this);
	}

	stop() {
		this.session.stop();
	}

	pause() {
		this.session.pause();
	}

	resume() {
		this.session.resume();
	}

	fadeIn(duration: number) {
		this.session.fadeIn(duration, this);
	}

	fadeOut(duration: number) {
		this.session.fadeOut(duration);
	}

	fadeTo(toClip: AnimationClip, duration: number) {
		this.session.fadeTo(toClip, duration);
	}

	addCurve(curve: AnimationCurve) {
		curve.name = this.animCurves.length;
		this.animCurves.push(curve);
		if (curve.duration > this.duration)
			this.duration = curve.duration;
	}

	removeCurve(id: number) {
		var curve = this.animCurves[id];
		if (curve) {
			this.animCurves.splice(id, 1);
			this.updateDuration();
		}
	}

	removeAllCurves() {
		this.animCurves.length = 0;
		this.duration = 0;
	}

	on(name: string, time: number, fnCallback: AnimationEventCallback, context: any, parameter: any) {
		if (this.session)
			this.session.on(name, time, fnCallback, context, parameter);
		return this;
	}

	off(name: string, time: number, fnCallback: AnimationEventCallback) {
		if (this.session)
			this.session.off(name, time, fnCallback);
		return this;
	}

	removeAllEvents() {
		if (this.session)
			this.session.removeAllEvents();
		return this;
	}

	getSubClip(tmBeg: number, tmEnd: number): AnimationClip {
		var subClip = new AnimationClip();
		subClip.name = this.name + "_sub";
		subClip.root = this.root;

		for (var i = 0, len = this.animCurves.length; i < len; i++) {
			var curve = this.animCurves[i];
			var subCurve = curve.getSubCurve(tmBeg, tmEnd);
			subClip.addCurve(subCurve);
		}

		return subClip;
	}

	eval_cache(time: number, cacheKeyIdx: number[], cacheValue: AnimationClipSnapshot): AnimationClipSnapshot {
		//console.log("cacheKeyIdx", cacheKeyIdx)
		if (!cacheValue) {
			var ret = this.eval();
			ret._cacheKeyIdx = cacheKeyIdx;
			return ret;
		}
		var snapshot = cacheValue;
		snapshot.time = time;
		for (var i = 0, len = this.animCurves.length; i < len; i++) {
			var curve = this.animCurves[i];
			var ki: number;
			if (cacheKeyIdx) {
				ki = cacheKeyIdx[curve.name];
			}
			var kv;
			if (cacheValue) {
				kv = cacheValue.curveKeyable[curve.name];
			} else {
				kv = new_AnimationKeyable(curve.keyableType);
			}
			var keyable = curve.eval_cache(time, ki, kv);
			if (cacheKeyIdx && keyable) {
				cacheKeyIdx[curve.name] = keyable._cacheKeyIdx;
			}
			snapshot.curveKeyable[curve.name] = keyable;
		}
		snapshot._cacheKeyIdx = cacheKeyIdx;
		return snapshot;
	}

	// take a snapshot of clip at this moment
	eval(time: number): AnimationClipSnapshot {
		var snapshot = new AnimationClipSnapshot();
		snapshot.time = time;

		for (var i = 0, len = this.animCurves.length; i < len; i++) {
			var curve = this.animCurves[i];
			var keyable = curve.eval(time);
			snapshot.curveKeyable[curve.name] = keyable;
		}
		return snapshot;
	}

	constructFromRoot(root: pc.GraphNode) {
		if (!root)
			return;

		// scale
		var curveScale = new AnimationCurve();
		curveScale.keyableType = AnimationKeyableType.VEC;
		//curveScale.name = root.name + ".localScale";
		curveScale.setTarget(root, TargetPath.LocalScale);
		this.addCurve(curveScale);

		// translate
		var curvePos = new AnimationCurve();
		curvePos.keyableType = AnimationKeyableType.VEC;
		//curvePos.name = root.name + ".localPosition";
		curvePos.setTarget(root, TargetPath.LocalPosition);
		this.addCurve(curvePos);

		// rotate
		var curveRotQuat = new AnimationCurve();
		//curveRotQuat.name = root.name + ".localRotation.quat";
		curveRotQuat.keyableType = AnimationKeyableType.QUAT;
		curveRotQuat.setTarget(root, TargetPath.LocalRotation);
		this.addCurve(curveRotQuat);

		// children
		for (var i = 0; i < root.children.length; i ++)
			if (root.children[i]) this.constructFromRoot(root.children[i]);
	}

	/*
	//this animation clip's target will now to root
	//Note that animationclip's original target may be on different scale from new root, for "localPosition", this needs to be adjusted
	//Example: animation clip is made under AS scale,
	//		 AS will never change no matter how many times this animation clip is transferred, because it is bound with how it is made
	//		 when it is transferred to a new root, which is under RS scale, define standard scale SS=1,
	//thus
	//		 standardPos = curvePos / AS;		  converting curvePos from AS to SS
	//		 newRootPos = standardPos * RS;		converting position under SS to new RS
	//thus
	//		 target.vScale = RS / AS;			  how to update curve pos to target
	//		 newRootPos = curvePos * target.vScale
	//
	//given animation clip, it maybe transferred multiple times, and its original AS is unknown, to recover AS, we have
	//					  RS (scale of current root in scene) and
	//					  vScale (scale of animation curve's value update to target)
	//thus
	//		 AS = RS / vScale;
	//
	//to transfer again to a new root with scale NS
	//
	//		 standardPos = curvePos / AS = curvePos * vScale / RS
	//		 newTargetPos = standardPos * NS = curvePos * vScale * NS / RS
	//
	//thus
	//		 newTarget.vScale = NS / AS = vScale * NS / RS;
	//
	*/

	transferToRoot(root: pc.GraphNode) {
		var dictTarget = {};
		AnimationTarget.constructTargetNodes(root, null, dictTarget); // contains localScale information

		for (var i = 0, len = this.animCurves.length; i < len; i++) {
			var ctarget = this.animTargets[i];
			var atarget = dictTarget[ctarget.targetNode.name];
			//var atarget = this.animTargets[i];
			if (atarget) { // match by target name
				var cScale = AnimationTarget.getLocalScale(ctarget.targetNode);
				ctarget.targetNode = atarget.targetNode; // atarget contains scale information
				if (cScale && atarget.vScale) {
					ctarget.vScale = new pc.Vec3(cScale.x, cScale.y, cScale.z);
					if (atarget.vScale.x) ctarget.vScale.x /= atarget.vScale.x;
					if (atarget.vScale.y) ctarget.vScale.y /= atarget.vScale.y;
					if (atarget.vScale.z) ctarget.vScale.z /= atarget.vScale.z;
				}
			} else // not found
				console.warn("transferToRoot: " + ctarget.targetNode.name + "in animation clip " + this.name + " has no transferred target under " + root.name);
		}
	}

	// blend related
	updateCurveNameFromTarget() {
		for (var i = 0, len = this.animCurves.length; i < len; i++) {
			var curve = this.animCurves[i];

			var animTarget = this.animTargets[i];
			// change name to target string
			var oldName = curve.name;// backup before change
			var newName = animTarget.toString();
			if (oldName == newName)// no need to change name
				continue;

			curve.name = newName;
		}
	}

	removeEmptyCurves() {
		for (var i = 0, len = this.animCurves.length; i < len; i++) {
			var curve = this.animCurves[i];
			if (!curve || !curve.animKeys || curve.animKeys.length === 0) {
				this.removeCurve(curve.name);
			}
		}
	}

	setInterpolationType(type: AnimationCurveType) {
		for (var i = 0, len = this.animCurves.length; i < len; i++) {
			var curve = this.animCurves[i];
			if (curve) {
				curve.type = type;
			}
		}
	}
}
