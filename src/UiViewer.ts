import * as pc from "playcanvas";
import * as pcui from '@playcanvas/pcui';
import { Viewer } from "./viewer";

declare var viewer: Viewer;

export class UiViewer {
    app: pc.Application;
    parent: pcui.Element;

    constructor(app: pc.Application, parent: pcui.Element) {
        this.app = app;
        this.parent = parent;
        this.appendSpawn8x8();
        this.appendBounds();
    }

    appendSpawn8x8() {
        var button = new pcui.Button({
            text: 'Spawn 8x8'
        });
        this.parent.append(button);
        button.on('click', e => {
            viewer.spawn8x8();
        })
    }

    appendBounds() {
        var element = new pcui.BooleanInput({
            text: 'Bounds',
            type: 'toggle'
        });
        element.on('click', function(e: MouseEvent) {
            //console.log('Bounds New Value: ', element.value);
            viewer.showBounds = element.value;
        })
        this.parent.append(element);
    }
}
