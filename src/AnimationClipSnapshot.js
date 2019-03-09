

// *===============================================================================================================
// * class AnimationClipSnapshot: animation clip slice (pose) at a particular time
// * member
// *       curveKeyable: the collection of evaluated keyables on curves at a particular time
// * e.g.: for an "walking" clip of a character, at time 1s, AnimationClipSnapshot corresponds to
// *       evaluated keyables that makes a arm-swing pose
// *===============================================================================================================

/**
 * @constructor
 */

var AnimationClipSnapshot = function () {
    this.curveKeyable = [];
};

/**
 * @param {AnimationClipSnapshot} shot
 */

AnimationClipSnapshot.prototype.copy = function (shot) {
    if (!shot)
        return this;
    this.curveKeyable = [];
    for (var i = 0; i < shot.curveKeyable.length; i ++) {
        this.curveKeyable[i] = shot.curveKeyable[i].clone();
    }
    return this;
};

AnimationClipSnapshot.prototype.clone = function () {
    var cloned = new AnimationClipSnapshot().copy(this);
    return cloned;
};

/**
 * @param {AnimationClipSnapshot} shot1
 * @param {AnimationClipSnapshot} shot2
 * @param {number} p
 * @returns {AnimationClipSnapshot}
 * @summary static function: linear blending
 */

AnimationClipSnapshot.linearBlend = function (shot1, shot2, p) {
    if (!shot1 || !shot2)
        return null;

    if (p === 0) return shot1;
    if (p === 1) return shot2;

    var resShot = new AnimationClipSnapshot();
    resShot.copy(shot1);
    for (var i = 0; i < shot2.curveKeyable.length; i ++) {
        var cname = i;
        if (shot1.curveKeyable[cname] && shot2.curveKeyable[cname]) {
            var resKey = AnimationKeyable.linearBlend(shot1.curveKeyable[cname], shot2.curveKeyable[cname], p);
            resShot.curveKeyable[cname] = resKey;
        } else if (shot1.curveKeyable[cname])
            resShot.curveKeyable[cname] = shot1.curveKeyable[cname];
        else if (shot2.curveKeyable[cname])
            resShot.curveKeyable[cname] = shot2.curveKeyable[cname];
    }
    return resShot;
};

/**
 * @param {AnimationClipSnapshot} shot1
 * @param {AnimationClipSnapshot} shot2
 * @param {number} p
 * @param {AnimationCurveMap} animCurveMap
 * @returns {AnimationClipSnapshot}
 * @summary static function: linear blending except for step curve
 */

AnimationClipSnapshot.linearBlendExceptStep = function (shot1, shot2, p, animCurveMap) {
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
};

