
/**
 * @constructor
 * @param {number} [time]
 * @param {pc.Quat} [value]
 */

export var AnimationKeyableQuat = function (time, value) {
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