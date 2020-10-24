import App from './App.svelte';
import { intercom } from './Intercom';

const app = new App({
	target: document.body,
});

intercom.connect("ws://localhost:3000");

export default app;