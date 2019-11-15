import { AnimationClip } from "./AnimationClip";
import { AnimationTarget } from "./AnimationTarget";
import { AnimationEvent, AnimationEventCallback } from "./AnimationEvent";
import { AnimationKeyable, new_AnimationKeyable, AnimationKeyableType } from "./AnimationKeyable";
import { AnimationClipSnapshot } from "./AnimationClipSnapshot";
import { AnimationCurveType } from "./AnimationCurve";
import { BlendValue, Blendable } from "./bundle_pcgltf";

// *===============================================================================================================
// * class AnimationSession: playback/runtime related thing
//						   AnimationCurve and AnimationClip are both playable, they are animation data container
//						   AnimationSession is the runtime play of curve/clip
//						   one clip can be played by multiple AnimationSession simultaneously
// *===============================================================================================================

export class AnimationSession {
    begTime: number;
    endTime: number;
    curTime: number;
    accTime: number;
    bySpeed: number;
    isPlaying: boolean;
    animTargets: AnimationTarget[];
	_cacheKeyIdx: number[];
	_cacheValue: any;
    speed: number;
    blendables: {[curveName: string]: Blendable};
    _cacheBlendValues: {[name: string]: AnimationClipSnapshot | AnimationKeyable};
    blendWeights: {[name: string]: number};
    animEvents: AnimationEvent[];
	onTimer: (dt: number) => void;
	loop: boolean;
	fadeBegTime: number;
	fadeEndTime: number;
	fadeTime: number;
	fadeDir: number; // 1 is in, -1 is out
	fadeSpeed: number;
	playable: AnimationClip;

	constructor(playable?: AnimationClip) {
		this._cacheKeyIdx = undefined;// integer if playable is curve, object {} if playable is clip
		this._cacheValue = undefined;// 1215, keyable if playable is curve, snapshot if playable is clip, all pre allocated
		this._cacheBlendValues = {};// 1226

		this.begTime = -1;
		this.endTime = -1;
		this.curTime = 0;
		this.accTime = 0;// accumulate time since playing
		this.bySpeed = 1;
		this.isPlaying = false;
		this.loop = false;

		// fade related
		this.fadeBegTime = -1;
		this.fadeEndTime = -1;
		this.fadeTime = -1;
		this.fadeDir = 0;// 1 is in, -1 is out
		this.fadeSpeed = 1;
		/* fadeIn, speed starts 0
		fadeOut from fully-playing session, speed starts 1
		fadeOut from previously unfinished fading session, speed starts from value (0,1)
		this is solving such situation: session fadeIn a small amount unfinished yet, and it now fadeOut(it should not start updating 100% to target) */

		this.playable = null;
		this.animTargets = [];
		if (playable) {
			this.playable = playable;// curve or clip
			this.allocateCache();
			this.animTargets = playable.getAnimTargets();
		}

		this.animEvents = [];

		// blend related==========================================================
		this.blendables = {};
		this.blendWeights = {};

		// ontimer function for playback
		var self = this;
		this.onTimer = function (/**@type {number} */dt) {
			self.curTime += (self.bySpeed * dt);
			self.accTime += (self.bySpeed * dt);

			if (!self.isPlaying ||// not playing
				(!self.loop && (self.curTime < self.begTime || self.curTime > self.endTime))){ // not in range
				self.invokeByTime(self.curTime);
				self.stop();
				self.invokeByName("stop");
				return;
			}

			// round time to duration
			var duration = self.endTime - self.begTime;
			if (self.curTime > self.endTime) { // loop start
				self.invokeByTime(self.curTime);
				self.curTime -= duration;
				for (var i = 0; i < self.animEvents.length; i ++)
					self.animEvents[i].triggered = false;
			}
			if (self.curTime < self.begTime)
				self.curTime += duration;

			if (self.fadeDir) {
				self.fadeTime +=  dt;// (self.bySpeed * dt);
				if (self.fadeTime >= self.fadeEndTime) {
					if (self.fadeDir === 1) { // fadein completed
						self.fadeDir = 0;
						self.fadeBegTime = -1;
						self.fadeEndTime = -1;
						self.fadeTime = -1;
					} else if (self.fadeDir === -1) { // fadeout completed
						self.stop();
						return;
					}
				}
			}

			self.showAt(self.curTime, self.fadeDir, self.fadeBegTime, self.fadeEndTime, self.fadeTime);
			self.invokeByTime(self.curTime);
		}
	}

	static _allocatePlayableCache(playable: AnimationClip): AnimationKeyable | AnimationClipSnapshot {
		if (!playable)
			return null;
		var snapshot = new AnimationClipSnapshot();
		for (var i = 0, len = playable.animCurves.length; i < len; i++) {
			var cname = playable.animCurves[i].name;
			snapshot.curveKeyable[cname] = new_AnimationKeyable(playable.animCurves[i].keyableType);
		}
		return snapshot;
	}

	allocateCache() {
		if (!this.playable)
			return;
		this._cacheKeyIdx = [];
		this._cacheValue = AnimationSession._allocatePlayableCache(this.playable);
	}

	clone() {
		var i, key;
		var cloned = new AnimationSession();

		cloned.begTime = this.begTime;
		cloned.endTime = this.endTime;
		cloned.curTime = this.curTime;
		cloned.accTime = this.accTime;
		cloned.speed = this.speed;
		cloned.loop = this.loop;
		cloned.isPlaying = this.isPlaying;

		// fading
		cloned.fadeBegTime = this.fadeBegTime;
		cloned.fadeEndTime = this.fadeEndTime;
		cloned.fadeTime = this.fadeTime;
		cloned.fadeDir = this.fadeDir;// 1 is in, -1 is out
		cloned.fadeSpeed = this.fadeSpeed;

		cloned.playable = this.playable;
		cloned.allocateCache();

		// targets
		cloned.animTargets = [];
		for (key in this.animTargets) {
			if (!this.animTargets.hasOwnProperty(key))
				continue;
			var ttargets = this.animTargets[key];
			var ctargets = [];
			for (i = 0; i < ttargets.length; i++) {
				ctargets.push(ttargets[i].clone());
			}
			cloned.animTargets[key] = ctargets;
		}

		// events
		cloned.animEvents = [];
		for (i = 0; i < this.animEvents.length; i ++)
			cloned.animEvents.push(this.animEvents[i].clone());

		// blending
		cloned.blendables = {};
		for (key in this.blendables) {
			if (this.blendables.hasOwnProperty(key)) {
				cloned.blendables[key] = this.blendables[key];
				cloned._cacheBlendValues[key] = AnimationSession._allocatePlayableCache(this.blendables[key]);// 1226, only animationclip has a snapshot cache, otherwise null
			}
		}

		cloned.blendWeights = {};
		for (key in this.blendWeights)
			if (this.blendWeights.hasOwnProperty(key))
				cloned.blendWeights[key] = this.blendWeights[key];

		return cloned;
	}

	// blend related==========================================================

	setBlend(blendValue: BlendValue, weight: number, curveName: string){
		if (blendValue instanceof AnimationClip){
			this.blendables[curveName] = blendValue;
			this._cacheBlendValues[curveName] = AnimationSession._allocatePlayableCache(blendValue);// 1226
			this.blendWeights[curveName] = weight;
			return;
		}

		// blendable is just a single DOF=================================
		var keyType;
		if (typeof blendValue === "number")// 1 instanceof Number is false, don't know why
			keyType =  AnimationKeyableType.NUM;
		else if (blendValue instanceof pc.Vec3)
			keyType = AnimationKeyableType.VEC;
		else if (blendValue instanceof pc.Quat)
			keyType = AnimationKeyableType.QUAT;

		if (!curveName || curveName === "" || typeof keyType === "undefined")// has to specify curveName
			return;

		this.blendWeights[curveName] = weight;
		this.blendables[curveName] = new_AnimationKeyable(keyType, 0, blendValue);
		this._cacheBlendValues[curveName] = null;// 1226, null if blendable is not animationclip
	}

	unsetBlend(curveName: string) {
		// unset blendvalue
		if (this.blendables[curveName]) {
			delete this.blendables[curveName];
			delete this._cacheBlendValues[curveName]; // 1226
			delete this.blendWeights[curveName];
		}
	}

	// events related

	on(name: string, time: number, fnCallback: AnimationEventCallback, context: any, parameter: any) {
		if (!name || !fnCallback)
			return;

		var event = new AnimationEvent(name, time, fnCallback, context, parameter);
		var pos = 0;
		for (; pos < this.animEvents.length; pos ++) {
			if (this.animEvents[pos].triggerTime > time)
				break;
		}

		if (pos >= this.animEvents.length)
			this.animEvents.push(event);
		else
			this.animEvents.splice(pos, 0, event);
	}

	off(name: string, time: number, fnCallback: AnimationEventCallback) {
		var pos = 0;
		for ( ; pos < this.animEvents.length; pos ++) {
			var event = this.animEvents[pos];
			if (!event) continue;
			if (event.name === name && event.fnCallback === fnCallback)
				break;

			if (event.triggerTime === time && event.fnCallback === fnCallback)
				break;
		}

		if (pos < this.animEvents.length)
			this.animEvents.splice(pos, 1);
	}

	removeAllEvents() {
		this.animEvents = [];
	}

	invokeByName(name: string) {
		for (var i = 0; i < this.animEvents.length; i ++) {
			if (this.animEvents[i] && this.animEvents[i].name === name) {
				this.animEvents[i].invoke();
			}
		}
	}

	invokeByTime(time: number) {
		for (var i = 0; i < this.animEvents.length; i ++) {
			if (!this.animEvents[i])
				continue;

			if (this.animEvents[i].triggerTime > time)
				break;

			if (!this.animEvents[i].triggered)
				this.animEvents[i].invoke();

		}
	}

	blendToTarget(input: AnimationClipSnapshot, p: number) {
		var i, j;
		var ctarget, blendUpdateNone;
		var eBlendType = { PARTIAL_BLEND: 0, FULL_UPDATE: 1, NONE: 2 };

		if (!input || p > 1 || p <= 0)// p===0 remain prev
			return;

		if (p === 1) {
			this.updateToTarget(input);
			return;
		}

		// playable is a clip, input is a AnimationClipSnapshot, animTargets is an object {curvename1:[]targets, curvename2:[]targets, curvename3:[]targets}
		//console.log("blendToTarget", this.playable, input, p);

		for (i = 0; i < input.curveKeyable.length; i ++) {

			blendUpdateNone = eBlendType.PARTIAL_BLEND;
			if (this.playable.animCurves[i] && this.playable.animCurves[i].type === AnimationCurveType.STEP && this.fadeDir) {
				if ((this.fadeDir == -1 && p <= 0.5) || (this.fadeDir == 1 && p > 0.5))
					blendUpdateNone = eBlendType.FULL_UPDATE;
				else
					blendUpdateNone = eBlendType.NONE;
			}

			ctarget = this.animTargets[i];

			if (blendUpdateNone === eBlendType.PARTIAL_BLEND)
				ctarget.blendToTarget(input.curveKeyable[i].value, p);
			else if (blendUpdateNone === eBlendType.FULL_UPDATE)
				ctarget.updateToTarget(input.value);
		}
	}

	updateToTarget(input: AnimationClipSnapshot) {
		var i;
		var ctarget;
		for (i = 0; i < input.curveKeyable.length; i ++) {
			ctarget = this.animTargets[i];
			if (input.curveKeyable[i]) {
				ctarget.updateToTarget(input.curveKeyable[i].value);
			}
		}
	}

	showAt(time: number, fadeDir: number, fadeBegTime: number, fadeEndTime: number, fadeTime: number) {
		var p;
		var input = this.playable.eval_cache(time, this._cacheKeyIdx, this._cacheValue);
		if (input) {
			this._cacheKeyIdx = input._cacheKeyIdx;
		}
		// blend related==========================================================
		// blend animations first
		for (var bname in this.blendables) {
			if (!this.blendables.hasOwnProperty(bname)) {
				continue;
			}
			p = this.blendWeights[bname];
			var blendClip = this.blendables[bname];
			if (blendClip && (blendClip instanceof AnimationClip) && (typeof p === "number")) {
				var blendInput = blendClip.eval_cache(this.accTime % blendClip.duration, null, this._cacheBlendValues[bname]);
				input = AnimationClipSnapshot.linearBlendExceptStep(input, blendInput, p, this.playable.animCurves);
			}
		}
		// blend custom bone second
		for (var cname in this.blendables) {
			if (!this.blendables.hasOwnProperty(cname)) {
				continue;
			}
			p = this.blendWeights[cname];
			var blendkey = this.blendables[cname];
			if (!blendkey || !input.curveKeyable[cname] || (blendkey instanceof AnimationClip)) {
				continue;
			}
			var resKey = AnimationKeyable.linearBlend(input.curveKeyable[cname], blendkey, p);
			input.curveKeyable[cname] = resKey;
		}
		if (fadeDir === 0 || fadeTime < fadeBegTime || fadeTime > fadeEndTime) {
			this.updateToTarget(input);
		} else {
			p = (fadeTime - fadeBegTime) / (fadeEndTime - fadeBegTime);
			if (fadeDir === -1) {
				p = 1 - p;
			}
			if (this.fadeSpeed < 1 && fadeDir === -1) { // fadeOut from non-100%
				p *= this.fadeSpeed;
			}
			this.blendToTarget(input, p);
		}
	}

	play(playable?: AnimationClip, animTargets?: AnimationTarget[]) {
		if (playable) {
			this.playable = playable;
			this.allocateCache();
		}
		if (this.isPlaying) { // already playing
			return this;
		}
		this.begTime = 0;
		this.endTime = this.playable.duration;
		this.curTime = 0;
		this.accTime = 0;
		this.isPlaying = true;
		if (playable && this !== playable.session) {
			this.bySpeed = playable.bySpeed;
			this.loop = playable.loop;
		}
		if (!animTargets && playable && typeof playable.getAnimTargets === "function") {
			this.animTargets = playable.getAnimTargets();
		} else if (animTargets) {
			this.animTargets = animTargets;
		}
		// reset events
		for (var i=0; i<this.animEvents.length; i++) {
			this.animEvents[i].triggered = false;
		}
		var app = pc.Application.getApplication();
		app.on('update', this.onTimer);
		return this;
	}

	stop() {
		var app = pc.Application.getApplication();
		app.off('update', this.onTimer);
		this.curTime = 0;
		this.isPlaying = false;
		this.fadeBegTime = -1;
		this.fadeEndTime = -1;
		this.fadeTime = -1;
		this.fadeDir = 0;
		this.fadeSpeed = 1;
		return this;
	}

	pause() {
		var app = pc.Application.getApplication();
		app.off('update', this.onTimer);
		this.isPlaying = false;
		return this;
	}

	resume() {
		if (!this.isPlaying) {
			this.isPlaying = true;
			var app = pc.Application.getApplication();
			app.on('update', this.onTimer);
		}
	}

	fadeOut(duration: number) {
		if (this.fadeDir === 0) // fade out from normal playing session
			this.fadeSpeed = 1;
		else if (this.fadeDir === 1) // fade out from session in the middle of fading In
			this.fadeSpeed = (this.fadeTime - this.fadeBegTime) / (this.fadeEndTime - this.fadeBegTime);
		else // fade out from seesion that is fading out
			return;//

		if (typeof duration !== "number")
			duration = 0;

		this.fadeBegTime = this.curTime;
		this.fadeTime = this.fadeBegTime;
		this.fadeEndTime = this.fadeBegTime + duration;
		this.fadeDir = -1;
	}

	fadeIn(duration: number, playable?: AnimationClip) {
		if (this.isPlaying) {
			this.stop();
		}
		this.fadeSpeed = 0;
		this.curTime = 0;
		if (typeof duration !== "number")
			duration = 0;

		this.fadeBegTime = this.curTime;
		this.fadeTime = this.fadeBegTime;
		this.fadeEndTime = this.fadeBegTime + duration;
		this.fadeDir = 1;
		if (playable) {
			this.playable = playable;
			this.allocateCache();
		}
		this.play(playable);
	}

	fadeTo(playable: AnimationClip, duration: number) {
		this.fadeOut(duration);
		var session = new AnimationSession();
		session.fadeIn(duration, playable);
		return session;
	}

	fadeToSelf(duration: number) {
		var session = this.clone();
		var app = pc.Application.getApplication();
		app.on('update', session.onTimer);
		session.fadeOut(duration);
		this.stop();
		this.fadeIn(duration);
	}
}
