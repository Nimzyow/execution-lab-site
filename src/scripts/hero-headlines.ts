export const headlines = [
	'Full-Stack Apps Built to Scale.',
	'Modernize Your Infrastructure Without Downtime.',
	'Eliminate Bottlenecks with Intelligent Automation.',
	'Engineering Expertise, Delivered on Demand.',
] as const;

export type Headline = (typeof headlines)[number];

const INTERVAL_MS = 4200;
const FADE_MS = 380;

export function initHeroHeadlines(
	root: HTMLElement,
	items: readonly string[] = headlines,
	intervalMs = INTERVAL_MS,
): () => void {
	if (items.length < 2) return () => {};

	const leadEl = root.querySelector<HTMLElement>('[data-hero-lead]');
	if (!leadEl) return () => {};

	let index = 0;
	let timer: ReturnType<typeof setInterval> | undefined;
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const setCopy = (headline: string) => {
		leadEl.textContent = headline;
	};

	const advance = () => {
		index = (index + 1) % items.length;
		const next = items[index];
		if (!next) return;

		if (prefersReducedMotion) {
			setCopy(next);
			return;
		}

		root.classList.add('is-fading');
		window.setTimeout(() => {
			setCopy(next);
			root.classList.remove('is-fading');
		}, FADE_MS);
	};

	const start = () => {
		if (timer || document.hidden) return;
		timer = setInterval(advance, intervalMs);
	};

	const stop = () => {
		if (!timer) return;
		clearInterval(timer);
		timer = undefined;
	};

	const onVisibility = () => {
		if (document.hidden) stop();
		else start();
	};

	document.addEventListener('visibilitychange', onVisibility);
	start();

	return () => {
		stop();
		document.removeEventListener('visibilitychange', onVisibility);
	};
}
