import { pathfinder } from "./pathfinder";
import "./pcuiExtension";
import * as pcui from '@playcanvas/pcui';

/**
 * 
 * @param {pc.ScriptType} script 
 */

export function nonAttributeVars(script) {
    var keys;
    var keep;
    keys = Object.keys(script);
    keep = [];
    for (var key of keys) {
        if (key[0] == '_') {
            continue;
        }
        if (key == "app") {
            continue;
        }
        if (key == "entity") {
            continue;
        }
        keep.push(key);
    }
    return keep;
}

export class Inspector {
    app: pc.Application;
    parent: pcui.Element;
    panel: pcui.Panel;
    panelScripts: pcui.Panel;

    constructor(app, parent) {
        this.app = app;
        this.parent = parent;
        this.addInspector();
        this.app.on("inspector:select", this.select.bind(this));
        window.inspector = this;
    }

    addInspector() {
        this.panel = new pcui.Panel({
            collapsible: true,
            enabled: true,
            headerSize: 32,
            headerText: "Inspector",
            scrollable: true
        });
        this.panel.scrollable = true;
        this.parent.append(this.panel);
    }

    addVectorInputs(entity) {
        // SET UP <TABLE>

        var table = document.createElement("table");

        // LOCAL POSITION <TR> and <TD>

        const tr_pos   = document.createElement("tr");
        const tr_euler = document.createElement("tr");
        const tr_scale = document.createElement("tr");

        const td_pos_left    = document.createElement("td");
        const td_pos_right   = document.createElement("td");
        const td_euler_left  = document.createElement("td");
        const td_euler_right = document.createElement("td");
        const td_scale_left  = document.createElement("td");
        const td_scale_right = document.createElement("td");

        tr_pos.append(td_pos_left, td_pos_right);
        tr_euler.append(td_euler_left, td_euler_right);
        tr_scale.append(td_scale_left, td_scale_right);
        
        table.append(tr_pos, tr_euler, tr_scale);
        this.panel.content.append(table);

        // SET UP LABELS
        // SET UP LABELS

        const label_pos   = new pcui.Label({text:"Position"});
        const label_euler = new pcui.Label({text:"Euler"});
        const label_scale = new pcui.Label({text:"Scale"});
        td_pos_left.append(label_pos.dom);
        td_euler_left.append(label_euler.dom);
        td_scale_left.append(label_scale.dom);

        label_pos.on("click", function() {
            pathfinder("entity.getLocalPosition()", {entity});
        });
        label_euler.on("click", function() {
            pathfinder("entity.getLocalEulerAngles()", {entity});
        });
        label_scale.on("click", function() {
            pathfinder("entity.getLocalScale()", {entity});
        });

        // SET UP VECTOR INPUTS
        // SET UP VECTOR INPUTS

        // LOCAL POSITION
        this.vectorInput = new pcui.VectorInput({
            placeholder: ["X", "Y", "Z"]
        })
        td_pos_right.append(this.vectorInput.dom);
        
        var pos = entity.getLocalPosition();
        this.vectorInput.value = [pos.x, pos.y, pos.z];
        this.vectorInput.on('change', newValue => {
            entity.setLocalPosition(...newValue);
        });

        // LOCAL EULER
        this.vectorInputEuler = new pcui.VectorInput({
            placeholder: ["X", "Y", "Z"]
        })
        td_euler_right.append(this.vectorInputEuler.dom);
        var euler = entity.getLocalEulerAngles();
        this.vectorInputEuler.value = [euler.x, euler.y, euler.z];
        this.vectorInputEuler.on('change', newValue => {
            entity.setLocalEulerAngles(...newValue);
        });

        // LOCAL SCALE
        this.vectorInputScale = new pcui.VectorInput({
            placeholder: ["X", "Y", "Z"]
        })
        td_scale_right.append(this.vectorInputScale.dom);
        var scale = entity.getLocalScale();
        this.vectorInputScale.value = [scale.x, scale.y, scale.z];
        this.vectorInputScale.on('change', newValue => {
            entity.setLocalScale(...newValue);
        });
    }

    select(entity) {
        this.panel.content.clear();

        this.addVectorInputs(entity);

        if (typeof entity.script === "undefined") {
            // TODO: Add button to add a script
            this.panelScripts = new pcui.Panel({
                collapsible: true,
                enabled: true,
                headerSize: 32,
                headerText: "Scripts (0)"
            });
            this.panelScripts.style.paddingLeft = "5px";
            this.panel.content.append(this.panelScripts);
        } else {
            var scripts = entity.script.scripts;
            // TODO: Add button to add a script
            this.panelScripts = new pcui.Panel({
                collapsible: true,
                enabled: true,
                headerSize: 32,
                headerText: `Scripts (${scripts.length})`,
                //scrollable: true
            });
            this.panelScripts.style.paddingLeft = "5px";
            this.panel.content.append(this.panelScripts);

            let scriptID = 0;
            for (var script of scripts) {
                var name = script.__scriptType.__name;
                var tmp = new pcui.Panel({
                    collapsible: true,
                    enabled: true,
                    headerSize: 32,
                    headerText: name
                });
                tmp.dom.style.paddingLeft = "5px";
                this.panelScripts.content.append(tmp);
                tmp.header.on("hover", function() {
                    pathfinder(name, {
                        [name]: script
                    });
                });

                this.addAttributes(tmp, script, scriptID);

                var divider = new pcui.Divider();
                tmp.append(divider);

                this.addNormalVars(tmp, script, scriptID);
                


                scriptID++;
            } // for (var script of scripts)

            
            var divider = new pcui.Divider();
            this.panelScripts.content.append(divider);

            this.addComponents(this.panelScripts.content, entity);
        }
    }

    addAttributes(panel, script, scriptId) {
        var attributes = Object.keys(script.__scriptType.attributes.index);
        var table = document.createElement("table");
        panel.append(table);
        for (const attribute of attributes) {
            const scriptAttribute = script.__scriptType.attributes.index[attribute];
            const tr = document.createElement("tr");
            const td_left = document.createElement("td");
            const td_right = document.createElement("td");
            tr.appendChild(td_left);
            tr.appendChild(td_right);
            table.appendChild(tr);

            //var labelLeft = new Label({text: attribute});
            var labelLeft = new pcui.Label({text: scriptAttribute.title || attribute});

            labelLeft.on("hover", function() {
                pathfinder(`entity.script.scripts[${scriptId}].${attribute}`, {
                    entity,
                    [attribute]: entity.script.scripts[scriptId][attribute]
                });
            });

            td_left.appendChild(labelLeft.dom);

            switch (scriptAttribute.type) {
                case "boolean": {
                    const booleanInput = new pcui.BooleanInput({});
                    booleanInput.value = script[attribute];
                    booleanInput.on("change", newValue => {
                        //console.log("attribute", attribute);
                        //console.log("arguments", arguments);
                        //console.log("newValue", newValue);
                        script[attribute] = newValue;
                    });
                    td_right.appendChild(booleanInput.dom);
                    break;
                }
                case "number": {
                    if (typeof scriptAttribute.enum === "undefined") {
                        const booleanInput = new pcui.NumericInput({
                            hideSlider: false
                        });
                        booleanInput.value = script[attribute];
                        booleanInput.on("change", newValue => {
                            //console.log("attribute", attribute);
                            //console.log("arguments", arguments);
                            //console.log("newValue", newValue);
                            script[attribute] = newValue;
                        });
                        td_right.appendChild(booleanInput.dom);
                    } else {
                        function scriptEnumToOption(enum_) {
                            return enum_.map(e=>{
                                var key = Object.keys(e)[0];
                                return {
                                    t: String(key),
                                    v: String(e[key])
                                };
                            });
                        }
                        const selectInput = new pcui.SelectInput({});
                        selectInput.options = scriptEnumToOption(scriptAttribute.enum);
                        selectInput.value = String(script[attribute]);
                        selectInput.on("change", newValue => {
                            script[attribute] = newValue;
                        });
                        td_right.appendChild(selectInput.dom);
                    }
                    break;
                }
                case "string": {
                    const textInput = new pcui.TextInput({});
                    textInput.value = String(script[attribute]);
                    textInput.on("change", newValue => {
                        script[attribute] = newValue;
                    });
                    td_right.appendChild(textInput.dom);
                    break;
                }
                case "asset": {
                    // don't bother with assets so far
                    const label = new pcui.Label({text: "..."});
                    td_right.appendChild(label.dom);
                    break;
                }
                default: {
                    td_right.innerText = JSON.stringify(scriptAttribute, null, "  ");
                    break;
                }
            }
        }
    }

    addNormalVars(panel, script, scriptId) {
        var vars = nonAttributeVars(script);
        var table = document.createElement("table");
        panel.append(table);
        for (let attribute of vars) {
            const tr = document.createElement("tr");
            const td_left = document.createElement("td");
            const td_right = document.createElement("td");
            tr.appendChild(td_left);
            tr.appendChild(td_right);
            table.appendChild(tr);
            const labelLeft = new pcui.Label({text: attribute});
            labelLeft.on("hover", () => {
                pathfinder(`entity.script.scripts[${scriptId}].${attribute}`, {
                    entity,
                    [attribute]: entity.script.scripts[scriptId][attribute]
                });
            });

            td_left.appendChild(labelLeft.dom);



            switch (typeof script[attribute]) {
                case "number": {
                    const booleanInput = new pcui.NumericInput({
                        hideSlider: false
                    });
                    booleanInput.value = script[attribute];
                    booleanInput.on("change", newValue => {
                        //console.log("attribute", attribute);
                        //console.log("arguments", arguments);
                        //console.log("newValue", newValue);
                        script[attribute] = newValue;
                    });
                    td_right.appendChild(booleanInput.dom);
                    break;
                }
                //case "string": {
                //    const textInput = new TextInput({});
                //    textInput.value = String(script[attribute]);
                //    textInput.on("change", newValue => {
                //        script[attribute] = newValue;
                //    });
                //    td_right.appendChild(textInput.dom);
                //    break;
                //}
                //case "asset": {
                //    // don't bother with assets so far
                //    const label = new Label({text: "..."});
                //    td_right.appendChild(label.dom);
                //    break;
                //}
                default: {
                    td_right.innerText = String(script[attribute]);
                    break;
                }
            }            
        }
    }

    addComponents(parent, entity) {
        var panel = new pcui.Panel({
            collapsible: true,
            enabled: true,
            headerSize: 32,
            headerText: "Components"
        });
        panel.dom.style.paddingLeft = "5px";
        panel.header.on("hover", function() {
            //pathfinder(name, {
            //    [name]: script
            //});
        });
        parent.append(panel);


        for (let component_name in entity.c) {


            var panelComponent = new pcui.Panel({
                collapsible: true,
                enabled: true,
                headerSize: 32,
                headerText: component_name
            });
            panelComponent.dom.style.paddingLeft = "5px";
            panelComponent.header.on("hover", function() {
                //pathfinder(name, {
                //    [name]: script
                //});
            });
            panel.content.append(panelComponent);
            //panel.content.appendMany(`COMPONENT: ${component_name}`);

            var table = document.createElement("table");
            panelComponent.content.append(table);
            const component = entity.c[component_name];

            var descriptors = Object.getOwnPropertyDescriptors(component.__proto__);
            for (const descriptorName in descriptors) {
                var descriptor = descriptors[descriptorName];
                var type_ = typeof component[descriptorName];

                const tr = document.createElement("tr");
                const td_left = document.createElement("td");
                const td_right = document.createElement("td");
                tr.appendChild(td_left);
                tr.appendChild(td_right);
                table.appendChild(tr);

                const labelLeft = new pcui.Label({text: descriptorName});
                labelLeft.on("hover", () => {
                    pathfinder(`entity.c.${component_name}`, {
                        entity,
                        [component_name]: entity.c[component_name]
                    });
                });
    
                td_left.appendChild(labelLeft.dom);


                /*
                    addCameraToLayers: {writable: true, enumerable: false, configurable: true, value: ƒ}
                    aspectRatio: {enumerable: false, configurable: false, get: ƒ, set: ƒ}
                    aspectRatioMode: {enumerable: false, configurable: false, get: ƒ, set: ƒ}
                    calculateAspectRatio: {writable: true, enumerable: false, configurable: true, value: ƒ}
                    calculateProjection: {enumerable: false, configurable: false, get: ƒ, set: ƒ}
                    calculateTransform: {enumerable: false, configurable: false, get: ƒ, set: ƒ}
                    camera: {set: undefined, enumerable: false, configurable: true, get: ƒ}
                */
                switch (type_) {
                    case "number": {
                        const numericInput = new pcui.NumericInput({
                            hideSlider: false
                        });
                        numericInput.value = component[descriptorName];
                        numericInput.on("change", newValue => {
                            component[descriptorName] = newValue;
                        });
                        td_right.appendChild(numericInput.dom);
                        break;
                    }
                    //case "string": {
                    //    const textInput = new TextInput({});
                    //    textInput.value = String(script[attribute]);
                    //    textInput.on("change", newValue => {
                    //        script[attribute] = newValue;
                    //    });
                    //    td_right.appendChild(textInput.dom);
                    //    break;
                    //}
                    //case "asset": {
                    //    // don't bother with assets so far
                    //    const label = new Label({text: "..."});
                    //    td_right.appendChild(label.dom);
                    //    break;
                    //}
                    default: {
                        console.log("Unknown", type_)
                        td_right.append(String(type_));
                        break;
                    }
                }
            }
        }
    }
}
