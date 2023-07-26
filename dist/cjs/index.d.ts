type Effect = () => void;
type Signal<T> = {
    value: T;
};
export declare const createSignal: <T>(initialValue: T) => Signal<T>;
export declare const computed: (batchChanges: Effect) => void;
export declare const createEffect: (callback: Effect) => void;
export {};
