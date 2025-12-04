// test/helpers.test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import './setup';
    import { describe, expect, test } from 'bun:test';
    import { createElement } from '../src/main';
    import {
        isNullOrBoolean,
        isVNode,
        isPrimitive,
        flattenChildren,
        sanitizeHTML,
        camelToKebab,
        shallowEqual,
        generateId,
        isBrowser,
        isFunction,
        isEventProp,
        getEventName,
        deepClone,
    } from '../src/utils/helpers';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TEST ════════════════════════════════════════╗

    describe('Helper Functions', () => {

        describe('Type Checking Functions', () => {
            describe('isNullOrBoolean', () => {
                test('should return true for null', () => {
                    expect(isNullOrBoolean(null)).toBe(true);
                });

                test('should return true for undefined', () => {
                    expect(isNullOrBoolean(undefined)).toBe(true);
                });

                test('should return true for booleans', () => {
                    expect(isNullOrBoolean(true)).toBe(true);
                    expect(isNullOrBoolean(false)).toBe(true);
                });

                test('should return false for other values', () => {
                    expect(isNullOrBoolean(0)).toBe(false);
                    expect(isNullOrBoolean('')).toBe(false);
                    expect(isNullOrBoolean({})).toBe(false);
                });
            });

            describe('isVNode', () => {
                test('should return true for VNode', () => {
                    const vnode = createElement('div', {}, 'test');
                    expect(isVNode(vnode)).toBe(true);
                });

                test('should return false for non-VNode', () => {
                    expect(isVNode('string')).toBe(false);
                    expect(isVNode(123)).toBe(false);
                    expect(isVNode(null)).toBe(false);
                    expect(isVNode({ type: 'div' })).toBe(false);
                });
            });

            describe('isPrimitive', () => {
                test('should return true for strings', () => {
                    expect(isPrimitive('hello')).toBe(true);
                });

                test('should return true for numbers', () => {
                    expect(isPrimitive(123)).toBe(true);
                });

                test('should return false for other types', () => {
                    expect(isPrimitive({})).toBe(false);
                    expect(isPrimitive([])).toBe(false);
                    expect(isPrimitive(null)).toBe(false);
                });
            });

            describe('isFunction', () => {
                test('should return true for functions', () => {
                    expect(isFunction(() => {})).toBe(true);
                    expect(isFunction(function() {})).toBe(true);
                });

                test('should return false for non-functions', () => {
                    expect(isFunction('string')).toBe(false);
                    expect(isFunction(123)).toBe(false);
                    expect(isFunction({})).toBe(false);
                });
            });
        });

        describe('Array & Children Functions', () => {
            describe('flattenChildren', () => {
                test('should flatten nested arrays', () => {
                    const result = flattenChildren([
                        'a',
                        ['b', 'c'],
                        ['d', 'e'],
                    ]);
                    expect(result).toEqual(['a', 'b', 'c', 'd', 'e']);
                });

                test('should filter out null and boolean', () => {
                    const result = flattenChildren([
                        'a',
                        null,
                        true,
                        false,
                        'b',
                        undefined,
                    ]);
                    expect(result).toEqual(['a', 'b']);
                });
            });
        });

        describe('String Manipulation', () => {
            describe('sanitizeHTML', () => {
                test('should remove script tags', () => {
                    const result = sanitizeHTML('<div><script>alert("xss")</script>Safe</div>');
                    expect(result).not.toContain('script');
                    expect(result).toContain('Safe');
                });

                test('should remove javascript: protocol', () => {
                    const result = sanitizeHTML('<a href="javascript:alert()">Link</a>');
                    expect(result).not.toContain('javascript:');
                });

                test('should remove inline event handlers', () => {
                    const result = sanitizeHTML('<div onerror="alert()" onclick="alert()">Text</div>');
                    expect(result).not.toContain('onerror=');
                    expect(result).not.toContain('onclick=');
                });

                test('should remove iframe tags', () => {
                    const result = sanitizeHTML('<div><iframe src="evil.com"></iframe>Safe</div>');
                    expect(result).not.toContain('iframe');
                });

                test('should remove object tags', () => {
                    const result = sanitizeHTML('<object data="evil.swf"></object>');
                    expect(result).not.toContain('object');
                });

                test('should remove embed tags', () => {
                    const result = sanitizeHTML('<embed src="evil.swf">');
                    expect(result).not.toContain('embed');
                });
            });

            describe('camelToKebab', () => {
                test('should convert camelCase to kebab-case', () => {
                    expect(camelToKebab('backgroundColor')).toBe('background-color');
                    expect(camelToKebab('fontSize')).toBe('font-size');
                    expect(camelToKebab('marginTop')).toBe('margin-top');
                });

                test('should handle single words', () => {
                    expect(camelToKebab('color')).toBe('color');
                });

                test('should handle numbers', () => {
                    expect(camelToKebab('grid2d')).toBe('grid2d');
                });
            });
        });

        describe('Object Comparison', () => {
            describe('shallowEqual', () => {
                test('should return true for same reference', () => {
                    const obj = { a: 1 };
                    expect(shallowEqual(obj, obj)).toBe(true);
                });

                test('should return true for equal objects', () => {
                    expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
                });

                test('should return false for different values', () => {
                    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
                });

                test('should return false for different keys', () => {
                    expect(shallowEqual({ a: 1 }, { b: 1 })).toBe(false);
                });

                test('should return false for different lengths', () => {
                    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
                });

                test('should handle primitives', () => {
                    expect(shallowEqual(1, 1)).toBe(true);
                    expect(shallowEqual('a', 'a')).toBe(true);
                    expect(shallowEqual(1, 2)).toBe(false);
                });

                test('should return false for null vs object', () => {
                    expect(shallowEqual(null, {})).toBe(false);
                });
            });

            describe('deepClone', () => {
                test('should clone objects', () => {
                    const obj = { a: 1, b: { c: 2 } };
                    const cloned = deepClone(obj);

                    expect(cloned).toEqual(obj);
                    expect(cloned).not.toBe(obj);
                    expect(cloned.b).not.toBe(obj.b);
                });

                test('should clone arrays', () => {
                    const arr = [1, 2, [3, 4]];
                    const cloned = deepClone(arr);

                    expect(cloned).toEqual(arr);
                    expect(cloned).not.toBe(arr);
                    expect(cloned[2]).not.toBe(arr[2]);
                });

                test('should handle primitives', () => {
                    expect(deepClone(123)).toBe(123);
                    expect(deepClone('hello')).toBe('hello');
                    expect(deepClone(null)).toBe(null);
                });

                test('should handle nested structures', () => {
                    const complex = {
                        a: [1, 2, { b: 3 }],
                        c: { d: [4, 5] }
                    };
                    const cloned = deepClone(complex);

                    expect(cloned).toEqual(complex);
                    expect(cloned.a[2]).not.toBe(complex.a[2]);
                });

                test('should handle objects with hasOwnProperty', () => {
                    const obj = { a: 1, b: 2 };
                    const cloned = deepClone(obj);

                    expect(Object.prototype.hasOwnProperty.call(cloned, 'a')).toBe(true);
                    expect(Object.prototype.hasOwnProperty.call(cloned, 'b')).toBe(true);
                });

                test('should handle empty objects and arrays', () => {
                    expect(deepClone({})).toEqual({});
                    expect(deepClone([])).toEqual([]);
                });
            });
        });

        describe('Utility Functions', () => {
            describe('generateId', () => {
                test('should generate unique IDs', () => {
                    const id1 = generateId();
                    const id2 = generateId();
                    expect(id1).not.toBe(id2);
                });

                test('should use custom prefix', () => {
                    const id = generateId('custom');
                    expect(id).toContain('custom-');
                });

                test('should use default prefix', () => {
                    const id = generateId();
                    expect(id).toContain('vdom-');
                });
            });

            describe('isBrowser', () => {
                test('should return true in test environment', () => {
                    expect(isBrowser()).toBe(true);
                });
            });
        });

        describe('Event Handler Functions', () => {
            describe('isEventProp', () => {
                test('should return true for event props', () => {
                    expect(isEventProp('onclick')).toBe(true);
                    expect(isEventProp('onmouseenter')).toBe(true);
                    expect(isEventProp('onkeydown')).toBe(true);
                });

                test('should return false for non-event props', () => {
                    expect(isEventProp('className')).toBe(false);
                    expect(isEventProp('id')).toBe(false);
                    expect(isEventProp('on')).toBe(false);
                });
            });

            describe('getEventName', () => {
                test('should extract event name', () => {
                    expect(getEventName('onclick')).toBe('click');
                    expect(getEventName('onmouseenter')).toBe('mouseenter');
                    expect(getEventName('onKeyDown')).toBe('keydown');
                });
            });
        });
    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝