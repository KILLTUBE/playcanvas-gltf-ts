
/**
 * @constructor
 * @param {string} name
 * @param {number} time
 * @param {AnimationEventCallback} fnCallback
 * @param {any} context
 * @param {any} parameter
 */

export var AnimationEvent = function (name, time, fnCallback, context, parameter) {
	this.name = name;
	this.triggerTime = time;
	this.fnCallback = fnCallback;
	this.context = context || this;
	this.parameter = parameter;

	this.triggered = false;
};

AnimationEvent.prototype.invoke = function () {
	if (this.fnCallback) {
		this.fnCallback.call(this.context, this.parameter);
		this.triggered = true;
	}
};

/*
// note: used in line 2127, but undefined... never used so far
AnimationEvent.prototype.clone = function () {
	return new pcAnimationEvent(
		this.name,
		this.triggerTime,
		this.fnCallback,
		this.context,
		this.parameter
	);
}
*/
