/**
 * @constructor
 * @param {number} [time]
 * @param {number} [value]
 */

export var AnimationKeyableNum = function (time, value) {
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