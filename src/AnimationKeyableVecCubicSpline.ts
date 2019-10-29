
/**
 * @constructor
 * @param {number } [time      ]
 * @param {pc.Vec3} [value     ]
 * @param {pc.Vec3} [inTangent ]
 * @param {pc.Vec3} [outTangent]
 */

export var AnimationKeyableVecCubicSpline = function (time, value, inTangent, outTangent) {
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