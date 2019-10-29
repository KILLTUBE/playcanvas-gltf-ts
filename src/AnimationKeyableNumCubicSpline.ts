
/**
 * @constructor
 * @param {number} [time      ]
 * @param {number} [value     ]
 * @param {number} [inTangent ]
 * @param {number} [outTangent]
 */

export var AnimationKeyableNumCubicSpline = function (time, value, inTangent, outTangent) {
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