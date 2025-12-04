// src/core/patch.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import type { VNode, VNodeChild } from '../types';
    import { isPrimitive, getChildAt } from '../utils/helpers';
    import { handleError } from '../utils/errors';
    import { createDOMElement } from './render';
    import { updateProps } from './props';
    import { patchChildrenWithKeys, patchChildrenByIndex } from './patch';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    /**
     * Patch/diff algorithm - updates DOM based on VNode changes
     *
     * @param parent - Parent HTML element
     * @param oldVNode - Old virtual node
     * @param newVNode - New virtual node
     * @param index - Child index in parent
     */
    export function patch(
        parent: HTMLElement,
        oldVNode: VNode | string | number | null,
        newVNode: VNode | string | number | null,
        index: number = 0
    ): void {
        try {
            const oldChild = getChildAt(parent, index);

            // Case 1: Add new node
            if (!oldVNode && newVNode) {
                addNode(parent, newVNode);
                return;
            }

            // Case 2: Remove old node
            if (oldVNode && !newVNode) {
                removeNode(parent, oldChild);
                return;
            }

            // Case 3: Both exist - update or replace
            if (oldVNode && newVNode) {
                updateNode(parent, oldVNode, newVNode, index, oldChild);
            }

        } catch (error) {
            handleError(
                error as Error,
                typeof newVNode === 'object' && newVNode !== null ? newVNode : undefined,
                'patch'
            );
        }
    }

    /**
     * Add a new node to parent
     */
    function addNode(parent: HTMLElement, vnode: VNode | string | number): void {
        const element = createDOMElement(vnode);
        parent.appendChild(element);
    }

    /**
     * Remove a node from parent
     */
    function removeNode(parent: HTMLElement, node: Node | undefined): void {
        if (node && node.parentNode === parent) {
            parent.removeChild(node);
        }
    }

    /**
     * Update existing node or replace if needed
     */
    function updateNode(
        parent: HTMLElement,
        oldVNode: VNode | string | number,
        newVNode: VNode | string | number,
        index: number,
        oldChild: Node | undefined
    ): void {
        // Both are primitives (text nodes)
        if (isPrimitive(oldVNode) && isPrimitive(newVNode)) {
            updateTextNode(parent, oldVNode, newVNode, index, oldChild);
            return;
        }

        // Type changed or one is primitive - replace completely
        if (
            (isPrimitive(oldVNode) && !isPrimitive(newVNode)) ||
            (!isPrimitive(oldVNode) && isPrimitive(newVNode)) ||
            hasVNodeChanged(oldVNode as VNode, newVNode as VNode)
        ) {
            replaceNode(parent, newVNode, oldChild);
            return;
        }

        // Both are VNodes of same type - update in place
        if (!isPrimitive(oldVNode) && !isPrimitive(newVNode)) {
            updateElement(parent, oldVNode as VNode, newVNode as VNode, index, oldChild);
        }
    }

    /**
     * Update text node
     */
    function updateTextNode(
        parent: HTMLElement,
        oldText: string | number,
        newText: string | number,
        index: number,
        oldChild: Node | undefined
    ): void {
        const oldStr = String(oldText);
        const newStr = String(newText);

        if (oldStr === newStr) return;

        if (oldChild?.nodeType === Node.TEXT_NODE) {
            oldChild.textContent = newStr;
        } else {
            const textNode = document.createTextNode(newStr);
            if (oldChild) {
                parent.replaceChild(textNode, oldChild);
            } else {
                parent.appendChild(textNode);
            }
        }
    }

    /**
     * Replace node completely
     */
    function replaceNode(
        parent: HTMLElement,
        newVNode: VNode | string | number,
        oldChild: Node | undefined
    ): void {
        const newElement = createDOMElement(newVNode);

        if (oldChild) {
            parent.replaceChild(newElement, oldChild);
        } else {
            parent.appendChild(newElement);
        }
    }

    /**
     * Update element in place
     * FIXED: When patching at index 0, we're updating the element itself, not its parent
     */
    function updateElement(
        parent: HTMLElement,
        oldVNode: VNode,
        newVNode: VNode,
        index: number,
        oldChild: Node | undefined
    ): void {
        let elementToUpdate: HTMLElement;

        if (index === 0 && !oldChild && parent.tagName.toLowerCase() === oldVNode.type) {
            // We're updating the parent element itself
            elementToUpdate = parent;
        } else if (oldChild instanceof HTMLElement) {
            // We're updating a child element
            elementToUpdate = oldChild;
        } else {
            // Fallback: replace the node
            replaceNode(parent, newVNode, oldChild);
            return;
        }

        // Update props
        updateProps(elementToUpdate, oldVNode.props, newVNode.props);

        // Update children
        const oldChildren = oldVNode.children || [];
        const newChildren = newVNode.children || [];

        patchChildren(elementToUpdate, oldChildren, newChildren);
    }

    /**
     * Check if VNode has changed (needs replacement)
     */
    function hasVNodeChanged(oldVNode: VNode, newVNode: VNode): boolean {
        return (
            oldVNode.type !== newVNode.type ||
            oldVNode.props.key !== newVNode.props.key
        );
    }

    /**
     * Patch children - decides between keyed and simple patching
     */
    function patchChildren(
        parent: HTMLElement,
        oldChildren: VNodeChild[],
        newChildren: VNodeChild[]
    ): void {
        // Check if we should use keyed diffing
        const hasKeys = newChildren.some(child =>
            child && typeof child === 'object' && 'props' in child && child.props.key != null
        );

        if (hasKeys) {
            patchChildrenWithKeys(parent, oldChildren, newChildren);
        } else {
            patchChildrenByIndex(parent, oldChildren, newChildren);
        }
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝