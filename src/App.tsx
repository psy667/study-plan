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
  children: Item[];
};

const generateId = (): string => {
  return Math.random().toString(16).split('.')[1]
}

function Item(title, depth): Item {
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

    ///
    expanded: true,
    children: []
  };
}

function Log(taskId: number) {
  return {
    taskId: taskId,
    
  }
}

/*
1
  2
  3
  4
    5
    6
  5
*/

const last = (arr) => {
  return arr[arr.length - 1]
}

function migration(item) {
  return {...Item("", 0), ...item}
}

function calcChildren(list) {
  // let result = [Item("root", -1)]
  // let curDepth = 0;
  let prev = Item("root", -1);
  let parent = [prev];
  let result = []


  list.map(it => JSON.parse(JSON.stringify(it))).forEach((it,idx) => {
    
    if(it.depth == prev.depth) {
      last(parent).children.push(it)
      prev = it
    } else if(it.depth > prev.depth) {
      parent.push(prev)
      last(parent).children.push(it)
      prev = it
    } else if(it.depth < prev.depth) {
      parent.pop()
      last(parent).children.push(it)
      prev = it
    }
    if(it.depth == 0) {
      result.push(it)
    }

  })

  console.log(result)
  return result
}

function TreeNode({item, context}) {
  const { state, setState, setTitle, handlePaste, cropString } = context;
  
  let inputRef;

  createEffect(() => {
    if(state.selectedItem == item.id) {
      inputRef.focus()
    }
  });
  
  return (
    <><div class="item">
              <span>{'  '.repeat(item.depth)}</span>
              <Show when={item.children.length} fallback={" "}>
                <span>
                  <Show when={!item.expanded} fallback={"-"}>+</Show>
                </span>
              </Show>
              <span>
                <input
                  class="checkbox"
                  type="checkbox"
                  disabled
                  checked={item.done}
                  onChange={(e) =>
                    setState('items', item.id, 'done', e.currentTarget.checked)
                  }
                />
              </span>

              <Show
                when={state.selectedItem == item.id}
                fallback={
                  <span onClick={(e) => setState('selectedItem', item.id)}>
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
                  onInput={(e) => setTitle(item.id, e.target.value)}
                  onPaste={handlePaste}
                  onClick={(e) => setState('selectedItem', item.id)}
                  value={item.title}
                />
              </Show>

              <Show when={item.children.length}>
                <span>
                  &nbsp;({item.children.length})
                </span>
              </Show>
            </div>
      <Show when={item.expanded}>
      <For each={item.children}>
          {(item2) => (
            <TreeNode item={item2} context={context}></TreeNode>
          )}
        </For>
        </Show>
    </>
  )
}

function App() {
  let inputRef;
  let commandInputRef;
  const prevState = [];

  createEffect(() => {
    prevState.push(JSON.stringify(state.items))
  })

  const initItem = Item('First item', 0)

  const [state, setState] = createLocalStore('state', {
    items: [initItem],
    log: [],
    selectedItem: initItem.id,
  });

  state.items.forEach((it,idx) => {
    setState("items", idx, migration(it))
  })


  const [mode, setMode] = createSignal('view');
  const [consoleOutput, setConsoleOutput] = createSignal("")

  const globalOnKeyDown = (e) => {
    if (e.key == 'ArrowUp') {
      setState('selectedItem', (it) => getPrevItemId(it));
    }

    if (e.key == 'ArrowDown') {
      setState('selectedItem', (it) => getNextItemId(it));
    }

    
    if (e.key == "/") {

    }

    if (e.key == ":") {
      commandInputRef.focus()
    }

    if (e.key == "z" && e.metaKey) {
      e.preventDefault()
      prevState.pop()
      const prevItems = JSON.parse(prevState.pop())

      setState('items', prevItems)
    }
  }

  const getItemById = (id) => {
    return state.items.find(it => it.id == id)
  }

  const onKeyDown = (e) => {
    console.log(e)
    
    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (e.shiftKey) {
        setState('items', it => it.id == state.selectedItem, 'depth', (it) => it - 1);
      } else {
        setState('items', it => it.id == state.selectedItem, 'depth', (it) => it + 1);
      }
    }

    if(e.key == 'ArrowLeft' && e.metaKey) {
      setState('items', it => it.id == state.selectedItem, 'expanded', it => false)
    }

    if(e.key == 'ArrowRight' && e.metaKey) {
      setState('items', it => it.id == state.selectedItem, 'expanded', it => true)
    }
    

    if (e.key == 'Enter') {
      if (e.metaKey) {
        // setState('openedItem', state.selectedItem);
        return;
      }
      if (e.altKey) {
        setState('items', it => it.id == state.selectedItem, 'done', (it) => !it);
        
        if(getItemById(state.selectedItem).done == true) {
          setState('items', it => it.id == state.selectedItem, 'doneAt', new Date());
        }
        
        e.preventDefault();
        return;
      }
      let depth;
      if (e.shiftKey) {
        depth = currentItem().depth + 1;
      } else {
        depth = currentItem().depth;
      }
      const newItems = state.items.slice(0);
      newItems.splice(getItemIdx(getNextItemId(state.selectedItem)), 0, Item('', depth));
      setState('items', newItems);
      setState('selectedItem', getNextItemId);
    }

    if (e.key == 'Backspace') {
      if (currentItem().title === '') {
        const newItems = state.items.slice(0);
        newItems.splice(getItemIdx(state.selectedItem), 1);
        setState('selectedItem', it => getPrevItemId(it));
        setState('items', newItems);
        e.preventDefault();
      }
    }
  };

  const getItemIdx = (id) => {
    return state.items.findIndex(it => it.id == id)
  }
  
  const getPrevItemId = (id) => {
    const curIdx = getItemIdx(id)
    const curItem = getItemById(id)
    const prevItem = state.items.findLast((it, idx) => idx < curIdx && it.depth <= curItem.depth)
    
    if(!prevItem.expanded) {
      return prevItem.id
    } else {
      return state.items[mod(curIdx - 1, state.items.length)].id
    }
  }

  const getNextItemId = (id) => {
    const curIdx = getItemIdx(id)
    const curItem = getItemById(id)

    if(!curItem.expanded) {
      return state.items.find((it, idx) => idx > curIdx && it.depth <= curItem.depth).id
    } else {
      return state.items[mod(curIdx + 1, state.items.length)].id
    }
  }

  const setTitle = (id, title) => {
    const idx = getItemIdx(id)
    
    setState('items', idx, 'title', title);
  };

  const currentItem = () => {
    return getItemById(state.selectedItem);
  };

  const setData = (id, dataRaw) => {
    const data = JSON.parse(dataRaw);
    const idx = getItemIdx(id)
    
    setState('items', idx, (it) => ({ ...it, ...data }));
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

    const depth = currentItem().depth;

    const items = state.items.slice(0);
    const newItems = pastedData.split('\n').map(it => it.trim()).map(it => Item(it, depth))
    items.splice(getItemIdx(state.selectedItem), 1, ...newItems);
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
        <For each={calcChildren(state.items)}>
          {(item, idx) => (
            <TreeNode item={item} idx={idx} context={{ state, setState, setTitle, handlePaste, cropString }}></TreeNode>
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

              <Show when={currentItem().doneAt}>
                <span>Done at {new Date(currentItem().doneAt).toLocaleString()}</span>
              </Show>



              <Show when={currentItem().description}>
                <p>{currentItem().description}</p>
              </Show>

              <For each={currentItem().tags}>
                {(it, idx) => <span class="tag">#{it}</span>}
              </For>

              <div>
                <button onClick={(e) => setMode('edit')}>✏️</button>
              </div>
            </div>
          </Show>

          <Show when={mode() === 'edit'}>
            <div class="edit">
              <button onClick={(e) => setMode('view')}>👀</button>

              <div>
                <textarea
                  cols="60"
                  rows="30"
                  value={JSON.stringify(currentItem(), null, 1)}
                  onChange={(e) => setData(state.selectedItem, e.target.value)}
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
