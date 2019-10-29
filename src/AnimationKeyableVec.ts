
/**
 * @constructor
 * @param {number} [time]
 * @param {pc.Vec3} [value]
 */

export var AnimationKeyableVec = function (time, value) {
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