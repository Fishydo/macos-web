<script lang="ts">
	import { apps, type AppID } from '🍎/state/apps.svelte.ts';

	type FeaturedAppID = 'calculator' | 'calendar' | 'vscode' | 'system-preferences';

	type StoreApp = {
		id: FeaturedAppID;
		title: string;
		description: string;
		icon: string;
	};


	const { app_id }: { app_id: AppID } = $props();
	void app_id;

	const featuredApps: StoreApp[] = [
		{
			id: 'calculator',
			title: 'Calculator',
			description: 'Quick calculations with the native desktop calculator.',
			icon: '/app-icons/calculator/256.webp',
		},
		{
			id: 'calendar',
			title: 'Calendar',
			description: 'Monthly and daily schedule view with macOS styling.',
			icon: '/app-icons/calendar/256.webp',
		},
		{
			id: 'vscode',
			title: 'VSCode',
			description: 'Open the built-in code editor workspace.',
			icon: '/app-icons/vscode/256.webp',
		},
		{
			id: 'system-preferences',
			title: 'Settings',
			description: 'Configure proxy Wisp endpoints and custom server list.',
			icon: '/app-icons/system-preferences/256.webp',
		},
	];

	const openApp = (appId: AppID) => {
		apps.open[appId] = true;
		apps.active = appId;
	};
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<h1>App Store</h1>
	</header>

	<section class="main-area">
		<p class="intro">Featured apps</p>

		<div class="grid">
			{#each featuredApps as app}
				<div class="card">
					<img src={app.icon} alt={app.title} />

					<div class="content">
						<h2>{app.title}</h2>
						<p>{app.description}</p>
					</div>

					<button onclick={() => openApp(app.id)}>Open</button>
				</div>
			{/each}
		</div>
	</section>
</section>

<style>
	.container {
		background-color: var(--system-color-light);
		border-radius: inherit;
		height: 100%;
		display: grid;
		grid-template-rows: 3rem 1fr;
	}

	.titlebar {
		display: flex;
		align-items: center;
		padding: 0 5rem;
	}

	h1 {
		font-size: 1rem;
		color: var(--system-color-light-contrast);
	}

	.main-area {
		padding: 1rem;
		overflow: auto;
		display: grid;
		gap: 0.8rem;
	}

	.intro {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--system-color-light-contrast);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 0.75rem;
	}

	.card {
		background: hsla(var(--system-color-dark-hsl), 0.07);
		border-radius: 0.8rem;
		padding: 0.7rem;
		display: grid;
		grid-template-columns: 3rem 1fr auto;
		align-items: center;
		gap: 0.7rem;
	}

	img {
		width: 3rem;
		height: 3rem;
		border-radius: 0.65rem;
	}

	h2 {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--system-color-light-contrast);
	}

	p {
		font-size: 0.8rem;
		color: hsla(var(--system-color-dark-hsl), 0.75);
	}

	button {
		background: hsl(214deg 88% 53%);
		color: white;
		font-weight: 600;
		border-radius: 0.45rem;
		padding: 0.4rem 0.7rem;
	}
</style>
