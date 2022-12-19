import styles from './App.module.css';
import { createSignal, createEffect, observable, from, Show, For } from "solid-js"
import { createStore, SetStoreFunction, Store } from "solid-js/store";

const mod = function(a, b) {
  return ((a % b) + b) % b;
};

export function createLocalStore<T extends object>(
  name: string,
  init: T
): [Store<T>, SetStoreFunction<T>] {
  const localState = localStorage.getItem(name);
  const [state, setState] = createStore<T>(
    localState ? JSON.parse(localState) : init
  );
  createEffect(() => localStorage.setItem(name, JSON.stringify(state)));
  return [state, setState];
}


function Item(title, depth) {
  return { title, depth, done: false }
}

function calcChildren(list) {

}

function App() {
  let inputRef;
  const [state, setState] = createLocalStore("state", {
    items: [],
    lineNumber: 0,
    openedItem: null,
    caretPos: 0,
  });

  const focusInput = () => {
    inputRef.focus()

    setTimeout(() => {
      inputRef.selectionStart = inputRef.selectionEnd = inputRef.value.length;
    }, 0)
  }

  createEffect(() => {
    focusInput()
    state.lineNumber
  })

  const onKeyDown = (e) => {

    if (e.key === "Tab") {
      e.preventDefault()

      if (e.shiftKey) {
        setState('items', state.lineNumber, 'depth', state.items[state.lineNumber].depth - 1)
      } else {
        setState('items', state.lineNumber, 'depth', state.items[state.lineNumber].depth + 1)
      }
    }

    if (e.key == "Enter") {
      console.log(e)
      if (e.metaKey) {
        setState("openedItem", state.lineNumber)
        return;
      }
      if (e.altKey) {
        setState("items", state.lineNumber, 'done', !state.items[state.lineNumber].done)
        return;
      }
      let depth
      if (e.shiftKey) {
        depth = state.items[state.lineNumber].depth + 1
      } else {
        depth = state.items[state.lineNumber].depth
      }
      const newItems = state.items.slice(0)
      newItems.splice(state.lineNumber + 1, 0, Item("", depth))
      setState('items', newItems)
      setState("lineNumber", state.lineNumber + 1)
    }

    if (e.key == "Backspace") {
      if (state.items[state.lineNumber].title === "") {
        const newItems = state.items.slice(0)
        newItems.splice(state.lineNumber, 1)
        setState('items', newItems)
        setState("lineNumber", state.lineNumber - 1)
        e.preventDefault()
      }
    }

    if (e.key == "ArrowUp") {
      setState("lineNumber", mod(state.lineNumber - 1, state.items.length))
    }

    if (e.key == "ArrowDown") {
      setState("lineNumber", mod(state.lineNumber + 1, state.items.length))
    }
  }

  const setTitle = (id, title) => {
    console.log(id, title)
    setState("items", id, 'title', title)
  }

  document.body.addEventListener('keydown', onKeyDown)

  return (
    <main class="main" onKeyDown={onKeyDown}>
      <div class="list">
        <For each={state.items}>
          {(item, idx) => (
            <div>
              <span>{"  ".repeat(item.depth)}</span>
              <span>
                <input
                  class="checkbox"
                  type="checkbox"
                  checked={item.done}
                  onChange={e => setState("items", idx(), "done", e.currentTarget.checked)}
                />
              </span>

              <Show when={state.lineNumber == idx()} fallback={
                <span
                  onClick={e => setState("lineNumber", idx)}
                >{item.title.slice(0, 30).padEnd(Math.min(item.title.length, 33), ".")}</span>
              }>
                <input
                  ref={inputRef}
                  class="title-input"
                  onInput={e => setTitle(idx(), e.target.value)}
                  onClick={e => setState("lineNumber", idx)}
                  value={item.title}
                />
              </Show>

            </div>
          )}
        </For>
      </div>


      <div class="sidebar">
        <pre>
          {JSON.stringify(state.items[state.openedItem], null, 1).slice(2, -2).replaceAll("\"", "")}
        </pre>
      </div>

      <div class="state">

      </div>
      <div class="command">

      </div>
    </main>
  );
}

export default App;
