import * as pc from "playcanvas";
import * as pcui from '@playcanvas/pcui';
import { Viewer } from "./viewer";

export class UiViewer {
    app: pc.Application;
    parent: pcui.Element;
    viewer: Viewer;
    spawn8x8: pcui.Button;
    resetScene: pcui.Button;
    bounds: pcui.BooleanInput;
    shaderChunks: pcui.BooleanInput;
    regenerateShaderChunks: pcui.BooleanInput;
    timeline: pcui.BooleanInput;

    constructor(app: pc.Application, parent: pcui.Element, viewer: Viewer) {
        this.app = app;
        this.parent = parent;
        this.viewer = viewer;
        this.appendSpawn8x8();
        this.appendResetScene();
        this.appendBounds();
        this.appendShaderChunks();
        this.appendTimeline();
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

    appendResetScene() {
        var button = new pcui.Button({
            text: 'Reset Scene'
        });
        this.parent.append(button);
        button.on('click', e => {
            this.viewer.resetScene();
        });
        this.resetScene = button;
    }

    appendBounds() {
        var container = new pcui.Container();
        var label = new pcui.Label({text: 'Show Bounds'});
        label.style.verticalAlign = 'top';
        var element = new pcui.BooleanInput({
            text: 'Bounds',
            type: 'toggle',
            value: this.viewer.showBounds
        });
        element.on('click', function(e: MouseEvent) {
            //console.log('Bounds New Value: ', element.value);
            this.viewer.showBounds = element.value;
        }.bind(this));
        container.append(label);
        container.append(element);
        this.parent.append(container);
        this.bounds = element;
    }

    appendShaderChunks() {
        var container = new pcui.Container();
        var label = new pcui.Label({text: 'Show ShaderChunks'});
        label.style.verticalAlign = 'top';
        var element = new pcui.BooleanInput({
            text: 'shaderChunks',
            type: 'toggle',
            value: this.viewer.shaderChunks.enabled
        });
        element.on('click', function(e: MouseEvent) {
            this.viewer.shaderChunks.toggle();
            element.value = this.viewer.shaderChunks.enabled;
        }.bind(this));
        container.append(label);
        container.append(element);
        this.parent.append(container);
        this.shaderChunks = element;
        // Button:
        var element = new pcui.Button({
            text: 'Regenerate ShaderChunks'
        });
        element.on('click', function(e: MouseEvent) {
            this.viewer.shaderChunks.regenerateShaders();
        }.bind(this));
        container.append(element);
        this.regenerateShaderChunks = element;
    }

    appendTimeline() {
        var container = new pcui.Container();
        var label = new pcui.Label({text: 'Show Timeline'});
        label.style.verticalAlign = 'top';
        var element = new pcui.BooleanInput({
            text: 'timeline',
            type: 'toggle',
            value: this.viewer.timeline.enabled
        });
        element.on('click', function(e: MouseEvent) {
            this.viewer.timeline.toggle();
        }.bind(this));
        container.append(label);
        container.append(element);
        this.parent.append(container);
        this.timeline = element;
    }

    update() {
        this.bounds.value = this.viewer.showBounds;
    }
}
