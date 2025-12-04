// test/patch.test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import './setup';
    import { describe, expect, test, beforeEach, afterEach, mock } from 'bun:test';
    import { createElement, render, patch } from '../src/main';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TEST ════════════════════════════════════════╗

    describe('Patch & Diff', () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        describe('Basic Patching', () => {
            test('should add new node', () => {
                const vnode = createElement('div', {}, 'New');
                patch(container, null, vnode, 0);

                expect(container.innerHTML).toBe('<div>New</div>');
            });

            test('should remove node', () => {
                const vnode = createElement('div', {}, 'Remove me');
                render(vnode, container);

                patch(container, vnode, null, 0);
                expect(container.innerHTML).toBe('');
            });

            test('should update text node', () => {
                container.appendChild(document.createTextNode('Old'));

                patch(container, 'Old', 'New', 0);
                expect(container.textContent).toBe('New');
            });

            test('should handle updating existing text node', () => {
                container.appendChild(document.createTextNode('Old'));
                patch(container, 'Old', 'New', 0);
                expect(container.textContent).toBe('New');
            });

            test('should handle same text content', () => {
                container.appendChild(document.createTextNode('Same'));
                patch(container, 'Same', 'Same', 0);
                expect(container.textContent).toBe('Same');
            });

            test('should handle patching with no old child', () => {
                const newVnode = createElement('div', {}, 'New content');
                patch(container, null, newVnode, 0);
                expect(container.innerHTML).toContain('New content');
            });

            test('should handle removing when old child exists', () => {
                const vnode = createElement('div', {}, 'Content');
                render(vnode, container);
                patch(container, vnode, null, 0);
                expect(container.innerHTML).toBe('');
            });
        });

        describe('Type Changes', () => {
            test('should replace when type changes', () => {
                const oldVnode = createElement('div', {}, 'Old');
                render(oldVnode, container);

                const newVnode = createElement('span', {}, 'New');
                patch(container, oldVnode, newVnode, 0);

                expect(container.innerHTML).toBe('<span>New</span>');
            });

            test('should handle text node type change', () => {
                container.appendChild(document.createTextNode('Old text'));
                const newVnode = createElement('div', {}, 'New');
                patch(container, 'Old text', newVnode, 0);
                expect(container.querySelector('div')).toBeTruthy();
            });

            test('should handle element to text change', () => {
                const oldVnode = createElement('div', {}, 'Old');
                render(oldVnode, container);
                patch(container, oldVnode, 'Just text', 0);
                expect(container.querySelector('div')).toBeFalsy();
            });

            test('should handle primitive to element change', () => {
                container.appendChild(document.createTextNode('Text'));

                const newVnode = createElement('div', {}, 'Element');
                patch(container, 'Text', newVnode, 0);

                expect(container.querySelector('div')).not.toBeNull();
            });

            test('should handle element to primitive change', () => {
                const oldVnode = createElement('div', {}, 'Element');
                render(oldVnode, container);

                patch(container, oldVnode, 'Just text', 0);

                expect(container.querySelector('div')).toBeNull();
                expect(container.textContent).toBe('Just text');
            });

            test('should handle type changes in nested elements', () => {
                const oldVnode = createElement('div', {},
                    createElement('span', {}, 'Content')
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    createElement('strong', {}, 'Content')
                );
                patch(container, oldVnode, newVnode, 0);

                expect(container.querySelector('span')).toBeNull();
                expect(container.querySelector('strong')).not.toBeNull();
            });
        });

        describe('Props Updates', () => {
            test('should update props when same type', () => {
                const oldVnode = createElement('div', { className: 'old' }, 'Text');
                render(oldVnode, container);

                const newVnode = createElement('div', { className: 'new' }, 'Text');
                patch(container, oldVnode, newVnode, 0);

                expect(container.querySelector('div')?.className).toBe('new');
            });

            test('should update multiple props', () => {
                const oldVnode = createElement('div', {
                    id: 'old',
                    className: 'old-class',
                    title: 'Old title'
                });
                render(oldVnode, container);

                const newVnode = createElement('div', {
                    id: 'new',
                    className: 'new-class',
                    title: 'New title'
                });

                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.id).toBe('new');
                expect(div.className).toBe('new-class');
                expect(div.title).toBe('New title');
            });

            test('should remove props', () => {
                const oldVnode = createElement('div', {
                    id: 'test',
                    title: 'Title',
                    'data-value': '123'
                });
                render(oldVnode, container);

                const newVnode = createElement('div', { id: 'test' });

                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.hasAttribute('title')).toBe(false);
                expect(div.hasAttribute('data-value')).toBe(false);
            });

            test('should update event handlers', () => {
                const oldHandler = mock(() => {});
                const newHandler = mock(() => {});

                const oldVnode = createElement('button', { onclick: oldHandler }, 'Click');
                render(oldVnode, container);

                const newVnode = createElement('button', { onclick: newHandler }, 'Click');
                patch(container, oldVnode, newVnode, 0);

                const button = container.querySelector('button')!;
                button.click();

                expect(oldHandler).not.toHaveBeenCalled();
                expect(newHandler).toHaveBeenCalled();
            });

            test('should update style object', () => {
                const oldVnode = createElement('div', {
                    style: { color: 'red', fontSize: '12px' }
                });
                render(oldVnode, container);

                const newVnode = createElement('div', {
                    style: { color: 'blue', fontSize: '16px' }
                });
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.style.color).toBe('blue');
                expect(div.style.fontSize).toBe('16px');
            });

            test('should handle ref updates', () => {
                let ref1: HTMLElement | null = null;
                let ref2: HTMLElement | null = null;

                const oldVnode = createElement('div', {
                    ref: (el: HTMLElement | null) => { ref1 = el; }
                });
                render(oldVnode, container);

                const newVnode = createElement('div', {
                    ref: (el: HTMLElement | null) => { ref2 = el; }
                });
                patch(container, oldVnode, newVnode, 0);

                expect(ref1).toBeTruthy();
                expect(ref2).toBeTruthy();
            });
        });

        describe('Children Patching', () => {
            test('should patch children', () => {
                const oldVnode = createElement('div', {},
                    createElement('span', {}, 'Child1')
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    createElement('span', {}, 'Child1'),
                    createElement('span', {}, 'Child2')
                );
                patch(container, oldVnode, newVnode, 0);

                expect(container.querySelectorAll('span').length).toBe(2);
            });

            test('should patch children by index', () => {
                const oldVnode = createElement('div', {},
                    createElement('span', {}, 'A'),
                    createElement('span', {}, 'B'),
                    createElement('span', {}, 'C')
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    createElement('span', {}, 'X'),
                    createElement('span', {}, 'Y'),
                    createElement('span', {}, 'Z')
                );

                patch(container, oldVnode, newVnode, 0);

                const spans = container.querySelectorAll('span');
                expect(spans[0].textContent).toBe('X');
                expect(spans[1].textContent).toBe('Y');
                expect(spans[2].textContent).toBe('Z');
            });

            test('should add children at end', () => {
                const oldVnode = createElement('div', {},
                    createElement('span', {}, 'A')
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    createElement('span', {}, 'A'),
                    createElement('span', {}, 'B'),
                    createElement('span', {}, 'C')
                );

                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.children.length).toBe(3);
            });

            test('should remove children from end', () => {
                const oldVnode = createElement('div', {},
                    createElement('span', {}, 'A'),
                    createElement('span', {}, 'B'),
                    createElement('span', {}, 'C')
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    createElement('span', {}, 'A')
                );

                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.children.length).toBe(1);
            });

            test('should handle empty children arrays', () => {
                const oldVnode = createElement('div', {},
                    createElement('span', {}, 'Child')
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {});
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.children.length).toBe(0);
            });

            test('should handle boolean children changes', () => {
                const oldVnode = createElement('div', {},
                    true,
                    'Visible',
                    false
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    false,
                    'Still Visible',
                    true
                );
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.textContent).toBe('Still Visible');
            });

            test('should handle mixed text and element children', () => {
                const oldVnode = createElement('div', {},
                    'Text 1',
                    createElement('span', {}, 'Element'),
                    'Text 2'
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    'New Text 1',
                    createElement('span', {}, 'New Element'),
                    'New Text 2'
                );
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.textContent).toContain('New Text 1');
                expect(div.textContent).toContain('New Element');
                expect(div.textContent).toContain('New Text 2');
            });
        });

        describe('Keyed Children', () => {
            test('should handle keyed children', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', { key: 'a' }, 'Item A'),
                    createElement('li', { key: 'b' }, 'Item B')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', { key: 'b' }, 'Item B'),
                    createElement('li', { key: 'a' }, 'Item A')
                );

                patch(container, oldVnode, newVnode, 0);

                const items = container.querySelectorAll('li');
                expect(items[0].textContent).toBe('Item B');
                expect(items[1].textContent).toBe('Item A');
            });

            test('should reorder keyed children', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', { key: 1 }, 'Item 1'),
                    createElement('li', { key: 2 }, 'Item 2'),
                    createElement('li', { key: 3 }, 'Item 3')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', { key: 3 }, 'Item 3'),
                    createElement('li', { key: 1 }, 'Item 1'),
                    createElement('li', { key: 2 }, 'Item 2')
                );

                patch(container, oldVnode, newVnode, 0);

                const items = Array.from(container.querySelectorAll('li'));
                expect(items[0].textContent).toBe('Item 3');
                expect(items[1].textContent).toBe('Item 1');
                expect(items[2].textContent).toBe('Item 2');
            });

            test('should add new keyed items', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', { key: 1 }, 'Item 1'),
                    createElement('li', { key: 2 }, 'Item 2')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', { key: 1 }, 'Item 1'),
                    createElement('li', { key: 2 }, 'Item 2'),
                    createElement('li', { key: 3 }, 'Item 3')
                );

                patch(container, oldVnode, newVnode, 0);

                const ul = container.querySelector('ul')!;
                expect(ul.children.length).toBe(3);
            });

            test('should remove old keyed items', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', { key: 1 }, 'Item 1'),
                    createElement('li', { key: 2 }, 'Item 2'),
                    createElement('li', { key: 3 }, 'Item 3')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', { key: 1 }, 'Item 1')
                );

                patch(container, oldVnode, newVnode, 0);

                const ul = container.querySelector('ul')!;
                expect(ul.children.length).toBe(1);
                expect(ul.children[0].textContent).toBe('Item 1');
            });

            test('should handle moving keyed elements backward', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', { key: 'a' }, 'A'),
                    createElement('li', { key: 'b' }, 'B'),
                    createElement('li', { key: 'c' }, 'C')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', { key: 'c' }, 'C'),
                    createElement('li', { key: 'a' }, 'A'),
                    createElement('li', { key: 'b' }, 'B')
                );

                const ul = container.querySelector('ul')!;
                patch(ul, oldVnode, newVnode, 0);

                const items = ul.querySelectorAll('li');
                expect(items[0].textContent).toBe('C');
                expect(items[1].textContent).toBe('A');
                expect(items[2].textContent).toBe('B');
            });

            test('should handle mixed keyed and non-keyed children', () => {
                const oldVnode = createElement('div', {},
                    createElement('span', { key: 'a' }, 'A'),
                    'Text',
                    createElement('span', { key: 'b' }, 'B')
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    createElement('span', { key: 'b' }, 'B'),
                    'New Text',
                    createElement('span', { key: 'a' }, 'A')
                );

                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.childNodes.length).toBeGreaterThan(0);
            });

            test('should handle text nodes in keyed list', () => {
                const oldVnode = createElement('div', {},
                    createElement('span', { key: 'a' }, 'A'),
                    'text',
                    createElement('span', { key: 'b' }, 'B')
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    createElement('span', { key: 'b' }, 'B'),
                    'new text',
                    createElement('span', { key: 'a' }, 'A')
                );
                patch(container, oldVnode, newVnode, 0);

                expect(container.textContent).toContain('new text');
            });

            test('should handle keyed children with same keys but different content', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', { key: 1 }, 'Old 1'),
                    createElement('li', { key: 2 }, 'Old 2')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', { key: 1 }, 'New 1'),
                    createElement('li', { key: 2 }, 'New 2')
                );

                patch(container, oldVnode, newVnode, 0);

                const items = container.querySelectorAll('li');
                expect(items[0].textContent).toBe('New 1');
                expect(items[1].textContent).toBe('New 2');
            });

            test('should handle inserting keyed items in middle', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', { key: 1 }, 'Item 1'),
                    createElement('li', { key: 3 }, 'Item 3')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', { key: 1 }, 'Item 1'),
                    createElement('li', { key: 2 }, 'Item 2'),
                    createElement('li', { key: 3 }, 'Item 3')
                );

                patch(container, oldVnode, newVnode, 0);

                const ul = container.querySelector('ul')!;
                expect(ul.children.length).toBe(3);
                expect(ul.children[1].textContent).toBe('Item 2');
            });
        });

        describe('Complex Scenarios', () => {
            test('should handle deeply nested updates', () => {
                const oldVnode = createElement('div', {},
                    createElement('section', {},
                        createElement('article', {},
                            createElement('p', {}, 'Old text')
                        )
                    )
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    createElement('section', {},
                        createElement('article', {},
                            createElement('p', {}, 'New text')
                        )
                    )
                );
                patch(container, oldVnode, newVnode, 0);

                const p = container.querySelector('p')!;
                expect(p.textContent).toBe('New text');
            });

            test('should handle large lists efficiently', () => {
                const oldChildren = Array.from({ length: 100 }, (_, i) =>
                    createElement('div', { key: i }, `Item ${i}`)
                );
                const oldVnode = createElement('div', {}, ...oldChildren);
                render(oldVnode, container);

                const newChildren = Array.from({ length: 100 }, (_, i) =>
                    createElement('div', { key: i }, `Updated ${i}`)
                );
                const newVnode = createElement('div', {}, ...newChildren);

                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.children.length).toBe(100);
                expect(div.children[0].textContent).toBe('Updated 0');
            });

            test('should handle rapid consecutive patches', () => {
                let vnode = createElement('div', { count: 0 }, '0');
                render(vnode, container);

                for (let i = 1; i <= 10; i++) {
                    const newVnode = createElement('div', { count: i }, String(i));
                    patch(container, vnode, newVnode, 0);
                    vnode = newVnode;
                }

                const div = container.querySelector('div')!;
                expect(div.textContent).toBe('10');
                expect(div.getAttribute('count')).toBe('10');
            });
        });
    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝