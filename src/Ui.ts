import * as pc from "playcanvas";
import * as pcui from '@playcanvas/pcui';
import { Hierarchy } from './Hierarchy';
import { Inspector } from './Inspector';
import { UiViewer } from "./UiViewer";

export class Ui {
  app: pc.Application;
  container: pcui.Container;
  panel: pcui.Panel;
  uiViewer: UiViewer;
  inspector: Inspector;
  hierarchy: Hierarchy;

  constructor(app: pc.Application) {
    this.app = app;
    this.appendContainer();
    this.appendPanel();
    this.uiViewer = new UiViewer(this.app, this.panel.content);
    this.inspector = new Inspector(this.app, this.panel.content);
    this.hierarchy = new Hierarchy(this.app, this.panel.content);
  }

  appendContainer() {
    this.container = new pcui.Container({
        //flex: true,
        //scrollable: true
    });
    this.container.style.position = 'absolute';
    this.container.style.height = '100%';
    this.container.style.left = '0px';
    this.container.style.top = '0px';
    this.container.style.overflowY = 'auto';
    this.container.style.margin = '0';
    this.container.style.padding = '0';
    document.body.appendChild(this.container.dom);
  }

  appendPanel() {
    this.panel = new pcui.Panel({
      //flex: true,
      collapsible: true,
      collapsed: false,
      //collapsed: true,
      collapseHorizontally: true,
      removable: false,
      headerText: 'Settings',
      resizable: 'right',
      resizeMax: 600,
    });
    //this.panelMain.style.height = "100%";
    this.panel.style.width = '400px';
        
    this.panel.on('collapse', () => {
      setTimeout(()=>{
        // The panel retains the size of all the hidden children.
        // Needs to be in a timeout, otherwise no effect.
        this.panel.style.height = "400px";
      }, 20);
    });
    this.panel.on('expand', () => {
      //console.log("expand", this);
    });
    this.container.append(this.panel);
  }
}
