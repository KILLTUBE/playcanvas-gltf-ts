import { AnimationCurve } from "./AnimationCurve";
import { AnimationKeyable } from "./AnimationKeyable";
import { Viewer } from "./viewer";

declare var viewer: Viewer;

export class Timeline {
  curveHeight: number;
  colorLines: string;
  colorLinesHovered: string;
  colorRectHovered: string;
  colorRectSelected: string;
  colorLineSlider: string;
  //anim_timeline_toggle: HTMLElement;
  anim_timeline: HTMLCanvasElement;
  anim_timeline_context: CanvasRenderingContext2D;
  enabled: boolean;
  curve_id: number;
  animkey_id: number;
  hoveredCurve: AnimationCurve;
  hoveredAnimKey: AnimationKeyable;
  selectedCurve: AnimationCurve;
  selectedAnimKey: AnimationKeyable;

  constructor() {
    this.curveHeight = 12;
    this.colorLines        = "rgba(0,0,  0, 0.4)"; // grayish
    this.colorLinesHovered = "rgba(0,0,255, 0.8)"; // quite blue
    this.colorRectHovered  = "rgba(0,0,255, 0.1)"; // blueish transparent
    this.colorRectSelected = "rgba(0,255,0, 0.1)"; // greenish transparent
    this.colorLineSlider   = "white";
    
    //this.anim_timeline_toggle = document.getElementById("anim_timeline_toggle");
    //this.anim_timeline_toggle.onclick = function(e) {
    //  this.toggle();
    //}.bind(this);
    
    this.anim_timeline = document.getElementById("anim_timeline") as HTMLCanvasElement;
    this.anim_timeline_context = this.anim_timeline.getContext("2d");
    this.anim_timeline.onmousemove = function(e: MouseEvent) {
      var pos_left = e.pageX - e.currentTarget.offsetLeft;
      var pos_top  = e.pageY - e.currentTarget.offsetTop;
      this.mouseMove(pos_left, pos_top);
    }.bind(this);
    this.anim_timeline.onmousedown = function(/*this: Timeline,*/ e: MouseEvent) {
      //var target = this.anim_timeline;
      var pos_left = e.pageX - e.currentTarget.offsetLeft;
      var pos_top  = e.pageY - e.currentTarget.offsetTop;
      if (e.button == 0) {
        this.mouseClickLeft(pos_left, pos_top);
      }
      if (e.button == 1) {
        this.mouseClickMiddle(pos_left, pos_top);
      }
      if (e.button == 2) {
        this.mouseClickRight(pos_left, pos_top);
      }
      e.preventDefault();
    }.bind(this);
    this.anim_timeline.onmouseleave = function(e) {
      this.hoveredCurve = undefined;
      this.hoveredAnimKey = undefined;
    }.bind(this);
    this.disable();
  }

  resize() {
    var needPixels = 0;
    if (this.enabled && viewer.gltf && viewer.gltf.animComponent) {
      needPixels = viewer.clip.animCurves.length * this.curveHeight;
      //console.log("needPixels", needPixels);
      var thirdOfScreen = window.innerHeight / 3; // use max 1/3 of all height
      if (needPixels > thirdOfScreen) {
        // if all animation curves dont fit into third of screen, just ignore the rest
        // either implement scrolling or decrease this.curveHeight automatically
        needPixels = thirdOfScreen;
      } else {
        // smallest timeline height possible, keep this
      }
    }
    this.anim_timeline.width = window.innerWidth;
    this.anim_timeline.height = needPixels;
    this.anim_timeline.style.top = (window.innerHeight - needPixels) + "px";
  }

  enable() {
    this.anim_timeline.style.display = "";
    this.enabled = true;
    //this.anim_timeline_toggle.value = "Hide Timeline";
    this.resize();
    if ( (viewer.gltf && viewer.gltf.animComponent) === undefined) {
      viewer.log("please load a gltf/glb with animation data to see the timeline \uD83C\uDF4B");
    }
  }

  disable() {
    this.anim_timeline.style.display = "none";
    this.enabled = false;
    //this.anim_timeline_toggle.value = "Show Timeline";
    this.resize();
  }

  toggle() {
    if (this.enabled)
      this.disable();
    else
      this.enable();
  }

  mouseMove(left: number, top: number) {
    if (viewer.clip === undefined) {
      return;
    }
    this.curve_id = Math.floor(top / this.curveHeight);
    var curve = viewer.clip.animCurves[this.curve_id];
    if (curve !== undefined) {
      var eg250 = window.innerWidth / curve.animKeys.length; // 1000px / 4 animkeys
      this.animkey_id = Math.floor(left / eg250);
      var animKey = curve.animKeys[this.animkey_id];
      this.hoveredCurve = curve;
      this.hoveredAnimKey = animKey;
    }
  }

  mouseClickLeft(left: number, top: number) {
    this.selectedCurve   = this.hoveredCurve;
    this.selectedAnimKey   = this.hoveredAnimKey;
    if (viewer.gltf && viewer.gltf.animComponent) {
      var msg = "open f12/devtools and check <code>viewer.selectedAnimKey</code> or ";
      msg += "<code>";
      if (this.curve_id !== undefined)
        msg += "viewer.clip.animCurves[" + this.curve_id + "]";
      if (this.animkey_id !== undefined)
        msg += ".animKeys[" + this.animkey_id + "]";
      msg += "</code> \uD83D\uDD75";
      viewer.log(msg);
    } else {
      viewer.log("please load a gltf/glb with animation data to use the timeline \uD83C\uDF4B");
    }
  }

  mouseClickMiddle(left: number, top: number) {
    viewer.log("scrolling not implemented yet \uD83D\uDE09");
  }

  mouseClickRight(left: number, top: number) {
    viewer.log("what happens on rightclick? \uD83E\uDD14");
  }

  render() {
    if (this.enabled === false) {
      return;
    }
    if (!(viewer.gltf && viewer.gltf.animComponent)) {
      viewer.log('Timeline#render> nothing to render');
      return;
    }
    var ctx = this.anim_timeline_context;
    var clip = viewer.gltf.animComponent.getCurrentClip();
    var canvasWidth = ctx.canvas.width;
    var multiplier = canvasWidth / clip.duration; // multiply with this for animKey.time to canvas "left"
    var left = 0;
    var top = 0;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = 1;
    for (var animcurve_id = 0; animcurve_id < clip.animCurves.length; animcurve_id++) {
      var animCurve = clip.animCurves[animcurve_id];
      var linecolor = this.colorLines;
      if (animCurve == this.hoveredCurve) {
        linecolor = this.colorLinesHovered;
      }
      var steptime = clip.duration / animCurve.animKeys.length;
      var eg250 = canvasWidth / animCurve.animKeys.length;
      for (var animkey_id=0; animkey_id<animCurve.animKeys.length; animkey_id++) {
        var animKey = animCurve.animKeys[animkey_id];
        var left = animkey_id * eg250;
        if (left != 0) { // don't draw a marker line on left==0px
          ctx.beginPath();
          ctx.strokeStyle = linecolor;
          ctx.moveTo(left, top);
          ctx.lineTo(left, top + this.curveHeight);
          ctx.stroke();
        }
        if (animKey == this.hoveredAnimKey) {
          ctx.beginPath();
          ctx.fillStyle = this.colorRectHovered;
          ctx.fillRect( // left, top, width, height
            left + 1, top + 1,
            eg250 - 2, this.curveHeight - 2
          );
          ctx.stroke();
        }
        if (animKey == this.selectedAnimKey) {
          ctx.beginPath();
          ctx.fillStyle = this.colorRectSelected;
          ctx.fillRect( // left, top, width, height
            left + 1, top + 1,
            eg250 - 2, this.curveHeight - 2
          );
          ctx.stroke();
        }
      }
      top += this.curveHeight;
    }
    // draw the time slider position
    var slider_left = clip.session.curTime * multiplier;
    ctx.strokeStyle = this.colorLineSlider;
    ctx.beginPath();
    ctx.moveTo(slider_left, 0);
    ctx.lineTo(slider_left, ctx.canvas.height);
    ctx.stroke();
  }
}
