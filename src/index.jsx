/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './components/App';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/assets/serviceworker.js");
}

render(() => <App />, document.getElementById('root'));
