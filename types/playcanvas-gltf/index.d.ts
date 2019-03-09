
// extend playcanvas-typings
declare namespace pc {
    interface Vec3 {
        [prop: string]: any;
    }
    interface GraphNode {
        name: string;
        [prop: string]: any;
    }
}

declare interface AnimationKeyable {
    type: AnimationKeyableType;
    time: number;
    value: BlendValue;
    outTangent: SingleDOF;
    inTangent: SingleDOF;
    _cacheKeyIdx: number;
    normalize(): void;
    clone(): AnimationKeyable;
    copy(other: AnimationKeyable): AnimationKeyable;
    linearBlend(from: AnimationKeyable, to: AnimationKeyable, alpha: number): AnimationKeyable;
}

declare interface AnimationKeyableNum {
    type: AnimationKeyableType;
    time: number;
    value: number;
}

declare interface AnimationKeyableVec {
    type: AnimationKeyableType;
    time: number;
    value: pc.Vec3;
}

declare interface AnimationKeyableQuat {
    type: AnimationKeyableType;
    time: number;
    value: pc.Quat;
}

declare interface AnimationKeyableNumCubicSpline {
    type: AnimationKeyableType;
    time: number;
    value: number;
    inTangent: number;
    outTangent: number;
}

declare interface AnimationKeyableVecCubicSpline {
    type: AnimationKeyableType;
    time: number;
    value: pc.Vec3;
    inTangent: pc.Vec3;
    outTangent: pc.Vec3;
}

declare interface AnimationKeyableQuatCubicSpline {
    type: AnimationKeyableType;
    time: number;
    value: pc.Quat;
    inTangent: pc.Quat;
    outTangent: pc.Quat;
}

declare interface AnimationEventCallback {
    (context: any, parameter: any): void
}

declare interface AnimationTarget {
    vScale?: pc.Vec3 | number[];
    targetNode: pc.GraphNode;
    targetPath: TargetPath;
    targetProp: string;
}

declare type SingleDOF = number | pc.Vec2 | pc.Vec3 | pc.Vec4 | pc.Quat;
declare type BlendValue = SingleDOF | Playable;
declare type AnimationInput = AnimationCurve | AnimationKeyable | AnimationClip | AnimationClipSnapshot;

declare type Blendable = AnimationKeyable | BlendValue;

// looks like: {
//     ...
//     curve13: 106,
//     curve14: 106,
//     curve15: 106,
//     curve16: 66,
//     curve17: 105,
//     curve18: 106,
//     ...
// }
declare type MapStringToNumber = {[curvenum: string]: number};

declare interface Playable {
    session: AnimationSession;
    bySpeed: number;
    loop: boolean;
    getAnimTargets(): AnimationTargetsMap;
    eval_cache(time: number, cacheKeyIdx: any, cacheValue: any): any;
}

declare class AnimationCurve implements Playable {
    name: number;
    type: AnimationCurveType;
    tension: number;
    duration: number;
    keyableType: AnimationKeyableType;
    animTargets: AnimationTarget[];
    animKeys: AnimationKeyable[];
    session: AnimationCurveSession;
    getAnimTargets(): AnimationTargetsMap;
}

declare class AnimationClipSnapshot {
    curveKeyable: AnimationKeyable[];
    time: number;
    _cacheKeyIdx: MapStringToNumber;
}

// todo: rename AnimationEvent (name collision with CSS)
declare interface AnimationEvent {
    name: string;
    triggerTime: number;
    fnCallback: AnimationEventCallback;
}

declare class AnimationClip implements Playable {
    name: string;
    duration: number;
    animCurves: AnimationCurve[];
    session: AnimationSession;
    root: pc.GraphNode;
    getAnimTargets(): AnimationTargetsMap;
}

declare interface AnimationSession {
    animTargets: AnimationTargetsMap;
    _cacheKeyIdx: number | object;
    speed: number;
    blendables: {[curveName: string]: Blendable};
    _cacheBlendValues: {[name: string]: AnimationClipSnapshot | AnimationKeyable};
    blendWeights: {[name: string]: Playable};
    animEvents: AnimationEvent[];
    onTimer: (dt: number) => void;
    _allocatePlayableCache(): Playable;
}

declare interface AnimationCurveSession {
    begTime: number;
    endTime: number;
    curTime: number;
    accTime: number;
    bySpeed: number;
    isPlaying: boolean;
    playable: AnimationCurve;
    animTargets: AnimationTargetsMap;
    _cacheKeyIdx: number;
    speed: number;
    blendables: {[curveName: string]: Blendable};
    _cacheBlendValues: {[name: string]: AnimationKeyable};
    blendWeights: {[name: string]: AnimationCurve};
    animEvents: AnimationEvent[];
    onTimer: (dt: number) => void;
    _allocatePlayableCache(): AnimationCurve;
}

declare interface AnimationComponent {
    animClips: AnimationClip[];
    animClipsMap: {[clipname: string]: AnimationClip};
    animSessions: {[sessionname: string]: AnimationSession};
}

declare interface AnimationTargetsMap {
    [name: string]: AnimationTarget[];
}

declare interface AnimationCurveMap {
    [name: number]: AnimationCurve;
}
