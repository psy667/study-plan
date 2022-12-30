/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './components/App';


import { registerSW } from "virtual:pwa-register";

if ("serviceWorker" in navigator) {
    // && !/localhost/.test(window.location)) {
    registerSW();
}

render(() => <App />, document.getElementById('root'));
