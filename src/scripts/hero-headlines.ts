export type Headline = {
	lead: string;
	sub: string;
};

export const headlines: Headline[] = [
    {
        lead: 'Full-Stack Apps Built to Scale.',
        sub: 'Web and mobile applications designed for high performance and reliability.',
    },
    {
        lead: 'Modernize Your Infrastructure Without Downtime.',
        sub: 'Seamless cloud migrations that cut costs and eliminate risk.',
    },
    {
        lead: 'Eliminate Bottlenecks with Intelligent Automation.',
        sub: 'Turn hundred-hour manual processes into instant, automated workflows.',
    },
    {
        lead: 'Engineering Expertise, Delivered on Demand.',
        sub: 'From MVP to production, we build software that drives business growth.',
    },
];

const INTERVAL_MS = 4200;
const FADE_MS = 380;

export function initHeroHeadlines(
	root: HTMLElement,
	items: Headline[] = headlines,
	intervalMs = INTERVAL_MS,
): () => void {
	if (items.length < 2) return () => {};

	const leadEl = root.querySelector<HTMLElement>('[data-hero-lead]');
	const subEl = root.querySelector<HTMLElement>('[data-hero-sub]');
	if (!leadEl || !subEl) return () => {};

	let index = 0;
	let timer: ReturnType<typeof setInterval> | undefined;
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const setCopy = (headline: Headline) => {
		leadEl.textContent = headline.lead;
		subEl.textContent = headline.sub;
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
