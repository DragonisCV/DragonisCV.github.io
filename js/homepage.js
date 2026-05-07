const DATA_URL = 'data/site-data.json';
const GITHUB_API = 'https://api.github.com/repos/';

let currentPublicationSort = 'author';
let currentPublicationFilter = 'all';
let publications = [];

function formatNumber(value) {
    if (!Number.isFinite(value)) return '-';
    return new Intl.NumberFormat('en', {
        notation: value >= 1000 ? 'compact' : 'standard',
        maximumFractionDigits: 1
    }).format(value);
}

function createButton(link) {
    const anchor = document.createElement('a');
    anchor.className = `btn${link.style === 'red' ? ' btn-red' : ''}${link.style === 'dark' ? ' btn-dark' : ''}`;
    anchor.href = link.href;
    anchor.textContent = link.label;
    if (/^https?:\/\//.test(link.href)) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
    }
    return anchor;
}

function githubRepoFromUrl(url) {
    if (!url) return '';
    try {
        const parsed = new URL(url);
        if (parsed.hostname !== 'github.com') return '';
        const [owner, repo] = parsed.pathname.split('/').filter(Boolean);
        return owner && repo ? `${owner}/${repo.replace(/\.git$/, '')}` : '';
    } catch (error) {
        return '';
    }
}

function publicationGithubRepo(pub) {
    if (pub.github) return pub.github;
    const githubLink = (pub.links || []).find(link => githubRepoFromUrl(link.href));
    return githubRepoFromUrl(githubLink?.href);
}

function renderNews(items) {
    const list = document.getElementById('news-list');
    if (!list) return;
    list.innerHTML = items.map(item => (
        `<li class="news-item"><time>${item.date}</time> -- ${item.html}</li>`
    )).join('');
}

function renderResearchLine(items) {
    const container = document.getElementById('research-line');
    if (!container) return;
    container.innerHTML = items.map((item, index) => `
        <article class="line-card reveal" style="--line-index: ${index}">
            <span class="line-year">${item.year}</span>
            <span class="focus-kicker">${item.kicker}</span>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
            <div class="focus-tags">
                ${item.tags.map(tag => `<span class="focus-tag">${tag}</span>`).join('')}
            </div>
        </article>
    `).join('');
}

function renderPublications() {
    const container = document.getElementById('publication-list');
    if (!container) return;

    const sorted = [...publications].sort((a, b) => {
        if (currentPublicationSort === 'author') {
            if (a.author === 'Chu-Jie Qin' && b.author !== 'Chu-Jie Qin') return -1;
            if (a.author !== 'Chu-Jie Qin' && b.author === 'Chu-Jie Qin') return 1;
        }
        return Number(b.date) - Number(a.date);
    });

    container.innerHTML = '';
    sorted.forEach(pub => {
        const isVisible = currentPublicationFilter === 'all' || pub.tags.includes(currentPublicationFilter);
        const card = document.createElement('div');
        card.className = `publication row clearfix reveal${pub.highlight ? ' highlight' : ''}${currentPublicationSort === 'author' && pub.author !== 'Chu-Jie Qin' ? ' gray-overlay' : ''}`;
        card.dataset.author = pub.author;
        card.dataset.date = pub.date;
        card.dataset.tags = pub.tags.join(' ');
        card.hidden = !isVisible;

        const media = document.createElement('div');
        media.className = 'row-media';
        media.style.backgroundImage = `url(${pub.teaser})`;

        const text = document.createElement('div');
        text.className = 'row-text';
        text.innerHTML = `
            <a class="publication-title bold" href="${pub.links[0]?.href || '#'}">${pub.title}</a><br/>
            ${pub.authorsHtml}<br/>
            <span class="italic">${pub.venue}</span>, ${pub.year}
        `;

        const actions = document.createElement('div');
        actions.className = 'publication-actions';
        pub.links.forEach(link => actions.appendChild(createButton(link)));
        const githubRepo = publicationGithubRepo(pub);
        if (githubRepo) {
            const stats = document.createElement('span');
            stats.className = 'github-stats';
            stats.dataset.githubRepo = githubRepo;
            stats.textContent = 'GitHub stats loading...';
            actions.appendChild(stats);
        }
        text.appendChild(actions);
        card.append(media, text);
        container.appendChild(card);
    });

    document.getElementById('sort-author')?.classList.toggle('active', currentPublicationSort === 'author');
    document.getElementById('sort-date')?.classList.toggle('active', currentPublicationSort === 'date');
    hydrateGitHubStats();
    observeReveals();
}

function sortPublications(criteria) {
    currentPublicationSort = criteria;
    renderPublications();
}

async function hydrateGitHubStats() {
    const nodes = document.querySelectorAll('[data-github-repo]');
    await Promise.all([...nodes].map(async node => {
        const repo = node.dataset.githubRepo;
        try {
            const response = await fetch(`${GITHUB_API}${repo}`, {
                headers: { Accept: 'application/vnd.github+json' }
            });
            if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
            const data = await response.json();
            node.innerHTML = `<span aria-hidden="true">★</span> ${formatNumber(data.stargazers_count)} <span aria-hidden="true">⑂</span> ${formatNumber(data.forks_count)}`;
            node.title = `${repo}: ${data.stargazers_count} stars, ${data.forks_count} forks`;
        } catch (error) {
            node.textContent = `${repo}`;
            node.title = 'GitHub statistics are temporarily unavailable';
        }
    }));
}

function observeReveals() {
    const targets = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
        targets.forEach(target => target.classList.add('is-visible'));
        return;
    }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.14 });
    targets.forEach(target => observer.observe(target));
}

function bindInteractions() {
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            currentPublicationFilter = button.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn === button);
            });
            renderPublications();
        });
    });

    document.getElementById('sort-author')?.addEventListener('click', () => sortPublications('author'));
    document.getElementById('sort-date')?.addEventListener('click', () => sortPublications('date'));
}

async function initHomepage() {
    bindInteractions();
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error(`Unable to load ${DATA_URL}`);
        const data = await response.json();
        publications = data.publications || [];
        renderNews(data.news || []);
        renderResearchLine(data.researchLine || []);
        renderPublications();
    } catch (error) {
        document.getElementById('publication-list')?.classList.add('data-error');
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', initHomepage);
