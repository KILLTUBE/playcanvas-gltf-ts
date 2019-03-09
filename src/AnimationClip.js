
// *===============================================================================================================
// * class AnimationClip:
// * member
// *       name: name of this animation clip
// *       animCurves: an array of curves in the clip, each curve corresponds to one channel along timeline
// *
// * e.g.:   for an animation clip of a character, name = "walk"
// *       each joint has one curve with keys on timeline, thus animCurves stores curves of all joints
// *===============================================================================================================

/**
 * @constructor
 * @param {pc.GraphNode} [root]
 */

var AnimationClip = function (root) {
    AnimationClip.count ++;
    this.name = "clip" + AnimationClip.count.toString();
    this.duration = 0;
    this.animCurves = [];
    this.root = null;
    if (root) {
        this.root = root;
        this.constructFromRoot(root);
    }

    this.session = new AnimationSession(this);
};
AnimationClip.count = 0;

// getter setter
Object.defineProperty(AnimationClip.prototype, 'isPlaying', {
    get: function () {
        return this.session.isPlaying;
    },
    set: function (isPlaying) {
        this.session.isPlaying = isPlaying;
    }
});
Object.defineProperty(AnimationClip.prototype, 'loop', {
    get: function () {
        return this.session.loop;
    },
    set: function (loop) {
        this.session.loop = loop;
    }
});
Object.defineProperty(AnimationClip.prototype, 'bySpeed', {
    get: function () {
        return this.session.bySpeed;
    },
    set: function (bySpeed) {
        this.session.bySpeed = bySpeed;
    }
});

/**
 * @param {AnimationClip} clip
 * @returns {AnimationClip}
 */

AnimationClip.prototype.copy = function (clip) {
    this.name = clip.name;
    this.duration = clip.duration;

    // copy curves
    this.animCurves.length = 0;

    for (var i = 0, len = clip.animCurves.length; i < len; i++) {
        var curve = clip.animCurves[i];
        this.addCurve(curve.clone());
    }

    return this;
};

AnimationClip.prototype.clone = function () {
    return new AnimationClip().copy(this);
};

AnimationClip.prototype.updateDuration = function () {
    this.duration = 0;
    for (var i = 0, len = this.animCurves.length; i < len; i++) {
        var curve = this.animCurves[i];
        this.duration = Math.max(this.duration, curve.duration);
    }
};

/**
 * @param {number} time
 * @param {number} fadeDir
 * @param {number} fadeBegTime
 * @param {number} fadeEndTime
 * @param {number} fadeTime
 */

AnimationClip.prototype.showAt = function (time, fadeDir, fadeBegTime, fadeEndTime, fadeTime) {
    this.session.showAt(time, fadeDir, fadeBegTime, fadeEndTime, fadeTime);
};

/**
 * @param {AnimationClipSnapshot} snapshot
 * @param {number} p
 */

AnimationClip.prototype.blendToTarget = function (snapshot, p) {
    this.session.blendToTarget(snapshot, p);
};

/**
 * @param {AnimationClipSnapshot} snapshot
 */

AnimationClip.prototype.updateToTarget = function (snapshot) {
    this.session.updateToTarget(snapshot);
};

// a dictionary: retrieve animTargets with curve name
/**
 * @returns {AnimationTargetsMap}
 */
AnimationClip.prototype.getAnimTargets = function () {
    /** @type {AnimationTargetsMap} */
    var animTargets = {};
    for (var i = 0, len = this.animCurves.length; i < len; i++) {
        var curve = this.animCurves[i];
        var curveTarget = curve.getAnimTargets();
        animTargets[curve.name] = curveTarget[curve.name];
    }
    return animTargets;
};

AnimationClip.prototype.resetSession = function () {
    this.session.playable = this;
    this.session.animTargets = this.getAnimTargets();
    this.session.isPlaying = true;
    this.session.begTime = 0;
    this.session.endTime = this.duration;
    this.session.curTime = 0;
    this.session.bySpeed = 1;
    this.session.loop = true;
};

AnimationClip.prototype.play = function () {
    this.session.play(this);
};

AnimationClip.prototype.stop = function () {
    this.session.stop();
};

AnimationClip.prototype.pause = function () {
    this.session.pause();
};

AnimationClip.prototype.resume = function () {
    this.session.resume();
};

/**
 * @param {number} duration
 */

AnimationClip.prototype.fadeIn = function (duration) {
    this.session.fadeIn(duration, this);
};

/**
 * @param {number} duration
 */

AnimationClip.prototype.fadeOut = function (duration) {
    this.session.fadeOut(duration);
};

/**
 * @param {AnimationClip} toClip
 * @param {number} duration
 */

AnimationClip.prototype.fadeTo = function (toClip, duration) {
    this.session.fadeTo(toClip, duration);
};

// curve related

/**
 * @param {AnimationCurve} curve
 */

AnimationClip.prototype.addCurve = function (curve) {
    curve.name = this.animCurves.length;
    this.animCurves.push(curve);
    if (curve.duration > this.duration)
        this.duration = curve.duration;
};

/**
 * @param {number} id
 */

AnimationClip.prototype.removeCurve = function (id) {
    var curve = this.animCurves[id];
    if (curve) {
        this.animCurves.splice(id, 1);
        this.updateDuration();
    }
};

AnimationClip.prototype.removeAllCurves = function () {
    this.animCurves.length = 0;
    this.duration = 0;
};


// events related

/**
 * @param {string} name
 * @param {number} time
 * @param {AnimationEventCallback} fnCallback
 * @param {any} context
 * @param {any} parameter
 */

AnimationClip.prototype.on = function (name, time, fnCallback, context, parameter) {
    if (this.session)
        this.session.on(name, time, fnCallback, context, parameter);
    return this;
};

/**
 * @param {string} name
 * @param {number} time
 * @param {AnimationEventCallback} fnCallback
 */

AnimationClip.prototype.off = function (name, time, fnCallback) {
    if (this.session)
        this.session.off(name, time, fnCallback);
    return this;
};

AnimationClip.prototype.removeAllEvents = function () {
    if (this.session)
        this.session.removeAllEvents();
    return this;
};

// clip related

/**
 * @param {number} tmBeg
 * @param {number} tmEnd
 * @returns {AnimationClip}
 */

AnimationClip.prototype.getSubClip = function (tmBeg, tmEnd) {
    var subClip = new AnimationClip();
    subClip.name = this.name + "_sub";
    subClip.root = this.root;

    for (var i = 0, len = this.animCurves.length; i < len; i++) {
        var curve = this.animCurves[i];
        var subCurve = curve.getSubCurve(tmBeg, tmEnd);
        subClip.addCurve(subCurve);
    }

    return subClip;
};

/**
 * @param {number} time
 * @param {MapStringToNumber} cacheKeyIdx
 * @param {AnimationClipSnapshot} cacheValue
 * @returns {AnimationClipSnapshot}
 */

AnimationClip.prototype.eval_cache = function (time, cacheKeyIdx, cacheValue) { // 1226
    if (!cacheValue) {
        var ret = this.eval();
        ret._cacheKeyIdx = cacheKeyIdx;
        return ret;
    }

    var snapshot = cacheValue;
    snapshot.time = time;

    for (var i = 0, len = this.animCurves.length; i < len; i++) {
        var curve = this.animCurves[i];
        var ki;
        if (cacheKeyIdx) {
            ki = cacheKeyIdx[curve.name];
        }
        var kv;
        if (cacheValue) {
            kv = cacheValue.curveKeyable[curve.name];
        } else {
            kv = new_AnimationKeyable(curve.keyableType);
        }
        var keyable = curve.eval_cache(time, ki, kv);// 0210
        if (cacheKeyIdx && keyable) cacheKeyIdx[curve.name] = keyable._cacheKeyIdx;
        snapshot.curveKeyable[curve.name] = keyable;
    }
    snapshot._cacheKeyIdx = cacheKeyIdx;
    return snapshot;
};

// take a snapshot of clip at this moment

/**
 * @param {number} [time]
 * @returns {AnimationClipSnapshot}
 */

AnimationClip.prototype.eval = function (time) {
    var snapshot = new AnimationClipSnapshot();
    snapshot.time = time;

    for (var i = 0, len = this.animCurves.length; i < len; i++) {
        var curve = this.animCurves[i];
        var keyable = curve.eval(time);
        snapshot.curveKeyable[curve.name] = keyable;
    }
    return snapshot;
};

/**
 * @param {pc.GraphNode} root
 */

AnimationClip.prototype.constructFromRoot = function (root) {
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
};

/*
//this animation clip's target will now to root
//Note that animationclip's original target may be on different scale from new root, for "localPosition", this needs to be adjusted
//Example: animation clip is made under AS scale,
//         AS will never change no matter how many times this animation clip is transferred, because it is bound with how it is made
//         when it is transferred to a new root, which is under RS scale, define standard scale SS=1,
//thus
//         standardPos = curvePos / AS;          converting curvePos from AS to SS
//         newRootPos = standardPos * RS;        converting position under SS to new RS
//thus
//         target.vScale = RS / AS;              how to update curve pos to target
//         newRootPos = curvePos * target.vScale
//
//given animation clip, it maybe transferred multiple times, and its original AS is unknown, to recover AS, we have
//                      RS (scale of current root in scene) and
//                      vScale (scale of animation curve's value update to target)
//thus
//         AS = RS / vScale;
//
//to transfer again to a new root with scale NS
//
//         standardPos = curvePos / AS = curvePos * vScale / RS
//         newTargetPos = standardPos * NS = curvePos * vScale * NS / RS
//
//thus
//         newTarget.vScale = NS / AS = vScale * NS / RS;
//
*/

/**
 * @param {pc.GraphNode} root
 */

AnimationClip.prototype.transferToRoot = function (root) {
    var dictTarget = {};
    AnimationTarget.constructTargetNodes(root, null, dictTarget);// contains localScale information

    for (var i = 0, len = this.animCurves.length; i < len; i++) {
        var curve = this.animCurves[i];
        var ctarget = curve.animTargets[0];
        if (curve.animTargets.length === 0) {
            continue;
        }
        var atarget = dictTarget[ctarget.targetNode.name];
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
};

// blend related
AnimationClip.prototype.updateCurveNameFromTarget = function () {
    for (var i = 0, len = this.animCurves.length; i < len; i++) {
        var curve = this.animCurves[i];
        if (!curve.animTargets || curve.animTargets.length < 1)
            continue;

        // change name to target string
        var oldName = curve.name;// backup before change
        var newName = curve.animTargets[0].toString();
        if (oldName == newName)// no need to change name
            continue;

        curve.name = newName;
    }
};

AnimationClip.prototype.removeEmptyCurves = function () {
    for (var i = 0, len = this.animCurves.length; i < len; i++) {
        var curve = this.animCurves[i];
        if (!curve || !curve.animKeys || curve.animKeys.length === 0) {
            this.removeCurve(curve.name);
        }
    }
};

/**
 * @param {AnimationCurveType} type
 */

AnimationClip.prototype.setInterpolationType = function (type) {
    for (var i = 0, len = this.animCurves.length; i < len; i++) {
        var curve = this.animCurves[i];
        if (curve) {
            curve.type = type;
        }
    }
};