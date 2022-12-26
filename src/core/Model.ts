import {generateId} from "../utils";

export type Item = {
    id: string,
    title: string;
    done: boolean;
    link: string;
    author: string;
    tags: string[];
    description: string;
    doneAt: Date | null;
    content: string;

    ///

    depth: number;
    expanded: boolean;
    children: Item[];
    parent: Item;
};

export function Item(title, depth): Item {
    return {
        id: generateId(),
        title,
        depth,
        done: false,
        link: '',
        author: '',
        tags: [],
        description: '',
        doneAt: null,
        content: '',

        ///
        expanded: true,
        children: [],
        parent: null,
    };
}
