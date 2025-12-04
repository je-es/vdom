/* eslint-disable @typescript-eslint/no-explicit-any */
// test/render.test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import './setup';
    import { describe, expect, test, beforeEach, afterEach, mock } from 'bun:test';
    import { createElement, Fragment, render, createDOMElement, setConfig } from '../src/main';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TEST ════════════════════════════════════════╗

    describe('Render & DOM Creation', () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
            setConfig({ devMode: true, sanitizeHTML: true });
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        describe('Basic Rendering', () => {
            test('should render simple element', () => {
                const vnode = createElement('div', { id: 'test' }, 'Hello World');
                render(vnode, container);

                expect(container.innerHTML).toBe('<div id="test">Hello World</div>');
            });

            test('should render nested elements', () => {
                const vnode = createElement('div', { className: 'parent' },
                    createElement('span', {}, 'Child 1'),
                    createElement('span', {}, 'Child 2')
                );
                render(vnode, container);

                expect(container.querySelectorAll('span').length).toBe(2);
            });

            test('should handle empty container', () => {
                const vnode = createElement('div', {}, 'Content');
                render(vnode, container);

                expect(container.children.length).toBe(1);
            });

            test('should handle replacing entire tree', () => {
                const oldVnode = createElement('div', {},
                    createElement('span', {}, 'Old')
                );
                render(oldVnode, container);

                const newVnode = createElement('section', {},
                    createElement('article', {}, 'New')
                );
                render(newVnode, container);

                expect(container.querySelector('section')).toBeTruthy();
                expect(container.querySelector('div')).toBeFalsy();
            });
        });

        describe('Text Node Rendering', () => {
            test('should render number as text', () => {
                const vnode = createElement('div', {}, 123);
                render(vnode, container);
                expect(container.textContent).toBe('123');
            });

            test('should render string as text', () => {
                const vnode = createElement('div', {}, 'hello');
                render(vnode, container);
                expect(container.textContent).toBe('hello');
            });

            test('should handle numeric children', () => {
                const vnode = createElement('div', {}, 0, 1, 2);
                render(vnode, container);

                expect(container.textContent).toBe('012');
            });

            test('should handle empty string children', () => {
                const vnode = createElement('div', {}, '', 'text', '');
                render(vnode, container);

                expect(container.textContent).toBe('text');
            });
        });

        describe('Fragment Rendering', () => {
            test('should handle fragment', () => {
                const vnode = Fragment(
                    createElement('div', {}, 'First'),
                    createElement('div', {}, 'Second')
                );
                render(vnode, container);

                expect(container.children.length).toBe(2);
            });
        });

        describe('createDOMElement', () => {
            test('should create text node from string', () => {
                const textNode = createDOMElement('Hello');
                expect(textNode.nodeType).toBe(Node.TEXT_NODE);
                expect(textNode.textContent).toBe('Hello');
            });

            test('should create text node from number', () => {
                const textNode = createDOMElement(42);
                expect(textNode.textContent).toBe('42');
            });

            test('should create element with attributes', () => {
                const vnode = createElement('div', {
                    id: 'test',
                    className: 'box',
                    'data-value': '123'
                });
                const element = createDOMElement(vnode) as HTMLElement;

                expect(element.id).toBe('test');
                expect(element.className).toBe('box');
                expect(element.getAttribute('data-value')).toBe('123');
            });

            test('should create element with event handlers', () => {
                const clickHandler = mock(() => {});
                const vnode = createElement('button', { onclick: clickHandler }, 'Click');
                const element = createDOMElement(vnode) as HTMLElement;

                element.click();
                expect(clickHandler).toHaveBeenCalled();
            });
        });

        describe('Style Handling', () => {
            test('should handle style object', () => {
                const vnode = createElement('div', {
                    style: { color: 'red', fontSize: '16px' }
                });
                const element = createDOMElement(vnode) as HTMLElement;

                expect(element.style.color).toBe('red');
                expect(element.style.fontSize).toBe('16px');
            });

            test('should handle style string', () => {
                const vnode = createElement('div', { style: 'color: blue;' });
                const element = createDOMElement(vnode) as HTMLElement;

                expect(element.getAttribute('style')).toBe('color: blue;');
            });

            test('should handle style object with null values', () => {
                const vnode = createElement('div', {
                    style: { color: 'red', fontSize: undefined }
                });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.style.color).toBe('red');
                expect(div.style.fontSize).toBe('');
            });

            test('should handle style removal', () => {
                const oldVnode = createElement('div', {
                    id: 'test',
                    style: { color: 'red' }
                });
                render(oldVnode, container);

                const newVnode = createElement('div', { id: 'test' });
                render(newVnode, container);

                const div = container.querySelector('div')!;
                const hasStyle = div.hasAttribute('style') && div.getAttribute('style')?.trim() !== '';
                expect(hasStyle).toBe(false);
            });
        });

        describe('Boolean Attributes', () => {
            test('should handle boolean attributes', () => {
                const vnode = createElement('input', {
                    type: 'checkbox',
                    checked: true,
                    disabled: false
                });
                const element = createDOMElement(vnode) as HTMLElement;

                expect(element.hasAttribute('checked')).toBe(true);
                expect(element.hasAttribute('disabled')).toBe(false);
            });

            test('should handle removing boolean attributes', () => {
                const oldVnode = createElement('input', {
                    type: 'checkbox',
                    checked: true
                });
                render(oldVnode, container);

                const newVnode = createElement('input', {
                    type: 'checkbox',
                    checked: false
                });
                render(newVnode, container);

                const input = container.querySelector('input')!;
                expect(input.hasAttribute('checked')).toBe(false);
            });
        });

        describe('Class/ClassName Handling', () => {
            test('should handle className removal', () => {
                const oldVnode = createElement('div', {
                    id: 'test',
                    className: 'test-class'
                });
                render(oldVnode, container);

                const newVnode = createElement('div', { id: 'test' });
                render(newVnode, container);

                const div = container.querySelector('div')!;
                expect(div.className).toBe('');
            });

            test('should handle null/false className', () => {
                const oldVnode = createElement('div', { className: 'test' });
                render(oldVnode, container);

                const newVnode = createElement('div', { className: undefined });
                render(newVnode, container);

                const div = container.querySelector('div')!;
                expect(div.className).toBe('');
            });

            test('should handle empty string className', () => {
                const vnode = createElement('div', { className: '   ' });
                const element = document.createElement('div');
                document.body.appendChild(element);

                render(vnode, element);
                expect(element.querySelector('div')?.hasAttribute('class')).toBe(false);

                document.body.removeChild(element);
            });
        });

        describe('Event Handlers', () => {
            test('should handle multiple event types', () => {
                const handlers = {
                    onclick: mock(() => {}),
                    onmouseenter: mock(() => {}),
                    onkeydown: mock(() => {})
                };

                const vnode = createElement('div', handlers);
                const element = createDOMElement(vnode) as HTMLElement;

                element.click();
                expect(handlers.onclick).toHaveBeenCalled();
            });

            test('should handle non-function event handler', () => {
                const consoleWarn = mock(() => {});
                const originalWarn = console.warn;
                console.warn = consoleWarn;

                setConfig({ devMode: true });
                const vnode = createElement('button', { onclick: 'not a function' });
                render(vnode, container);

                expect(consoleWarn).toHaveBeenCalled();
                console.warn = originalWarn;
            });
        });

        describe('Special Attributes', () => {
            test('should handle form attributes', () => {
                const vnode = createElement('input', {
                    type: 'text',
                    value: 'test',
                    placeholder: 'Enter text',
                    required: true,
                    maxLength: 10
                });
                const element = createDOMElement(vnode) as HTMLElement;

                expect(element.getAttribute('type')).toBe('text');
                expect(element.getAttribute('value')).toBe('test');
                expect(element.getAttribute('placeholder')).toBe('Enter text');
                expect(element.hasAttribute('required')).toBe(true);
                expect(element.getAttribute('maxlength')).toBe('10');
            });

            test('should handle ARIA attributes', () => {
                const vnode = createElement('button', {
                    'aria-label': 'Close',
                    'aria-expanded': 'true'
                });
                const element = createDOMElement(vnode) as HTMLElement;

                expect(element.getAttribute('aria-label')).toBe('Close');
                expect(element.getAttribute('aria-expanded')).toBe('true');
            });

            test('should handle data attributes', () => {
                const vnode = createElement('div', {
                    'data-id': '123',
                    'data-name': 'test'
                });
                const element = createDOMElement(vnode) as HTMLElement;

                expect(element.getAttribute('data-id')).toBe('123');
                expect(element.getAttribute('data-name')).toBe('test');
            });

            test('should handle attribute removal', () => {
                const oldVnode = createElement('div', {
                    'data-test': '123',
                    title: 'Test'
                });
                render(oldVnode, container);

                const newVnode = createElement('div', {});
                render(newVnode, container);

                const div = container.querySelector('div')!;
                expect(div.hasAttribute('data-test')).toBe(false);
                expect(div.hasAttribute('title')).toBe(false);
            });

            test('should handle null/false attributes', () => {
                const vnode = createElement('div', {
                    'data-test': null,
                    title: false
                });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.hasAttribute('data-test')).toBe(false);
                expect(div.hasAttribute('title')).toBe(false);
            });

            test('should remove props when updated to null', () => {
                const oldVnode = createElement('div', { id: 'test', title: 'Test' });
                render(oldVnode, container);

                const newVnode = createElement('div', { id: 'test' });
                render(newVnode, container);

                const element = container.querySelector('div')!;
                expect(element.hasAttribute('title')).toBe(false);
            });

            test('should handle dangerouslySetInnerHTML', () => {
                const vnode = createElement('div', {
                    dangerouslySetInnerHTML: { __html: '<span>HTML</span>' }
                });
                const element = createDOMElement(vnode) as HTMLElement;

                expect(element.innerHTML).toBe('<span>HTML</span>');
            });
        });

        describe('Ref Callback', () => {
            test('should handle ref callback', () => {
                let refElement: HTMLElement | null = null;
                const vnode = createElement('div', {
                    ref: (el: HTMLElement | null) => { refElement = el; }
                });
                const element = createDOMElement(vnode) as HTMLElement;

                expect(refElement).toBeTruthy();
                if (refElement) {
                    expect(refElement).toEqual(element as any);
                }
            });
        });

        describe('Error Handling', () => {
            test('should handle render error gracefully', () => {
                const consoleError = mock(() => {});
                const originalError = console.error;
                console.error = consoleError;

                const invalidVNode = { type: 'div', props: null, children: null } as any;
                render(invalidVNode, container);

                expect(consoleError).toHaveBeenCalled();
                console.error = originalError;
            });

            test('should handle createDOMElement error', () => {
                const consoleError = mock(() => {});
                const originalError = console.error;
                console.error = consoleError;

                // @ts-expect-error - Testing invalid input
                render({ invalid: 'vnode' }, container);

                expect(consoleError).toHaveBeenCalled();
                console.error = originalError;
            });
        });
    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝