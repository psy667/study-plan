/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './components/App';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/serviceworker.js");
}

render(() => <App />, document.getElementById('root'));
