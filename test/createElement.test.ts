// test/createElement.test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import './setup';
    import { describe, expect, test, beforeEach, mock } from 'bun:test';
    import {
        createElement,
        Fragment,
        jsx,
        jsxs,
        jsxDEV,
        h,
        setConfig
    } from '../src/main';
    import { createTextNode } from '../src/core/createElement';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    describe('createElement', () => {

        beforeEach(() => {
            setConfig({ devMode: true, sanitizeHTML: true });
        });

        describe('Basic createElement', () => {
            test('should create VNode with props and children', () => {
                const vnode = createElement('div', { className: 'test' }, 'Hello');

                expect(vnode.type).toBe('div');
                expect(vnode.props.className).toBe('test');
                expect(vnode.children[0]).toBe('Hello');
            });

            test('should handle null props', () => {
                const vnode = createElement('div', null, 'Hello');

                expect(vnode.type).toBe('div');
                expect(vnode.props).toEqual({});
                expect(vnode.children[0]).toBe('Hello');
            });

            test('should filter out boolean and null children', () => {
                const vnode = createElement('div', null,
                    'Hello',
                    true,
                    false,
                    null,
                    undefined,
                    'World'
                );

                expect(vnode.children).toEqual(['Hello', 'World']);
            });

            test('should handle class vs className', () => {
                const vnode = createElement('div', { class: 'test-class' });

                expect(vnode.props.className).toBe('test-class');
                expect(vnode.props.class).toBeUndefined();
            });
        });

        describe('h Alias', () => {
            test('h alias should work like createElement', () => {
                const vnode = h('div', { id: 'test' }, 'Content');

                expect(vnode.type).toBe('div');
                expect(vnode.props.id).toBe('test');
                expect(vnode.children[0]).toBe('Content');
            });
        });

        describe('Invalid Element Types', () => {
            test('should warn about invalid element type in dev mode', () => {
                const consoleWarn = mock(() => {});
                const originalWarn = console.warn;
                console.warn = consoleWarn;

                setConfig({ devMode: true });
                // @ts-expect-error - Testing invalid input
                createElement(null, {}, 'test');

                expect(consoleWarn).toHaveBeenCalled();
                console.warn = originalWarn;
            });
        });
    });

    describe('Fragment', () => {
        test('should create fragment with no children', () => {
            const frag = Fragment();
            expect(frag.type).toBe('fragment');
            expect(frag.props).toEqual({});
            expect(frag.children).toEqual([]);
        });

        test('should create fragment with single child', () => {
            const frag = Fragment('single child');
            expect(frag.type).toBe('fragment');
            expect(frag.children).toEqual(['single child']);
        });

        test('should create fragment with multiple children', () => {
            const frag = Fragment(
                'text',
                createElement('div', {}, 'element'),
                123
            );
            expect(frag.children.length).toBe(3);
        });

        test('should create fragment with createElement', () => {
            const frag = createElement('fragment', null, 'Child1', 'Child2');

            expect(frag.type).toBe('fragment');
            expect(frag.props).toEqual({});
            expect(frag.children.length).toBe(2);
        });
    });

    describe('createTextNode', () => {
        test('should convert string to string', () => {
            const result = createTextNode('hello');
            expect(result).toBe('hello');
        });

        test('should convert number to string', () => {
            const result = createTextNode(42);
            expect(result).toBe('42');
        });

        test('should convert zero to string', () => {
            const result = createTextNode(0);
            expect(result).toBe('0');
        });
    });

    describe('JSX Factory Functions', () => {
        test('jsx should work like createElement', () => {
            const vnode = jsx('div', { id: 'test' }, 'content');
            expect(vnode.type).toBe('div');
            expect(vnode.props.id).toBe('test');
            expect(vnode.children).toEqual(['content']);
        });

        test('jsxs should work like createElement', () => {
            const vnode = jsxs('span', { className: 'text' }, 'child1', 'child2');
            expect(vnode.type).toBe('span');
            expect(vnode.props.className).toBe('text');
        });

        test('jsxDEV should work like createElement', () => {
            const vnode = jsxDEV('p', null, 'paragraph');
            expect(vnode.type).toBe('p');
            expect(vnode.props).toEqual({});
        });
    });

    describe('Children Handling', () => {
        test('should handle mixed children types', () => {
            const vnode = createElement('div', {},
                'Text',
                123,
                createElement('span', {}, 'Element'),
                false,
                null,
                ['Array', 'Items']
            );

            expect(vnode.children).toContain('Text');
            expect(vnode.children).toContain(123);
            expect(vnode.children).toContain('Array');
            expect(vnode.children).toContain('Items');
        });

        test('should handle numeric children', () => {
            const vnode = createElement('div', {}, 0, 1, 2);
            expect(vnode.children).toEqual([0, 1, 2]);
        });

        test('should handle empty string children', () => {
            const vnode = createElement('div', {}, '', 'text', '');
            expect(vnode.children).toContain('text');
        });
    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝