/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './components/App';

import * as serviceWorker from "./serviceWorker";
serviceWorker.register();

render(() => <App />, document.getElementById('root'));
