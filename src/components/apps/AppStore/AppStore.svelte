<script lang="ts">
	import type { AppID } from '🍎/state/apps.svelte.ts';
	import { apps } from '🍎/state/apps.svelte.ts';
	import {
		installed_web_apps,
		install_web_app,
		to_installable_url,
	} from '🍎/state/installed-apps.svelte.ts';

	const { app_id }: { app_id: AppID } = $props();

	let input_url = $state('');
	let error = $state('');

	const install = () => {
		error = '';

		try {
			const normalized = to_installable_url(input_url);
			const installed = install_web_app(normalized);

			apps.open[installed.id] = true;
			apps.active = installed.id;

			input_url = '';
		} catch {
			error = 'Enter a valid URL like lcc-math.pages.dev or https://example.com';
		}
	};

	const openApp = (targetAppID: string) => {
		apps.open[targetAppID] = true;
		apps.active = targetAppID;
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
					onkeydown={(event) => event.key === 'Enter' && install()}
				/>
				<button onclick={install}>Install</button>
			</div>
			{#if error}
				<p class="error">{error}</p>
			{/if}
		</div>

		<div class="apps-list">
			<h2>Installed apps</h2>
			{#if installed_web_apps.length === 0}
				<p class="empty">No apps installed yet.</p>
			{:else}
				{#each installed_web_apps as webApp}
					<button class="installed-app" onclick={() => openApp(webApp.id)}>
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
	}

	.name {
		font-weight: 600;
	}
</style>
