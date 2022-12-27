import {createEffect, For, Show} from "solid-js";
import {Spc} from "./Spc";
import {cropString} from "../utils";

export function TreeNode({item, controller, handlePaste}) {
    let inputRef;

    createEffect(() => {
        if (controller.stateManager.state.selectedItem == item.id) {
            // inputRef.focus();

            // setTimeout(() => {
            //     inputRef.selectionStart = inputRef.selectionEnd = item.title.length;
            // }, 10)
        }
    });

    return (
        <>
            <div class='item'>
                <span>{'  '.repeat(item.depth)}</span>
                <Show
                    when={item.children.length}
                    fallback={<Spc/>}
                >
          <span>
            <Show
                when={!item.expanded}
                fallback={'-'}
            >
              +
            </Show>
          </span>
                </Show>
                <span>
          <input
              class='checkbox'
              type='checkbox'
              disabled
              checked={item.done}
          />
        </span>

                <Show
                    when={controller.getCurrentItem()?.id === item.id}
                    fallback={
                        <span onClick={(e) => controller.selectItem(item.id)}>
              {cropString(item.title, 50)}
                            <Show when={item.link}>
                <a
                    class='inline-link'
                    href={item.link}
                    target='_blank'
                >
                  ↗️
                </a>
              </Show>
            </span>
                    }
                >
                    <input
                        ref={inputRef}
                        class='title-input'
                        onInput={(e) => controller.setTitle(item.id, e.target.value)}
                        onPaste={handlePaste}
                        onClick={(e) => controller.selectItem(item.id)}
                        value={item.title}
                    />
                </Show>

                <Show when={item.children.length}>
                    <span>&nbsp;({item.children.length})</span>
                </Show>
            </div>
            <Show when={item.expanded}>
                <For each={item.children}>
                    {(item2) => (
                        <TreeNode
                            item={item2}
                            controller={controller}
                            handlePaste={handlePaste}
                        ></TreeNode>
                    )}
                </For>
            </Show>
        </>
    );
}