export interface AnimationEventCallback {
  (context: any, parameter: any): void
}

export class AnimationEvent {
  name: string;
  triggerTime: number;
  fnCallback: AnimationEventCallback;
  context: any;
  parameter: any;
  triggered: boolean;

  constructor(name: string, time: number, fnCallback: AnimationEventCallback, context: any, parameter: any) {
    this.name = name;
    this.triggerTime = time;
    this.fnCallback = fnCallback;
    this.context = context || this;
    this.parameter = parameter;
    this.triggered = false;
  }

  invoke() {
    if (this.fnCallback) {
      this.fnCallback.call(this.context, this.parameter);
      this.triggered = true;
    }
  }
}

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
