
/**
 * @constructor
 * @param {number } [time      ]
 * @param {pc.Quat} [value     ]
 * @param {pc.Quat} [inTangent ]
 * @param {pc.Quat} [outTangent]
 */

export var AnimationKeyableQuatCubicSpline = function (time, value, inTangent, outTangent) {
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
