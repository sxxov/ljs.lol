// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import App from './App.svelte';
import './global.css';

const app = new App({
	target: document.body,
	props: {},
});

export default app;
