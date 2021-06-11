import { AnimationClip } from "./AnimationClip";
import { AnimationSession } from "./AnimationSession";
import { BlendValue } from "./Animation";

// *===============================================================================================================
// * class AnimationComponent:
// * member
// *     animClips: dictionary type, query animation clips animClips[clipName]
// *
// *===============================================================================================================

export class AnimationComponent {
  name: string;
  curClip: string;
  animClips: AnimationClip[];
  animClipsMap: {[clipname: string]: AnimationClip};
  animSessions: {[sessionname: string]: AnimationSession};

  constructor() {
    this.name = "";
    this.animClipsMap = {}; // make it a map, easy to query clip by name
    this.animClips = [];
    this.curClip = "";
    this.animSessions = {}; // For storing AnimationSessions
  }

  clipCount() {
    return this.animClips.length;
  }

  getCurrentClip(): AnimationClip {
    return this.animClipsMap[this.curClip];
  }

  clipAt(index: number): AnimationClip {
    if (this.animClips.length <= index)
      return null;
    return this.animClips[index];
  }

  addClip(clip: AnimationClip) {
    if (clip && clip.name) {
      this.animClips.push(clip);
      this.animClipsMap[clip.name] = clip;
    }
  }

  removeClip(name: string) {
    var clip = this.animClipsMap[name];
    if (clip) {
      var idx = this.animClips.indexOf(clip);
      if (idx !== -1) {
        this.animClips.splice(idx, 1);
      }
      delete this.animClipsMap[name];
    }

    if (this.curClip === name)
      this.curClip = "";
  }

  playClip(name: string) {
    var clip = this.animClipsMap[name];
    if (clip) {
      this.curClip = name;
      clip.play();
    }
  }

  stopClip() {
    var clip = this.animClipsMap[this.curClip];
    if (clip) {
      clip.stop();
      this.curClip = "";
    }
  }

  crossFadeToClip(name: string, duration: number) {
    var fromClip = this.animClipsMap[this.curClip];
    var toClip = this.animClipsMap[name];

    if (fromClip && toClip) {
      fromClip.fadeOut(duration);
      toClip.fadeIn(duration);
      this.curClip = name;
    } else if (fromClip) {
      fromClip.fadeOut(duration);
      this.curClip = "";
    } else if (toClip) {
      toClip.fadeIn(duration);
      this.curClip = name;
    }
  }

  setBlend(blendValue: BlendValue, weight: number, curveName: string) {
    var curClip = this.getCurrentClip();
    if (curClip && curClip.session)
      curClip.session.setBlend(blendValue, weight, curveName);
  }

  unsetBlend(curveName: string) {
    var curClip = this.getCurrentClip();
    if (curClip && curClip.session)
      curClip.session.unsetBlend(curveName);
  }

  getCurrentSession(): AnimationSession {
    return this.animSessions[this.curClip];
  }

  playSession(name: string) {
    var session = this.animSessions[name];
    if (session) {
      session.play();
      this.curClip = name;
    }
  }

  stopSession() {
    var session = this.animSessions[this.curClip];
    if (session) {
      session.stop();
      this.curClip = "";
    }
  }

  crossFadeToSession(name: string, duration: number) {
    var fromSession = this.animSessions[this.curClip];
    var toSession = this.animSessions[name];

    if (fromSession && this.animSessions[name]) {
      fromSession.fadeOut(duration);
      toSession.fadeIn(duration);
      this.curClip = name;
    } else if (fromSession) {
      fromSession.fadeOut(duration);
      this.curClip = "";
    } else if (toSession) {
      toSession.fadeIn(duration);
      this.curClip = name;
    }
  }

  setBlendSession(blendValue: BlendValue, weight: number, curveName: string) {
    var curSession = this.animSessions[this.curClip];
    if (curSession) {
      curSession.setBlend(blendValue, weight, curveName);
    }
  }

  unsetBlendSession(curveName: string) {
    var curSession = this.animSessions[this.curClip];
    if (curSession) {
      curSession.unsetBlend(curveName);
    }
  }

  playSubstring(substr: string) {
    var n = this.animClips.length;
    for (var i = 0; i < n; i++) {
      var clip = this.animClips[i];
      if (clip.isPlaying)
        clip.pause();
      if (clip.name.indexOf(substr) !== -1)
        clip.play();
    }
  }

  pauseAll() {
    var n = this.animClips.length;
    for (var i = 0; i < n; i++) {
      var clip = this.animClips[i];
      if (clip.isPlaying)
        clip.pause();
    }
  }
}
