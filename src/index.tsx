/* @refresh reload */
import { render } from 'solid-js/web';

import { Root } from './Root';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => (
  <Root clientSettings={{ channels: ['y0nd'], options: { debug: true } }}/>
), root!);
