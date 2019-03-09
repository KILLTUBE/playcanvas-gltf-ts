
// *===============================================================================================================
// * class AnimationCurveSession: playback/runtime related thing
//                           AnimationCurve and AnimationClip are both playable, they are animation data container
//                           AnimationCurveSession is the runtime play of curve/clip
//                           one clip can be played by multiple AnimationCurveSession simultaneously
// *===============================================================================================================

/**
 * @constructor
 * @param {AnimationCurve} [playable]
 * @param {AnimationTargetsMap} [targets]
 */

var AnimationCurveSession = function AnimationCurveSession(playable, targets) {
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
    this.animTargets = {};
    if (playable) {
        this.playable = playable;// curve or clip
        this.allocateCache();
        if (!targets)
            this.animTargets = playable.getAnimTargets();
    }
    if (targets)
        this.animTargets = targets;// collection of AnimationTarget

    this.animEvents = [];
};

AnimationCurveSession.app = null;

/**
 * @param {AnimationCurve} curve
 * @returns {AnimationKeyable}
 */

AnimationCurveSession._allocatePlayableCache = function(curve) {
	return new_AnimationKeyable(curve.keyableType);
};

AnimationCurveSession.prototype.allocateCache = function () { // 1215
    this._cacheKeyIdx = 0;
    this._cacheValue = AnimationCurveSession._allocatePlayableCache(this.playable);
};

AnimationCurveSession.prototype.clone = function () {
    var i, key;
    var cloned = new AnimationCurveSession();

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
    cloned.allocateCache();// 1215

    // targets
    cloned.animTargets = {};
    for (key in this.animTargets) {
        if (!this.animTargets.hasOwnProperty(key)) continue;
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
            cloned._cacheBlendValues[key] = AnimationCurveSession._allocatePlayableCache(this.blendables[key]);// 1226, only animationclip has a snapshot cache, otherwise null
        }
    }

    cloned.blendWeights = {};
    for (key in this.blendWeights)
        if (this.blendWeights.hasOwnProperty(key))
            cloned.blendWeights[key] = this.blendWeights[key];

    return cloned;
};

// events related

/**
 * @param {string} name
 * @param {number} time
 * @param {AnimationEventCallback} fnCallback
 * @param {any} context
 * @param {any} parameter
 */

AnimationCurveSession.prototype.on = function (name, time, fnCallback, context, parameter) {
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
};

/**
 * @param {string} name
 * @param {number} time
 * @param {AnimationEventCallback} fnCallback
 */

AnimationCurveSession.prototype.off = function (name, time, fnCallback) {
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
};

AnimationCurveSession.prototype.removeAllEvents = function () {
    this.animEvents = [];
};

/**
 * @param {string} name
 */

AnimationCurveSession.prototype.invokeByName = function (name) {
    for (var i = 0; i < this.animEvents.length; i ++) {
        if (this.animEvents[i] && this.animEvents[i].name === name) {
            this.animEvents[i].invoke();
        }
    }
};

/**
 * @param {number} time
 */

AnimationCurveSession.prototype.invokeByTime = function (time) {
    for (var i = 0; i < this.animEvents.length; i ++) {
        if (!this.animEvents[i])
            continue;

        if (this.animEvents[i].triggerTime > time)
            break;

        if (!this.animEvents[i].triggered)
            this.animEvents[i].invoke();

    }
};

/**
 * @param {AnimationKeyable} keyable
 */

AnimationCurveSession.prototype.updateToTarget = function (keyable) {
    var j;
    var cname = this.playable.name;
	var ctargets = this.animTargets[cname];
	if (!ctargets)
		return;
	for (j = 0; j < ctargets.length; j ++)
		ctargets[j].updateToTarget(keyable.value);
};

/**
 * @param {Playable} [playable]
 * @param {AnimationTargetsMap} [animTargets]
 * @returns {AnimationCurveSession}
 */

AnimationCurveSession.prototype.play = function (playable, animTargets) {
    var i;

    if (playable) {
        this.playable = playable;
        this.allocateCache();
    }

    if (!(this.playable instanceof AnimationClip) && !(this.playable instanceof AnimationCurve))
        return this;

    if (this.isPlaying)// already playing
        return this;

    this.begTime = 0;
    this.endTime = this.playable.duration;
    this.curTime = 0;
    this.accTime = 0;
    this.isPlaying = true;
    if (playable && this !== playable.session) {
        this.bySpeed = playable.bySpeed;
        this.loop = playable.loop;
    }

    if (!animTargets && playable && typeof playable.getAnimTargets === "function")
        this.animTargets = playable.getAnimTargets();
    else if (animTargets)
        this.animTargets = animTargets;

    // reset events
    for (i = 0; i < this.animEvents.length; i ++)
        this.animEvents[i].triggered = false;

    // reset events
    for (i = 0; i < this.animEvents.length; i ++)
        this.animEvents[i].triggered = false;

    var app = pc.Application.getApplication();
    app.on('update', this.onTimer);
    return this;
};

AnimationCurveSession.prototype.stop = function () {
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
};

AnimationCurveSession.prototype.pause = function () {
    if (AnimationCurveSession.app)
        AnimationCurveSession.app.off('update', this.onTimer);
    this.isPlaying = false;
    return this;
};

AnimationCurveSession.prototype.resume = function () {
    if (!this.isPlaying) {
        this.isPlaying = true;
        var app = pc.Application.getApplication();
        app.on('update', this.onTimer);
    }
};

/**
 * @param {number} duration
 */

AnimationCurveSession.prototype.fadeOut = function (duration) {
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
};

/**
 * @param {number} duration
 * @param {Playable} [playable]
 */

AnimationCurveSession.prototype.fadeIn = function (duration, playable) {
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
};

/**
 * @param {Playable} playable
 * @param {number} duration
 */

AnimationCurveSession.prototype.fadeTo = function (playable, duration) {
    this.fadeOut(duration);
    var session = new AnimationCurveSession();
    session.fadeIn(duration, playable);
    return session;
};

/**
 * @param {number} duration
 */

AnimationCurveSession.prototype.fadeToSelf = function (duration) {
    var session = this.clone();
    if (AnimationCurveSession.app)
        AnimationCurveSession.app.on('update', session.onTimer);
    session.fadeOut(duration);

    this.stop();
    this.fadeIn(duration);
};
