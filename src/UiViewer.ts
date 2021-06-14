import * as pc from "playcanvas";
import * as pcui from '@playcanvas/pcui';
import { Viewer } from "./viewer";

export class UiViewer {
    app: pc.Application;
    parent: pcui.Element;
    viewer: Viewer;
    spawn8x8: pcui.Button;
    bounds: pcui.BooleanInput;

    constructor(app: pc.Application, parent: pcui.Element, viewer: Viewer) {
        this.app = app;
        this.parent = parent;
        this.viewer = viewer;
        this.appendSpawn8x8();
        this.appendBounds();
    }

    appendSpawn8x8() {
        var button = new pcui.Button({
            text: 'Spawn 8x8'
        });
        this.parent.append(button);
        button.on('click', e => {
            this.viewer.spawn8x8();
        });
        this.spawn8x8 = button;
    }

    appendBounds() {
        var element = new pcui.BooleanInput({
            text: 'Bounds',
            type: 'toggle',
            value: this.viewer.showBounds
        });
        element.on('click', function(e: MouseEvent) {
            //console.log('Bounds New Value: ', element.value);
            this.viewer.showBounds = element.value;
        }.bind(this));
        this.parent.append(element);
        this.bounds = element;
    }

    update() {
        this.bounds.value = this.viewer.showBounds;
    }
}
