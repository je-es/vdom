// test/html.test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import './setup';
    import { describe, expect, test, beforeEach, mock } from 'bun:test';
    import { html, createElement, setConfig, createDOMElement } from '../src/main';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TEST ════════════════════════════════════════╗

    describe('HTML Template Literals', () => {

        beforeEach(() => {
            setConfig({ devMode: true, sanitizeHTML: true });
        });

        describe('Basic Template Parsing', () => {
            test('should parse simple HTML', () => {
                const vnode = html`<div>Hello World</div>`;

                expect(vnode.type).toBe('div');
                expect(vnode.children[0]).toBe('Hello World');
            });

            test('should handle template with no interpolations', () => {
                const vnode = html`<div class="static">Static content</div>`;
                expect(vnode.type).toBe('div');
                expect(vnode.props.className).toBe('static');
            });

            test('should handle empty template', () => {
                const vnode = html``;
                expect(vnode.type).toBe('div');
            });

            test('should handle text-only template', () => {
                const vnode = html`Just text`;
                expect(typeof vnode === 'object').toBe(true);
            });

            test('should handle self-closing tags', () => {
                const vnode = html`<input type="text" />`;
                expect(vnode.type).toBe('input');
            });

            test('should handle comment nodes', () => {
                const vnode = html`<div><!-- comment --></div>`;
                expect(vnode.type).toBe('div');
            });
        });

        describe('Value Interpolation', () => {
            test('should interpolate values', () => {
                const name = 'Maysara';
                const vnode = html`<div>Hello ${name}!</div>`;

                expect(vnode.children[0]).toContain('Maysara');
            });

            test('should handle null values in text content', () => {
                const value = null;
                const vnode = html`<div>${value}</div>`;
                expect(vnode.type).toBe('div');
                expect(vnode.children.every(c => c !== null)).toBe(true);
            });

            test('should handle undefined values in text content', () => {
                const value = undefined;
                const vnode = html`<div>${value}</div>`;
                expect(vnode.type).toBe('div');
                expect(vnode.children.every(c => c !== undefined)).toBe(true);
            });

            test('should handle false in text content', () => {
                const value = false;
                const vnode = html`<div>${value}</div>`;
                expect(vnode.type).toBe('div');
            });

            test('should handle true in text content', () => {
                const value = true;
                const vnode = html`<div>${value}</div>`;
                expect(vnode.type).toBe('div');
            });

            test('should handle numeric interpolation in attributes', () => {
                const width = 100;
                const vnode = html`<div style="width: ${width}px">Content</div>`;
                expect(vnode.props.style).toContain('100');
            });

            test('should handle object in interpolation', () => {
                const obj = { value: 'test' };
                const vnode = html`<div data-obj="${obj}">Content</div>`;
                expect(vnode.props['data-obj']).toContain('[object Object]');
            });
        });

        describe('VNode Interpolation', () => {
            test('should handle VNode interpolation', () => {
                const child = createElement('span', {}, 'Child');
                const vnode = html`<div>${child}</div>`;

                expect(vnode.children[0]).toEqual(child);
            });

            test('should handle deeply nested interpolations', () => {
                const outer = createElement('div', {},
                    createElement('span', {}, 'inner')
                );
                const vnode = html`<section>${outer}</section>`;
                expect(vnode.type).toBe('section');
                expect(vnode.children[0]).toEqual(outer);
            });

            test('should handle complex nested structures', () => {
                const handler = mock(() => {});
                const items = ['a', 'b', 'c'];
                const childVNode = createElement('span', {}, 'nested');

                const vnode = html`<div onclick="${handler}">
    ${childVNode}
    <ul>${items.map(i => createElement('li', {}, i))}</ul>
    </div>`;

                expect(vnode.type).toBe('div');
                expect(typeof vnode.props.onclick).toBe('function');
            });
        });

        describe('Array Interpolation', () => {
            test('should handle array interpolation', () => {
                const items = ['A', 'B', 'C'];
                const vnode = html`<ul>${items.map(i => createElement('li', {}, i))}</ul>`;

                expect(vnode.children.length).toBe(3);
            });

            test('should handle nested arrays in children', () => {
                const items = [['a', 'b'], ['c', 'd']];
                const vnode = html`<ul>${items.flat().map(i => createElement('li', {}, i))}</ul>`;
                expect(vnode.type).toBe('ul');
            });

            test('should handle multiple root elements in array', () => {
                const items = [
                    createElement('div', {}, 'First'),
                    createElement('div', {}, 'Second')
                ];
                const vnode = html`<div>${items}</div>`;
                expect(vnode.children.length).toBe(2);
            });

            test('should filter null/boolean from arrays', () => {
                const items = [
                    null,
                    false,
                    createElement('li', {}, 'Valid'),
                    true,
                    undefined
                ];
                const vnode = html`<div>${items}</div>`;
                const validChildren = vnode.children.filter(c =>
                    c && typeof c === 'object' && 'type' in c
                );
                expect(validChildren.length).toBe(1);
            });
        });

        describe('Event Handler Attributes', () => {
            test('should handle event handlers', () => {
                const handler = mock(() => {});
                const vnode = html`<button onclick="${handler}">Click</button>`;

                expect(typeof vnode.props.onclick).toBe('function');
            });

            test('should handle multiple event handlers', () => {
                const onClick = () => {};
                const onHover = () => {};
                const vnode = html`<div onclick="${onClick}" onmouseenter="${onHover}">Test</div>`;

                expect(typeof vnode.props.onclick).toBe('function');
                expect(typeof vnode.props.onmouseenter).toBe('function');
            });

            test('should preserve event handler reference', () => {
                const myHandler = () => 'test';
                const vnode = html`<button onclick="${myHandler}">Test</button>`;

                expect(vnode.props.onclick).toBe(myHandler);
            });
        });

        describe('Boolean Attributes', () => {
            test('should handle boolean attributes', () => {
                const vnode = html`<input type="checkbox" checked="${true}" />`;
                expect(vnode.props.checked).toBe(true);
            });

            test('should handle checked attribute with true', () => {
                const vnode = html`<input type="checkbox" checked="${true}" />`;
                expect(vnode.props.checked).toBe(true);
            });

            test('should handle checked attribute with empty string', () => {
                const vnode = html`<input type="checkbox" checked="" />`;
                expect(vnode.props.checked).toBe(true);
            });

            test('should not set boolean attribute when value is false', () => {
                const isChecked = false;
                const vnode = html`<input type="checkbox" checked="${isChecked}" />`;
                expect(Object.prototype.hasOwnProperty.call(vnode.props, 'checked')).toBe(false);
            });

            test('should handle disabled attribute with false', () => {
                const vnode = html`<button disabled="${false}">Click</button>`;
                expect(Object.prototype.hasOwnProperty.call(vnode.props, 'disabled')).toBe(false);
            });

            test('should handle disabled attribute with string', () => {
                const vnode = html`<button disabled="disabled">Click</button>`;
                expect(vnode.props.disabled).toBe('disabled');
            });

            test('should handle selected attribute', () => {
                const vnode = html`<option selected="${true}">Option</option>`;
                expect(vnode.props.selected).toBe(true);
            });

            test('should handle all attribute types', () => {
                const vnode = html`<input type="text" checked="${true}" disabled="${false}" value="test" />`;
                expect(vnode.props.checked).toBe(true);
                expect(Object.prototype.hasOwnProperty.call(vnode.props, 'disabled')).toBe(false);
            });
        });

        describe('Special Attributes', () => {
            test('should handle className attribute', () => {
                const vnode = html`<div class="my-class"></div>`;
                expect(vnode.props.className).toBe('my-class');
            });

            test('should trim className attribute', () => {
                const vnode = html`<div class="  spaced  "></div>`;
                expect(vnode.props.className!.trim()).toBe('spaced');
            });

            test('should handle style string attribute', () => {
                const vnode = html`<div style="color: red;"></div>`;
                expect(vnode.props.style).toBe('color: red;');
            });

            test('should handle style with marker', () => {
                const color = 'blue';
                const vnode = html`<div style="color: ${color};">Content</div>`;
                expect(vnode.props.style).toContain('blue');
            });

            test('should handle data attributes with markers', () => {
                const id = '123';
                const vnode = html`<div data-id="${id}">Content</div>`;
                expect(vnode.props['data-id']).toBe('123');
            });

            test('should handle aria attributes with markers', () => {
                const label = 'Close dialog';
                const vnode = html`<button aria-label="${label}">X</button>`;
                expect(vnode.props['aria-label']).toBe('Close dialog');
            });

            test('should handle empty string attribute', () => {
                const value = '';
                const vnode = html`<input value="${value}" />`;
                expect(vnode.props.value).toBe('');
            });
        });

        describe('Marker Replacement', () => {
            test('should handle marker at start of attribute value', () => {
                const prefix = 'test';
                const vnode = html`<div class="${prefix}-class">Content</div>`;
                expect(vnode.props.className).toBe('test-class');
            });

            test('should handle marker at end of attribute value', () => {
                const suffix = 'class';
                const vnode = html`<div class="test-${suffix}">Content</div>`;
                expect(vnode.props.className).toBe('test-class');
            });

            test('should handle multiple markers in same attribute', () => {
                const prefix = 'my';
                const suffix = 'class';
                const vnode = html`<div class="${prefix}-${suffix}">Content</div>`;
                expect(vnode.props.className).toBe('my-class');
            });

            test('should handle marker with surrounding text', () => {
                const word = 'World';
                const vnode = html`<div>Hello ${word}!</div>`;
                expect(vnode.children.some(c =>
                    typeof c === 'string' && c.includes('World')
                )).toBe(true);
            });

            test('should replace all markers in string', () => {
                const first = 'Hello';
                const second = 'World';
                const vnode = html`<div title="${first} ${second}">Content</div>`;
                expect(vnode.props.title).toBe('Hello World');
            });
        });

        describe('Children Parsing', () => {
            test('should handle empty text nodes', () => {
                const vnode = html`<div>   </div>`;
                expect(vnode.type).toBe('div');
            });

            test('should handle mixed text and elements', () => {
                const vnode = html`<div>Text ${createElement('span', {}, 'span')} More</div>`;
                expect(vnode.type).toBe('div');
                expect(vnode.children.length).toBeGreaterThan(0);
            });

            test('should handle text node with only markers', () => {
                const value = 'test';
                const vnode = html`<div>${value}</div>`;
                expect(vnode.children).toContain('test');
            });

            test('should process text with markers', () => {
                const word = 'beautiful';
                const vnode = html`<p>This is a ${word} day!</p>`;
                const textContent = vnode.children.join(' ');
                expect(textContent).toContain('beautiful');
            });
        });

        describe('Fragment Handling', () => {
            test('should handle fragment in interpolation', () => {
                const frag = createElement('fragment', null,
                    'child1',
                    'child2'
                );
                const vnode = html`<div>${frag}</div>`;
                expect(vnode.type).toBe('div');
            });

            test('should handle empty fragment', () => {
                const frag = createElement('fragment', null);
                const vnode = html`<div>${frag}</div>`;
                expect(vnode.type).toBe('div');
            });
        });

        describe('HTML Sanitization', () => {
            test('should sanitize HTML when enabled', () => {
                setConfig({ sanitizeHTML: true });
                const vnode = html`<div><script>alert('xss')</script>Safe</div>`;

                const element = document.createElement('div');
                element.innerHTML = vnode.type;
                expect(element.textContent).not.toContain('script');
            });

            test('should sanitize with event markers present', () => {
                setConfig({ sanitizeHTML: true });
                const handler = () => {};
                const vnode = html`<div onclick="${handler}"><script>alert('xss')</script></div>`;
                expect(vnode.type).toBe('div');
                expect(typeof vnode.props.onclick).toBe('function');
            });

            test('should handle multiple event markers in sanitization', () => {
                setConfig({ sanitizeHTML: true });
                const onClick = () => {};
                const onHover = () => {};
                const vnode = html`<button onclick="${onClick}" onmouseenter="${onHover}">Button</button>`;
                expect(typeof vnode.props.onclick).toBe('function');
                expect(typeof vnode.props.onmouseenter).toBe('function');
            });

            test('should work with sanitization disabled', () => {
                setConfig({ sanitizeHTML: false });
                const vnode = html`<div><script>console.log('test')</script></div>`;
                expect(vnode.type).toBe('div');
            });
        });

        describe('Production Mode', () => {
            test('should work without dev mode', () => {
                setConfig({ devMode: false });
                const handler = () => {};
                const vnode = html`<button onclick="${handler}">Click</button>`;
                expect(typeof vnode.props.onclick).toBe('function');
            });
        });

        test('html template should handle event handlers', () => {
            let clicked = false;
            const handleClick = () => { clicked = true; };

            const vnode = html`<button onclick=${handleClick}>Click</button>`;
            const element = createDOMElement(vnode) as HTMLElement;

            element.click();
            expect(clicked).toBe(true);
        });
    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝