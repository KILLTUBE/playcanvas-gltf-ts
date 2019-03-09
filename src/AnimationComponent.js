
// *===============================================================================================================
// * class AnimationComponent:
// * member
// *       animClips: dictionary type, query animation clips animClips[clipName]
// *
// *===============================================================================================================

/**
 * @constructor
 */

var AnimationComponent = function () {
    this.name = "";
    this.animClipsMap = {}; // make it a map, easy to query clip by name
    this.animClips = [];
    this.curClip = "";

    // For storing AnimationSessions
    this.animSessions = {};
};

/**
 * @returns {number}
 */

AnimationComponent.prototype.clipCount = function () {
    return this.animClips.length;
};

/**
 * @returns {AnimationClip}
 */

AnimationComponent.prototype.getCurrentClip = function () {
    return this.animClipsMap[this.curClip];
};

/**
 * @param {number} index
 * @returns {AnimationClip}
 */

AnimationComponent.prototype.clipAt = function (index) {
    if (this.animClips.length <= index)
        return null;
    return this.animClips[index];
};

/**
 * @param {AnimationClip} clip
 */

AnimationComponent.prototype.addClip = function (clip) {
    if (clip && clip.name) {
        this.animClips.push(clip);
        this.animClipsMap[clip.name] = clip;
    }
};

/**
 * @param {string} name
 */

AnimationComponent.prototype.removeClip = function (name) {
    var clip = this.animClipsMap[name];
    if (clip) {
        var idx = this.animClips.indexOf(clip);
        if (idx !== -1) {
            this.animClips.splice(idx, 1);
        }
        delete this.animClipsMap[name];
    }

    if (this.curClip === name)
        this.curClip = "";
};

/**
 * @param {string} name
 */

AnimationComponent.prototype.playClip = function (name) {
    var clip = this.animClipsMap[name];
    if (clip) {
        this.curClip = name;
        clip.play();
    }
};

AnimationComponent.prototype.stopClip = function () {
    var clip = this.animClipsMap[this.curClip];
    if (clip) {
        clip.stop();
        this.curClip = "";
    }
};

/**
 * @param {string} name
 * @param {number} duration
 */

AnimationComponent.prototype.crossFadeToClip = function (name, duration) {
    var fromClip = this.animClipsMap[this.curClip];
    var toClip = this.animClipsMap[name];

    if (fromClip && toClip) {
        fromClip.fadeOut(duration);
        toClip.fadeIn(duration);
        this.curClip = name;
    } else if (fromClip) {
        fromClip.fadeOut(duration);
        this.curClip = "";
    } else if (toClip) {
        toClip.fadeIn(duration);
        this.curClip = name;
    }
};


// blend related

/**
 * @param {BlendValue} blendValue
 * @param {number} weight
 * @param {string} curveName
 */

AnimationComponent.prototype.setBlend = function (blendValue, weight, curveName) {
    var curClip = this.getCurrentClip();
    if (curClip && curClip.session)
        curClip.session.setBlend(blendValue, weight, curveName);
};

/**
 * @param {string} curveName
 */

AnimationComponent.prototype.unsetBlend = function (curveName) {
    var curClip = this.getCurrentClip();
    if (curClip && curClip.session)
        curClip.session.unsetBlend(curveName);
};


// APIs for sessions =================================================
AnimationComponent.prototype.getCurrentSession = function () {
    return this.animSessions[this.curClip];
};

/**
 * @param {string} name
 */

AnimationComponent.prototype.playSession = function (name) {
    var session = this.animSessions[name];
    if (session) {
        session.play();
        this.curClip = name;
    }
};

AnimationComponent.prototype.stopSession = function () {
    var session = this.animSessions[this.curClip];
    if (session) {
        session.stop();
        this.curClip = "";
    }
};

/**
 * @param {string} name
 * @param {number} duration
 */

AnimationComponent.prototype.crossFadeToSession = function (name, duration) {
    var fromSession = this.animSessions[this.curClip];
    var toSession = this.animSessions[name];

    if (fromSession && this.animSessions[name]) {
        fromSession.fadeOut(duration);
        toSession.fadeIn(duration);
        this.curClip = name;
    } else if (fromSession) {
        fromSession.fadeOut(duration);
        this.curClip = "";
    } else if (toSession) {
        toSession.fadeIn(duration);
        this.curClip = name;
    }
};

/**
 * @param {BlendValue} blendValue
 * @param {number} weight
 * @param {string} curveName
 */

AnimationComponent.prototype.setBlendSession = function (blendValue, weight, curveName) {
    var curSession = this.animSessions[this.curClip];
    if (curSession) {
        curSession.setBlend(blendValue, weight, curveName);
    }
};

/**
 * @param {string} curveName
 */

AnimationComponent.prototype.unsetBlendSession = function (curveName) {
    var curSession = this.animSessions[this.curClip];
    if (curSession) {
        curSession.unsetBlend(curveName);
    }
};

/**
 * @param {string} substr
 */

AnimationComponent.prototype.playSubstring = function (substr) {
    var n = this.animClips.length;
    for (var i = 0; i < n; i++) {
        var clip = this.animClips[i];
        if (clip.isPlaying)
            clip.pause();
        if (clip.name.indexOf(substr) !== -1)
            clip.play();
    }
};

AnimationComponent.prototype.pauseAll = function () {
    var n = this.animClips.length;
    for (var i = 0; i < n; i++) {
        var clip = this.animClips[i];
        if (clip.isPlaying)
            clip.pause();
    }
};
