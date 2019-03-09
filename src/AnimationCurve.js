
// *===============================================================================================================
// * class AnimationCurve: each curve corresponds to one channel
// * member
// *        animKeys: an array of Keys (knots) on the curve
// *        type: how to interpolate between keys.
// *
// *===============================================================================================================

/**
 * @enum {number}
 */

var AnimationCurveType = {
    LINEAR:           0,
    STEP:             1,
    CUBIC:            2,
    CUBICSPLINE_GLTF: 3
};

/**
 * @constructor
 */

var AnimationCurve = function () {
    this.name = -1; // AnimationClip#addCurve will assign a proper ID
    this.type = AnimationCurveType.LINEAR;
    this.keyableType = AnimationKeyableType.NUM;
    this.tension = 0.5;// 0.5 catmul-rom
    this.animTarget = undefined;// allow multiple targets
    this.duration = 0;
    this.animKeys = [];
    //this.session = new AnimationCurveSession(this);
};

/**
 * @param {AnimationCurve} curve
 */

AnimationCurve.prototype.copy = function (curve) {
    var i;

    this.name = curve.name;
    this.type = curve.type;
    this.keyableType = curve.keyableType;
    this.tension = curve.tension;
    this.duration = curve.duration;
    this.animTarget = curve.animTarget.clone();

    this.animKeys = [];
    for (i = 0; i < curve.animKeys.length; i ++) {
        var key = curve.animKeys[i].clone();
        this.animKeys.push(key);
    }
    return this;
};

AnimationCurve.prototype.clone = function () {
    return new AnimationCurve().copy(this);
};

/**
 * @param {pc.GraphNode} targetNode
 * @param {TargetPath} targetPath
 * @param {string} targetProp
 */

AnimationCurve.prototype.addTarget = function (targetNode, targetPath, targetProp) {
    var target = new AnimationTarget(targetNode, targetPath, targetProp);
    this.animTarget = target;
};

/**
 * @param {pc.GraphNode} targetNode
 * @param {TargetPath} targetPath
 * @param {string} [targetProp]
 */

AnimationCurve.prototype.setTarget = function (targetNode, targetPath, targetProp) {
    this.addTarget(targetNode, targetPath, targetProp);
};

/**
 * @param {AnimationKeyable[]} animKeys
 */

AnimationCurve.prototype.setAnimKeys = function (animKeys) {
    this.animKeys = animKeys;
};

/**
 * @param {AnimationCurveType} type
 * @param {number} time
 * @param {SingleDOF} value
 */

AnimationCurve.prototype.insertKey = function (type, time, value) {
    if (this.keyableType != type)
        return;

    var pos = 0;
    while (pos < this.animKeys.length && this.animKeys[pos].time < time)
        pos ++;

    // replace if existed at time
    if (pos < this.animKeys.length && this.animKeys[pos].time == time) {
        this.animKeys[pos].value = value;
        return;
    }

    var keyable = new_AnimationKeyable(type, time, value);

    // append at the back
    if (pos >= this.animKeys.length) {
        this.animKeys.push(keyable);
        this.duration = time;
        return;
    }

    // insert at pos
    this.animKeys.splice(pos, 0, keyable);
};

// 10/15
/**
 * @param {AnimationKeyable} keyable
 */
AnimationCurve.prototype.insertKeyable = function (keyable) {
    if (!keyable || this.keyableType != keyable.type)
        return;

    var time = keyable.time;
    var pos = 0;
    while (pos < this.animKeys.length && this.animKeys[pos].time < time)
        pos ++;

    // replace if existed at time
    if (pos < this.animKeys.length && this.animKeys[pos].time == time) {
        this.animKeys[pos] = keyable;
        return;
    }

    // append at the back
    if (pos >= this.animKeys.length) {
        this.animKeys.push(keyable);
        this.duration = time;
        return;
    }

    // insert at pos
    this.animKeys.splice(pos, 0, keyable);
};

/**
 * @param {number} index
 */

AnimationCurve.prototype.removeKey = function (index) {
    if (index <= this.animKeys.length) {
        if (index == this.animKeys.length - 1)
            this.duration = (index - 1) >= 0 ? this.animKeys[index - 1].time : 0;
        this.animKeys.splice(index, 1);
    }
};

AnimationCurve.prototype.removeAllKeys = function () {
    this.animKeys = [];
    this.duration = 0;
};

/**
 * @param {number} time
 */

AnimationCurve.prototype.shiftKeyTime = function (time) {
    for (var i = 0; i < this.animKeys.length; i ++)
        this.animKeys[i].time += time;
};

/**
 * @param {number} tmBeg
 * @param {number} tmEnd
 */

AnimationCurve.prototype.getSubCurve = function (tmBeg, tmEnd) {
    var i;
    var subCurve = new AnimationCurve();
    subCurve.type = this.type;
    subCurve.keyableType = this.keyableType;
    subCurve.tension = this.tension;
    subCurve.animTarget = this.animTarget.clone();

    var tmFirst = -1;
    for (i = 0; i < this.animKeys.length; i++) {
        if (this.animKeys[i].time >= tmBeg && this.animKeys[i].time <= tmEnd) {
            if (tmFirst < 0)
                tmFirst = this.animKeys[i].time;

            var key = this.animKeys[i].clone();
            key.time -= tmFirst;
            subCurve.animKeys.push(key);
        }
    }

    subCurve.duration = (tmFirst === -1) ? 0 : (tmEnd - tmFirst);
    return subCurve;
};

/**
 * @param {number} time
 * @param {number} cacheKeyIdx
 * @param {AnimationKeyable} cacheValue
 * @returns {AnimationKeyable}
 */

AnimationCurve.prototype.evalLINEAR_cache = function (time, cacheKeyIdx, cacheValue) { //1215
    if (!this.animKeys || this.animKeys.length === 0)
        return null;

    // 1. find the interval [key1, key2]
    var resKey = cacheValue;// new AnimationKeyable();

    var begIdx = 0;
    if (cacheKeyIdx) begIdx = cacheKeyIdx;
    var i = begIdx;

    var n = this.animKeys.length;
    /** @type AnimationKeyable */
    var animKey;
    for (var c = 0; c < n; c ++) {
        i = begIdx + c;

        // same as `i %= n` in this setting, just much faster
		if (i >= n) {
			i -= n;
		}

        animKey = this.animKeys[i];
        
        if (animKey.time === time) {
            resKey.copy(animKey);
            resKey._cacheKeyIdx = i;
            return resKey;
        }

        // 2. only found one boundary
        if (i === 0 && animKey.time > time) { // earlier than first
            resKey.copy(animKey);
            resKey.time = time;
            resKey._cacheKeyIdx = i;
            return resKey;
        }

        // 2. only found one boundary
        if (i == n - 1 && animKey.time < time) { // later than last
            resKey.copy(animKey);
            resKey.time = time;
            resKey._cacheKeyIdx = i;
            return resKey;
        }

        // both found then interpolate
        if (animKey.time > time && (i - 1 < 0 || this.animKeys[i - 1].time < time)) {
            var key1 = this.animKeys[i - 1];
            var key2 = animKey;
            //if (!key1 || !key2)
            //    debugger;
            var p = (time - key1.time) / (key2.time - key1.time);
            resKey.linearBlend(key1, key2, p);
            resKey.time = time;
            resKey._cacheKeyIdx = i;
            return resKey;
        }
    }

    console.log("no key found for time ", time, "cacheKeyIdx", cacheKeyIdx, "cacheValue", cacheValue);
    return resKey;
};

/**
 * @param {number} time
 * @param {number} cacheKeyIdx
 * @param {AnimationKeyable} cacheValue
 * @returns {AnimationKeyable}
 */

AnimationCurve.prototype.evalSTEP_cache = function (time, cacheKeyIdx, cacheValue) { //1215
    if (!this.animKeys || this.animKeys.length === 0)
        return null;

    var begIdx = 0;
    if (cacheKeyIdx) {
        begIdx = cacheKeyIdx;
    }
    var i = begIdx;

    var key = this.animKeys[i];
    for (var c = 1; c < this.animKeys.length; c ++) {
        i = (begIdx + c) % this.animKeys.length;

        if (i === 0 && this.animKeys[i].time > time) { // earlier than first
            key = this.animKeys[i];
            break;
        }

        if (i === this.animKeys.length - 1 && this.animKeys[i].time <= time) { // later than last
            key = this.animKeys[i];
            break;
        }

        if (this.animKeys[i].time <= time && (i + 1 >= this.animKeys.length || this.animKeys[i + 1].time > time)) {
            key = this.animKeys[i];
            break;
        }
    }
    var resKey = cacheValue;// new AnimationKeyable();
    resKey.copy(key);
    resKey.time = time;
    resKey._cacheKeyIdx = i;
    return resKey;
};

/**
 * @param {number} time
 * @param {number} cacheKeyIdx
 * @param {AnimationKeyable} cacheValue
 * @returns {AnimationKeyable}
 */

AnimationCurve.prototype.evalCUBIC_cache = function (time, cacheKeyIdx, cacheValue) {//1215
    if (!this.animKeys || this.animKeys.length === 0)
        return null;

    var begIdx = 0;
    if (cacheKeyIdx) begIdx = cacheKeyIdx;
    var i = begIdx;

    // 1. find interval [key1, key2] enclosing time
    // key0, key3 are for tangent computation
    var key0, key1, key2, key3;
    var resKey = cacheValue;// new AnimationKeyable();
    for (var c = 0; c < this.animKeys.length; c ++) {
        i = (begIdx + c) % this.animKeys.length;

        if (this.animKeys[i].time === time) {
            resKey.copy(this.animKeys[i]);
            resKey._cacheKeyIdx = i;
            return resKey;
        }

        if (i === 0 && this.animKeys[i].time > time) { // earlier than first
            key0 = null;
            key1 = null;
            key2 = this.animKeys[i];
            if (i + 1 < this.animKeys.length) key3 = this.animKeys[i + 1];
            break;
        }

        if (i == this.animKeys.length - 1 && this.animKeys[i].time < time) { // later than last
            if (i - 1 > 0) key0 = this.animKeys[i - 1];
            key1 = this.animKeys[i];
            key2 = null;
            key3 = null;
            break;

        }

        if (this.animKeys[i].time > time &&
            (i - 1 < 0 || this.animKeys[i - 1].time < time)) {

            if (i - 2 > 0) key0 = this.animKeys[i - 2];
            key1 = this.animKeys[i - 1];
            key2 = this.animKeys[i];
            if (i + 1 < this.animKeys.length) key3 = this.animKeys[i + 1];
            break;
        }
    }

    // 2. only find one boundary
    if (!key1 || !key2) {
        resKey.copy(key1 ? key1 : key2);
        resKey.time = time;
        resKey._cacheKeyIdx = i;
        return resKey;
    }

    // 3. curve interpolation
    if (key1.type == AnimationKeyableType.NUM || key1.type == AnimationKeyableType.VEC) {
        resKey = AnimationCurve.cubicCardinal(key0, key1, key2, key3, time, this.tension);
        resKey.time = time;
        resKey._cacheKeyIdx = i;
        return resKey;
    }
    return null;
};

/**
 * @param {number} time
 * @param {number} cacheKeyIdx
 * @param {AnimationKeyable} cacheValue
 * @returns {AnimationKeyable}
 */

AnimationCurve.prototype.evalCUBICSPLINE_GLTF_cache = function (time, cacheKeyIdx, cacheValue) {//1215
    if (!this.animKeys || this.animKeys.length === 0)
        return null;

    var begIdx = 0;
    if (cacheKeyIdx) begIdx = cacheKeyIdx;
    var i = begIdx;

    // 1. find the interval [key1, key2]
    var resKey = cacheValue;// new AnimationKeyable(); 1215
    var key1, key2;
    for (var c = 0; c < this.animKeys.length; c ++) {
        i = (begIdx + c) % this.animKeys.length;

        if (this.animKeys[i].time === time) {
            resKey.copy(this.animKeys[i]);
            resKey._cacheKeyIdx = i;
            return resKey;
        }

        if (i === 0 && this.animKeys[i].time > time) { // earlier than first
            key1 = null;
            key2 = this.animKeys[i];
            break;
        }

        if (i === this.animKeys.length - 1 && this.animKeys[i].time < time) { // later than last
            key1 = this.animKeys[i];
            key2 = null;
            break;

        }

        if (this.animKeys[i].time > time &&
            (i - 1 < 0 || this.animKeys[i - 1].time < time)) {
            key1 = this.animKeys[i - 1];
            key2 = this.animKeys[i];
            break;
        }
    }

    // 2. only found one boundary
    if (!key1 || !key2) {
        resKey.copy(key1 ? key1 : key2);
        resKey.time = time;
        resKey._cacheKeyIdx = i;
        return resKey;
    }

    // 3. both found then interpolate
    var p = (time - key1.time) / (key2.time - key1.time);
    resKey.cubicHermite(key1, key2, p);
    resKey.time = time;
    resKey._cacheKeyIdx = i;
    return resKey;
};

/**
 * @param {number} time
 * @param {number} cacheKeyIdx
 * @param {AnimationKeyable} cacheValue
 * @returns {AnimationKeyable}
 */

AnimationCurve.prototype.eval_cache = function (time, cacheKeyIdx, cacheValue) { //1215
    if (!this.animKeys || this.animKeys.length === 0)
        return null;

    switch (this.type) {
        case AnimationCurveType.LINEAR: {
            return this.evalLINEAR_cache(time, cacheKeyIdx, cacheValue);
        }
        case AnimationCurveType.STEP: {
            return this.evalSTEP_cache(time, cacheKeyIdx, cacheValue);
        }
        case AnimationCurveType.CUBIC: {
            if (this.keyableType == AnimationKeyableType.QUAT) {
                return this.evalLINEAR_cache(time, cacheKeyIdx, cacheValue);
            }
            return this.evalCUBIC_cache(time, cacheKeyIdx, cacheValue);
        }
        case AnimationCurveType.CUBICSPLINE_GLTF: {// 10/15, keyable contains (inTangent, value, outTangent)
            return this.evalCUBICSPLINE_GLTF_cache(time, cacheKeyIdx, cacheValue);
        }
    }
    return null;
};

/**
 * @param {number} t1
 * @param {number} v1
 * @param {number} t2
 * @param {number} v2
 * @param {number} p
 * @returns {number}
 * @summary static method: tangent 1, value 1, tangent 2, value 2, proportion
 */

AnimationCurve.cubicHermite = function (t1, v1, t2, v2, p) {
    // basis
    var p2 = p * p;
    var p3 = p2 * p;
    var h0 = 2 * p3 - 3 * p2 + 1;
    var h1 = -2 * p3 + 3 * p2;
    var h2 = p3 - 2 * p2 + p;
    var h3 = p3 - p2;

    // interpolation
    return v1 * h0 + v2 * h1 + t1 * h2 + t2 * h3;
};

/**
 * @param {AnimationKeyable} key0
 * @param {AnimationKeyable} key1
 * @param {AnimationKeyable} key2
 * @param {AnimationKeyable} key3
 * @param {number} time
 * @param {number} tension
 * @param {AnimationKeyable} [cacheValue]
 * @returns {AnimationKeyable}
 * @summary static: only for num or vec
 */

AnimationCurve.cubicCardinal = function (key0, key1, key2, key3, time, tension, cacheValue) {//1215
    var m1, m2;

    if (!key1 || !key2 || key1.type != key2.type)
        return null;

    if (key1.type != AnimationKeyableType.NUM && key1.type != AnimationKeyableType.VEC)
        return null;

    var p = (time - key1.time) / (key2.time - key1.time);
    var resKey;
    if (cacheValue) resKey = cacheValue;
    else resKey = new_AnimationKeyable(key1.type);

    // adjust for non-unit-interval
    var factor = tension * (key2.time - key1.time);
    if (key1.type === AnimationKeyableType.NUM) {
        m1 = factor * (key2.value - key1.value) / (key2.time - key1.time);
        if (key0)
            m1 = 2 * factor * (key2.value - key0.value) / (key2.time - key0.time);

        m2 = factor * (key2.value - key1.value) / (key2.time - key1.time);
        if (key3)
            m2 = 2 * factor * (key3.value - key1.value) / (key3.time - key1.time);
        resKey.value = AnimationCurve.cubicHermite(m1, key1.value, m2, key2.value, p);
    }

    // each element in vector, direct x, y, z, w
    if (key1.type === AnimationKeyableType.VEC) {
        resKey.value = key1.value.clone();
        var props = ["x", "y", "z", "w"];
        for (var i = 0; i < props.length; i ++) {
            var pr = props[i];
            if (resKey.value[pr] === undefined)
                continue;
            m1 = factor * (key2.value[pr] - key1.value[pr]) / (key2.time - key1.time);
            if (key0)
                m1 = 2 * factor * (key2.value[pr] - key0.value[pr]) / (key2.time - key0.time);

            m2 = factor * (key2.value[pr] - key1.value[pr]) / (key2.time - key1.time);
            if (key3)
                m2 = 2 * factor * (key3.value[pr] - key1.value[pr]) / (key3.time - key1.time);
            resKey.value[pr] = AnimationCurve.cubicHermite(m1, key1.value[pr], m2, key2.value[pr], p);
        }
    }
    return resKey;
};