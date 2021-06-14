import * as pc from "playcanvas";
import { AnimationComponent } from "./AnimationComponent";
import { Timeline } from "./Timeline";
import { ShaderChunks } from "./ShaderChunks";
import { init_overlay, select_remove_options, select_add_option, gltf_clone_setpos_playclip } from "./utils";
import { loadGlb, loadGltf } from "./playcanvas-gltf";
import { AnimationClip } from "./AnimationClip";
import { DebugLines } from "./DebugLines";
import { calcMeshBoundingBox } from "./utils_bbox";
import { Ui } from "./Ui";

declare var viewer: Viewer;

var decoderModule: any;

export class Viewer {
  onlyLoadAnimations: boolean;
  app: pc.Application;
  camera: pc.Entity;
  playing: boolean;
  overlay: any;
  timeline: Timeline;
  shaderChunks: ShaderChunks;
  gltf: pc.Entity;
  asset: any;
  textures: any;
  animationClips: AnimationClip[];
  anim_info: HTMLElement;
  anim_select: HTMLSelectElement;
  anim_slider: HTMLInputElement;
  anim_pause: HTMLElement;
  cameraPosition: pc.Vec3;
  clip: AnimationClip;
  ui: Ui;
  firstFrame = true;
  dirtyBounds = true;
  debugBounds: DebugLines;
  
  _showBounds = true;
  get showBounds() {
    return this._showBounds;
  }
  set showBounds(newValue) {
    this.dirtyBounds = true;
    this._showBounds = newValue;
    this.ui.uiViewer.update();
  }

  constructor() {
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    var app = new pc.Application(canvas, {
      mouse: new pc.Mouse(document.body),
      keyboard: new pc.Keyboard(window),
      vr: true
    });
    app.start();

    // Fill the available space at full resolution
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    app.scene.gammaCorrection = pc.GAMMA_SRGB;
    app.scene.toneMapping = pc.TONEMAP_ACES;

    // Ensure canvas is resized when window changes size
    window.addEventListener('resize', function() {
      app.resizeCanvas();
    });

    // Create camera entity
    var camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      fov: 45.8366
    });
    camera.addComponent('script');
    camera.setPosition(0, 0, 1);
    app.root.addChild(camera);

    // Make the camera interactive
    app.assets.loadFromUrl('./src/orbit-camera.js', 'script', function (err, asset) {
      camera.script.create('orbitCamera');
      camera.script.create('keyboardInput');
      camera.script.create('mouseInput');

      if (this.cameraPosition) {
        camera.script.orbitCamera.distance = this.cameraPosition.length();
      } else if (this.gltf) {
        camera.script.orbitCamera.focusEntity = this.gltf;
      }
    }.bind(this));

    // Create directional light entity
    var light = new pc.Entity('light');
    light.addComponent('light');
    light.setEulerAngles(45, 0, 0);
    app.root.addChild(light);

    // Set a prefiltered cubemap as the skybox
    var cubemapAsset = new pc.Asset('helipad', 'cubemap', {
      url: "./assets/cubemap/6079289/Helipad.dds"
    }, {
      "textures": [
        "./assets/cubemap/6079292/Helipad_posx.png",
        "./assets/cubemap/6079290/Helipad_negx.png",
        "./assets/cubemap/6079293/Helipad_posy.png",
        "./assets/cubemap/6079298/Helipad_negy.png",
        "./assets/cubemap/6079294/Helipad_posz.png",
        "./assets/cubemap/6079300/Helipad_negz.png"
      ],
      "magFilter": 1,
      "minFilter": 5,
      "anisotropy": 1,
      "name": "Helipad",
      "rgbm": true,
      "prefiltered": "Helipad.dds"
    });
    app.assets.add(cubemapAsset);
    app.assets.load(cubemapAsset);
    cubemapAsset.ready(function () {
      app.scene.skyboxMip = 2;
      app.scene.setSkybox(cubemapAsset.resources);
    });

    this.app = app;
    this.camera = camera;
    this.playing = true; // for play/pause button
    this.overlay = init_overlay();
    this.setupAnimControls();
    this.timeline = new Timeline();

    this.shaderChunks = new ShaderChunks();
    
    // Press 'D' to delete the currently loaded model
    app.on('update', function (this: Viewer) {
      if (typeof viewer != "undefined" && viewer.shaderChunks.enabled == false && this.app.keyboard.wasPressed(pc.KEY_D)) {
        this.destroyScene();
      }
      if (this.gltf && this.gltf.animComponent) {
        // mirror the playback time of the playing clip into the html range slider
        var curTime = this.gltf.animComponent.getCurrentClip().session.curTime;
        this.anim_slider.value = curTime;
      }
      this.timeline.render();
    }, this);

    this.debugBounds = new DebugLines(app, camera);

    app.on('prerender', this.onPrerender, this);
    app.on('frameend', this.onFrameend, this);

    // Setup Ui
    this.ui = new Ui(this.app, this);
  }

  onPrerender() {
    // debug bounds
    if (this.dirtyBounds) {
      this.dirtyBounds = false;
      this.debugBounds.clear();
      if (this._showBounds) {
          const bbox = calcMeshBoundingBox(this.meshInstances);
          this.debugBounds.box(bbox.getMin(), bbox.getMax());
      }
      this.debugBounds.update();
    }
  }

  onFrameend() {
    if (this.firstFrame) {
      this.firstFrame = false;
      // focus camera after first frame otherwise skinned model bounding
      // boxes are incorrect
      this.focusCamera();
      this.dirtyBounds = true;
      //this.renderNextFrame();
    }
  }

  destroyScene() {
    if (this.textures) {
      this.textures.forEach(function (texture) {
        texture.destroy();
      });
    }

    // First destroy the glTF entity...
    if (this.gltf) {
      if (this.gltf.animComponent) {
        this.gltf.animComponent.stopClip();
      }
      if (this.camera.script.orbitCamera.focusEntity) {
        this.camera.script.orbitCamera.focusEntity = null;
      }
      this.gltf.destroy();
    }

    // ...then destroy the asset. If not done in this order,
    // the entity will be retained by the JS engine.
    if (this.asset) {
      this.app.assets.remove(this.asset);
      this.asset.unload();
    }

    // Blow away all properties holding the loaded scene
    delete this.asset;
    delete this.textures;
    delete this.animationClips;
    delete this.gltf;

    this.dirtyBounds = true;
    this.firstFrame = true;

    this.ui.hierarchy.update();
    this.deleteClones();
  }

  initializeScene(err, res) {
    var model = res.model;
    var textures = res.textures;
    var animationClips = res.animations;

    if (!this.onlyLoadAnimations) {
      // Blow away whatever is currently loaded
      this.destroyScene();

      // Wrap the model as an asset and add to the asset registry
      var asset = new pc.Asset('gltf', 'model', {
        url: ''
      });
      asset.resource = model;
      asset.loaded = true;
      this.app.assets.add(asset);

      // Store the loaded resources
      this.asset = asset;
      this.textures = textures;

      // Add the loaded scene to the hierarchy
      this.gltf = new pc.Entity('gltf');
      this.gltf.addComponent('model', {
        asset: asset
      });
      this.app.root.addChild(this.gltf);

      // Now that the model is created, after translateAnimation, we have to hook here
      if (animationClips) {
        for (i = 0; i < animationClips.length; i++) {
          for(var c = 0; c < animationClips[i].animCurves.length; c++) {
            var animTarget = animationClips[i].animTargets[c];
            if (animTarget.targetNode === "model")
              animTarget.targetNode = this.gltf;
          }
        }
      }
    }

    // Load any animations
    if (animationClips && animationClips.length > 0) {
      this.animationClips = animationClips;

      // If we don't already have an animation component, create one.
      // Note that this isn't really a 'true' component like those
      // found in the engine...
      if (!this.gltf.animComponent) {
        this.gltf.animComponent = new AnimationComponent();
      }

      // Add all animations to the model's animation component
      for (i = 0; i < animationClips.length; i++) {
        animationClips[i].transferToRoot(this.gltf);
        this.gltf.animComponent.addClip(animationClips[i]);
      }
      this.gltf.animComponent.curClip = animationClips[0].name;
      this.pauseAnimationClips();
      this.playCurrentAnimationClip();
      
      select_remove_options(this.anim_select);
      for (var i = 0; i < animationClips.length; i++) {
        select_add_option(this.anim_select, animationClips[i].name);
      }
      this.anim_info.innerHTML = animationClips.length + " animation clips loaded";
    }    
  }

  focusCamera() {
    // Focus the camera on the newly loaded scene
    if (this.camera.script.orbitCamera) {
      if (this.cameraPosition) {
        this.camera.script.orbitCamera.distance = this.cameraPosition.length();
      } else {
        this.camera.script.orbitCamera.focusEntity = this.gltf;
      }
    }
  }

  loadGlb(arrayBuffer: ArrayBuffer) {
    loadGlb(arrayBuffer, this.app.graphicsDevice, this.initializeScene.bind(this));
  }

  loadGltf(gltf, basePath, processUri) {
    loadGltf(gltf, this.app.graphicsDevice, this.initializeScene.bind(this), {
      decoderModule: decoderModule,
      basePath: basePath,
      processUri: processUri
    });
  }
  
  pauseAnimationClips() {
    if (this.gltf && this.gltf.animComponent) {
      this.gltf.animComponent.pauseAll();
      this.playing = false;
      this.anim_pause.value = ">";
    }
  }
  
  resumeCurrentAnimationClip() {
    if (this.gltf && this.gltf.animComponent) {
      var clip = this.gltf.animComponent.getCurrentClip();
      clip.resume();
      this.anim_slider.max = clip.duration;
      this.playing = true;
      this.anim_pause.value = "||";
      this.clip = clip; // quick access for f12 devtools
      this.timeline.resize();
    }
  }

  playCurrentAnimationClip() {
    if (this.gltf && this.gltf.animComponent) {
      //this.gltf.animComponent.getCurrentClip().resume(); // resume doesn't work yet
      var clip = this.gltf.animComponent.getCurrentClip();
      clip.play(); // just play it again, until resume() works
      this.anim_slider.max = clip.duration;
      this.playing = true;
      this.anim_pause.value = "||";
      this.clip = clip; // quick access for f12 devtools
      this.timeline.resize();
    }
  }
  
  togglePlayPauseAnimation() {
    if (this.playing) {
      this.pauseAnimationClips();
    } else {
      this.resumeCurrentAnimationClip();
    }
  }
  
  pauseAnimationsAndSeekToTime(curTime) {
    if (this.gltf && this.gltf.animComponent) {
      // once we seek into the animation, stop the default playing
      this.pauseAnimationClips();
      // now set the seeked time for the last played clip
      var clip = this.gltf.animComponent.getCurrentClip();
      var session = clip.session;
      var self = session;
      session.curTime = curTime;
      self.showAt(self.curTime, self.fadeDir, self.fadeBegTime, self.fadeEndTime, self.fadeTime);
      self.invokeByTime(self.curTime);
    } else {
      this.anim_info.innerHTML = "please load a gltf with animation clips";
    }
  }
  
  switchToClipByName(clipName) {
    if (this.gltf && this.gltf.animComponent) {
      var clip = this.gltf.animComponent.animClipsMap[clipName];
      this.anim_info.innerHTML = clip.duration + "s " + clipName;
      this.gltf.animComponent.curClip = clipName;
      this.pauseAnimationClips();
      this.playCurrentAnimationClip();
    } else {
      this.anim_info.innerHTML = "please load a gltf with animation clips";
    }
  }
  
  setupAnimControls() {
    this.anim_select = document.getElementById("anim_select");
    this.anim_select.onchange = function(e) {
      var clipName = this.anim_select.value;
      this.switchToClipByName(clipName);
    }.bind(this);
    
    this.anim_slider = document.getElementById("anim_slider");
    this.anim_slider.oninput = function(e) {
      var curTime = Number(this.anim_slider.value);
      this.pauseAnimationsAndSeekToTime(curTime);
    }.bind(this);
    
    this.anim_pause = document.getElementById("anim_pause");
    this.anim_pause.onclick = function(e) {
      this.togglePlayPauseAnimation();
    }.bind(this);
    
    this.anim_info = document.getElementById("anim_info");

    window.onresize = function () {
      this.timeline.resize();
      this.shaderChunks.resize();
    }.bind(this);
  }
  
  log(msg: string) {
    this.anim_info.innerHTML = msg;
  }

  get models() {
    var models: pc.ModelComponent[];
    var app: pc.Application;
    // #########################
    app = this.app;
    models = [];
    // #########################
    app.root.forEach(function (e) {
      if (e.model) {
        models.push(e.model);
      }
    });
    return models;
  }

  get meshInstances() {
    var all: pc.MeshInstance[];
    var app: pc.Application;
    var model: pc.ModelComponent;
    // #########################
    all = [];
    app = this.app;
    // #########################
    app.root.forEach(function (e) {
      model = e.model;
      if (model && model.meshInstances) {
        all.push(...e.model.meshInstances);
      }
    });
    return all;
  }

  
  clones: pc.Entity = undefined;
  clonesNextHeight = 0;

  deleteClones() {
    this.clonesNextHeight = 0;
  }

  /**
   * @summary
   * clones the current viewer.gltf 64 times
   * 8 rows, 8 cols
   * useful for performance tracing
   */

  spawn8x8() {
    if (!this.gltf) {
      console.log('spawn8x8> nothing to clone');
      return;
    }
    if (typeof this.clones == 'undefined') {
      this.clones = new pc.Entity('Clones');
      this.app.root.addChild(this.clones);
    }
    var entity = this.gltf;
    var padding_x = 0;
    var padding_y = 0;
    var padding_z = 0;
    for (var i=0; i<entity.model.meshInstances.length; i++) {
      var aabb = entity.model.meshInstances[i].aabb;
      //console.log(aabb.halfExtents);
      padding_x = Math.max(padding_x, aabb.halfExtents.x * 2);
      padding_y = Math.max(padding_y, aabb.halfExtents.y * 2);
      padding_z = Math.max(padding_z, aabb.halfExtents.z * 2);
    }
    for (var i=1; i<=8; i++) {
      for (var j=1; j<=8; j++) {
        var clone = gltf_clone_setpos_playclip(
          entity,
          i * padding_x,     // x
          this.clonesNextHeight,  // y
          j * padding_z * -1 // z
        );
        this.clones.addChild(clone);
      }
    }
    this.clonesNextHeight += padding_y;
  }
}

function getParameterByName(name: string, url: string) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function loadScript(src: string) {
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = src;
  return new Promise(function (resolve) {
    script.onload = resolve;
    head.appendChild(script);
  });
}

export function main() {
  if (typeof WebAssembly !== 'object') {
    loadScript('../draco/draco_decoder.js').then(function () {
      decoderModule = DracoDecoderModule();
    });
  } else {
    loadScript('../draco/draco_wasm_wrapper.js').then(function () {
      fetch('../draco/draco_decoder.wasm').then(function (response) {
        response.arrayBuffer().then(function (arrayBuffer) {
          decoderModule = DracoDecoderModule({ wasmBinary: arrayBuffer });
        });
      });
    });
  }

  var viewer = new Viewer();
  Object.assign(window, {viewer});

  var assetUrl = getParameterByName('assetUrl');
  if (assetUrl) {
    if (assetUrl.endsWith('gltf')) {
      fetch(assetUrl)
        .then(function(response) {
          response.json().then(function(gltf) {
            var basePath = assetUrl.substring(0, assetUrl.lastIndexOf('/')) + "/";
            viewer.loadGltf(gltf, basePath);
          });
        });
    } else if (assetUrl.endsWith('glb')) {
      fetch(assetUrl)
        .then(function(response) {
          response.arrayBuffer().then(function(glb) {
            viewer.loadGlb(glb);
          });
        });
    }
  }

  var cameraPosition = getParameterByName('cameraPosition');
  if (cameraPosition) {
    var pos = cameraPosition.split(',').map(Number);
    if (pos.length === 3) {
      viewer.cameraPosition = new pc.Vec3(pos);
    }
  }

  // Handle dropped GLB/GLTF files
  document.addEventListener('dragover', function (event) {
    event.preventDefault();
  }, false);

  document.addEventListener('drop', function (event) {
    event.preventDefault();

    var dropzone = document.getElementById('dropzone');
    dropzone.style.display = 'none';

    viewer.onlyLoadAnimations = event.ctrlKey;

    var loadFile = function (file, availableFiles) {
      var processUri = function (uri, success) {
        for (var filename in availableFiles) {
          if (filename.endsWith(uri)) {
            if (uri.endsWith('.bin')) {
              var fr = new FileReader();
              fr.onload = function() {
                success(fr.result);
              };
              fr.readAsArrayBuffer(availableFiles[filename]);
            } else { // ...it's an image
              var url = URL.createObjectURL(availableFiles[filename]);
              success(url);
            }
          }
        }
      };

      var fr = new FileReader();
      fr.onload = function() {
        var arrayBuffer = fr.result;
        var extension = file.name.split('.').pop();

        if (extension === 'glb') {
          viewer.loadGlb(arrayBuffer);
        } else if (extension === 'gltf') {
          var decoder = new TextDecoder('utf-8');
          var json = decoder.decode(arrayBuffer);
          var gltf = JSON.parse(json);
          viewer.loadGltf(gltf, undefined, processUri);
        }
      };
      fr.readAsArrayBuffer(file);
    };

    var getFiles = function (success) {
      var foldersRequested = 0;
      var foldersCompleted = 0;
      var filesRequested = 0;
      var filesCompleted = 0;

      var files = {};

      var loadEntries = function (entries) {
        var entry = entries.pop();
        if (entry.isFile) {
          filesRequested++;
          entry.file(function (file) {
            files[entry.fullPath] = file;
            filesCompleted++;
            if ((foldersRequested === foldersCompleted) && (filesRequested === filesCompleted)) {
              success(files);
            }
          });
          if (entries.length > 0) {
            loadEntries(entries);
          }
        } else if (entry.isDirectory) {
          foldersRequested++;
          var reader = entry.createReader();
          reader.readEntries(function (entries) {
            loadEntries(entries);
            foldersCompleted++;
            if ((foldersRequested === foldersCompleted) && (filesRequested === filesCompleted)) {
              success(files);
            }
          });
        }
      };

      var i;
      var items = event.dataTransfer.items;
      if (items) {
        var entries = [];
        for (i = 0; i < items.length; i++) {
          entries[i] = items[i].webkitGetAsEntry();
        }
        loadEntries(entries);
      }
    };

    getFiles(function (files) {
      for (var filename in files) {
        if (filename.endsWith('.gltf') || filename.endsWith('.glb')) {
          loadFile(files[filename], files);
        }
      };
    });

  }, false);
}
