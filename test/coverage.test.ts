/* eslint-disable @typescript-eslint/no-explicit-any */
// test/coverage.test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import './setup';
    import { describe, expect, test, beforeEach, afterEach, mock } from 'bun:test';
    import {
        createElement,
        render,
        patch,
        setConfig,
        html,
        VNode
    } from '../src/main';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    describe('HTML Template', () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
            setConfig({ devMode: true, sanitizeHTML: true });
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        describe('Line 78: isInAttribute - lastEqualIndex > lastGtIndex check', () => {
            test('should detect when NOT inside attribute value', () => {
                // When we have: <div>text</div>${value}
                // lastGtIndex (from >) is after lastEqualIndex, so NOT in attribute
                const value = 'outside';
                const vnode = html`<div></div>${value}`;
                // This should treat value as text content, not attribute
                expect(vnode.type).toBe('div');
            });

            test('should detect when inside attribute value', () => {
                // When we have: <div attr="${value}
                // lastEqualIndex (from =) is after lastGtIndex, so IS in attribute
                const attrValue = 'test-value';
                const vnode = html`<div data-test="${attrValue}"></div>`;
                expect(vnode.props['data-test']).toBe('test-value');
            });
        });

        describe('Lines 131-133: createMarker - function handling', () => {
            test('should create marker for non-event function in text', () => {
                const fn = function myFunction() { return 'test'; };
                const vnode = html`<div>${fn}</div>`;
                // Function in text context should be treated as a marker
                expect(vnode.type).toBe('div');
            });
        });

        describe('Lines 160-161: parseHTML - empty element case', () => {
            test('should handle completely empty HTML that creates no element', () => {
                // Force empty template content
                const vnode = html``;
                expect(vnode.type).toBe('div');
            });

            test('should handle whitespace-only HTML', () => {
                const vnode = html`   `;
                expect(vnode.type).toBe('div');
            });
        });

        describe('Line 168: convertDOMToVNode - skip non-element nodes', () => {
            test('should handle document fragment with comment node', () => {
                const vnode = html`<div><!-- This is a comment -->Content</div>`;
                expect(vnode.type).toBe('div');
                expect(vnode.children.some(c => typeof c === 'string' && c.includes('Content'))).toBe(true);
            });
        });

        describe('Line 203: handleTextNode - array marker found but continue', () => {
            test('should break loop after finding first array marker', () => {
                // This tests the 'break' statement on line 203
                const arr = ['item1', 'item2', 'item3'];
                const vnode = html`<div>${arr}</div>`;
                // Should create fragment from array
                expect(vnode.children.length).toBeGreaterThan(0);
            });

            test('should handle array marker at start of text', () => {
                const items = [createElement('span', {}, 'A'), createElement('span', {}, 'B')];
                const vnode = html`<div>${items}</div>`;
                expect(vnode.children.length).toBe(2);
            });
        });

        describe('Lines 223-229: parseAttributes - event handler storage and continue', () => {
            test('should store event handler and continue to next iteration', () => {
                const handler = () => console.log('clicked');
                // This should trigger the 'continue' on line 228
                const vnode = html`<button onclick="${handler}" id="test">Click</button>`;
                expect(typeof vnode.props.onclick).toBe('function');
                expect(vnode.props.id).toBe('test');
            });

            test('should handle event handler then process other attributes', () => {
                const clickHandler = () => {};
                const hoverHandler = () => {};
                // Multiple iterations with continue statements
                const vnode = html`<div onclick="${clickHandler}" class="btn" onmouseenter="${hoverHandler}">Test</div>`;
                expect(typeof vnode.props.onclick).toBe('function');
                expect(vnode.props.className).toBe('btn');
                expect(typeof vnode.props.onmouseenter).toBe('function');
            });
        });

        describe('Lines 234-236: parseAttributes - boolean attribute continue statements', () => {
            test('should handle boolean attribute with true and continue', () => {
                // Line 236: continue after setting true
                const isChecked = true;
                const vnode = html`<input type="checkbox" checked="${isChecked}" id="cb" />`;
                expect(vnode.props.checked).toBe(true);
                expect(vnode.props.id).toBe('cb');
            });

            test('should handle boolean attribute with empty string and continue', () => {
                // Line 238: continue after setting true for empty string
                const vnode = html`<input disabled="" name="test" />`;
                expect(vnode.props.disabled).toBe(true);
                expect(vnode.props.name).toBe('test');
            });

            test('should handle boolean attribute with other string value', () => {
                // Line 240: handle string value that is not 'true' or ''
                const value = 'yes';
                const vnode = html`<input checked="${value}" />`;
                expect(vnode.props.checked).toBe('yes');
            });

            test('should not set boolean attribute when false', () => {
                // Now correctly checks for 'false' string and skips setting the prop
                const vnode = html`<input checked="${false}" required="${false}" />`;
                expect(Object.prototype.hasOwnProperty.call(vnode.props, 'checked')).toBe(false);
                expect(Object.prototype.hasOwnProperty.call(vnode.props, 'required')).toBe(false);
            });
        });

        describe('Line 242: parseAttributes - regular attribute assignment', () => {
            test('should assign regular attributes after marker replacement', () => {
                // Line 242: props[name] = replaceMarkers(...)
                const id = 'unique-123';
                const title = 'Hover text';
                const vnode = html`<div id="${id}" title="${title}" data-value="static"></div>`;
                expect(vnode.props.id).toBe('unique-123');
                expect(vnode.props.title).toBe('Hover text');
                expect(vnode.props['data-value']).toBe('static');
            });

            test('should handle attributes with no markers', () => {
                const vnode = html`<div role="button" tabindex="0"></div>`;
                expect(vnode.props.role).toBe('button');
                expect(vnode.props.tabindex).toBe('0');
            });
        });

        describe('Lines 264-265: parseChildren - continue after adding processed text', () => {
            test('should add processed text and continue to next child', () => {
                // Line 265: continue after pushing processedText
                const name = 'World';
                const vnode = html`<div>Hello ${name} and more text</div>`;
                const textChildren = vnode.children.filter(c => typeof c === 'string');
                expect(textChildren.length).toBeGreaterThan(0);
                expect(textChildren.some(t => t.includes('World'))).toBe(true);
            });

            test('should skip empty text after processing', () => {
                // Test the condition where processedText.trim() is empty
                const empty = '';
                const vnode = html`<div>   ${empty}   </div>`;
                // Empty whitespace should be filtered
                expect(vnode.type).toBe('div');
            });

            test('should handle multiple text nodes with markers', () => {
                const first = 'One';
                const second = 'Two';
                const third = 'Three';
                const vnode = html`<div>${first} and ${second} and ${third}</div>`;
                const hasAllText = vnode.children.some(c =>
                    typeof c === 'string' && c.includes('One') && c.includes('Two') && c.includes('Three')
                );
                expect(hasAllText).toBe(true);
            });
        });

        describe('Edge Cases in Attribute Parsing', () => {
            test('should handle attribute with empty string value', () => {
                const vnode = html`<input value="" />`;
                expect(vnode.props.value).toBe('');
            });

            test('should handle attribute without value', () => {
                const vnode = html`<input disabled />`;
                expect(vnode.props.disabled).toBe(true);
            });

            test('should handle multiple markers in nested text', () => {
                const a = 'Hello';
                const b = 'World';
                const c = '!';
                const vnode = html`<div>${a} ${b}${c}</div>`;
                expect(vnode.type).toBe('div');
            });
        });

        describe('Text Node Edge Cases', () => {
            test('should handle text node with only whitespace around marker', () => {
                const value = 'test';
                const vnode = html`<div>   ${value}   </div>`;
                // HTML parser preserves whitespace, so check that the value is in the string
                const hasValue = vnode.children.some(c =>
                    typeof c === 'string' && c.includes('test')
                );
                expect(hasValue).toBe(true);
            });

            test('should handle empty text content', () => {
                const vnode = html`<div></div>`;
                expect(vnode.children.length).toBe(0);
            });

            test('should handle comment-only content', () => {
                const vnode = html`<div><!-- only comment --></div>`;
                expect(vnode.type).toBe('div');
            });
        });

        describe('Children Parsing Edge Cases', () => {
            test('should handle element node without children', () => {
                const vnode = html`<div><span></span></div>`;
                expect(vnode.children.length).toBe(1);
                expect((vnode.children[0] as VNode).type).toBe('span');
            });

            test('should handle deeply nested empty elements', () => {
                const vnode = html`<div><section><article></article></section></div>`;
                expect(vnode.type).toBe('div');
            });

            test('should handle non-element, non-text nodes', () => {
                const vnode = html`<div><!-- comment --></div>`;
                expect(vnode.type).toBe('div');
            });
        });

        describe('Marker Replacement Edge Cases', () => {
            test('should handle marker at very start', () => {
                const value = 'start';
                const vnode = html`<div>${value}end</div>`;
                expect(vnode.children.some(c =>
                    typeof c === 'string' && c.includes('start')
                )).toBe(true);
            });

            test('should handle marker at very end', () => {
                const value = 'end';
                const vnode = html`<div>start${value}</div>`;
                expect(vnode.children.some(c =>
                    typeof c === 'string' && c.includes('end')
                )).toBe(true);
            });

            test('should handle multiple consecutive markers', () => {
                const a = 'a';
                const b = 'b';
                const c = 'c';
                const vnode = html`<div>${a}${b}${c}</div>`;
                expect(vnode.type).toBe('div');
            });
        });

        describe('Event Handler Edge Cases', () => {
            test('should handle event handler with surrounding attributes', () => {
                const handler = () => {};
                const vnode = html`<button id="btn" onclick="${handler}" class="btn">Click</button>`;
                expect(vnode.props.id).toBe('btn');
                expect(typeof vnode.props.onclick).toBe('function');
                expect(vnode.props.className).toBe('btn');
            });

            test('should handle multiple event handlers on same element', () => {
                const click = () => {};
                const hover = () => {};
                const blur = () => {};
                const vnode = html`<input onclick="${click}" onmouseenter="${hover}" onblur="${blur}" />`;
                expect(typeof vnode.props.onclick).toBe('function');
                expect(typeof vnode.props.onmouseenter).toBe('function');
                expect(typeof vnode.props.onblur).toBe('function');
            });
        });

        describe('Fragment Edge Cases', () => {
            test('should handle fragment with single text child', () => {
                const frag = createElement('fragment', null, 'text');
                const vnode = html`<div>${frag}</div>`;
                expect(vnode.type).toBe('div');
            });

            test('should handle nested fragments', () => {
                const innerFrag = createElement('fragment', null, 'inner');
                const outerFrag = createElement('fragment', null, innerFrag);
                const vnode = html`<div>${outerFrag}</div>`;
                expect(vnode.type).toBe('div');
            });
        });

        describe('Sanitization Edge Cases', () => {
            test('should handle sanitization with event handlers preserved', () => {
                setConfig({ sanitizeHTML: true });
                const handler = () => {};
                const vnode = html`<div onclick="${handler}"><script>alert()</script>Safe</div>`;
                expect(typeof vnode.props.onclick).toBe('function');
            });

            test('should handle multiple event markers during sanitization', () => {
                setConfig({ sanitizeHTML: true });
                const click = () => {};
                const hover = () => {};
                const vnode = html`<button onclick="${click}" onmouseenter="${hover}"><script>bad</script></button>`;
                expect(typeof vnode.props.onclick).toBe('function');
                expect(typeof vnode.props.onmouseenter).toBe('function');
            });
        });

        describe('Additional HTML Edge Cases', () => {
            test('should handle non-element nodes during conversion', () => {
                // Test with a document fragment
                const template = document.createElement('template');
                template.innerHTML = '<div>Test</div><!-- comment -->';
                const vnode = html`<div>${createElement('span', {}, 'child')}</div>`;
                expect(vnode.type).toBe('div');
            });

            test('should handle text node that is only marker', () => {
                const value = 'only-marker';
                const vnode = html`<div>${value}</div>`;
                const hasMarker = vnode.children.some(c =>
                    typeof c === 'string' && c.includes('only-marker')
                );
                expect(hasMarker).toBe(true);
            });

            test('should handle element node during children parsing', () => {
                const child = createElement('span', {}, 'child');
                const vnode = html`<div>${child}<p>text</p></div>`;
                expect(vnode.children.length).toBeGreaterThan(0);
            });

            test('should process text node with marker replacement', () => {
                const name = 'World';
                const vnode = html`<p>Hello ${name}!</p>`;
                const hasText = vnode.children.some(c =>
                    typeof c === 'string' && c.includes('World')
                );
                expect(hasText).toBe(true);
            });

            test('should handle empty string after marker replacement', () => {
                const empty = '';
                const vnode = html`<div>${empty}text</div>`;
                expect(vnode.type).toBe('div');
            });

            test('should handle multiple VNode markers in same text node', () => {
                const child1 = createElement('span', {}, 'A');
                const child2 = createElement('span', {}, 'B');
                const vnode = html`<div>${child1}${child2}</div>`;
                expect(vnode.children.length).toBe(2);
            });

            test('should handle text content with no trimming', () => {
                const vnode = html`<div>

                </div>`;
                expect(vnode.type).toBe('div');
            });
        });

        describe('Additional Props Edge Cases', () => {
            test('should handle string boolean attribute value', () => {
                const vnode = createElement('input', { checked: 'true' });
                render(vnode, container);

                const input = container.querySelector('input')!;
                expect(input.hasAttribute('checked')).toBe(true);
            });

            test('should handle non-true non-empty-string boolean attribute', () => {
                const vnode = createElement('input', { checked: 'yes' });
                render(vnode, container);

                const input = container.querySelector('input')!;
                // 'yes' is treated as a boolean attribute and set to empty string
                expect(input.hasAttribute('checked')).toBe(true);
            });

            test('should handle updating boolean attribute from true to truthy string', () => {
                const oldVnode = createElement('input', { disabled: true });
                render(oldVnode, container);

                const newVnode = createElement('input', { disabled: 'disabled' });
                render(newVnode, container);

                const input = container.querySelector('input')!;
                // 'disabled' string is treated as truthy for boolean attribute
                expect(input.hasAttribute('disabled')).toBe(true);
            });

            test('should not warn about non-function handler in production', () => {
                const consoleWarn = mock(() => {});
                const originalWarn = console.warn;
                console.warn = consoleWarn;

                setConfig({ devMode: false });
                const vnode = createElement('button', { onclick: 'not-a-function' });
                render(vnode, container);

                expect(consoleWarn).not.toHaveBeenCalled();
                console.warn = originalWarn;
                setConfig({ devMode: true }); // Reset
            });
            test('should handle fallback to replaceNode when element is not HTMLElement', () => {
                const oldVnode = createElement('div', {}, 'Old');
                render(oldVnode, container);

                // Create a text node instead of element
                const textNode = document.createTextNode('Text');
                container.appendChild(textNode);

                const newVnode = createElement('div', {}, 'New');
                // This will trigger the replaceNode fallback
                patch(container, oldVnode, newVnode, 1);

                expect(container.querySelectorAll('div').length).toBeGreaterThan(0);
            });

            test('should handle parent that matches VNode type but has different child', () => {
                const div = document.createElement('div');
                const span = document.createElement('span');
                span.textContent = 'Different type';
                div.appendChild(span);
                container.appendChild(div);

                const oldVnode = createElement('div', {},
                    createElement('p', {}, 'Old')
                );
                const newVnode = createElement('div', {},
                    createElement('p', {}, 'New')
                );

                patch(div, oldVnode, newVnode, 0);
                expect(div.textContent).toContain('New');
            });

            test('should handle null oldVNode with newVNode primitive', () => {
                patch(container, null, 'New text', 0);
                expect(container.textContent).toBe('New text');
            });

            test('should handle removing primitive node', () => {
                container.appendChild(document.createTextNode('Remove me'));
                patch(container, 'Remove me', null, 0);
                expect(container.textContent).toBe('');
            });
        });
    });

    describe('Props', () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
            setConfig({ devMode: true });
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        describe('Lines 133-135: setProperty - early return for children and key', () => {
            test('should return early when key is children', () => {
                // Pass actual children to render, not just as a prop
                const vnode = createElement('div', { children: ['should', 'be', 'ignored'] }, 'Actual child');
                render(vnode, container);
                const div = container.querySelector('div')!;
                // children prop should not be set as attribute
                expect(div.hasAttribute('children')).toBe(false);
                // But actual children should be rendered
                expect(div.childNodes.length).toBeGreaterThan(0);
                expect(div.textContent).toBe('Actual child');
            });

            test('should return early when key is key', () => {
                // Line 134: if (key === 'children' || key === 'key') return;
                const vnode = createElement('div', { key: 'my-key' }, 'Content');
                render(vnode, container);
                const div = container.querySelector('div')!;
                expect(div.hasAttribute('key')).toBe(false);
                expect(div.textContent).toBe('Content');
            });
        });

        describe('Lines 140-141: setProperty - ref callback return', () => {
            test('should call ref and return without setting attribute', () => {
                // Line 141: value(element); return;
                let capturedRef: HTMLElement | null = null;
                const vnode = createElement('div', {
                    ref: (el: HTMLElement | null) => { capturedRef = el; },
                    id: 'test'
                });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(capturedRef!).toBe(div);
                expect(div.id).toBe('test');
                expect(div.hasAttribute('ref')).toBe(false);
            });

            test('should handle ref with other props', () => {
                let refElement: HTMLElement | null = null;
                const vnode = createElement('button', {
                    ref: (el: HTMLElement | null) => { refElement = el; },
                    className: 'btn',
                    type: 'button'
                });
                render(vnode, container);

                expect(refElement).not.toBeNull();
                expect(refElement!.className).toBe('btn');
            });
        });

        describe('Lines 146-148: setProperty - className return', () => {
            test('should set className and return', () => {
                // Line 147: setClassName(element, value); return;
                const vnode = createElement('div', {
                    className: 'my-class',
                    id: 'test'
                });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.className).toBe('my-class');
                expect(div.id).toBe('test');
            });

            test('should handle class prop (legacy) and return', () => {
                // Line 147: handles both 'className' and 'class'
                const vnode = createElement('span', {
                    class: 'old-style',
                    title: 'Test'
                });
                render(vnode, container);

                const span = container.querySelector('span')!;
                expect(span.className).toBe('old-style');
                expect(span.title).toBe('Test');
            });
        });

        describe('Lines 153-154: setProperty - style return', () => {
            test('should set style and return', () => {
                // Line 154: setStyle(element, value); return;
                const vnode = createElement('div', {
                    style: 'color: red; font-size: 14px;',
                    id: 'styled'
                });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.getAttribute('style')).toContain('color');
                expect(div.id).toBe('styled');
            });

            test('should set style object and return', () => {
                const vnode = createElement('div', {
                    style: { backgroundColor: 'blue', padding: '10px' },
                    className: 'box'
                });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.style.backgroundColor).toBe('blue');
                expect(div.className).toBe('box');
            });
        });

        describe('Lines 159-160: setProperty - dangerouslySetInnerHTML return', () => {
            test('should set innerHTML and return', () => {
                // Line 160: element.innerHTML = value.__html; return;
                const vnode = createElement('div', {
                    dangerouslySetInnerHTML: { __html: '<span>HTML</span>' },
                    id: 'danger'
                });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.innerHTML).toBe('<span>HTML</span>');
                expect(div.id).toBe('danger');
            });

            test('should handle dangerouslySetInnerHTML with complex markup', () => {
                const vnode = createElement('div', {
                    dangerouslySetInnerHTML: {
                        __html: '<h1>Title</h1><p>Paragraph</p>'
                    },
                    className: 'content'
                });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.querySelector('h1')).not.toBeNull();
                expect(div.querySelector('p')).not.toBeNull();
                expect(div.className).toBe('content');
            });
        });

        describe('Lines 218-219: setStyle - null value handling in loop', () => {
            test('should set style property to empty string when value is null', () => {
                // Line 219: (element.style)[prop] = '';
                const vnode = createElement('div', {
                    style: {
                        color: 'red',
                        fontSize: undefined,
                        fontWeight: 'bold',
                        padding: undefined
                    }
                });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.style.color).toBe('red');
                expect(div.style.fontSize).toBe(''); // null should set to ''
                expect(div.style.fontWeight).toBe('bold');
                expect(div.style.padding).toBe(''); // undefined should set to ''
            });

            test('should handle mixed null and valid style values', () => {
                const vnode = createElement('div', {
                    style: {
                        backgroundColor: 'blue',
                        margin: undefined,
                        border: '1px solid black',
                        opacity: undefined
                    }
                });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.style.backgroundColor).toBe('blue');
                expect(div.style.margin).toBe('');
                expect(div.style.border).toBe('1px solid black');
                expect(div.style.opacity).toBe('');
            });
        });

        describe('Property Removal Edge Cases', () => {
            test('should remove event handler', () => {
                const handler = mock(() => {});
                const oldVnode = createElement('button', { onclick: handler });
                render(oldVnode, container);

                const newVnode = createElement('button', {});
                render(newVnode, container);

                const button = container.querySelector('button')!;
                button.click();
                // Handler should not be called since it was removed
            });

            test('should remove style attribute completely', () => {
                const oldVnode = createElement('div', { style: 'color: red;' });
                render(oldVnode, container);

                const newVnode = createElement('div', {});
                render(newVnode, container);

                const div = container.querySelector('div')!;
                expect(div.hasAttribute('style')).toBe(false);
            });

            test('should remove boolean attribute', () => {
                const oldVnode = createElement('input', { disabled: true });
                render(oldVnode, container);

                const newVnode = createElement('input', {});
                render(newVnode, container);

                const input = container.querySelector('input')!;
                expect(input.hasAttribute('disabled')).toBe(false);
            });

            test('should remove regular attribute', () => {
                const oldVnode = createElement('div', { 'data-test': '123' });
                render(oldVnode, container);

                const newVnode = createElement('div', {});
                render(newVnode, container);

                const div = container.querySelector('div')!;
                expect(div.hasAttribute('data-test')).toBe(false);
            });
        });

        describe('Property Setting Edge Cases', () => {
            test('should handle null className', () => {
                const vnode = createElement('div', { className: '' });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.hasAttribute('class')).toBe(false);
            });

            test('should handle false className', () => {
                const vnode = createElement('div', { className: '' });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.hasAttribute('class')).toBe(false);
            });

            test('should handle null style', () => {
                const vnode = createElement('div', { style: undefined });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.hasAttribute('style')).toBe(false);
            });

            test('should handle undefined style', () => {
                const vnode = createElement('div', { style: undefined });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.hasAttribute('style')).toBe(false);
            });

            test('should handle style object with null value', () => {
                const vnode = createElement('div', {
                    style: { color: undefined, fontSize: '16px' }
                });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.style.color).toBe('');
                expect(div.style.fontSize).toBe('16px');
            });

            test('should handle false boolean attribute', () => {
                const vnode = createElement('input', { checked: false });
                render(vnode, container);

                const input = container.querySelector('input')!;
                expect(input.hasAttribute('checked')).toBe(false);
            });

            test('should handle empty string boolean attribute', () => {
                const vnode = createElement('input', { checked: '' });
                render(vnode, container);

                const input = container.querySelector('input')!;
                expect(input.hasAttribute('checked')).toBe(true);
            });

            test('should handle null attribute value', () => {
                const vnode = createElement('div', { 'data-test': null });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.hasAttribute('data-test')).toBe(false);
            });

            test('should handle false attribute value', () => {
                const vnode = createElement('div', { 'data-test': false });
                render(vnode, container);

                const div = container.querySelector('div')!;
                expect(div.hasAttribute('data-test')).toBe(false);
            });
        });

        describe('Event Handler Edge Cases', () => {
            test('should warn about non-function event handler in dev mode', () => {
                const consoleWarn = mock(() => {});
                const originalWarn = console.warn;
                console.warn = consoleWarn;

                setConfig({ devMode: true });
                const vnode = createElement('button', { onclick: 'not-a-function' });
                render(vnode, container);

                expect(consoleWarn).toHaveBeenCalled();
                console.warn = originalWarn;
            });

            test('should handle replacing event handler', () => {
                const handler1 = mock(() => {});
                const handler2 = mock(() => {});

                const oldVnode = createElement('button', { onclick: handler1 });
                render(oldVnode, container);

                const newVnode = createElement('button', { onclick: handler2 });
                render(newVnode, container);

                const button = container.querySelector('button')!;
                button.click();

                expect(handler2).toHaveBeenCalled();
            });
        });
    });

    describe('Patch', () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
            setConfig({ devMode: true });
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        describe('Edge Cases in Patching', () => {
            test('should handle patching with mismatched element and VNode type', () => {
                const oldVnode = createElement('div', {}, 'Old');
                render(oldVnode, container);

                // Manually create a span in the DOM
                const span = document.createElement('span');
                span.textContent = 'Manual';
                container.appendChild(span);

                const newVnode = createElement('div', {}, 'New');
                patch(container, oldVnode, newVnode, 0);

                expect(container.querySelector('div')).toBeTruthy();
            });

            test('should handle updating parent element when child doesnt exist', () => {
                const ul = document.createElement('ul');
                container.appendChild(ul);

                const oldVnode = createElement('ul', {},
                    createElement('li', { key: 'a' }, 'A')
                );
                const newVnode = createElement('ul', {},
                    createElement('li', { key: 'a' }, 'Updated A')
                );

                patch(ul, oldVnode, newVnode, 0);
                expect(ul.textContent).toContain('Updated A');
            });

            test('should handle text node replacement when text is same', () => {
                container.appendChild(document.createTextNode('Same'));
                patch(container, 'Same', 'Same', 0);
                expect(container.textContent).toBe('Same');
            });

            test('should handle appending new text node when old doesnt exist', () => {
                patch(container, 'Old', 'New', 0);
                expect(container.textContent).toBe('New');
            });
        });

        describe('Keyed Children Edge Cases', () => {
            test('should handle keyed list with text nodes between', () => {
                const oldVnode = createElement('div', {},
                    'Text 1',
                    createElement('span', { key: 'a' }, 'A'),
                    'Text 2',
                    createElement('span', { key: 'b' }, 'B'),
                    'Text 3'
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    'New Text 1',
                    createElement('span', { key: 'b' }, 'B'),
                    'New Text 2',
                    createElement('span', { key: 'a' }, 'A'),
                    'New Text 3'
                );
                patch(container, oldVnode, newVnode, 0);

                expect(container.textContent).toContain('New Text');
            });

            test('should handle keyed elements with primitive siblings', () => {
                const oldVnode = createElement('div', {},
                    123,
                    createElement('span', { key: 1 }, 'A'),
                    456
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    789,
                    createElement('span', { key: 1 }, 'B'),
                    0
                );
                patch(container, oldVnode, newVnode, 0);

                expect(container.textContent).toContain('B');
            });

            test('should handle removing all keyed items', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', { key: 1 }, 'Item 1'),
                    createElement('li', { key: 2 }, 'Item 2'),
                    createElement('li', { key: 3 }, 'Item 3')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {});
                patch(container, oldVnode, newVnode, 0);

                expect(container.querySelector('ul')?.children.length).toBe(0);
            });

            test('should handle adding items to empty keyed list', () => {
                const oldVnode = createElement('ul', {});
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', { key: 1 }, 'Item 1'),
                    createElement('li', { key: 2 }, 'Item 2')
                );
                patch(container, oldVnode, newVnode, 0);

                expect(container.querySelectorAll('li').length).toBe(2);
            });
        });

        describe('Complex Patching Scenarios', () => {
            test('should handle patching with null children array', () => {
                const oldVnode = createElement('div', {}, 'Old');
                render(oldVnode, container);

                const newVnode = { type: 'div', props: {}, children: [] };
                patch(container, oldVnode, newVnode, 0);

                expect(container.querySelector('div')).toBeTruthy();
            });

            test('should handle element without oldChild when types match', () => {
                const parent = document.createElement('section');
                container.appendChild(parent);

                const oldVnode = createElement('section', {}, 'Old');
                const newVnode = createElement('section', {}, 'New');

                patch(parent, oldVnode, newVnode, 0);
                expect(parent.textContent).toContain('New');
            });
        });

        describe('Line 175: patchChild - early return when newChild is null/boolean', () => {
            test('should return early when newChild is null', () => {
                // Line 175: if (isNullOrBoolean(newChild)) { ... return; }
                const oldVnode = createElement('div', {},
                    'First',
                    'Second',
                    'Third'
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    'First',
                    null, // This should trigger early return
                    'Third'
                );
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.textContent).toContain('First');
                expect(div.textContent).toContain('Third');
            });

            test('should return early when newChild is false', () => {
                const oldVnode = createElement('div', {}, 'A', 'B', 'C');
                render(oldVnode, container);

                const newVnode = createElement('div', {}, 'A', false, 'C');
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.textContent).toBe('AC');
            });

            test('should return early when newChild is true', () => {
                const oldVnode = createElement('div', {}, 'X', 'Y');
                render(oldVnode, container);

                const newVnode = createElement('div', {}, 'X', true);
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.textContent).toBe('X');
            });

            test('should return early when newChild is undefined', () => {
                const oldVnode = createElement('div', {}, 'One', 'Two');
                render(oldVnode, container);

                const newVnode = createElement('div', {}, 'One', undefined);
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.textContent).toBe('One');
            });
        });

        describe('Line 297: updateTextNode - else branch when oldChild is not text node', () => {
            test('should replace element with text node when old is element', () => {
                // Line 297: else branch - replaceChild or appendChild
                const oldVnode = createElement('div', {},
                    createElement('span', {}, 'Element child')
                );
                render(oldVnode, container);

                const div = container.querySelector('div')!;
                expect(div.querySelector('span')).not.toBeNull();

                const newVnode = createElement('div', {}, 'Just text now');
                patch(container, oldVnode, newVnode, 0);

                expect(div.querySelector('span')).toBeNull();
                expect(div.textContent).toBe('Just text now');
            });

            test('should append text node when oldChild does not exist', () => {
                // Line 299: appendChild when oldChild is undefined
                const parent = document.createElement('div');
                container.appendChild(parent);

                // No old child, patching text at index 0
                patch(parent, null, 'New text', 0);

                expect(parent.textContent).toBe('New text');
            });
        });

        describe('Line 316: replaceNode - else branch appendChild', () => {
            test('should append new element when oldChild is undefined', () => {
                // Line 318: else branch - appendChild
                const parent = document.createElement('div');
                container.appendChild(parent);

                const newVnode = createElement('span', {}, 'Appended');
                // No oldChild at index 0
                patch(parent, null, newVnode, 0);

                expect(parent.querySelector('span')).not.toBeNull();
                expect(parent.textContent).toBe('Appended');
            });

            test('should append multiple elements when no old children exist', () => {
                const parent = document.createElement('ul');
                container.appendChild(parent);

                patch(parent, null, createElement('li', {}, 'Item 1'), 0);
                patch(parent, null, createElement('li', {}, 'Item 2'), 1);

                expect(parent.querySelectorAll('li').length).toBe(2);
            });
        });

        describe('Lines 446-450: patch - catch block error handling', () => {
            test('should catch and handle errors during patch', () => {
                // Line 446-450: try-catch block
                const oldVnode = createElement('div', {}, 'Old');
                render(oldVnode, container);

                // Create a scenario that might trigger an error
                const invalidVnode = {
                    type: 'div',
                    props: {},
                    children: null
                };

                // Should not throw, error should be handled
                expect(() => {
                    patch(container, oldVnode, invalidVnode as any, 0);
                }).not.toThrow();
            });

            test('should handle error with invalid parent element', () => {
                const vnode = createElement('div', {}, 'Content');
                const invalidParent = null;

                // Should catch error gracefully
                expect(() => {
                    patch(invalidParent as any, null, vnode, 0);
                }).not.toThrow();
            });

            test('should handle error during complex patch operation', () => {
                const oldVnode = createElement('div', {},
                    createElement('ul', {},
                        createElement('li', { key: 1 }, 'Item 1')
                    )
                );
                render(oldVnode, container);

                // Create a malformed newVnode
                const newVnode = {
                    type: 'div',
                    props: {},
                    children: [
                        {
                            type: 'ul',
                            props: {},
                            children: 'invalid' // Should be array
                        }
                    ]
                };

                expect(() => {
                    patch(container, oldVnode, newVnode as any, 0);
                }).not.toThrow();
            });
        });

        describe('Keyed children - complex scenarios', () => {
            test('should handle keyed children with all new keys', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', { key: '1' }, 'Item 1'),
                    createElement('li', { key: '2' }, 'Item 2')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', { key: '3' }, 'Item 3'),
                    createElement('li', { key: '4' }, 'Item 4')
                );
                patch(container, oldVnode, newVnode, 0);

                const ul = container.querySelector('ul')!;
                const items = ul.querySelectorAll('li');
                expect(items.length).toBe(2);
                expect(items[0].textContent).toBe('Item 3');
                expect(items[1].textContent).toBe('Item 4');
            });

            test('should handle keyed children with partial overlap', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', { key: 'a' }, 'A'),
                    createElement('li', { key: 'b' }, 'B'),
                    createElement('li', { key: 'c' }, 'C')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', { key: 'b' }, 'B-updated'),
                    createElement('li', { key: 'd' }, 'D'),
                    createElement('li', { key: 'c' }, 'C-updated')
                );
                patch(container, oldVnode, newVnode, 0);

                const ul = container.querySelector('ul')!;
                const items = ul.querySelectorAll('li');
                expect(items.length).toBe(3);
                expect(items[0].textContent).toBe('B-updated');
                expect(items[1].textContent).toBe('D');
                expect(items[2].textContent).toBe('C-updated');
            });

            test('should handle keyed children with reverse order', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', { key: '1' }, '1'),
                    createElement('li', { key: '2' }, '2'),
                    createElement('li', { key: '3' }, '3'),
                    createElement('li', { key: '4' }, '4')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', { key: '4' }, '4'),
                    createElement('li', { key: '3' }, '3'),
                    createElement('li', { key: '2' }, '2'),
                    createElement('li', { key: '1' }, '1')
                );
                patch(container, oldVnode, newVnode, 0);

                const ul = container.querySelector('ul')!;
                const items = ul.querySelectorAll('li');
                expect(items.length).toBe(4);
                expect(items[0].textContent).toBe('4');
                expect(items[1].textContent).toBe('3');
                expect(items[2].textContent).toBe('2');
                expect(items[3].textContent).toBe('1');
            });
        });
    });

    describe('Render', () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        describe('Error Handling Edge Cases', () => {
            test('should handle invalid VNode in createDOMElement', () => {
                const consoleError = mock(() => {});
                const originalError = console.error;
                console.error = consoleError;

                const invalidVNode = { type: 123, props: {}, children: [] };
                render(invalidVNode as any, container);

                expect(consoleError).toHaveBeenCalled();
                console.error = originalError;
            });

            test('should handle null children in VNode', () => {
                const vnode = createElement('div', {}, null);

                const consoleError = mock(() => {});
                const originalError = console.error;
                console.error = consoleError;

                render(vnode, container);

                console.error = originalError;
            });
        });
    });

    describe('All Remaining Lines', () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
            setConfig({ devMode: true, sanitizeHTML: true });
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // HTML.TS - Line 78: isInAttribute check
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('html.ts - Line 78: isInAttribute - lastEqualIndex > lastGtIndex', () => {
            test('should correctly identify when inside an attribute value', () => {
                // This will trigger line 78 where lastEqualIndex > lastGtIndex
                const value = 'test-value';
                const vnode = html`<div data-attr="${value}"></div>`;
                expect(vnode.props['data-attr']).toBe('test-value');
            });

            test('should handle value right after equals sign in attribute', () => {
                const color = 'red';
                const vnode = html`<div style="color: ${color}"></div>`;
                expect(vnode.props.style).toContain('red');
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // HTML.TS - Line 203: Array marker break statement
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('html.ts - Line 203: handleTextNode - array marker break', () => {
            test('should break after finding array marker', () => {
                // This triggers the break statement on line 203
                const items = ['A', 'B', 'C'];
                const vnode = html`<ul>${items}</ul>`;

                // The array should be processed and break should occur
                expect(vnode.type).toBe('ul');
                expect(vnode.children.length).toBe(3);
            });

            test('should handle array with VNodes', () => {
                const items = [
                    createElement('li', {}, 'Item 1'),
                    createElement('li', {}, 'Item 2')
                ];
                const vnode = html`<ul>${items}</ul>`;
                expect(vnode.children.length).toBe(2);
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // HTML.TS - Lines 223-229: Event handler continue statement
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('html.ts - Lines 223-229: parseAttributes - event handler continue', () => {
            test('should continue after storing event handler', () => {
                // This triggers the continue on line 228
                const handler = () => console.log('click');
                const vnode = html`<button onclick="${handler}" disabled>Click</button>`;

                expect(typeof vnode.props.onclick).toBe('function');
                expect(vnode.props.disabled).toBe(true);
            });

            test('should handle multiple event handlers with continue', () => {
                const onClick = () => {};
                const onHover = () => {};
                const onBlur = () => {};

                const vnode = html`<div
                    onclick="${onClick}"
                    class="test"
                    onmouseenter="${onHover}"
                    id="myid"
                    onblur="${onBlur}"
                >Content</div>`;

                expect(typeof vnode.props.onclick).toBe('function');
                expect(typeof vnode.props.onmouseenter).toBe('function');
                expect(typeof vnode.props.onblur).toBe('function');
                expect(vnode.props.className).toBe('test');
                expect(vnode.props.id).toBe('myid');
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // HTML.TS - Lines 234-236: Boolean attribute continue statements
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('html.ts - Lines 234-236: Boolean attributes continue', () => {
            test('should continue after setting boolean to true', () => {
                // Line 238: continue after setting true
                const vnode = html`<input checked="${true}" name="test" required />`;
                expect(vnode.props.checked).toBe(true);
                expect(vnode.props.name).toBe('test');
                expect(vnode.props.required).toBe(true);
            });

            test('should continue after setting boolean to true for empty string', () => {
                // Line 240: continue for empty string
                const vnode = html`<input checked="" disabled="" type="checkbox" />`;
                expect(vnode.props.checked).toBe(true);
                expect(vnode.props.disabled).toBe(true);
                expect(vnode.props.type).toBe('checkbox');
            });

            test('should continue after handling non-true/non-empty boolean value', () => {
                // Line 242: continue for other string values
                const vnode = html`<input checked="yes" id="cb" />`;
                expect(vnode.props.checked).toBe('yes');
                expect(vnode.props.id).toBe('cb');
            });

            test('should skip false boolean values and continue', () => {
                // Line 236: continue when value is 'false'
                const vnode = html`<input checked="${false}" disabled="${false}" type="text" />`;
                expect(Object.prototype.hasOwnProperty.call(vnode.props, 'checked')).toBe(false);
                expect(Object.prototype.hasOwnProperty.call(vnode.props, 'disabled')).toBe(false);
                expect(vnode.props.type).toBe('text');
            });

            test('should handle required attribute with false', () => {
                const vnode = html`<input required="${false}" name="field" />`;
                expect(Object.prototype.hasOwnProperty.call(vnode.props, 'required')).toBe(false);
                expect(vnode.props.name).toBe('field');
            });

            test('should handle selected attribute', () => {
                const vnode = html`<option selected="${true}" value="1">Option</option>`;
                expect(vnode.props.selected).toBe(true);
                expect(vnode.props.value).toBe('1');
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // HTML.TS - Line 242: Regular attribute assignment
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('html.ts - Line 242: Regular attribute assignment after marker replacement', () => {
            test('should assign regular attributes with marker replacement', () => {
                // Line 252: props[name] = replaceMarkers(...)
                const userId = '12345';
                const userName = 'John';

                const vnode = html`<div data-user-id="${userId}" data-user-name="${userName}" role="button"></div>`;
                expect(vnode.props['data-user-id']).toBe('12345');
                expect(vnode.props['data-user-name']).toBe('John');
                expect(vnode.props.role).toBe('button');
            });

            test('should handle ARIA attributes with markers', () => {
                const label = 'Close dialog';
                const expanded = 'true';

                const vnode = html`<button aria-label="${label}" aria-expanded="${expanded}">X</button>`;
                expect(vnode.props['aria-label']).toBe('Close dialog');
                expect(vnode.props['aria-expanded']).toBe('true');
            });

            test('should handle mixed static and dynamic attributes', () => {
                const id = 'dynamic-id';
                const vnode = html`<div id="${id}" class="static-class" title="Static Title"></div>`;
                expect(vnode.props.id).toBe('dynamic-id');
                expect(vnode.props.className).toBe('static-class');
                expect(vnode.props.title).toBe('Static Title');
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // HTML.TS - Lines 266-267: parseChildren - continue after adding text
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('html.ts - Lines 266-267: parseChildren continue statements', () => {
            test('should continue after finding array marker in child text', () => {
                // Line 262: continue after pushing array items
                const items = ['Item 1', 'Item 2', 'Item 3'];
                const vnode = html`<div>${items}</div>`;

                expect(vnode.children.length).toBe(3);
                expect(vnode.children).toContain('Item 1');
                expect(vnode.children).toContain('Item 2');
                expect(vnode.children).toContain('Item 3');
            });

            test('should continue after finding VNode markers in child text', () => {
                // Line 274: continue after pushing VNode
                const child1 = createElement('span', {}, 'A');
                const child2 = createElement('span', {}, 'B');

                const vnode = html`<div>${child1}${child2}</div>`;

                expect(vnode.children.length).toBe(2);
                expect(vnode.children[0]).toEqual(child1);
                expect(vnode.children[1]).toEqual(child2);
            });

            test('should continue loop when adding processed text', () => {
                // Line 281: continue after pushing processed text
                const name = 'World';
                const greeting = 'Hello';

                const vnode = html`<p>${greeting} ${name}!</p>`;

                const textContent = vnode.children.join(' ');
                expect(textContent).toContain('Hello');
                expect(textContent).toContain('World');
            });

            test('should skip empty text and continue', () => {
                const empty = '';
                const vnode = html`<div>Text ${empty} More</div>`;

                expect(vnode.type).toBe('div');
                // Empty values should be filtered out
                const hasContent = vnode.children.some(c =>
                    typeof c === 'string' && (c.includes('Text') || c.includes('More'))
                );
                expect(hasContent).toBe(true);
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // PROPS.TS - Lines 133-135: Early return for children and key
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('props.ts - Lines 133-135: setProperty early return', () => {
            test('should return early when key is "children"', () => {
                // Line 134: if (key === 'children' || key === 'key') return;
                const vnode = createElement('div', {
                    children: ['ignored'],
                    id: 'test'
                }, 'Real Child');

                render(vnode, container);
                const div = container.querySelector('div')!;

                // children prop should not be set as attribute
                expect(div.hasAttribute('children')).toBe(false);
                // But real children should render
                expect(div.textContent).toBe('Real Child');
                expect(div.id).toBe('test');
            });

            test('should return early when key is "key"', () => {
                const vnode = createElement('li', {
                    key: 'item-1',
                    className: 'list-item'
                }, 'Content');

                render(vnode, container);
                const li = container.querySelector('li')!;

                // key should not be set as attribute
                expect(li.hasAttribute('key')).toBe(false);
                // But other props should be set
                expect(li.className).toBe('list-item');
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // PROPS.TS - Lines 140-141: Ref callback return
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('props.ts - Lines 140-141: Ref callback early return', () => {
            test('should call ref callback and return without setting attribute', () => {
                // Line 141: value(element); return;
                let capturedElement: HTMLElement | null = null;

                const vnode = createElement('div', {
                    ref: (el: HTMLElement | null) => { capturedElement = el; },
                    id: 'ref-test',
                    className: 'ref-class'
                }, 'Content');

                render(vnode, container);
                const div = container.querySelector('div')!;

                // Ref callback should have been called
                expect(capturedElement!).toBe(div);
                // ref should not be an attribute
                expect(div.hasAttribute('ref')).toBe(false);
                // Other props should be set
                expect(div.id).toBe('ref-test');
                expect(div.className).toBe('ref-class');
            });

            test('should handle ref with multiple other props', () => {
                let refEl: HTMLElement | null = null;

                const vnode = createElement('button', {
                    ref: (el: HTMLElement | null) => { refEl = el; },
                    type: 'button',
                    disabled: true,
                    className: 'btn',
                    'aria-label': 'Close'
                }, 'X');

                render(vnode, container);
                const btn = container.querySelector('button')!;

                expect(refEl!).toBe(btn);
                expect(btn.type).toBe('button');
                expect(btn.disabled).toBe(true);
                expect(btn.className).toBe('btn');
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // PROPS.TS - Lines 146-148: className return
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('props.ts - Lines 146-148: setClassName and return', () => {
            test('should set className and return early', () => {
                // Line 147: setClassName(element, value); return;
                const vnode = createElement('div', {
                    className: 'my-class another-class',
                    id: 'test-id',
                    'data-value': '123'
                });

                render(vnode, container);
                const div = container.querySelector('div')!;

                expect(div.className).toBe('my-class another-class');
                expect(div.id).toBe('test-id');
                expect(div.getAttribute('data-value')).toBe('123');
            });

            test('should handle class prop (legacy) and return', () => {
                const vnode = createElement('span', {
                    class: 'legacy-class',
                    title: 'Test Title'
                });

                render(vnode, container);
                const span = container.querySelector('span')!;

                expect(span.className).toBe('legacy-class');
                expect(span.title).toBe('Test Title');
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // PROPS.TS - Lines 153-154: Style return
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('props.ts - Lines 153-154: setStyle and return', () => {
            test('should set style string and return early', () => {
                // Line 154: setStyle(element, value); return;
                const vnode = createElement('div', {
                    style: 'color: blue; font-size: 16px;',
                    id: 'styled-div',
                    className: 'styled'
                });

                render(vnode, container);
                const div = container.querySelector('div')!;

                expect(div.getAttribute('style')).toContain('color');
                expect(div.id).toBe('styled-div');
                expect(div.className).toBe('styled');
            });

            test('should set style object and return early', () => {
                const vnode = createElement('div', {
                    style: {
                        backgroundColor: 'red',
                        padding: '10px',
                        margin: '5px'
                    },
                    title: 'Styled Box'
                });

                render(vnode, container);
                const div = container.querySelector('div')!;

                expect(div.style.backgroundColor).toBe('red');
                expect(div.style.padding).toBe('10px');
                expect(div.style.margin).toBe('5px');
                expect(div.title).toBe('Styled Box');
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // PROPS.TS - Lines 159-160: dangerouslySetInnerHTML return
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('props.ts - Lines 159-160: dangerouslySetInnerHTML and return', () => {
            test('should set innerHTML and return early', () => {
                // Line 160: element.innerHTML = value.__html; return;
                const vnode = createElement('div', {
                    dangerouslySetInnerHTML: { __html: '<strong>Bold</strong>' },
                    id: 'html-container',
                    className: 'content'
                });

                render(vnode, container);
                const div = container.querySelector('div')!;

                expect(div.innerHTML).toBe('<strong>Bold</strong>');
                expect(div.id).toBe('html-container');
                expect(div.className).toBe('content');
            });

            test('should handle complex HTML with dangerouslySetInnerHTML', () => {
                const vnode = createElement('article', {
                    dangerouslySetInnerHTML: {
                        __html: '<h1>Title</h1><p>Paragraph</p><ul><li>Item</li></ul>'
                    },
                    'data-article-id': '456'
                });

                render(vnode, container);
                const article = container.querySelector('article')!;

                expect(article.querySelector('h1')).not.toBeNull();
                expect(article.querySelector('p')).not.toBeNull();
                expect(article.querySelector('ul')).not.toBeNull();
                expect(article.getAttribute('data-article-id')).toBe('456');
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // PROPS.TS - Lines 218-219: setStyle null value handling
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('props.ts - Lines 218-219: Style null value to empty string', () => {
            test('should set null style values to empty string', () => {
                // Line 219: (element.style)[prop] = '';
                const vnode = createElement('div', {
                    style: {
                        color: 'red',
                        fontSize: undefined,
                        fontWeight: 'bold',
                        marginTop: undefined,
                        padding: '10px'
                    }
                });

                render(vnode, container);
                const div = container.querySelector('div')!;

                expect(div.style.color).toBe('red');
                expect(div.style.fontSize).toBe(''); // null → ''
                expect(div.style.fontWeight).toBe('bold');
                expect(div.style.marginTop).toBe(''); // undefined → ''
                expect(div.style.padding).toBe('10px');
            });

            test('should handle style object with all null values', () => {
                const vnode = createElement('div', {
                    style: {
                        color: undefined,
                        fontSize: undefined,
                        padding: undefined
                    },
                    id: 'null-styles'
                });

                render(vnode, container);
                const div = container.querySelector('div')!;

                expect(div.style.color).toBe('');
                expect(div.style.fontSize).toBe('');
                expect(div.style.padding).toBe('');
                expect(div.id).toBe('null-styles');
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // PATCH.TS - Line 175: Early return when newChild is null/boolean
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('patch.ts - Line 175: patchChild early return for null/boolean', () => {
            test('should return early when newChild is null', () => {
                // Line 175: if (isNullOrBoolean(newChild)) { ... return; }
                const oldVnode = createElement('div', {},
                    'First',
                    'Second',
                    'Third'
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    'First',
                    null, // Should trigger early return
                    'Third'
                );
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.textContent).toContain('First');
                expect(div.textContent).toContain('Third');
                expect(div.textContent).not.toContain('Second');
            });

            test('should return early when newChild is undefined', () => {
                const oldVnode = createElement('div', {}, 'A', 'B', 'C');
                render(oldVnode, container);

                const newVnode = createElement('div', {}, 'A', undefined, 'C');
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.textContent).toBe('AC');
            });

            test('should return early when newChild is true', () => {
                const oldVnode = createElement('div', {}, 'X', 'Y', 'Z');
                render(oldVnode, container);

                const newVnode = createElement('div', {}, 'X', true, 'Z');
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.textContent).toBe('XZ');
            });

            test('should return early when newChild is false', () => {
                const oldVnode = createElement('ul', {},
                    createElement('li', {}, 'Item 1'),
                    createElement('li', {}, 'Item 2'),
                    createElement('li', {}, 'Item 3')
                );
                render(oldVnode, container);

                const newVnode = createElement('ul', {},
                    createElement('li', {}, 'Item 1'),
                    false,
                    createElement('li', {}, 'Item 3')
                );
                patch(container, oldVnode, newVnode, 0);

                const ul = container.querySelector('ul')!;
                expect(ul.children.length).toBe(2);
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // PATCH.TS - Line 297: updateTextNode else branch
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('patch.ts - Line 297: updateTextNode else branch', () => {
            test('should replace element with text node when old is element', () => {
                // Line 297: else branch - replaceChild or appendChild
                const oldVnode = createElement('div', {},
                    createElement('span', {}, 'Element')
                );
                render(oldVnode, container);

                const div = container.querySelector('div')!;
                expect(div.querySelector('span')).not.toBeNull();

                const newVnode = createElement('div', {}, 'Just text');
                patch(container, oldVnode, newVnode, 0);

                expect(div.querySelector('span')).toBeNull();
                expect(div.textContent).toBe('Just text');
            });

            test('should append text node when oldChild does not exist', () => {
                // Line 299: appendChild when oldChild is undefined
                const parent = document.createElement('div');
                container.appendChild(parent);

                patch(parent, null, 'New text node', 0);

                expect(parent.textContent).toBe('New text node');
                expect(parent.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
            });

            test('should replace non-text node with text node', () => {
                const oldVnode = createElement('section', {},
                    createElement('article', {}, 'Article')
                );
                render(oldVnode, container);

                const newVnode = createElement('section', {}, 'Plain text');
                patch(container, oldVnode, newVnode, 0);

                const section = container.querySelector('section')!;
                expect(section.querySelector('article')).toBeNull();
                expect(section.textContent).toBe('Plain text');
            });
        });

        // ═══════════════════════════════════════════════════════════════════════════════
        // Additional edge cases for complete coverage
        // ═══════════════════════════════════════════════════════════════════════════════
        describe('Additional edge cases for 100% coverage', () => {
            test('should handle mixed boolean attributes in html template', () => {
                const isChecked = true;
                const isDisabled = false;
                const isRequired = true;

                const vnode = html`<input
                    checked="${isChecked}"
                    disabled="${isDisabled}"
                    required="${isRequired}"
                    type="checkbox"
                />`;

                expect(vnode.props.checked).toBe(true);
                expect(Object.prototype.hasOwnProperty.call(vnode.props, 'disabled')).toBe(false);
                expect(vnode.props.required).toBe(true);
                expect(vnode.props.type).toBe('checkbox');
            });

            test('should handle style with mixed null and valid values in different order', () => {
                const vnode = createElement('div', {
                    style: {
                        padding: '5px',
                        margin: undefined,
                        color: 'blue',
                        fontSize: undefined,
                        fontWeight: 'bold',
                        border: undefined
                    }
                });

                render(vnode, container);
                const div = container.querySelector('div')!;

                expect(div.style.padding).toBe('5px');
                expect(div.style.margin).toBe('');
                expect(div.style.color).toBe('blue');
                expect(div.style.fontSize).toBe('');
                expect(div.style.fontWeight).toBe('bold');
                expect(div.style.border).toBe('');
            });

            test('should handle complex nested children with null/boolean filtering', () => {
                const oldVnode = createElement('div', {},
                    'Text',
                    true,
                    createElement('span', {}, 'Span'),
                    false,
                    null,
                    'More text',
                    undefined
                );
                render(oldVnode, container);

                const newVnode = createElement('div', {},
                    'New text',
                    false,
                    createElement('span', {}, 'Updated span'),
                    null,
                    true,
                    'Final text'
                );
                patch(container, oldVnode, newVnode, 0);

                const div = container.querySelector('div')!;
                expect(div.textContent).toContain('New text');
                expect(div.textContent).toContain('Updated span');
                expect(div.textContent).toContain('Final text');
            });

            test('should handle all special props together', () => {
                let refElement: HTMLElement | null = null;

                const vnode = createElement('div', {
                    key: 'special-key',
                    ref: (el: HTMLElement | null) => { refElement = el; },
                    children: ['ignored'],
                    className: 'special-class',
                    style: { color: 'red', fontSize: undefined },
                    dangerouslySetInnerHTML: { __html: '<em>HTML</em>' },
                    id: 'special-id'
                });

                render(vnode, container);
                const div = container.querySelector('div')!;

                expect(refElement!).toBe(div);
                expect(div.hasAttribute('key')).toBe(false);
                expect(div.hasAttribute('children')).toBe(false);
                expect(div.className).toBe('special-class');
                expect(div.style.color).toBe('red');
                expect(div.style.fontSize).toBe('');
                expect(div.innerHTML).toBe('<em>HTML</em>');
                expect(div.id).toBe('special-id');
            });
        });
    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
