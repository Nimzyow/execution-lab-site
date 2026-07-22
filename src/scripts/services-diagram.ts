export type ServiceFilter = 'all' | 'software' | 'platform';

export type FilterMeta = {
	id: ServiceFilter;
	label: string;
	summaryTitle: string;
	summaryBody: string;
	focus: string[];
};

export const filters: FilterMeta[] = [
	{
		id: 'all',
		label: 'All Services',
		summaryTitle: 'Unified stack',
		summaryBody:
			'End-to-end delivery across product software and production infrastructure—or a focused engagement on any layer.',
		focus: [
			'Web & mobile products',
			'APIs & tooling',
			'Data & workflows',
			'Cloud reliability',
		],
	},
	{
		id: 'software',
		label: 'Software Development',
		summaryTitle: 'Full-stack product & tooling',
		summaryBody:
			'Ship modern web and mobile apps, APIs, and automation tooling—integrated with your team or delivered end-to-end.',
		focus: ['Fast web products', 'Native apps', 'API & logic', 'Automation tooling'],
	},
	{
		id: 'platform',
		label: 'Platform & Infrastructure',
		summaryTitle: 'Reliability, releases & cost',
		summaryBody:
			'Harden AWS foundations, automate CI/CD, and recover cloud spend without sacrificing uptime.',
		focus: ['High availability', 'CI/CD', 'Cost control', 'Zero-downtime ops'],
	},
];

export function initServicesDiagram(root: HTMLElement): () => void {
	const buttons = root.querySelectorAll<HTMLButtonElement>('[data-filter]');
	const layers = root.querySelectorAll<SVGElement>('[data-layer]');
	const callouts = root.querySelectorAll<HTMLElement | SVGElement>('[data-callout]');
	const summaryTitle = root.querySelector<HTMLElement>('[data-summary-title]');
	const summaryBody = root.querySelector<HTMLElement>('[data-summary-body]');
	const summaryFocus = root.querySelector<HTMLElement>('[data-summary-focus]');

	const apply = (filter: ServiceFilter) => {
		const meta = filters.find((item) => item.id === filter) ?? filters[0];
		if (!meta) return;

		root.dataset.activeFilter = filter;

		buttons.forEach((button) => {
			const active = button.dataset.filter === filter;
			button.setAttribute('aria-pressed', active ? 'true' : 'false');
			button.classList.toggle('is-active', active);
		});

		layers.forEach((layer) => {
			const group = layer.dataset.layerGroup ?? '';
			const match =
				filter === 'all' ||
				(filter === 'software' && group === 'software') ||
				(filter === 'platform' && group === 'platform');
			layer.classList.toggle('is-dimmed', !match);
			layer.classList.toggle('is-active', match && filter !== 'all');
		});

		callouts.forEach((callout) => {
			const group = callout.dataset.calloutGroup ?? '';
			const match =
				filter === 'all' ||
				(filter === 'software' && group === 'software') ||
				(filter === 'platform' && group === 'platform');
			callout.classList.toggle('is-dimmed', !match);
		});

		if (summaryTitle) summaryTitle.textContent = meta.summaryTitle;
		if (summaryBody) summaryBody.textContent = meta.summaryBody;
		if (summaryFocus) {
			summaryFocus.replaceChildren(
				...meta.focus.map((item) => {
					const li = document.createElement('li');
					li.className =
						'border border-zinc-800 px-3 py-1 font-mono text-xs text-zinc-400';
					li.textContent = item;
					return li;
				}),
			);
		}
	};

	const onClick = (event: Event) => {
		const target = event.currentTarget;
		if (!(target instanceof HTMLButtonElement)) return;
		const filter = target.dataset.filter as ServiceFilter | undefined;
		if (!filter) return;
		apply(filter);
	};

	buttons.forEach((button) => button.addEventListener('click', onClick));
	apply('all');

	return () => {
		buttons.forEach((button) => button.removeEventListener('click', onClick));
	};
}
