"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEffect = exports.computed = exports.createSignal = void 0;
const constants_1 = require("./constants");
// Все зарегистрированные эффект-колбеки.
const allEffects = [];
// Словарь вида: [effect_index] -> Signal[].
const effectIndexSignals = new Map();
// Отложенные индексы эффектов для батчинга в "compute" функции.
const deferredEffectIndexes = new Set();
let currentEffectIndex = null;
let isBatchingEnabled = false;
const executeEffectByIndex = (index) => {
    if (typeof currentEffectIndex === 'number') {
        throw new Error(constants_1.EXECUTION_EFFECT_ERROR);
    }
    currentEffectIndex = index;
    allEffects[index]();
    currentEffectIndex = null;
};
const createSignal = (initialValue) => {
    const data = {
        value: initialValue,
    };
    return new Proxy(data, {
        get(target, property) {
            if (property !== 'value')
                throw new Error(constants_1.PROXY_ERROR);
            if (typeof currentEffectIndex === 'number') {
                if (!effectIndexSignals.get(currentEffectIndex)) {
                    effectIndexSignals.set(currentEffectIndex, []);
                }
                const currentEffectIndexSignals = effectIndexSignals.get(currentEffectIndex);
                if (!currentEffectIndexSignals.includes(data)) {
                    effectIndexSignals.set(currentEffectIndex, [
                        ...currentEffectIndexSignals,
                        data,
                    ]);
                }
            }
            return target[property];
        },
        set(target, property, newValue) {
            if (property !== 'value')
                throw new Error(constants_1.PROXY_ERROR);
            target[property] = newValue;
            effectIndexSignals.forEach((signals, effectIndex) => {
                if (signals.includes(data)) {
                    if (isBatchingEnabled) {
                        deferredEffectIndexes.add(effectIndex);
                        return;
                    }
                    executeEffectByIndex(effectIndex);
                }
            });
            return true;
        },
    });
};
exports.createSignal = createSignal;
const computed = (batchChanges) => {
    isBatchingEnabled = true;
    batchChanges();
    const sortedDeferredEffectIndexes = Array.from(deferredEffectIndexes.values()).sort((a, b) => a - b);
    sortedDeferredEffectIndexes.forEach((effectIndex) => {
        executeEffectByIndex(effectIndex);
    });
    deferredEffectIndexes.clear();
    isBatchingEnabled = false;
};
exports.computed = computed;
const createEffect = (callback) => {
    const newLength = allEffects.push(callback);
    executeEffectByIndex(newLength - 1);
};
exports.createEffect = createEffect;
//# sourceMappingURL=index.js.map