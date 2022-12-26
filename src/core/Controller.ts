import {StateManager} from "./StateManager";
import {fetchMetatags} from "../service/fetchMetatags";
import {deepCopy, last, urlRegex} from "../utils";
import {Item} from "./Model";
import {AuthResponse} from "@supabase/supabase-js";

export class Controller {
    stateManager = new StateManager()

    constructor() {
    }



    selectItem(id) {
        this.stateManager.setState('selectedItem', id)
    }

    selectPrevItem() {
        this.stateManager.setState('selectedItem', (it) => this.stateManager.getPrevItemId(it));
    }

    selectNextItem() {
        this.stateManager.setState('selectedItem', (it) => this.stateManager.getNextItemId(it));
    }

    saveData() {
        return this.stateManager.saveDataToDatabase()
    }

    fetchData() {
        return this.stateManager.fetchDataFromDatabase()
    }

    moveNodeUp() {
        const curItem = this.getCurrentItem()
        const curId = curItem.id;
        const curIdx = this.stateManager.getItemIdx(curId);

        const prevId = this.stateManager.getPrevItemId(curId);
        const prevIdx = this.stateManager.getItemIdx(prevId);

        const newItems = this.stateManager.state.items.slice(0);

        newItems.splice(curIdx, 1);
        newItems.splice(prevIdx, 0, curItem);

        this.stateManager.setState('items', newItems);
        this.stateManager.setState('selectedItem', curId);
    }

    toggleTheme() {
        this.stateManager.setState('theme', (it) => (it === 'dark' ? 'light' : 'dark'));
    }

    setTitle(id, title) {
        this.stateManager.setTitle(id, title)
    }

    moveNodeDown() {
        const curItem = this.stateManager.currentItem();
        const curId = curItem.id;
        const curIdx = this.stateManager.getItemIdx(curId);

        const nextId = this.stateManager.getNextItemId(curId);
        const nextIdx = this.stateManager.getItemIdx(nextId);

        const newItems = this.stateManager.state.items.slice(0);

        newItems.splice(curIdx, 1);
        newItems.splice(nextIdx, 0, curItem);

        this.stateManager.setState('items', newItems);
        this.stateManager.setState('selectedItem', curId);
    }

    moveNodeLeft() {
        this.stateManager.setState(
            'items',
            it => it.id == this.stateManager.currentItem().id,
            'depth',
            it => it - 1
        );
    }

    moveNodeRight() {
        this.stateManager.setState(
            'items',
            it => it.id == this.stateManager.currentItem().id,
            'depth',
            it => it + 1
        );
    }

    undoAction() {
        this.stateManager.prevState.pop();
        const prevItems = JSON.parse(this.stateManager.prevState.pop());

        this.stateManager.setState('items', prevItems);
    }

    toggleNodeStatus() {
        this.stateManager.setState(
            'items',
            it => it.id == this.stateManager.currentItem().id,
            'done',
            it => !it
        );

        if (this.stateManager.currentItem().done == true) {
            this.stateManager.setState(
                'items',
                it => it.id == this.stateManager.currentItem().id,
                'doneAt',
                new Date()
            );
        }
    }

    collapseNode() {
        console.log(this.stateManager.currentItem())
        this.stateManager.setState(
            'items',
            it => it.id == this.stateManager.currentItem().id,
            'expanded',
            _ => false
        );
    }

    expandNode() {
        this.stateManager.setState(
            'items',
            it => it.id == this.stateManager.currentItem().id,
            'expanded',
            _ => true
        );
    }

    loadInfo(link) {
        const curItem = this.getCurrentItem()

        if (link.match(urlRegex)) {
            fetchMetatags(link).then((r) => {
                const pasredTitle =
                    r['title'] || r['twitter:title'] || r['og:title'] || link;
                const parsedDescription =
                    r['description'] || r['twitter:description'] || r['og:description'];

                const newData = {
                    title: pasredTitle,
                    description: parsedDescription,
                    link: link
                }

                this.stateManager.setState('items', this.stateManager.getItemIdx(curItem.id), {...curItem, ...newData});
            });
        }
    }

    createNode(nested: boolean) {
        let depth;
        const curItem = this.getCurrentItem()
        if (nested) {
            depth = curItem.depth + 1;
        } else {
            depth = curItem.depth;
        }
        const newItems = this.stateManager.state.items.slice(0);
        let nextIdx = this.stateManager.getItemIdx(this.stateManager.getNextItemId(curItem.id));

        if (nextIdx == 0) {
            nextIdx = this.stateManager.state.items.length;
        }
        const newItem = Item('', depth);

        newItems.splice(nextIdx, 0, newItem);
        this.stateManager.setState('items', newItems);
        this.stateManager.setState('selectedItem', it => this.stateManager.getNextItemId(it));
    }

    deleteNode() {
        const newItems = this.stateManager.state.items.slice(0);
        newItems.splice(this.stateManager.getItemIdx(this.getCurrentItem().id), 1);
        this.stateManager.setState('selectedItem', (it) => this.stateManager.getPrevItemId(it));
        this.stateManager.setState('items', newItems);
    }

    getCurrentItem() {
        return this.stateManager.currentItem()
    }

    setNodeData(id: string, value: any) {
        this.stateManager.setData(id, value)
    }

    getTree() {
        let root = Item('root', -1);
        const items = this.stateManager.state.items.map((it) => deepCopy(it));

        const path = [root];
        for(const s of items) {
            while(last(path)!.depth >= s.depth) {
                path.pop()
            }

            const parent = last(path)
            parent.children.push(s)
            s.parent = parent
            path.push(s)
        }

        return root.children;
    }

    bulkInsert(lines: string[]) {
        const curItem = this.getCurrentItem()
        let depth  = curItem.depth;

        const items = this.stateManager.state.items.slice(0);
        const curIdx = this.stateManager.getItemIdx(curItem.id);

        const newItems = lines.map(it =>  Item(it, depth))

        items.splice(curIdx, 0, ...newItems);

        this.stateManager.setState('items', items);
        this.stateManager.setState('selectedItem', curItem.id);
    }

    setUser(r: AuthResponse) {
        this.stateManager.setState('session', r.data.session)
        this.stateManager.setState('user', r.data.user)
    }
}