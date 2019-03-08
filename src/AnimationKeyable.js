/**
 * @constructor
 * @param {number} [time]
 * @param {number} [value]
 */

var AnimationKeyableNum = function (time, value) {
    this.type  = AnimationKeyableType.NUM;
    this.time  = time  || 0.0;
    this.value = value || 0.0;
};

AnimationKeyableNum.prototype.clone = function () {
    return new AnimationKeyableNum(this.time, this.value);
};

/**
 * @param {AnimationKeyableNum} other
 */

AnimationKeyableNum.prototype.copy = function (other) {
	this.time = other.time;
    this.value = other.value;
    return this;
};

/**
 * @param {AnimationKeyableNum} from
 * @param {AnimationKeyableNum} to
 * @param {number} alpha
 */

AnimationKeyableNum.prototype.linearBlend = function (from, to, alpha) {
    this.value = (1.0 - alpha) * from.value + alpha * to.value;
}

/**
 * @constructor
 * @param {number} [time]
 * @param {pc.Vec3} [value]
 */

var AnimationKeyableVec = function (time, value) {
    this.type  = AnimationKeyableType.VEC;
    this.time  = time  || 0.0;
    this.value = value || new pc.Vec3();
};

AnimationKeyableVec.prototype.clone = function () {
    return new AnimationKeyableVec(this.time, this.value.clone());
}

/**
 * @param {AnimationKeyableVec} other
 */

AnimationKeyableVec.prototype.copy = function (other) {
	this.time = other.time;
    this.value.copy(other.value);
    return this;
};

/**
 * @param {AnimationKeyableVec} from
 * @param {AnimationKeyableVec} to
 * @param {number} alpha
 */

AnimationKeyableVec.prototype.linearBlend = function (from, to, alpha) {
    this.value.lerp(from.value, to.value, alpha);
};

/**
 * @constructor
 * @param {number} [time]
 * @param {pc.Quat} [value]
 */

var AnimationKeyableQuat = function (time, value) {
    this.type  = AnimationKeyableType.QUAT;
    this.time  = time  || 0.0;
    this.value = value || new pc.Quat();
};

AnimationKeyableQuat.prototype.clone = function () {
    return new AnimationKeyableQuat(this.time, this.value.clone());
};

/**
 * @param {AnimationKeyableQuat} other
 */

AnimationKeyableQuat.prototype.copy = function (other) {
	this.time = other.time;
    this.value.copy(other.value);
    return this;
};

/**
 * @param {AnimationKeyableQuat} from
 * @param {AnimationKeyableQuat} to
 * @param {number} alpha
 */

AnimationKeyableQuat.prototype.linearBlend = function (from, to, alpha) {
    this.value.slerp(from.value, to.value, alpha);
};

/**
 * @constructor
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

AnimationKeyableNumCubicSpline.prototype.clone = function () {
    return new AnimationKeyableNumCubicSpline(this.time, this.value, this.inTangent, this.outTangent);
};

/**
 * @param {AnimationKeyableNumCubicSpline} other
 */

AnimationKeyableNumCubicSpline.prototype.copy = function (other) {
	this.time = other.time;
    this.value = other.value;
    this.inTangent = other.inTangent;
    this.outTangent = other.outTangent;
    return this;
};

/**
 * @param {AnimationKeyableNumCubicSpline} from
 * @param {AnimationKeyableNumCubicSpline} to
 * @param {number} alpha
 */

AnimationKeyableNumCubicSpline.prototype.cubicHermite = function (from, to, alpha) {
    var g = to.time - from.time;
    this.value = AnimationCurve.cubicHermite(g * from.outTangent, from.value, g * to.inTangent, to.value, alpha);
};

/**
 * @constructor
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

AnimationKeyableVecCubicSpline.prototype.clone = function () {
    return new AnimationKeyableVecCubicSpline(this.time, this.value.clone(), this.inTangent.clone(), this.outTangent.clone());
}

/**
 * @param {AnimationKeyableVecCubicSpline} other
 */

AnimationKeyableVecCubicSpline.prototype.copy = function (other) {
	this.time = other.time;
    this.value.copy(other.value);
    this.inTangent.copy(other.inTangent);
    this.outTangent.copy(other.outTangent);
    return this;
};

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
 * @constructor
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

AnimationKeyableQuatCubicSpline.prototype.clone = function () {
    return new AnimationKeyableQuatCubicSpline(this.time, this.value.clone(), this.inTangent.clone(), this.outTangent.clone());
};

/**
 * @param {AnimationKeyableQuatCubicSpline} other
 */

AnimationKeyableQuatCubicSpline.prototype.copy = function (other) {
	this.time = other.time;
    this.value.copy(other.value);
    this.inTangent.copy(other.inTangent);
    this.outTangent.copy(other.outTangent);
    return this;
};

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
};
