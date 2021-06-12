import * as pcui from '@playcanvas/pcui';

var container = undefined;

export function pathfinder(path, data) {
    if (container == undefined) {
        container = new pcui.Container({
            flex: true
        });
        document.body.appendChild(container.dom);
        container.style.position = "absolute";
        container.style.right = "0";
        container.style.bottom = "0";
        container.style.backgroundColor = "rgba(20, 20, 20, 0.5)";
        container.style.margin = "0";
        container.style.padding = "2px 8px";
        container.style.zIndex = 10;
    }
    var label = new pcui.Label({
        text: path
    });
    window.lastLabel = label;
    label.on('click', function() {
        if (!data) {
            console.log('No data present');
            return;
        }
        console.log("Path: ", path);
        console.log("Apply context to window: ", data);
        Object.assign(window, data);
    })
    container.append(label);
    setTimeout(function() {
        label.destroy();
    }, 5000);
}
