// test/errors.test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import './setup';
    import { describe, expect, test, beforeEach, mock } from 'bun:test';
    import {
        createElement,
        setConfig,
        getConfig,
        VDOMError,
        handleError,
        warn,
        assert,
        createErrorPlaceholder,
        validateVNode,
        withErrorHandling
    } from '../src/main';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TESTS ════════════════════════════════════════╗

describe('Error Handling', () => {

    beforeEach(() => {
        setConfig({ devMode: true, sanitizeHTML: true, onError: undefined });
    });

    describe('VDOMError Class', () => {
        test('should create error with message', () => {
            const error = new VDOMError('Test error');
            expect(error.message).toBe('Test error');
            expect(error.name).toBe('VDOMError');
        });

        test('should store vnode context', () => {
            const vnode = createElement('div', {}, 'test');
            const error = new VDOMError('Test', vnode);
            expect(error.vnode).toBe(vnode);
        });

        test('should store string context', () => {
            const error = new VDOMError('Test', undefined, 'render');
            expect(error.context).toBe('render');
        });
    });

    describe('handleError Function', () => {
        test('should call custom error handler', () => {
            const handler = mock(() => {});
            setConfig({ onError: handler });

            const error = new Error('Test');
            handleError(error);

            expect(handler).toHaveBeenCalled();
        });

        test('should convert regular Error to VDOMError', () => {
            const handler = mock((error: Error) => {
                expect(error).toBeInstanceOf(VDOMError);
            });
            setConfig({ onError: handler });

            handleError(new Error('Test'));
            expect(handler).toHaveBeenCalled();
        });

        test('should handle error in custom handler', () => {
            const consoleError = mock(() => {});
            const originalError = console.error;
            console.error = consoleError;

            setConfig({
                onError: () => { throw new Error('Handler error'); }
            });

            handleError(new Error('Original error'));

            expect(consoleError).toHaveBeenCalled();
            console.error = originalError;
        });

        test('should log to console without custom handler', () => {
            const consoleError = mock(() => {});
            const originalError = console.error;
            console.error = consoleError;

            setConfig({ onError: undefined });
            handleError(new Error('Test error'));

            expect(consoleError).toHaveBeenCalled();
            console.error = originalError;
        });

        test('should include vnode in dev mode', () => {
            const consoleError = mock(() => {});
            const originalError = console.error;
            console.error = consoleError;

            setConfig({ devMode: true, onError: undefined });
            const vnode = createElement('div', {}, 'test');
            handleError(new Error('Test'), vnode, 'test-context');

            expect(consoleError).toHaveBeenCalled();
            console.error = originalError;
        });
    });

    describe('warn Function', () => {
        test('should warn in dev mode', () => {
            const consoleWarn = mock(() => {});
            const originalWarn = console.warn;
            console.warn = consoleWarn;

            setConfig({ devMode: true });
            warn('Test warning');

            expect(consoleWarn).toHaveBeenCalled();
            console.warn = originalWarn;
        });

        test('should not warn in production', () => {
            const consoleWarn = mock(() => {});
            const originalWarn = console.warn;
            console.warn = consoleWarn;

            setConfig({ devMode: false });
            warn('Test warning');

            expect(consoleWarn).not.toHaveBeenCalled();
            console.warn = originalWarn;
        });

        test('should include vnode in warning', () => {
            const consoleWarn = mock(() => {});
            const originalWarn = console.warn;
            console.warn = consoleWarn;

            setConfig({ devMode: true });
            const vnode = createElement('div', {}, 'test');
            warn('Test warning', vnode);

            expect(consoleWarn).toHaveBeenCalledTimes(2);
            console.warn = originalWarn;
        });
    });

    describe('assert Function', () => {
        test('should throw in dev mode when false', () => {
            setConfig({ devMode: true });
            expect(() => assert(false, 'Should fail')).toThrow(VDOMError);
        });

        test('should not throw in dev mode when true', () => {
            setConfig({ devMode: true });
            expect(() => assert(true, 'Should pass')).not.toThrow();
        });

        test('should not throw in production mode', () => {
            setConfig({ devMode: false });
            expect(() => assert(false, 'Should not throw')).not.toThrow();
        });
    });

    describe('createErrorPlaceholder Function', () => {
        test('should create text node with error message in dev', () => {
            setConfig({ devMode: true });
            const error = new Error('Test error');
            const placeholder = createErrorPlaceholder(error);

            expect(placeholder.nodeType).toBe(Node.TEXT_NODE);
            expect(placeholder.textContent).toContain('Test error');
        });

        test('should create generic error message in production', () => {
            setConfig({ devMode: false });
            const error = new Error('Test error');
            const placeholder = createErrorPlaceholder(error);

            expect(placeholder.textContent).toBe('[Render Error]');
        });
    });

    describe('validateVNode Function', () => {
        test('should validate correct VNode', () => {
            const vnode = createElement('div', {}, 'test');
            expect(validateVNode(vnode)).toBe(true);
        });

        test('should reject null', () => {
            expect(validateVNode(null)).toBe(false);
        });

        test('should reject non-object', () => {
            expect(validateVNode('string')).toBe(false);
            expect(validateVNode(123)).toBe(false);
        });

        test('should reject object without required properties', () => {
            setConfig({ devMode: true });
            expect(validateVNode({ type: 'div' })).toBe(false);
        });

        test('should reject non-string type', () => {
            setConfig({ devMode: true });
            expect(validateVNode({ type: 123, props: {}, children: [] })).toBe(false);
        });

        test('should reject non-array children', () => {
            setConfig({ devMode: true });
            expect(validateVNode({ type: 'div', props: {}, children: 'string' })).toBe(false);
        });
    });

    describe('withErrorHandling Function', () => {
        test('should wrap function with error handling', () => {
            const fn = () => { throw new Error('Test'); };
            const wrapped = withErrorHandling(fn, 'test-context');

            expect(() => wrapped()).not.toThrow();
        });

        test('should return function result on success', () => {
            const fn = () => 'success';
            const wrapped = withErrorHandling(fn);

            expect(wrapped()).toBe('success');
        });

        test('should return null on error', () => {
            const fn = () => { throw new Error('Test'); };
            const wrapped = withErrorHandling(fn);

            expect(wrapped()).toBe(null);
        });

        test('should pass arguments to wrapped function', () => {
            const fn = (a: number, b: number) => a + b;
            const wrapped = withErrorHandling(fn);

            expect(wrapped(2, 3)).toBe(5);
        });
    });

    describe('Configuration Management', () => {
        test('should set and get config', () => {
            setConfig({ devMode: false, sanitizeHTML: false });
            const config = getConfig();

            expect(config.devMode).toBe(false);
            expect(config.sanitizeHTML).toBe(false);
        });

        test('should merge config', () => {
            setConfig({ devMode: true });
            setConfig({ sanitizeHTML: false });
            const config = getConfig();

            expect(config.devMode).toBe(true);
            expect(config.sanitizeHTML).toBe(false);
        });

        test('should return copy of config', () => {
            setConfig({ devMode: true });
            const config1 = getConfig();
            const config2 = getConfig();

            expect(config1).not.toBe(config2);
            expect(config1).toEqual(config2);
        });
    });
});

// ╚══════════════════════════════════════════════════════════════════════════════════════╝