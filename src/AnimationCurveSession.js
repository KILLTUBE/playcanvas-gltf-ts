
// *===============================================================================================================
// * class AnimationCurveSession: playback/runtime related thing
//                           AnimationCurve and AnimationClip are both playable, they are animation data container
//                           AnimationCurveSession is the runtime play of curve/clip
//                           one clip can be played by multiple AnimationCurveSession simultaneously
// *===============================================================================================================

/**
 * @constructor
 * @param {AnimationCurve} curve
 */

var AnimationCurveSession = function AnimationCurveSession(curve) {
    this.playable = curve;
    this.allocateCache();
};

AnimationCurveSession.prototype.allocateCache = function () {
    this._cacheKeyIdx = 0;
    this._cacheValue = new_AnimationKeyable(this.playable.keyableType);
};

AnimationCurveSession.prototype.clone = function () {
    var i, key;
    var cloned = new AnimationCurveSession(this.playable);
    cloned.allocateCache();

    // targets
    cloned.animTargets = {};
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

    return cloned;
};
