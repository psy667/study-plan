import {createEffect, For, Show} from "solid-js";
import {cropString} from "../utils";
import {MarkdownViewer} from "./MarkdownViewer";

export function Sidebar({currentItem, consoleOutput, controller}) {
    const mode = controller.stateManager.sidebarMode;
    let contentInputRef;

    createEffect(() => {
        if(mode() == 'edit') {
            contentInputRef.focus()
            contentInputRef.selectionStart = currentItem().content?.length;
        }
    })

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
                        <div>
                            ✅ Done at {new Date(currentItem().doneAt).toLocaleString()}
                        </div>
                    </Show>

                    <Show when={currentItem().description}>
                        <p>{currentItem().description}</p>
                    </Show>

                    <For each={currentItem().tags}>
                        {(it, idx) => <span class='tag'>#{it}</span>}
                    </For>

                    <div>
                        <button onClick={(e) => controller.toggleSidebarMode()}>✏️</button>
                    </div>

                    <MarkdownViewer>
                        <>
                            { currentItem().content || "" }
                        </>
                    </MarkdownViewer>
                </div>
            </Show>

            <Show when={mode() === 'edit'}>
                <div class='edit'>
                    <button onClick={(e) => controller.toggleSidebarMode()}>👀</button>
                    <div>
                <textarea
                    cols='80'
                    rows='10'
                    value={JSON.stringify(currentItem(), null, 1)}
                    onChange={(e) => controller.setNodeData(currentItem().id, e.target.value)}
                >
                  {JSON.stringify(currentItem(), null, 1)}
                </textarea>
                    <textarea
                        ref={contentInputRef}
                        cols='80'
                        rows='28'
                        value={currentItem().content}
                        onChange={(e) => controller.setContent(currentItem().id, e.target.value)}
                    >
                        {currentItem().content}
                    </textarea>
                    </div>
                </div>
            </Show>
        </div>
    </Show>)
}