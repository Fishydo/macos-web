<script lang="ts">
	import { onMount } from 'svelte';
	import { sleep } from '🍎/helpers/sleep';
	import { get_app_icon_path } from '🍎/configs/apps/app-icons.config.ts';
	import type { AppID } from '🍎/state/apps.svelte.ts';
	import { preferences } from '🍎/state/preferences.svelte.ts';
	import { spring } from '🍎/state/spring.svelte.ts';
	import { should_show_notch } from '🍎/state/menubar.svelte.ts';

	const { app_id }: { app_id: AppID } = $props();

	const motion_val = spring(0, { damping: 0.28, stiffness: 0.1 });

	onMount(async () => {
		await sleep(100);

		motion_val.value = 1;
	});

	const image_transform = $derived(
		!preferences.reduced_motion
			? `rotate(${180 * (motion_val.value + 1)}deg) scale(${motion_val.value}) translateZ(0px)`
			: 'initial',
	);

	const is_app_installer = $derived(app_id === 'appstore');
	const is_settings = $derived(app_id === 'system-preferences');

	const base_url = import.meta.env.BASE_URL;

	const installables = [
		{ title: 'Proxy Browser', path: `${base_url}staticsjv2/index.html` },
		{ title: 'Proxy Embed', path: `${base_url}staticsjv2/embed.html#https://example.com` },
	];

	const current_installations = $state<Record<string, boolean>>({});

	for (const app of installables) {
		current_installations[app.title] = localStorage.getItem(`macos:installed:${app.title}`) === 'true';
	}

	function install_app(title: string) {
		current_installations[title] = true;
		localStorage.setItem(`macos:installed:${title}`, 'true');
	}

	function open_app(path: string) {
		window.open(path, '_blank', 'noopener,noreferrer');
	}
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle"></header>
	<section class="main-area">
		{#if is_app_installer}
			<h1>App Installer</h1>
			<p>Install and launch bundled proxy apps.</p>
			<div class="cards">
				{#each installables as app}
					<article class="card">
						<h2>{app.title}</h2>
						<div class="actions">
							<button onclick={() => install_app(app.title)} disabled={current_installations[app.title]}>
								{current_installations[app.title] ? 'Installed' : 'Install'}
							</button>
							<button onclick={() => open_app(app.path)}>Open</button>
						</div>
					</article>
				{/each}
			</div>
		{:else if is_settings}
			<h1>Settings</h1>
			<div class="cards settings-grid">
				<label class="setting-row">
					<span>Dark Mode</span>
					<input
						type="checkbox"
						checked={preferences.theme.scheme === 'dark'}
						onchange={(event) =>
							(preferences.theme.scheme = (event.currentTarget as HTMLInputElement).checked
								? 'dark'
								: 'light')}
					/>
				</label>
				<label class="setting-row">
					<span>Reduce Motion</span>
					<input type="checkbox" bind:checked={preferences.reduced_motion} />
				</label>
				<label class="setting-row">
					<span>Show Notch</span>
					<input type="checkbox" bind:checked={should_show_notch.value} />
				</label>
			</div>
		{:else}
			<img
				style:transform={image_transform}
				src={get_app_icon_path(app_id)}
				alt="Placeholder App"
			/>

			<br />

			<h1 style:display="flex" style:align-items="center" style:gap="0.5rem">
				Nothing here yet <img
					style="height: 1em; width: auto; transform: translateY(0.1em);"
					src="/emojis/wink.png"
					alt="Wink Emoji"
				/>
			</h1>
		{/if}
	</section>
</section>

<style>
	.container {
		background-color: var(--system-color-light);

		border-radius: inherit;
	}

	.titlebar {
		padding: 1rem 1rem;

		width: 100%;

		position: absolute;
		top: 0;
		left: 0;
	}

	.main-area {
		font-size: 1.618rem;
		color: var(--system-color-light-contrast);

		height: 100%;
		width: 100%;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
	}

	img {
		max-width: 8rem;
		aspect-ratio: 1 / 1;
	}

	.cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		width: min(720px, 100%);
	}

	.card {
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.15);
		border-radius: 0.75rem;
		padding: 1rem;
		font-size: 1rem;
	}

	.card h2 {
		font-size: 1rem;
		margin-bottom: 0.75rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	button {
		padding: 0.5rem 0.8rem;
		border-radius: 0.5rem;
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.2);
		background: hsla(var(--system-color-light-hsl), 0.7);
		font-size: 0.9rem;
	}

	button:disabled {
		opacity: 0.6;
	}

	.settings-grid {
		grid-template-columns: 1fr;
		max-width: 520px;
	}

	.setting-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 1rem;
		padding: 0.75rem 1rem;
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.15);
		border-radius: 0.75rem;
	}
</style>
