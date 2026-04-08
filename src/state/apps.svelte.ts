export type AppID = string;

export const apps = $state({
	open: {
		wallpapers: false,
		finder: true,
		vscode: false,
		calculator: false,
		appstore: false,
		calendar: false,
		'purus-twitter': false,
		'view-source': true,
		vercel: true,
	} as Record<AppID, boolean>,

	active: 'finder' as AppID,

	active_z_index: -2,

	z_indices: {
		wallpapers: 0,
		finder: 0,
		vscode: 0,
		calculator: 0,
		appstore: 0,
		calendar: 0,
		'purus-twitter': 0,
		'view-source': 0,
		vercel: 0,
	} as Record<AppID, number>,

	is_being_dragged: false as boolean,

	fullscreen: {
		wallpapers: false,
		finder: false,
		vscode: false,
		calculator: false,
		appstore: false,
		calendar: false,
		'purus-twitter': false,
		'view-source': false,
		vercel: false,
	} as Record<AppID, boolean>,
});
