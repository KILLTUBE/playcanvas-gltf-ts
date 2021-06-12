const {Container} = pcui;

/**
 * @example
 * var key = document.createElement('code');
 * key.innerText = "pos";
 * var val = document.createElement('code');
 * val.innerText = '{x: 1, y: 2, z: 3}';
 * container.appendMany("Key: ", key, "Value: ", val);
 */

Container.prototype.appendMany = function() {
    for (let i=0; i<arguments.length; i++) {
        let arg = arguments[i];
        let node;
        if (typeof arg === 'string') {
            node = new pcui.Label({text: arg});
        } else {
            node = arg;
        }
        this.append(node);
    }
}
