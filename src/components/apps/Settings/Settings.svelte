<script lang="ts">
	type WispServer = { name: string; url: string; isCustom?: boolean };

	const defaultServers: WispServer[] = [{ name: 'GLSeries', url: 'wss://glseries.net/wisp/' }];

	let activeWisp = $state(localStorage.getItem('proxServer') || defaultServers[0].url);
	let autoswitch = $state(localStorage.getItem('wispAutoswitch') !== 'false');
	let customInput = $state('');
	let customServers = $state<WispServer[]>([]);
	let latencies = $state<Record<string, string>>({});

	const loadCustomServers = () => {
		try {
			const parsed = JSON.parse(localStorage.getItem('customWisps') || '[]');
			customServers = Array.isArray(parsed)
				? parsed
						.filter((item) => item?.url)
						.map((item, index) => ({
							name: item.name || `Custom ${index + 1}`,
							url: item.url,
							isCustom: true,
						}))
				: [];
		} catch {
			customServers = [];
		}
	};

	const persist = () => {
		localStorage.setItem('proxServer', activeWisp);
		localStorage.setItem('wispAutoswitch', String(autoswitch));
		localStorage.setItem(
			'customWisps',
			JSON.stringify(customServers.map((server) => ({ name: server.name, url: server.url }))),
		);
		navigator.serviceWorker.controller?.postMessage({
			type: 'config',
			wispurl: activeWisp,
			servers: [...defaultServers, ...customServers],
			autoswitch,
		});
	};

	const allServers = $derived([...defaultServers, ...customServers]);

	const chooseServer = (url: string) => {
		activeWisp = url;
		persist();
	};

	const toggleAutoswitch = () => {
		autoswitch = !autoswitch;
		persist();
	};

	const addServer = () => {
		const url = customInput.trim();
		if (!url || !url.startsWith('ws')) return;
		if (allServers.some((server) => server.url === url)) {
			customInput = '';
			return;
		}
		customServers = [
			...customServers,
			{ name: `Custom ${customServers.length + 1}`, url, isCustom: true },
		];
		customInput = '';
		persist();
	};

	const removeServer = (url: string) => {
		customServers = customServers.filter((server) => server.url !== url);
		if (activeWisp === url) activeWisp = defaultServers[0].url;
		persist();
	};

	const ping = async (url: string) => {
		const start = performance.now();
		try {
			const socket = new WebSocket(url);
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => {
					socket.close();
					reject(new Error('timeout'));
				}, 2000);
				socket.onopen = () => {
					clearTimeout(timeout);
					socket.close();
					resolve();
				};
				socket.onerror = () => {
					clearTimeout(timeout);
					reject(new Error('error'));
				};
			});
			latencies[url] = `${Math.round(performance.now() - start)} ms`;
		} catch {
			latencies[url] = 'offline';
		}
	};

	loadCustomServers();

	$effect(() => {
		allServers.forEach((server) => ping(server.url));
	});
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<h1>Proxy Settings</h1>
	</header>

	<section class="main-area">
		<div class="section-title">Select Server</div>
		<div class="server-list">
			{#each allServers as server}
				<button class="server-item" class:active={server.url === activeWisp} onclick={() => chooseServer(server.url)}>
					<div class="left">
						<div class="name">{server.name}</div>
						<div class="url">{server.url}</div>
					</div>
					<div class="right">
						<span class="latency">{latencies[server.url] || '...'}</span>
						{#if server.isCustom}
							<span class="delete" role="button" tabindex="0" onclick={(event) => { event.stopPropagation(); removeServer(server.url); }} onkeydown={(event) => event.key === "Enter" && removeServer(server.url)}>✕</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>

		<button class="toggle" class:enabled={autoswitch} onclick={toggleAutoswitch}>
			Auto-switch on failure: {autoswitch ? 'On' : 'Off'}
		</button>

		<div class="section-title">Custom Server</div>
		<div class="add-row">
			<input bind:value={customInput} placeholder="wss://your-wisp-server.com/wisp/" />
			<button onclick={addServer}>Add</button>
		</div>
	</section>
</section>

<style>
	.container { background-color: var(--system-color-light); border-radius: inherit; height: 100%; display: grid; grid-template-rows: 3.2rem 1fr; }
	.titlebar { display: flex; align-items: center; padding: 0 5rem; }
	h1 { color: var(--system-color-light-contrast); font-size: 1rem; }
	.main-area { padding: 1rem; display: grid; gap: 0.8rem; overflow: auto; }
	.section-title { color: var(--system-color-light-contrast); font-size: 0.9rem; font-weight: 600; }
	.server-list { display: grid; gap: 0.5rem; }
	.server-item { background: hsla(var(--system-color-dark-hsl), 0.08); border-radius: 0.7rem; padding: 0.65rem 0.75rem; display: flex; justify-content: space-between; align-items: center; text-align: left; color: var(--system-color-light-contrast); }
	.server-item.active { outline: 2px solid hsl(214deg 88% 53%); }
	.name { font-weight: 600; }
	.url { font-size: 0.78rem; color: hsla(var(--system-color-dark-hsl), 0.7); }
	.right { display: flex; align-items: center; gap: 0.6rem; }
	.latency { font-size: 0.8rem; color: hsla(var(--system-color-dark-hsl), 0.7); }
	.delete { color: hsl(0deg 70% 56%); font-weight: 700; cursor: pointer; }
	.toggle { background: hsla(var(--system-color-dark-hsl), 0.08); color: var(--system-color-light-contrast); border-radius: 0.6rem; padding: 0.6rem; text-align: left; }
	.toggle.enabled { background: hsla(214deg, 88%, 53%, 0.15); }
	.add-row { display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; }
	input { background: white; border: 1px solid hsla(var(--system-color-dark-hsl), 0.2); color: #111; padding: 0.55rem 0.7rem; border-radius: 0.45rem; }
	.add-row button { border-radius: 0.45rem; padding: 0.5rem 0.8rem; background: hsl(214deg 88% 53%); color: white; }
</style>
