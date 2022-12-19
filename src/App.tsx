import {
  createSignal,
  createEffect,
  observable,
  from,
  Show,
  For,
} from 'solid-js';
import { createStore, SetStoreFunction, Store } from 'solid-js/store';
import { mod, createLocalStore } from './utils';

type Item = {
  title: string;
  done: boolean;
  link: string;
  author: string;
  tags: string[];
  description: string;

  ///

  depth: number;
  expanded: boolean;
};

function Item(title, depth): Item {
  return {
    title,
    depth,
    done: false,
    link: '',
    author: '',
    tags: [],
    description: '',
    expanded: true,
  };
}

function calcChildren(list) { }

function App() {
  let inputRef;
  let commandInputRef;
  const prevState = [];

  createEffect(() => {
    prevState.push(JSON.stringify(state.items))
  })

  const [state, setState] = createLocalStore('state', {
    items: [Item('First item', 0)],
    lineNumber: 0,
  });

  const [mode, setMode] = createSignal('view');
  const [consoleOutput, setConsoleOutput] = createSignal("")

  const focusInput = () => {
    if (!inputRef) return;
    inputRef.focus();

    setTimeout(() => {
      inputRef.selectionStart = inputRef.selectionEnd = inputRef.value.length;
    }, 0);
  };

  createEffect(() => {
    focusInput();
    state.lineNumber;
  });

  const globalOnKeyDown = (e) => {
    if (e.key == "/") {

    }

    if (e.key == ":") {
      commandInputRef.focus()
    }

    if (e.key == "z" && e.metaKey) {
      e.preventDefault()
      prevState.pop()
      const prevItems = JSON.parse(prevState.pop())

      console.log("PREV STATE", prevItems)
      setState('items', prevItems)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();

      if (e.shiftKey) {
        setState('items', state.lineNumber, 'depth', (it) => it - 1);
      } else {
        setState('items', state.lineNumber, 'depth', (it) => it + 1);
      }
    }

    if (e.key == 'Enter') {
      if (e.metaKey) {
        // setState('openedItem', state.lineNumber);
        return;
      }
      if (e.altKey) {
        setState('items', state.lineNumber, 'done', (it) => !it);
        e.preventDefault();
        return;
      }
      let depth;
      if (e.shiftKey) {
        depth = state.items[state.lineNumber].depth + 1;
      } else {
        depth = state.items[state.lineNumber].depth;
      }
      const newItems = state.items.slice(0);
      newItems.splice(state.lineNumber + 1, 0, Item('', depth));
      setState('items', newItems);
      setState('lineNumber', (it) => it + 1);
    }

    if (e.key == 'Backspace') {
      if (state.items[state.lineNumber].title === '') {
        const newItems = state.items.slice(0);
        newItems.splice(state.lineNumber, 1);
        setState('lineNumber', (it) => it - 1);
        setState('items', newItems);
        e.preventDefault();
      }
    }

    if (e.key == 'ArrowUp') {
      setState('lineNumber', (it) => mod(it - 1, state.items.length));
    }

    if (e.key == 'ArrowDown') {
      setState('lineNumber', (it) => mod(it + 1, state.items.length));
    }
  };

  const setTitle = (id, title) => {
    console.log(id, title);
    setState('items', id, 'title', title);
  };

  const currentItem = () => {
    return state.items[state.lineNumber];
  };

  const setData = (id, dataRaw) => {
    const data = JSON.parse(dataRaw);

    setState('items', id, (it) => ({ ...it, ...data }));
  };

  const cropString = (str: string, limit: number) => {
    if (str.length <= limit) return str
    return str.slice(0, limit) + '...'
  }

  const handlePaste = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text');

    const depth = state.items[state.lineNumber].depth;

    const items = state.items.slice(0);
    const newItems = pastedData.split('\n').map(it => it.trim()).map(it => Item(it, depth))
    items.splice(state.lineNumber, 1, ...newItems);
    setState('items', items);
  }

  const search = (value: string) => {

  }

  const log = (data) => {
    setConsoleOutput(data)
  }

  const execCommand = (input: string) => {
    let [cmd, ...args] = input.split(' ')

    if (cmd[0] == ':') {
      cmd = cmd.slice(1)
    }

    if (cmd[0] == "/") {
      search(cmd.slice(1))
      return;
    }

    if (cmd == '') {
      log("")
      return;
    }

    const commands = {
      smile: () => log(":)"),
      clear: () => log(""),
      exec: (...args) => log(eval(args.join(" ")))
    }
    console.log(commands[cmd], { commands, cmd, args })
    if (commands[cmd]) {
      commands[cmd](...args)
    } else {
      log(`Unknown command ${cmd}`)
    }
  }

  document.body.addEventListener('keydown', globalOnKeyDown);

  return (
    <main class="main">
      <div class="list" onKeyDown={onKeyDown}>
        <For each={state.items}>
          {(item, idx) => (
            <div class="item">
              <span>{'  '.repeat(item.depth)}</span>
              <span>
                <input
                  class="checkbox"
                  type="checkbox"
                  checked={item.done}
                  onChange={(e) =>
                    setState('items', idx(), 'done', e.currentTarget.checked)
                  }
                />
              </span>

              <Show
                when={state.lineNumber == idx()}
                fallback={
                  <span onClick={(e) => setState('lineNumber', idx)}>
                    {cropString(item.title, 50)}
                    <Show
                      when={item.link}
                    >
                      <a class="inline-link" href={item.link} target="_blank">↗️</a>
                    </Show>
                  </span>
                }
              >
                <input
                  ref={inputRef}
                  class="title-input"
                  onInput={(e) => setTitle(idx(), e.target.value)}
                  onPaste={handlePaste}
                  onClick={(e) => setState('lineNumber', idx)}
                  value={item.title}
                />
              </Show>
            </div>
          )}
        </For>
      </div>

      <Show when={currentItem() && consoleOutput() == ""} fallback={
        <div class="sidebar">
          <pre class="output">{consoleOutput()}</pre>
        </div>
      }>
        <div class="sidebar">
          <h2>{currentItem().title}</h2>

          <Show when={mode() === 'view'}>
            <div class="view">
              <Show when={currentItem().author}>
                <div>By {currentItem().author}</div>
              </Show>

              <Show when={currentItem().link}>
                <a class="value" href={currentItem().link} target="_blank">
                  {cropString(currentItem().link, 50)}
                </a>
              </Show>



              <Show when={currentItem().description}>
                <p>{currentItem().description}</p>
              </Show>

              <For each={currentItem().tags}>
                {(it, idx) => <span class="tag">#{it}</span>}
              </For>

              <div>
                <button onClick={(e) => setMode('edit')}>Edit</button>
              </div>
            </div>
          </Show>

          <Show when={mode() === 'edit'}>
            <div class="edit">
              <button onClick={(e) => setMode('view')}>View</button>

              <div>
                <textarea
                  cols="60"
                  rows="30"
                  value={JSON.stringify(currentItem(), null, 1)}
                  onChange={(e) => setData(state.lineNumber, e.target.value)}
                >
                  {JSON.stringify(currentItem(), null, 1)}
                </textarea>
              </div>
            </div>
          </Show>
        </div>
      </Show>

      <div class="command">
        <input ref={commandInputRef} onChange={e => execCommand(e.target.value)} />
      </div>
    </main>
  );
}

export default App;
