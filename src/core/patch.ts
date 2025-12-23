// src/core/patch.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import type { VNode, VNodeChild } from '../types';
    import { isNullOrBoolean, isPrimitive, getChildAt } from '../utils/helpers';
    import { handleError } from '../utils/errors';
    import { createDOMElement } from './render';
    import { updateProps } from './props';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ HELP ════════════════════════════════════════╗

    /**
     * Patch a single child
     */
    function patchChild(
        parent: HTMLElement,
        oldChild: VNodeChild,
        newChild: VNodeChild,
        index: number
    ): void {
        // Skip null/boolean children
        if (isNullOrBoolean(newChild)) {
            if (!isNullOrBoolean(oldChild)) {
                const node = parent.childNodes[index];
                if (node) parent.removeChild(node);
            }
            return;
        }

        // Convert to proper types for patch function
        const oldVNode = isNullOrBoolean(oldChild) ? null : oldChild;
        patch(parent, oldVNode, newChild, index);
    }

    /**
     * Patch children by index (simple diffing without keys)
     */
    export function patchChildrenByIndex(
        parent: HTMLElement,
        oldChildren: VNodeChild[],
        newChildren: VNodeChild[]
    ): void {
        const maxLength = Math.max(oldChildren.length, newChildren.length);

        // Patch each child
        for (const i of Array.from({ length: maxLength }, (_, idx) => idx)) {
            patchChild(parent, oldChildren[i], newChildren[i], i);
        }

        // Remove excess children
        while (parent.childNodes.length > newChildren.filter(c => !isNullOrBoolean(c)).length) {
            const lastChild = parent.lastChild;
            if (lastChild) parent.removeChild(lastChild);
        }
    }

    /**
     * Patch children with keys (optimized diffing)
     * Properly map VNode children to DOM elements
     */
    export function patchChildrenWithKeys(
        parent: HTMLElement,
        oldChildren: VNodeChild[],
        newChildren: VNodeChild[]
    ): void {
        // Step 1: Build map of old keyed elements
        // CRITICAL FIX: Only use ELEMENT nodes, not all childNodes
        const oldKeyMap = new Map<unknown, { vnode: VNode; element: HTMLElement }>();

        // Get only element children (skip text nodes)
        const domElements: HTMLElement[] = [];
        for (const child of Array.from(parent.children)) {
            domElements.push(child as HTMLElement);
        }

        // Match VNode children with DOM elements
        let elementIndex = 0;
        for (const child of oldChildren) {
            if (isNullOrBoolean(child)) continue;
            if (isPrimitive(child)) continue; // Skip text nodes in VNode children

            const vnode = child as VNode;
            const element = domElements[elementIndex];

            if (!element) break;

            if (vnode.props.key != null) {
                const key = vnode.props.key;
                oldKeyMap.set(key, { vnode, element });
            }
            elementIndex++;
        }

        // Step 2: Build the new DOM structure
        const newElements: Node[] = [];

        for (const newChild of newChildren) {
            if (isNullOrBoolean(newChild)) continue;

            // Handle text nodes
            if (isPrimitive(newChild)) {
                const textNode = document.createTextNode(String(newChild));
                newElements.push(textNode);
                continue;
            }

            const newVNode = newChild as VNode;
            const key = newVNode.props.key;

            // Try to reuse existing keyed element
            if (key != null && oldKeyMap.has(key)) {
                const { vnode: oldVNode, element } = oldKeyMap.get(key)!;

                // Update the existing element
                updateProps(element, oldVNode.props, newVNode.props);

                // Recursively patch children
                const oldChildrenArray = oldVNode.children || [];
                const newChildrenArray = newVNode.children || [];

                const childrenHaveKeys = newChildrenArray.some(
                    c => c && typeof c === 'object' && 'props' in c && c.props.key != null
                );

                if (childrenHaveKeys) {
                    patchChildrenWithKeys(element, oldChildrenArray, newChildrenArray);
                } else {
                    patchChildrenByIndex(element, oldChildrenArray, newChildrenArray);
                }

                newElements.push(element);
                // Mark as used by deleting from map
                oldKeyMap.delete(key);
            } else {
                // Create new element
                const newElement = createDOMElement(newVNode);
                newElements.push(newElement);
            }
        }

        // Step 3: Update the DOM to match the new order
        // Remove all children first
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }

        // Append in the correct order
        for (const element of newElements) {
            parent.appendChild(element);
        }
    }

    /**
     * Patch children - decides between keyed and simple patching
     */
    export function patchChildren(
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



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

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
     * Check if VNode has changed (needs replacement)
     */
    function hasVNodeChanged(oldVNode: VNode, newVNode: VNode): boolean {
        return (
            oldVNode.type !== newVNode.type ||
            oldVNode.props.key !== newVNode.props.key
        );
    }

    /**
     * Update element in place
     * Detect if we're patching the parent element itself vs its children
     */
    function updateElement(
        parent: HTMLElement,
        oldVNode: VNode,
        newVNode: VNode,
        index: number,
        oldChild: Node | undefined
    ): void {
        let elementToUpdate: HTMLElement;

        // CRITICAL: Check if we're patching the parent element itself
        // This happens when parent's tag matches BOTH VNode types
        // AND the oldChild either doesn't exist OR has a different tag than the VNode
        // This pattern: patch(ul, ulVNode, ulVNode, 0) where we want to update ul's children
        const parentMatchesVNode = parent.tagName.toLowerCase() === oldVNode.type &&
                                   parent.tagName.toLowerCase() === newVNode.type;
        const childIsDifferentType = oldChild instanceof HTMLElement &&
                                    oldChild.tagName.toLowerCase() !== oldVNode.type;

        if (parentMatchesVNode && (!oldChild || childIsDifferentType)) {
            // We're updating the parent element itself, not a child
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

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
