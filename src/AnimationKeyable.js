




/**
 * @param {number} [time]
 * @param {number} [value]
 */

var AnimationKeyableNum = function (time, value) {
    this.type  = AnimationKeyableType.NUM;
    this.time  = time  || 0.0;
    this.value = value || 0.0;
};

/**
 * @param {number} [time]
 * @param {pc.Vec3} [value]
 */

var AnimationKeyableVec = function (time, value) {
    this.type  = AnimationKeyableType.VEC;
    this.time  = time  || 0.0;
    this.value = value || new pc.Vec3();
};

/**
 * @param {number} [time]
 * @param {pc.Quat} [value]
 */

var AnimationKeyableQuat = function (time, value) {
    this.type  = AnimationKeyableType.QUAT;
    this.time  = time  || 0.0;
    this.value = value || new pc.Quat();
};

/**
 * @param {number} [time      ]
 * @param {number} [value     ]
 * @param {number} [inTangent ]
 * @param {number} [outTangent]
 */

var AnimationKeyableNumCubicSpline = function (time, value, inTangent, outTangent) {
    this.type       = AnimationKeyableType.NUM_CUBICSCPLINE;
    this.time       = time       || 0.0;
    this.value      = value      || 0.0;
    this.inTangent  = inTangent  || 0.0;
    this.outTangent = outTangent || 0.0;
};

/**
 * @param {number } [time      ]
 * @param {pc.Vec3} [value     ]
 * @param {pc.Vec3} [inTangent ]
 * @param {pc.Vec3} [outTangent]
 */

var AnimationKeyableVecCubicSpline = function (time, value, inTangent, outTangent) {
    this.type       = AnimationKeyableType.VEC_CUBICSCPLINE;
    this.time       = time       || 0.0;
    this.value      = value      || new pc.Vec3();
    this.inTangent  = inTangent  || new pc.Vec3();
    this.outTangent = outTangent || new pc.Vec3();
};

/**
 * @param {number } [time      ]
 * @param {pc.Quat} [value     ]
 * @param {pc.Quat} [inTangent ]
 * @param {pc.Quat} [outTangent]
 */

var AnimationKeyableQuatCubicSpline = function (time, value, inTangent, outTangent) {
    this.type       = AnimationKeyableType.QUAT_CUBICSCPLINE;
    this.time       = time       || 0.0;
    this.value      = value      || new pc.Quat();
    this.inTangent  = inTangent  || new pc.Quat();
    this.outTangent = outTangent || new pc.Quat();
};

/**
 * @param {AnimationKeyableNum} other
 */

AnimationKeyableNum.prototype.copy = function (other) {
    this.value = other.value;
    return this;
};

/**
 * @param {AnimationKeyableVec} other
 */

AnimationKeyableVec.prototype.copy = function (other) {
    this.value = other.value.clone();
    return this;
};

/**
 * @param {AnimationKeyableQuat} other
 */

AnimationKeyableQuat.prototype.copy = function (other) {
    this.value = other.value.clone();
    return this;
};

/**
 * @param {AnimationKeyableNumCubicSpline} other
 */

AnimationKeyableNumCubicSpline.prototype.copy = function (other) {
    this.value = other.value;
    this.inTangent = other.value;
    this.outTangent = other.value;
    return this;
};

/**
 * @param {AnimationKeyableVecCubicSpline} other
 */

AnimationKeyableVecCubicSpline.prototype.copy = function (other) {
    this.value      = other.value.clone();
    this.inTangent  = other.inTangent.value.clone();
    this.outTangent = other.outTangent.value.clone();
    return this;
};

/**
 * @param {AnimationKeyableQuatCubicSpline} other
 */

AnimationKeyableQuatCubicSpline.prototype.copy = function (other) {
    this.value      = other.value.clone();
    this.inTangent  = other.inTangent.value.clone();
    this.outTangent = other.outTangent.value.clone();
    return this;
};

AnimationKeyableNum.prototype.clone = function () {
    return new AnimationKeyableNum(this.time, this.value);
}

AnimationKeyableVec.prototype.clone = function () {
    return new AnimationKeyableVec(this.time, this.value.clone());
}

AnimationKeyableQuat.prototype.clone = function () {
    return new AnimationKeyableQuat(this.time, this.value.clone());
}

AnimationKeyableNumCubicSpline.prototype.clone = function () {
    return new AnimationKeyableNumCubicSpline(this.time, this.value, this.inTangent, this.outTangent);
}

AnimationKeyableVecCubicSpline.prototype.clone = function () {
    return new AnimationKeyableVecCubicSpline(this.time, this.value.clone(), this.inTangent.clone(), this.outTangent.clone());
}

AnimationKeyableQuatCubicSpline.prototype.clone = function () {
    return new AnimationKeyableQuatCubicSpline(this.time, this.value.clone(), this.inTangent.clone(), this.outTangent.clone());
}

/**
 * @param {AnimationKeyableNumCubicSpline} from
 * @param {AnimationKeyableNumCubicSpline} to
 * @param {number} alpha
 */

AnimationKeyableNumCubicSpline.prototype.cubicHermite = function (from, to, alpha) {
    var g = to.time - from.time;
    this.value = AnimationCurve.cubicHermite(g * from.outTangent, from.value, g * to.inTangent, to.value, alpha);
}

/**
 * @param {AnimationKeyableVecCubicSpline} from
 * @param {AnimationKeyableVecCubicSpline} to
 * @param {number} alpha
 */

AnimationKeyableVecCubicSpline.prototype.cubicHermite = function (from, to, alpha) {
    var g = to.time - from.time;
    this.value.x = AnimationCurve.cubicHermite(g * from.outTangent.x, from.value.x, g * to.inTangent.x, to.value.x, alpha);
    this.value.y = AnimationCurve.cubicHermite(g * from.outTangent.y, from.value.y, g * to.inTangent.y, to.value.y, alpha);
    this.value.z = AnimationCurve.cubicHermite(g * from.outTangent.z, from.value.z, g * to.inTangent.z, to.value.z, alpha);
}

/**
 * @param {AnimationKeyableQuatCubicSpline} from
 * @param {AnimationKeyableQuatCubicSpline} to
 * @param {number} alpha
 */

AnimationKeyableQuatCubicSpline.prototype.cubicHermite = function (from, to, alpha) {
    var g = to.time - from.time;
    this.value.w = AnimationCurve.cubicHermite(g * from.outTangent.w, from.value.w, g * to.inTangent.w, to.value.w, alpha);
    this.value.x = AnimationCurve.cubicHermite(g * from.outTangent.x, from.value.x, g * to.inTangent.x, to.value.x, alpha);
    this.value.y = AnimationCurve.cubicHermite(g * from.outTangent.y, from.value.y, g * to.inTangent.y, to.value.y, alpha);
    this.value.z = AnimationCurve.cubicHermite(g * from.outTangent.z, from.value.z, g * to.inTangent.z, to.value.z, alpha);
    this.value.normalize();
}

/**
 * @param {AnimationKeyableNum} from
 * @param {AnimationKeyableNum} to
 * @param {number} alpha
 */

AnimationKeyableNum.prototype.linearBlend = function (from, to, alpha) {
    this.value = (1.0 - alpha) * from.value + alpha * to.value;
}

/**
 * @param {AnimationKeyableNum} from
 * @param {AnimationKeyableNum} to
 * @param {number} alpha
 */

AnimationKeyableVec.prototype.linearBlend = function (from, to, alpha) {
    this.value.lerp(from.value, to.value, alpha);
}

/**
 * @param {AnimationKeyableNum} from
 * @param {AnimationKeyableNum} to
 * @param {number} alpha
 */

AnimationKeyableQuat.prototype.linearBlend = function (from, to, alpha) {
    this.value.slerp(from.value, to.value, alpha);
}
