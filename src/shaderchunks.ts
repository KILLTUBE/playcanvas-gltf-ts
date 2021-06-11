import { Viewer } from "./viewer";
import { textarea_fit_text, textarea_enable_tab_indent } from "./utils";

declare var viewer: Viewer;

export class ShaderChunks {
  shaderchunks: HTMLElement;
  shaderchunks_toggle: HTMLElement;
  shaderchunks_regen: HTMLElement;
  textareas: {[name: string]: HTMLTextAreaElement};
  enabled: boolean;

  constructor() {
    this.shaderchunks = document.getElementById("shaderchunks");
    
    this.shaderchunks_toggle = document.getElementById("shaderchunks_toggle");
    this.shaderchunks_toggle.onclick = function(e) {
      this.toggle();
    }.bind(this);
    
    this.shaderchunks_regen = document.getElementById("shaderchunks_regen");
    this.shaderchunks_regen.onclick = function(e) {
      this.regenerateShaders();
    }.bind(this);
    
    this.textareas = {};
    for (var name in pc.shaderChunks) {
      var shaderChunk = pc.shaderChunks[name];
      if (typeof shaderChunk !== "string") // there are a few functions
        continue;
      // add text
      var text = document.createElement("div");
      text.innerHTML = name;
      this.shaderchunks.appendChild(text);
      // add textarea
      var textarea = document.createElement("textarea");
      textarea.spellcheck = false;
      textarea.value = shaderChunk;
      textarea_fit_text(textarea);
      textarea_enable_tab_indent(textarea);
      textarea.shaderChunkName = name;
      textarea.originalShaderChunk = shaderChunk;
      textarea.oninput = function (e) {
        // immediately mirror textarea edits into pc.shaderChunks
        pc.shaderChunks[this.shaderChunkName] = this.value;
        //console.log(this.shaderChunkName, this.value);
      }
      this.textareas[name] = textarea;
      this.shaderchunks.appendChild(textarea);
    }
    this.shaderchunks.style.position = "absolute";
    this.shaderchunks.style.left = "0px";
    this.shaderchunks.style.top = "40px";
    this.shaderchunks.style.overflowY = "scroll";
    this.resize();
    this.disable();
  }

  enable() {
    this.shaderchunks.style.display = "";
    this.shaderchunks_regen.style.display = "";
    this.shaderchunks_toggle.value = "Hide ShaderChunks";
    this.enabled = true;
  }

  disable() {
    this.shaderchunks.style.display = "none";
    this.shaderchunks_regen.style.display = "none";
    this.shaderchunks_toggle.value = "Show ShaderChunks";
    this.enabled = false;
  }

  toggle() {
    if (this.enabled)
      this.disable();
    else
      this.enable();
  }

  resize() {
    this.shaderchunks.style.width = window.innerWidth + "px";
    this.shaderchunks.style.height = (window.innerHeight - 40) + "px";
  }

  regenerateShaders() {
    if (viewer.gltf == undefined) {
      viewer.log("please load a model first");
      return;
    }
    pc.app.graphicsDevice.programLib._cache = {};
    var n = viewer.gltf.model.meshInstances.length;
    for (var i=0; i<n; i++) {
      var meshInstance = viewer.gltf.model.meshInstances[i];
      meshInstance.material.clearVariants();
    }
  }
}
