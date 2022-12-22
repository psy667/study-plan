import {createSignal, For, Show} from "solid-js";
import {cropString} from "../utils";

export function Sidebar({currentItem, consoleOutput, controller}) {
    const [mode, setMode] = createSignal('view');

    return (<Show when={currentItem() && consoleOutput() == ''}>
        <div class='sidebar'>
            <h2>{currentItem().title}</h2>

            <Show when={mode() === 'view'}>
                <div class='view'>
                    <Show when={currentItem().author}>
                        <div>By {currentItem().author}</div>
                    </Show>

                    <Show when={currentItem().link}>
                        <a
                            class='value'
                            href={currentItem().link}
                            target='_blank'
                        >
                            {cropString(currentItem().link, 50)}
                        </a>
                    </Show>

                    <Show when={currentItem().doneAt}>
                <span>
                  Done at {new Date(currentItem().doneAt).toLocaleString()}
                </span>
                    </Show>

                    <Show when={currentItem().description}>
                        <p>{currentItem().description}</p>
                    </Show>

                    <For each={currentItem().tags}>
                        {(it, idx) => <span class='tag'>#{it}</span>}
                    </For>

                    <div>
                        <button onClick={(e) => setMode('edit')}>✏️</button>
                    </div>
                </div>
            </Show>

            <Show when={mode() === 'edit'}>
                <div class='edit'>
                    <button onClick={(e) => setMode('view')}>👀</button>
                    <div>
                <textarea
                    cols='60'
                    rows='30'
                    value={JSON.stringify(currentItem(), null, 1)}
                    onChange={(e) => controller.setNodeData(currentItem().id, e.target.value)}
                >
                  {JSON.stringify(currentItem(), null, 1)}
                </textarea>
                    </div>
                </div>
            </Show>
        </div>
    </Show>)
}