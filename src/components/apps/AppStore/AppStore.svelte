<script lang="ts">
	import { onMount } from 'svelte';
	import type { AppID } from '🍎/state/apps.svelte.ts';
	import { apps } from '🍎/state/apps.svelte.ts';
	import {
		installed_web_apps,
		install_web_app,
		to_installable_url,
		type WebAppInstallOptions,
	} from '🍎/state/installed-apps.svelte.ts';

	type CatalogApp = {
		id: string;
		url: string;
		appname: string;
		imageurl: string;
	};

	const { app_id }: { app_id: AppID } = $props();

	let input_url = $state('');
	let error = $state('');
	let catalog = $state<CatalogApp[]>([]);

	const parseCatalogLine = (line: string) => {
		const match = line.match(/^(\S+)\s+url="([^"]+)"\s+appname="([^"]+)"\s+imageurl="([^"]+)"$/);

		if (!match) return null;

		return {
			id: match[1],
			url: match[2],
			appname: match[3],
			imageurl: match[4],
		} satisfies CatalogApp;
	};

	onMount(async () => {
		try {
			const response = await fetch('/app-list.txt');
			if (!response.ok) return;

			const body = await response.text();
			catalog = body
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)
				.map(parseCatalogLine)
				.filter(Boolean) as CatalogApp[];
		} catch {
			catalog = [];
		}
	});

	const openInstalled = (installedID: string) => {
		apps.open[installedID] = true;
		apps.active = installedID;
	};

	const install = (url: string, options: WebAppInstallOptions = {}) => {
		error = '';

		try {
			const normalized = to_installable_url(url);
			const installed = install_web_app(normalized, options);

			apps.open[installed.id] = true;
			apps.active = installed.id;

			input_url = '';
		} catch {
			error = 'Enter a valid URL like lcc-math.pages.dev or https://example.com';
		}
	};
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<h1>App Store</h1>
	</header>

	<section class="main-area">
		<div class="install-card">
			<label for="url-input">Install a web app URL</label>
			<div class="install-row">
				<input
					id="url-input"
					bind:value={input_url}
					placeholder="lcc-math.pages.dev"
					onkeydown={(event) => event.key === 'Enter' && install(input_url)}
				/>
				<button onclick={() => install(input_url)}>Install</button>
			</div>
			{#if error}
				<p class="error">{error}</p>
			{/if}
		</div>

		{#if catalog.length > 0}
			<div class="apps-list">
				<h2>Catalog</h2>
				{#each catalog as app}
					<button
						class="installed-app"
						onclick={() =>
							install(app.url, {
								id: app.id,
								appname: app.appname,
								imageurl: app.imageurl,
							})}
					>
						<img src={app.imageurl} alt={app.appname} />
						<div>
							<p class="name">{app.appname}</p>
							<p class="url">{app.url}</p>
						</div>
					</button>
				{/each}
			</div>
		{/if}

		<div class="apps-list">
			<h2>Installed apps</h2>
			{#if installed_web_apps.length === 0}
				<p class="empty">No apps installed yet.</p>
			{:else}
				{#each installed_web_apps as webApp}
					<button class="installed-app" onclick={() => openInstalled(webApp.id)}>
						<img src={webApp.icon} alt={webApp.title} />
						<div>
							<p class="name">{webApp.title}</p>
							<p class="url">{webApp.url}</p>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</section>
</section>

<style>
	.container {
		background-color: var(--system-color-light);
		border-radius: inherit;
		height: 100%;
		display: grid;
		grid-template-rows: 3.2rem 1fr;
	}

	.titlebar {
		display: flex;
		align-items: center;
		padding-left: 5rem;
	}

	h1 {
		font-size: 1rem;
		color: var(--system-color-light-contrast);
	}

	.main-area {
		padding: 1rem;
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		overflow: auto;
	}

	.install-card {
		padding: 1rem;
		border-radius: 0.8rem;
		background: hsla(var(--system-color-dark-hsl), 0.08);
		display: grid;
		gap: 0.8rem;
	}

	.install-row {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.5rem;
	}

	input {
		background: white;
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.2);
		color: #111;
		padding: 0.55rem 0.7rem;
		border-radius: 0.45rem;
	}

	button {
		border-radius: 0.5rem;
		padding: 0.5rem 0.9rem;
		background: hsl(210deg 90% 52%);
		color: white;
		font-weight: 500;
	}

	.apps-list {
		display: grid;
		gap: 0.6rem;
	}

	h2 {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--system-color-light-contrast);
	}

	.empty,
	.error,
	.url {
		color: hsla(var(--system-color-dark-hsl), 0.7);
		font-size: 0.85rem;
	}

	.installed-app {
		display: grid;
		grid-template-columns: 2.3rem 1fr;
		gap: 0.7rem;
		text-align: left;
		background: hsla(var(--system-color-light-hsl), 0.55);
		color: var(--system-color-light-contrast);
		align-items: center;
	}

	.installed-app img {
		width: 2.3rem;
		height: 2.3rem;
		border-radius: 0.55rem;
		object-fit: cover;
	}

	.name {
		font-weight: 600;
	}
</style>
