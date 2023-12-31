import { EXECUTION_EFFECT_ERROR, PROXY_ERROR } from './constants';

type Effect = () => void;
type Signal<T> = {
  value: T;
};

// Все зарегистрированные эффект-колбеки.
const allEffects: Effect[] = [];

// Словарь вида: [effect_index] -> Signal[].
const effectIndexSignals = new Map<number, Signal<any>[]>();

// Отложенные индексы эффектов для батчинга в "batch" функции.
const deferredEffectIndexes = new Set<number>();

let currentEffectIndex: null | number = null;
let isBatchingEnabled: boolean = false;

const executeEffectByIndex = (index: number) => {
  if (typeof currentEffectIndex === 'number') {
    throw new Error(EXECUTION_EFFECT_ERROR);
  }

  currentEffectIndex = index;
  allEffects[index]();

  currentEffectIndex = null;
};

export const createSignal = <T>(initialValue: T): Signal<T> => {
  const data = {
    value: initialValue,
  };

  return new Proxy(data, {
    get(target, property) {
      if (property !== 'value') throw new Error(PROXY_ERROR);

      if (typeof currentEffectIndex === 'number') {
        if (!effectIndexSignals.get(currentEffectIndex)) {
          effectIndexSignals.set(currentEffectIndex, []);
        }

        const currentEffectIndexSignals =
          effectIndexSignals.get(currentEffectIndex)!;

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
      if (property !== 'value') throw new Error(PROXY_ERROR);

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

export const batch = (changes: Effect) => {
  isBatchingEnabled = true;

  changes();

  const sortedDeferredEffectIndexes = Array.from(
    deferredEffectIndexes.values(),
  ).sort((a, b) => a - b);

  sortedDeferredEffectIndexes.forEach((effectIndex) => {
    executeEffectByIndex(effectIndex);
  });

  deferredEffectIndexes.clear();

  isBatchingEnabled = false;
};

export const createEffect = (callback: Effect) => {
  const newLength = allEffects.push(callback);

  executeEffectByIndex(newLength - 1);
};
