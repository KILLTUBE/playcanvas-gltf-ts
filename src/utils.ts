import Ammo from "../types/ammo";
import { ToDo } from "../types/todo";
import { AnimationComponent } from "./AnimationComponent";
import { loadGltf } from "./playcanvas-gltf";
import { Viewer } from "./viewer";

declare var viewer: Viewer;
declare var app: pc.Application;

export function init_overlay() {
  var overlay = document.getElementById("overlay");
  // give scripts the ability to determine if the event should be ignored
  overlay.onkeydown = function(event) {
    event.stopPropagation();
  };
  overlay.onmousedown = function(event) {
    event.stopPropagation();
  };
  overlay.onmousemove = function(event) {
    event.stopPropagation();
  };
  overlay.onmousewheel = function(event) {
    event.stopPropagation();
  };
  return overlay;
}

export function textarea_fit_text(textarea: HTMLTextAreaElement) {
  var numNewlines = 1;
  var str = textarea.value;
  for (var i=0; i<str.length; i++)
    if (str[i] == "\n")
      numNewlines++;
  textarea.style.height = (numNewlines * 16) + "px";
}

export function textarea_enable_tab_indent(textarea: HTMLTextAreaElement) {
  textarea.onkeydown = function(e) {
    if (e.keyCode == 9 || e.which == 9){
      e.preventDefault();
      var oldStart = this.selectionStart;
      var before   = this.value.substring(0, this.selectionStart);
      var selected = this.value.substring(this.selectionStart, this.selectionEnd);
      var after    = this.value.substring(this.selectionEnd);
      this.value = before + "    " + selected + after;
      this.selectionEnd = oldStart + 4;
    }
  }
}

export function select_add_option(select: HTMLSelectElement, option_text: string) {
  var option = document.createElement("option");
  option.text = option_text;
  select.add(option);
  return option;
}

export function select_remove_options(select: HTMLSelectElement) {
  for (var i=select.options.length-1; i>=0; i--)
    select.remove(i);
}

/**
 * @example
 * add_infinite_ground(new pc.Vec3(0, 1, 0), new pc.Vec3(0, 0, 0), pc.Quat.IDENTITY);
 */
export function add_infinite_ground(normal_: pc.Vec3, position_: pc.Vec3, rotation_: pc.Quat) {
  // There isn't any infinite plane in PlayCanvas (yet).
  // This just makes sure that entities aren't falling into the void.
  var normal      = new Ammo.btVector3   (  normal_.x,   normal_.y,   normal_.z             );
  var origin      = new Ammo.btVector3   (position_.x, position_.y, position_.z             );
  var rotation    = new Ammo.btQuaternion(rotation_.x, rotation_.y, rotation_.z, rotation_.w);
  var shape       = new Ammo.btStaticPlaneShape(normal, 0);
  var transform   = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(origin);
  transform.setRotation(rotation);
  var localInertia  = new Ammo.btVector3(0, 0, 0);
  var motionState   = new Ammo.btDefaultMotionState(transform);
  var rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, shape, localInertia);
  var body          = new Ammo.btRigidBody(rigidBodyInfo);
  body.entity       = new pc.Entity("dummy entity for add_infinite_ground");
  app.root.addChild(body.entity);
  app.systems.rigidbody.dynamicsWorld.addRigidBody(body);
  return body;
}

/**
 * @param {pc.Entity} entity
 * @summary
 * clones a pc.Entity including the GLTF animation component
 */

export function clone_gltf(entity: pc.Entity) {
  // 1) clone entity
  var entity_clone = entity.clone();
  for (var i=0; i<entity.model.meshInstances.length; i++) {
    // visibility of meshInstances is not cloned, update manually:
    entity_clone.model.meshInstances[i].visible = entity.model.meshInstances[i].visible;
  }
  // 2) clone existing AnimationComponent, otherwise we are done
  if (!entity.animComponent) {
    return entity_clone;
  }
  // 3) assign new AnimationComponent
  entity_clone.animComponent = new AnimationComponent();
  // 4) clone animation clips
  var numClips = entity.animComponent.animClips.length;
  var animationClips = Array(numClips);
  for (var i=0; i<numClips; i++) {
    animationClips[i] = entity.animComponent.animClips[i].clone();
  }
  // 5) assign entity_clone to each clip->curve->target
  for (var i = 0; i < animationClips.length; i++) {
    var clip = animationClips[i];
    for(var c = 0; c < clip.animCurves.length; c++) {
      var animTarget = clip.animTargets[c];
      if (animTarget.targetNode === "model")
        animTarget.targetNode = entity_clone;
    }
  }
  // 6) Add all animations to the model's animation component
  for (i = 0; i < animationClips.length; i++) {
    var clip = animationClips[i];
    clip.transferToRoot(entity_clone);
    entity_clone.animComponent.addClip(clip);
  }
  return entity_clone;
}

export function gltf_clone_setpos_playclip(gltf: pc.Entity, x: number, y: number, z: number) {
  var cloned = clone_gltf(gltf);
  cloned.enabled = true;
  cloned.setLocalPosition(x, y, z);
  if (gltf.animComponent) {
    var activeClipName = gltf.animComponent.curClip;
    var activeClip = cloned.animComponent.animClipsMap[activeClipName];
    activeClip.loop = true;
    activeClip.play();
  }
  return cloned;
}

export function enter_vr() {
  viewer.camera.camera.enterVr(function (err: any) {
    if (err) {
      console.error(err); // could not enter VR
    } else {
      // in VR!
    }
  });
}

export interface FetchGltfOptions extends Object {
  layers?: any;
};


export async function fetch_gltf(url: string, options: FetchGltfOptions) {
  var basePath = url.substring(0, url.lastIndexOf("/")) + "/";
  if (!options) {
    options = {};
  }
  if (!options.hasOwnProperty('layers')) {
    options.layers = [0]; // should be worldLayer.id
  }
  //console.log("fetch_gltf", url, options);
  return new Promise(function(resolve, reject) {
    app.assets.loadFromUrl(url, 'json', function (err: ToDo, asset: ToDo) {
      var json = asset.resource;
      var gltf = JSON.parse(json);
      loadGltf(gltf, app.graphicsDevice, function (model: ToDo, textures: ToDo, animationClips: ToDo[]) {
        var asset = new pc.Asset('gltf', 'model', {
          url: ''
        });
        asset.resource = model;
        asset.loaded = true;
        app.assets.add(asset);
        var gltf = new pc.Entity('gltf');
        gltf.addComponent('model', {
          asset: asset,
          layers: options.layers
        });
        if (animationClips && animationClips.length > 0) {
          gltf.animComponent = new AnimationComponent();
          for (var i = 0; i < animationClips.length; i++) {
            animationClips[i].transferToRoot(gltf);
            gltf.animComponent.addClip(animationClips[i]);
          }
          gltf.animComponent.playClip(animationClips[0].name);
        }
        resolve(gltf);
      }, {
        basePath
      });
    });
  })
}

/**
 * @example ```
 * function test(a, b) {
 *   console.log("test", a, b, this);
 * }
 * var delayedTest = delay(test.bind(333), 1000);
 * delayedTest(111, 222);
 * ```
 */

export function delay(callback: CallableFunction, ms: number) {
  var id = -1;
  return function() {
    //console.log("this", this);
    if (id != -1) {
      //console.log(`clearTimeout(${id})`);
      clearTimeout(id);
    }
    id = setTimeout(callback, ms, ...arguments);
    //console.log(`id = setTimeout (id = ${id})`);
  }
}
