<script lang="ts">
	import { get_web_app_by_id } from '🍎/state/installed-apps.svelte.ts';
	import type { AppID } from '🍎/state/apps.svelte.ts';

	const { app_id }: { app_id: AppID } = $props();
	const webApp = $derived(get_web_app_by_id(app_id));
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<div class="title">{webApp?.title ?? 'Web App'}</div>
	</header>

	{#if webApp}
		<iframe title={webApp.title} src={webApp.proxy_url}></iframe>
	{:else}
		<div class="missing">App could not be loaded.</div>
	{/if}
</section>

<style>
	.container {
		height: 100%;
		width: 100%;
		background: var(--system-color-light);
		border-radius: inherit;
		overflow: hidden;
		display: grid;
		grid-template-rows: 3rem 1fr;
	}

	.titlebar {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.9rem;
		color: var(--system-color-light-contrast);
		font-weight: 500;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: 0;
		background: white;
	}

	.missing {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--system-color-light-contrast);
	}
</style>
