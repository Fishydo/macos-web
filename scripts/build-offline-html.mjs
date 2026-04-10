import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');
const inputHtml = join(distDir, 'index.html');
const outputHtml = join(distDir, 'offline.html');

if (!existsSync(inputHtml)) {
	console.error('Missing dist/index.html. Run the Vite build first.');
	process.exit(1);
}

const MIME_TYPES = {
	'.js': 'text/javascript',
	'.mjs': 'text/javascript',
	'.css': 'text/css',
	'.html': 'text/html',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.otf': 'font/otf',
	'.mp3': 'audio/mpeg',
};

const isRemote = (value) => /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('#');

function resolveLocalPath(value, baseDir) {
	if (!value || isRemote(value)) return null;
	const clean = value.split('?')[0].split('#')[0];
	if (clean.startsWith('/')) return join(distDir, clean.slice(1));
	return resolve(baseDir, clean);
}

function toDataUri(filePath) {
	const ext = extname(filePath).toLowerCase();
	const mime = MIME_TYPES[ext] ?? 'application/octet-stream';
	const data = readFileSync(filePath);
	const encoded = data.toString('base64');
	return `data:${mime};base64,${encoded}`;
}

function inlineCssAssets(css, cssDir) {
	return css.replace(/url\(([^)]+)\)/g, (match, raw) => {
		const value = raw.trim().replace(/^['"]|['"]$/g, '');
		if (!value || isRemote(value)) return match;

		const assetPath = resolveLocalPath(value, cssDir);
		if (!assetPath || !existsSync(assetPath)) return match;

		return `url(${toDataUri(assetPath)})`;
	});
}

let html = readFileSync(inputHtml, 'utf8');
const htmlDir = dirname(inputHtml);

html = html.replace(/<link([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi, (full, before, href, after) => {
	if (isRemote(href) || !/rel=["']stylesheet["']/i.test(full)) return full;
	const cssPath = resolveLocalPath(href, htmlDir);
	if (!cssPath || !existsSync(cssPath)) return full;
	let css = readFileSync(cssPath, 'utf8');
	css = inlineCssAssets(css, dirname(cssPath));
	return `<style data-inline-source="${href}">${css}</style>`;
});

html = html.replace(/<script([^>]*?)src=["']([^"']+)["']([^>]*)><\/script>/gi, (full, before, src, after) => {
	if (isRemote(src)) return full;
	const scriptPath = resolveLocalPath(src, htmlDir);
	if (!scriptPath || !existsSync(scriptPath)) return full;
	const js = readFileSync(scriptPath, 'utf8');
	const attrs = `${before ?? ''}${after ?? ''}`.replace(/\s*crossorigin(?:=["'][^"']*["'])?/gi, '');
	return `<script${attrs} data-inline-source="${src}">${js}</script>`;
});

html = html.replace(/<(img|source)\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*?)>/gi, (full, tag, before, src, after) => {
	if (isRemote(src)) return full;
	const assetPath = resolveLocalPath(src, htmlDir);
	if (!assetPath || !existsSync(assetPath)) return full;
	const dataUri = toDataUri(assetPath);
	return `<${tag}${before}src="${dataUri}"${after}>`;
});

html = html.replace(/<link([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi, (full, before, href, after) => {
	if (isRemote(href)) return full;
	if (/rel=["']stylesheet["']/i.test(full)) return full;
	const assetPath = resolveLocalPath(href, htmlDir);
	if (!assetPath || !existsSync(assetPath)) return full;
	const dataUri = toDataUri(assetPath);
	return `<link${before}href="${dataUri}"${after}>`;
});

writeFileSync(outputHtml, html, 'utf8');
console.log(`Wrote offline single-file HTML: ${outputHtml}`);
