<!-- ╔══════════════════════════════ BEG ══════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="./assets/img/logo.png" alt="logo" style="" height="80" />
    </p>
</div>

<div align="center">
    <img src="https://img.shields.io/badge/v-0.0.4-black"/>
    <img src="https://img.shields.io/badge/🔥-@je--es-black"/>
    <br>
    <img src="https://github.com/je-es/vdom/actions/workflows/ci.yml/badge.svg" alt="CI" />
    <img src="https://img.shields.io/badge/coverage-100%25-brightgreen" alt="Test Coverage" />
    <img src="https://img.shields.io/github/issues/je-es/vdom?style=flat" alt="Github Repo Issues" />
    <img src="https://img.shields.io/github/stars/je-es/vdom?style=social" alt="GitHub Repo stars" />
</div>
<br>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ DOC ══════════════════════════════╗ -->

- ## Quick Start 🔥

    > _**The Virtual DOM library you'll actually enjoy using.**_

    - #### Setup

        > install [`space`](https://github.com/solution-lib/space) first.

        ```bash
        # install
        space i @je-es/vdom
        ```

    - #### Usage

        ```typescript
        // import
        import { createElement, render } from '@je-es/vdom';

        // Create your app
        const app = createElement('div', { className: 'app' },
            createElement('h1', {}, 'Hello, World! 👋'),
            createElement('p', {}, 'You just built your first VDOM app!')
        );

        // Render it
        render(app, document.getElementById('root'));
        ```

        **That's it!** You now have a working app.

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - #### Core Features

        - ##### JSX & Tagged Templates
            ```ts
            // Use JSX (with proper tsconfig)
            const app = <div className="app">Hello JSX!</div>;

            // Or use html tagged templates
            import { html } from '@je-es/vdom';
            const name = 'World';
            const app = html`<div class="app">Hello ${name}!</div>`;
            ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

        - ##### Event Handlers
            ```ts
            const handleClick = (e) => console.log('Clicked!');

            const button = createElement('button', {
                onclick: handleClick
            }, 'Click Me');

            // Or with html template
            const button = html`<button onclick=${handleClick}>Click Me</button>`;
            ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

        - ##### Dynamic Lists
            ```ts
            const items = ['Apple', 'Banana', 'Cherry'];

            const list = createElement('ul', {},
                ...items.map(item =>
                    createElement('li', { key: item }, item)
                )
            );

            // With html template
            const list = html`<ul>${items.map(i => html`<li key=${i}>${i}</li>`)}</ul>`;
            ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

        - ##### Efficient Updates
            ```ts
            // Initial render
            let count = 0;
            const render = () => {
                const app = createElement('div', {},
                    createElement('h1', {}, `Count: ${count}`),
                    createElement('button', {
                        onclick: () => { count++; update(); }
                    }, '+')
                );
                return app;
            };

            const container = document.getElementById('root');
            let oldVNode = render();
            render(oldVNode, container);

            // Update efficiently with patch
            function update() {
                const newVNode = render();
                patch(container, oldVNode, newVNode, 0);
                oldVNode = newVNode;
            }
            ```

    <br>

    - #### Advanced Usage

        - ##### Fragments
            ```ts
            import { Fragment } from '@je-es/vdom';

            // Group elements without wrapper
            const nav = Fragment(
                createElement('a', { href: '/' }, 'Home'),
                createElement('a', { href: '/about' }, 'About')
            );

            // With html template
            const nav = html`
                <a href="/">Home</a>
                <a href="/about">About</a>
            `;
            ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

        - ##### Refs & DOM Access
            ```ts
            let inputRef = null;

            const form = createElement('div', {},
                createElement('input', {
                    ref: (el) => { inputRef = el; },
                    placeholder: 'Enter text'
                }),
                createElement('button', {
                    onclick: () => inputRef?.focus()
                }, 'Focus Input')
            );
            ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

        - ##### Keyed Lists for Performance
            ```ts
            // Without keys - full re-render
            const list = items.map(item => createElement('li', {}, item));

            // With keys - smart diffing
            const list = items.map(item =>
                createElement('li', { key: item.id }, item.name)
            );
            ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

        - ##### Configuration
            ```ts
            import { setConfig } from '@je-es/vdom';

            setConfig({
                devMode: true,              // Enable warnings
                sanitizeHTML: true,         // XSS protection
                onError: (err) => {         // Custom error handler
                    console.error('VDOM Error:', err);
                }
            });
            ```


<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

<br>

---

<div align="center">
    <a href="https://github.com/solution-lib/space"><img src="https://img.shields.io/badge/by-Space-black"/></a>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->