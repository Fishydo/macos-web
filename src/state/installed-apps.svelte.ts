import { create_app_config, type AppConfig } from '🍎/helpers/create-app-config.ts';
import { persisted } from './persisted.svelte.ts';

export type InstalledWebApp = {
	id: string;
	title: string;
	url: string;
	proxy_url: string;
	icon: string;
};

export type WebAppInstallOptions = {
	id?: string;
	appname?: string;
	imageurl?: string;
};

export const installed_web_apps = persisted('installed-web-apps', [] as InstalledWebApp[]);

const sanitize = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/(^\w+:|^)\/\//, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48);

export const to_installable_url = (value: string) => {
	const normalized = value.trim().match(/^https?:\/\//i) ? value.trim() : `https://${value.trim()}`;
	return new URL(normalized).toString();
};

export const create_web_app = (value: string, options: WebAppInstallOptions = {}): InstalledWebApp => {
	const url = to_installable_url(value);
	const parsed = new URL(url);
	const cleanHost = sanitize(parsed.hostname || parsed.host || url);
	const id = options.id ? sanitize(options.id) : `webapp-${cleanHost || `site-${Date.now()}`}`;
	const title = options.appname?.trim() || cleanHost || parsed.hostname || 'Web App';
	const proxy_url = `/staticsjv2/index.html?embedded=1#${encodeURIComponent(url)}`;
	const icon = options.imageurl?.trim() || '/app-icons/safari/256.webp';

	return {
		id: id.startsWith('webapp-') ? id : `webapp-${id}`,
		title,
		url,
		proxy_url,
		icon,
	};
};

export const install_web_app = (value: string, options: WebAppInstallOptions = {}) => {
	const next = create_web_app(value, options);
	const existingIndex = installed_web_apps.findIndex((app) => app.id === next.id);

	if (existingIndex >= 0) {
		installed_web_apps[existingIndex] = next;
		return next;
	}

	installed_web_apps.push(next);
	return next;
};

export const get_web_apps_config = () =>
	Object.fromEntries(
		installed_web_apps.map((webApp) => [
			webApp.id,
			create_app_config({
				title: webApp.title,
				resizable: true,
				height: 650,
				width: 980,
			}) satisfies AppConfig,
		]),
	);

export const get_web_app_by_id = (app_id: string) => installed_web_apps.find((app) => app.id === app_id);
