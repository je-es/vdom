// src/types/props.d.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    import type { EventHandler } from './core';

    /**
     * Common HTML attributes
     */
    export interface HTMLAttributes {
        id?: string;
        title?: string;
        tabIndex?: number;
        role?: string;
        lang?: string;
        dir?: 'ltr' | 'rtl' | 'auto';
    }

    /**
     * Boolean attributes
     */
    export interface BooleanAttributes {
        checked?: boolean;
        disabled?: boolean;
        selected?: boolean;
        readOnly?: boolean;
        required?: boolean;
        autoFocus?: boolean;
        multiple?: boolean;
        hidden?: boolean;
    }

    /**
     * Form attributes
     */
    export interface FormAttributes {
        value?: string | number;
        placeholder?: string;
        name?: string;
        type?: string;
        accept?: string;
        autocomplete?: string;
        min?: string | number;
        max?: string | number;
        step?: string | number;
        pattern?: string;
        maxLength?: number;
        minLength?: number;
    }

    /**
     * ARIA attributes
     */
    export interface ARIAAttributes {
        'aria-label'?: string;
        'aria-labelledby'?: string;
        'aria-describedby'?: string;
        'aria-hidden'?: boolean;
        'aria-disabled'?: boolean;
        'aria-expanded'?: boolean;
        'aria-selected'?: boolean;
        'aria-checked'?: boolean | 'mixed';
        'aria-pressed'?: boolean | 'mixed';
        'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
        'aria-live'?: 'off' | 'polite' | 'assertive';
        'aria-atomic'?: boolean;
        'aria-busy'?: boolean;
        'aria-controls'?: string;
        'aria-owns'?: string;
    }

    /**
     * Mouse event handlers
     */
    export interface MouseEventHandlers {
        onclick?: EventHandler<MouseEvent>;
        ondblclick?: EventHandler<MouseEvent>;
        onmousedown?: EventHandler<MouseEvent>;
        onmouseup?: EventHandler<MouseEvent>;
        onmousemove?: EventHandler<MouseEvent>;
        onmouseover?: EventHandler<MouseEvent>;
        onmouseout?: EventHandler<MouseEvent>;
        onmouseenter?: EventHandler<MouseEvent>;
        onmouseleave?: EventHandler<MouseEvent>;
        oncontextmenu?: EventHandler<MouseEvent>;
    }

    /**
     * Keyboard event handlers
     */
    export interface KeyboardEventHandlers {
        onkeydown?: EventHandler<KeyboardEvent>;
        onkeyup?: EventHandler<KeyboardEvent>;
        onkeypress?: EventHandler<KeyboardEvent>;
    }

    /**
     * Form event handlers
     */
    export interface FormEventHandlers {
        onchange?: EventHandler<Event>;
        oninput?: EventHandler<InputEvent>;
        onfocus?: EventHandler<FocusEvent>;
        onblur?: EventHandler<FocusEvent>;
        onsubmit?: EventHandler<SubmitEvent>;
        onreset?: EventHandler<Event>;
        oninvalid?: EventHandler<Event>;
    }

    /**
     * Touch event handlers
     */
    export interface TouchEventHandlers {
        ontouchstart?: EventHandler<TouchEvent>;
        ontouchmove?: EventHandler<TouchEvent>;
        ontouchend?: EventHandler<TouchEvent>;
        ontouchcancel?: EventHandler<TouchEvent>;
    }

    /**
     * Drag event handlers
     */
    export interface DragEventHandlers {
        ondragstart?: EventHandler<DragEvent>;
        ondrag?: EventHandler<DragEvent>;
        ondragend?: EventHandler<DragEvent>;
        ondragenter?: EventHandler<DragEvent>;
        ondragleave?: EventHandler<DragEvent>;
        ondragover?: EventHandler<DragEvent>;
        ondrop?: EventHandler<DragEvent>;
    }

    /**
     * Other event handlers
     */
    export interface OtherEventHandlers {
        onscroll?: EventHandler<Event>;
        onwheel?: EventHandler<WheelEvent>;
        oncopy?: EventHandler<ClipboardEvent>;
        oncut?: EventHandler<ClipboardEvent>;
        onpaste?: EventHandler<ClipboardEvent>;
        onload?: EventHandler<Event>;
        onerror?: EventHandler<Event>;
    }

    /**
     * All event handlers combined
     */
    export interface EventHandlers extends
        MouseEventHandlers,
        KeyboardEventHandlers,
        FormEventHandlers,
        TouchEventHandlers,
        DragEventHandlers,
        OtherEventHandlers {}

// ╚══════════════════════════════════════════════════════════════════════════════════════╝