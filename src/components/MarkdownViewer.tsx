import remarkGfm from "remark-gfm";
import {createEffect, createSignal, Show} from "solid-js";
import SolidMarkdown from "solid-markdown";

export function MarkdownViewer(props) {
    const {children} = props;
    const list = () => props.children();
    const [visible, setVisible] = createSignal(true);

    createEffect(() => {
        list();
        setVisible(false);
        setTimeout(() => {
            setVisible(true);
        });
    });

    return (
        <div class="markdown">
            <Show when={visible()}>
                <SolidMarkdown children={children()} remarkPlugins={[remarkGfm]}/>
            </Show>
        </div>
    );
}