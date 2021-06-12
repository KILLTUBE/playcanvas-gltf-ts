import * as pc from "playcanvas";
import * as pcui from '@playcanvas/pcui';
import { spawn8x8 } from "./utils";

export class UiViewer {
    app: pc.Application;
    parent: pcui.Element;

    constructor(app: pc.Application, parent: pcui.Element) {
        this.app = app;
        this.parent = parent;
        this.appendSpawn8x8();
    }

    appendSpawn8x8() {
        var button = new pcui.Button({text: 'Spawn 8x8'});
        this.parent.append(button);
        button.on('click', e => {
            spawn8x8();
        })
        window.button = button;
    }
}
