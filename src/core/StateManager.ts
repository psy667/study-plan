import {createLocalStore, findLast, mod} from "../utils";
import {createEffect} from "solid-js";
import {Item} from "./Model";

export class StateManager {
    initItem = Item('Type :help to get info', 0);
    prevState = [];

    initState = {
        items: [this.initItem],
        log: [],
        selectedItem: this.initItem.id,
        theme: 'dark',
    }

    state = this.initState

    setState

    constructor() {
        [this.state, this.setState] = createLocalStore('state', this.initState);

        createEffect(() => {
            this.prevState.push(JSON.stringify(this.state.items));
        });
    }


    getItemById = (id: string): Item => {
        return this.state.items.find((it) => it.id == id);
    };

    getItemIdx (id: string): number {
        return this.state.items.findIndex((it) => it.id == id);
    };

    getPrevItemId (id: string): string {
        const curIdx = this.getItemIdx(id);
        const curItem = this.getItemById(id);
        const prevItem = findLast(this.state.items,
            (it, idx) => idx < curIdx && it.depth <= curItem.depth
        );

        if (prevItem && !prevItem.expanded) {
            return prevItem.id;
        } else {
            return this.state.items[mod(curIdx - 1, this.state.items.length)].id;
        }
    };

    getNextItemId(id: string): string {
        const curIdx = this.getItemIdx(id);
        const curItem = this.getItemById(id);

        if (!curItem.expanded) {
            const res = this.state.items.find(
                (it, idx) => idx > curIdx && it.depth <= curItem.depth
            );
            if (!res) {
                return this.state.items[0].id;
            }
            return res.id;
        } else {
            return this.state.items[mod(curIdx + 1, this.state.items.length)].id;
        }
    };

    setTitle(id, title) {
        const idx = this.getItemIdx(id);

        this.setState('items', idx, 'title', title);
    };

    currentItem() {
        return this.getItemById(this.state.selectedItem);
    };

    setData(id, dataRaw) {
        const data = JSON.parse(dataRaw);
        const idx = this.getItemIdx(id);

        this.setState('items', idx, (it) => ({...it, ...data}));
    };
}