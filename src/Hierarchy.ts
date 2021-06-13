import * as pcui from '@playcanvas/pcui';
import { delay } from './utils';

export class Hierarchy {
    debug: boolean;
    app: pc.Application;
    parent: pcui.Element;
    treeView: pcui.TreeView;
    panelHierarchy: pcui.Panel;

    constructor(app, parent) {
        this.debug = true;
        this.app = app;
        this.parent = parent;
        this.addTreeView();
        this.update();
        this.app.root.on("childinsert", delay(this.onChildInsert.bind(this), 100));
        window.hierarchy = this;
    }

    update() {
        this.treeView.clearTreeItems();
        this.addTreeViewItems(this.app.root, this.treeView);
    }

    // test = new pc.Entity(`Test #${Math.round(Math.random()*1000)}`); app.root.addChild(test);
    onChildInsert(child) {
        //console.log("INSERT CHILD", child);
        this.update();
    }

    addTreeView() {
        this.panelHierarchy = new pcui.Panel({
            collapsible: true,
            enabled: true,
            headerSize: 32,
            headerText: "Hierarchy",
            //scrollable: true
        });

        //this.panelHierarchy.style.minHeight = "100px";
        //this.panelHierarchy.dom.style.overflow = "hidden";
        //this.panelHierarchy.dom.style.overflowY = "scroll";
        //this.labelHierarchy = new Label({text: "Hierarchy"})
        this.parent.append(this.panelHierarchy);

        this.treeView = new pcui.TreeView({
            allowDrag: true,
            allowRenaming: true,
            allowReordering: true,
            enabled: true,
            //scrollable: true
        });
        //this.treeView.style.minHeight = "100px";
        const item1 = new pcui.TreeViewItem({text: "Item 1"});
        const item2 = new pcui.TreeViewItem({text: "Item 2"});
        const item3 = new pcui.TreeViewItem({text: "Item 3"});
        this.treeView.append(item1);
        this.treeView.append(item2);
        this.treeView.append(item3);
        
        this.panelHierarchy.content.append(this.treeView.dom);
    }

    addTreeViewItems(parent, treeView) {
        parent.children.forEach(child => {
            var item = new pcui.TreeViewItem({text: child.name});
            // link each other
            child.treeViewItem = item;
            item.entity = child;
            // ...
            treeView.append(item);
            item.on("select", this.onItemSelect.bind(this));
            this.addTreeViewItems(child, item);
        })
    }

    onItemSelect(treeViewItem) {
        if (this.debug) {
            console.groupCollapsed("window.treeViewItem, window.entity");
            console.log(treeViewItem);
            console.log(treeViewItem.entity);
            console.groupEnd();
            window.treeViewItem = treeViewItem;
            window.entity = treeViewItem.entity;
        }
        this.app.fire("inspector:select", treeViewItem.entity);
    }

}
