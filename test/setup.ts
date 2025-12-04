/* eslint-disable @typescript-eslint/no-explicit-any */
// test/setup.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { Window } from 'happy-dom';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ INIT ════════════════════════════════════════╗

    // Create virtual browser environment
    const window = new Window();
    const document = window.document;

    // Make DOM globals available
    (global as any).window = window;
    (global as any).document = document;
    (global as any).HTMLElement = window.HTMLElement;
    (global as any).Element = window.Element;
    (global as any).Node = window.Node;
    (global as any).Text = window.Text;
    (global as any).DocumentFragment = window.DocumentFragment;
    (global as any).Event = window.Event;

    // Mock AbortController
    (global as any).AbortController = class AbortController {
        signal = { aborted: false } as AbortSignal;
        abort() {
            (this.signal as any).aborted = true;
        }
    };

    // Mock navigator
    (global as any).navigator = {
        userAgent: 'Bun Test Runner',
        language: 'en-US',
        languages: ['en-US', 'en'],
        onLine: true,
        cookieEnabled: true,
        platform: 'Test'
    };

    export { window, document };

// ╚══════════════════════════════════════════════════════════════════════════════════════╝