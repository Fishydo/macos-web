<script lang="ts">
	let proxServer = $state(localStorage.getItem('proxServer') || 'wss://glseries.net/wisp/');
	let customWisp = $state('');

	const parsedCustomWisps = () => {
		try {
			const existing = JSON.parse(localStorage.getItem('customWisps') || '[]');
			return Array.isArray(existing) ? existing : [];
		} catch {
			return [];
		}
	};

	let customWisps = $state(parsedCustomWisps() as Array<{ name?: string; url: string }>);

	const saveProxServer = () => {
		if (!proxServer.trim()) return;
		localStorage.setItem('proxServer', proxServer.trim());
	};

	const addCustomWisp = () => {
		const value = customWisp.trim();
		if (!value) return;

		if (customWisps.some((entry) => entry.url === value)) {
			customWisp = '';
			return;
		}

		customWisps = [...customWisps, { name: `Wisp ${customWisps.length + 1}`, url: value }];
		localStorage.setItem('customWisps', JSON.stringify(customWisps));
		customWisp = '';
	};

	const removeCustomWisp = (url: string) => {
		customWisps = customWisps.filter((entry) => entry.url !== url);
		localStorage.setItem('customWisps', JSON.stringify(customWisps));
	};
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<h1>Settings</h1>
	</header>

	<section class="main-area">
		<div class="card">
			<h2>Active Wisp</h2>
			<div class="row">
				<input bind:value={proxServer} placeholder="wss://example.com/wisp/" />
				<button onclick={saveProxServer}>Save</button>
			</div>
		</div>

		<div class="card">
			<h2>Custom Wisps</h2>
			<div class="row">
				<input bind:value={customWisp} placeholder="wss://example.com/wisp/" />
				<button onclick={addCustomWisp}>Add</button>
			</div>

			<div class="list">
				{#if customWisps.length === 0}
					<p class="muted">No custom wisps yet.</p>
				{:else}
					{#each customWisps as entry}
						<div class="item">
							<span>{entry.url}</span>
							<button class="remove" onclick={() => removeCustomWisp(entry.url)}>Remove</button>
						</div>
					{/each}
				{/if}
			</div>
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

	h1,
	h2 {
		color: var(--system-color-light-contrast);
	}

	.main-area {
		display: grid;
		gap: 1rem;
		padding: 1rem;
		overflow: auto;
	}

	.card {
		padding: 1rem;
		border-radius: 0.8rem;
		background: hsla(var(--system-color-dark-hsl), 0.08);
		display: grid;
		gap: 0.7rem;
	}

	.row {
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
		padding: 0.45rem 0.8rem;
		background: hsl(210deg 90% 52%);
		color: white;
	}

	.list {
		display: grid;
		gap: 0.5rem;
	}

	.item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
		padding: 0.45rem 0.6rem;
		background: hsla(var(--system-color-light-hsl), 0.55);
		border-radius: 0.5rem;
		color: var(--system-color-light-contrast);
	}

	.remove {
		background: hsl(0deg 75% 57%);
	}

	.muted {
		color: hsla(var(--system-color-dark-hsl), 0.7);
	}
</style>
