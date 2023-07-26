# reactive-signals
My implementation of signals. Something like Vue and Solid.

## Functional:
    type Effect = () => void;
    type Signal<T> = {
        value: T;
    };

    const createSignal: <T>(initialValue: T) => Signal<T>;

    const computed: (batchChanges: Effect) => void;

    const createEffect: (callback: Effect) => void;
