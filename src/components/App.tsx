import {
    createSignal,
    Show,
    For, createEffect,
} from 'solid-js';
import {TreeNode} from "./TreeNode";
import {Controller} from "../core/Controller";
import {MarkdownViewer} from "./MarkdownViewer";
import {Sidebar} from "./Sidebar";

import {supabase} from "../service/database";



// function migration(item) {
//   return { ...Item('', 0), ...item };
// }


const help = `
## Shortcuts
\`⌘ ↑\` Move node up  
\`⌘ ↓\` Move node down  
\`⌘ ←\` Hide child nodes  
\`⌘ →\` Show child nodes  
\`Tab\` Move node right  
\`⇧ Tab\` Move node left  
\`⌘ ⏎\` Toggle done/undone  
\`⌘ Z\` Undo action  
\`:\` Open command pallete  

## Commands
\`:help\` or \`:\` Print help  
\`:clear\` or \`<empty>\` Clear output  
\`:smile\` Print smile  
\`:dump\` Print data in JSON  
\`:toggle\` Theme Toggle theme  
\`:echo <text>\` Show <text>  
\`:exec <expr>\` Execute JS expression and print result  
\`:signup \<email\> \<password\>\` Sign up  
\`:signin \<email\> \<password\>\` Sign in  
\`:save\` Save data to external storage  
\`:load\` Load data from external storage  
`;


function App() {
    let bodyRef = document.body;
    let commandInputRef;


    const controller = new Controller()

    const currentItem = () => {
        return controller.getCurrentItem()
    }

    createEffect(() => {
      bodyRef.dataset.theme = controller.stateManager.state.theme;
    });

    // state.items.forEach((it, idx) => {
    //   setState('items', idx, migration(it));
    // });

    const [consoleOutput, setConsoleOutput] = createSignal('');

    const globalOnKeyDown = (e) => {
        if(e.key == 'e' && e.metaKey) {
            controller.toggleSidebarMode()
            return;
        }

        if(controller.stateManager.sidebarMode() === 'edit') {
            if(e.key === 'Tab') e.preventDefault()
            return;
        }

        if (e.key == 'ArrowUp' && !e.metaKey) {
            controller.selectPrevItem()
        }

        if (e.key == 'ArrowDown' && !e.metaKey) {
            controller.selectNextItem()
        }

        if (e.key == 'ArrowUp' && e.metaKey) {
            controller.moveNodeUp()
        }

        if (e.key == 'ArrowDown' && e.metaKey) {
            controller.moveNodeDown()
        }

        if (e.key == '/') {
        }

        if (e.key == ':') {
            commandInputRef.focus();
        }

        if (e.key == 'z' && e.metaKey) {
            e.preventDefault();
            controller.undoAction()
        }
    };

    const onKeyDown = (e: any) => {
        if(controller.stateManager.sidebarMode() === 'edit') {
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();

            if (e.shiftKey) {
                controller.moveNodeLeft()
            } else {
                controller.moveNodeRight()
            }
        }

        if (e.key == 'ArrowLeft' && e.metaKey) {
            e.preventDefault()
            controller.collapseNode()
        }

        if (e.key == 'ArrowRight' && e.metaKey) {
            e.preventDefault()
            controller.expandNode()
        }

        if (e.key == 'Enter') {
            if (e.altKey) {
                controller.toggleNodeStatus()

                e.preventDefault();
                return;
            }
            controller.createNode(e.shiftKey)
        }

        if (e.key == 'Backspace') {
            if (currentItem().title === '') {
                controller.deleteNode()
                e.preventDefault();
            }
        }
    };

    const handlePaste = (e) => {
        e.stopPropagation();
        e.preventDefault();

        const clipboardData = e.clipboardData;
        const pastedData = clipboardData.getData('Text');

        const lines = pastedData.split('\n')
        console.log("handle paste", {pastedData})
        if (lines.length > 1) {
            controller.bulkInsert(lines)
        } else {
            controller.loadInfo(pastedData)
        }
    };

    const search = (value: string) => {
    };

    const log = (data) => {
        setConsoleOutput(data);
    };

    const execCommand = (input: string) => {
        let [cmd, ...args] = input.split(' ');

        if (cmd == ':') {
            cmd = ':help';
        }
        if (cmd[0] == ':') {
            cmd = cmd.slice(1);
        }

        if (cmd[0] == '/') {
            search(cmd.slice(1));
            return;
        }

        if (cmd == '') {
            log('');
            return;
        }

        const commands = {
            smile: () => log('🙂'),
            echo: (...args) => log(args.join(' ')),
            clear: () => log(''),
            exec: (...args) => log(eval(args.join(' ')).toString()),
            toggleTheme: () => controller.toggleTheme(),
            dump: () => log(localStorage.getItem('state')),
            help: () => log(help),
            signup: (...args) => {
                const [email, password] = args;
                if(!email || !password) {
                    console.log({args})
                    log("Input email and password")
                    return;
                }
                supabase.auth.signUp({
                    email,
                    password
                }).then(r => {
                    console.log(r)
                    log("Confirm your email")
                });
            },
            signin: (...args) => {
                const [email, password] = args;
                if(!email || !password) {
                    console.log({args})
                    log("Input email and password")
                    return;
                }
                supabase.auth.signInWithPassword({
                    email,
                    password
                }).then(r => {
                    console.log(r)
                    controller.setUser(r)
                    log(`Logged in as ${r.data.user.email}`)
                });
            },
            whoami: () => {
                log(`\`\`\`json\n${JSON.stringify(controller.stateManager.state.user, null, 2)}\`\`\``)
            },
            save: () => {
                controller.saveData().then(r => log("Data saved"))
            },
            load: () => {
                log('Loading...')
                controller.fetchData().then(r => log("Data fetched"))
            }
        };

        if (commands[cmd]) {
            commands[cmd](...args);
        } else {
            log(`Unknown command ${cmd}`);
        }
    };

    bodyRef.addEventListener('keydown', globalOnKeyDown);

    return (
        <main class='main'>
            <div
                class='list'
                onKeyDown={onKeyDown}
            >
                <For each={controller.getTree()}>
                    {(item, idx) => (
                        <TreeNode
                            item={item}
                            controller={controller}
                            handlePaste={handlePaste}
                        ></TreeNode>
                    )}
                </For>
            </div>

            <Show when={!currentItem() || consoleOutput() !== ''}>
                <div class='sidebar markdown'>
                    <MarkdownViewer>{consoleOutput}</MarkdownViewer>
                </div>
            </Show>

            <Sidebar
                consoleOutput={consoleOutput}
                currentItem={currentItem}
                controller={controller}
            ></Sidebar>

            <div class='command'>
                <input
                    ref={commandInputRef}
                    onKeyUp={(e) =>
                        e.key == 'Enter' ? execCommand(e.target.value) : null
                    }
                />
            </div>
        </main>
    );
}

export default App;
