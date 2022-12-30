/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './components/App';


if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/serviceworker.js')
        .then(() => { console.log('Service Worker Registered'); });
}

render(() => <App />, document.getElementById('root'));
