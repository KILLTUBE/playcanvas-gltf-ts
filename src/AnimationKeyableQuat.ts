export class AnimationKeyableQuat {
	type: AnimationKeyableType;
	time: number;
	value: pc.Quat;

	constructor(time: number, value: pc.Quat) {
		this.type  = AnimationKeyableType.QUAT;
		this.time  = time  || 0.0;
		this.value = value || new pc.Quat();
	}

	clone() {
		return new AnimationKeyableQuat(this.time, this.value.clone());
	}

	copy(other: AnimationKeyableQuat) {
		this.time = other.time;
		this.value.copy(other.value);
		return this;
	}

	linearBlend(from: AnimationKeyableQuat, to: AnimationKeyableQuat, alpha: number) {
		this.value.slerp(from.value, to.value, alpha);
	}
}
