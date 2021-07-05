/*
tsd(entity.script.scripts[0], 'ScriptTypeOrbitCamera');
*/

interface ScriptTypeOrbitCamera {
  _callbacks: object;
  _callbackActive: object;
  app: Application;
  entity: Entity;
  _enabled: boolean;
  _enabledOld: boolean;
  __destroyed: boolean;
  __attributes: object;
  __attributesRaw: object;
  __scriptType: Function;
  __executionOrder: number;
  _initialized: boolean;
  _modelsAabb: BoundingBox;
  _pivotPoint: Vec3;
  _yaw: number;
  _pitch: number;
  _distance: number;
  _targetYaw: number;
  _targetPitch: number;
  _targetDistance: number;
  _postInitialized: boolean;
}

// tsd(entity.script.scripts[1].__scriptType);


// tsd(entity, 'Entity');

interface Entity {
  _callbacks: object;
  _callbackActive: object;
  name: string;
  tags: pc.Tags;
  _labels: object;
  localPosition: pc.Vec3;
  localRotation: pc.Quat;
  localScale: pc.Vec3;
  localEulerAngles: pc.Vec3;
  position: pc.Vec3;
  rotation: pc.Quat;
  eulerAngles: pc.Vec3;
  _scale: object;
  localTransform: pc.Mat4;
  _dirtyLocal: boolean;
  _aabbVer: number;
  _frozen: boolean;
  worldTransform: pc.Mat4;
  _dirtyWorld: boolean;
  normalMatrix: pc.Mat3;
  _dirtyNormal: boolean;
  _right: object;
  _up: object;
  _forward: pc.Vec3;
  _parent: pc.Entity;
  _children: [];
  _graphDepth: number;
  _enabled: boolean;
  _enabledInHierarchy: boolean;
  scaleCompensation: boolean;
  _batchHandle: object;
  c: object;
  _app: pc.Application;
  _guid: string;
  _destroying: boolean;
  _template: boolean;
  camera: pc.CameraComponent;
  script: pc.ScriptComponent;
  _beingEnabled: boolean;
  treeViewItem: TreeViewItem;
}

// tsd(entity.treeViewItem, 'TreeViewItem');

interface TreeViewItem {
  _suspendEvents: boolean;
  _destroyed: boolean;
  _parent: TreeView;
  _domEventClick: Function;
  _domEventMouseOver: Function;
  _domEventMouseOut: Function;
  _eventsParent: [];
  _dom: HTMLDivElement;
  _enabled: boolean;
  _hiddenParents: boolean;
  _hidden: boolean;
  _readOnly: boolean;
  _ignoreParent: boolean;
  _flashTimeout: object;
  _domEventScroll: Function;
  _domContent: HTMLDivElement;
  _scrollable: boolean;
  _flex: boolean;
  _grid: boolean;
  _domResizeHandle: object;
  _domEventResizeStart: Function;
  _domEventResizeMove: Function;
  _domEventResizeEnd: Function;
  _domEventResizeTouchStart: Function;
  _domEventResizeTouchMove: Function;
  _domEventResizeTouchEnd: Function;
  _resizeTouchId: object;
  _resizeData: object;
  _resizeHorizontally: boolean;
  _resizable: object;
  _resizeMin: number;
  _resizeMax: number;
  _draggedStartIndex: number;
  _containerContents: Container;
  _labelIcon: Label;
  _labelText: Label;
  _allowSelect: boolean;
  _allowDrop: boolean;
  _allowDrag: boolean;
  _numChildren: number;
  _treeOrder: number;
  _domEvtFocus: Function;
  _domEvtBlur: Function;
  _domEvtKeyDown: Function;
  _domEvtDragStart: Function;
  _domEvtMouseDown: Function;
  _domEvtMouseUp: Function;
  _domEvtMouseOver: Function;
  _domEvtClick: Function;
  _domEvtDblClick: Function;
  _domEvtContextMenu: Function;
  entity: pc.Entity;
  _treeView: TreeView;
}

/*
entity = new pc.Entity("test");
entity.addComponent('script');
scriptType = new pc.ScriptType({app: viewer.app, entity})
tsd(scriptType);
*/

interface ScriptType {
  _callbacks: object;
  _callbackActive: object;
  app: Application;
  entity: Entity;
  _enabled: boolean;
  _enabledOld: boolean;
  __destroyed: boolean;
  __attributes: object;
  __attributesRaw: object;
  __scriptType: Function;
  __executionOrder: number;
}
