"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROXY_ERROR = exports.EXECUTION_EFFECT_ERROR = void 0;
exports.EXECUTION_EFFECT_ERROR = 'Хорошей практикой будет инициировать эффекты в одном месте и независимо друг от друга, чтобы не создавать цепочку эффектов. А ещё похоже на GOTO-программирование, но вообще можно запилить очередь, которую исполнить перед зануллением currentEffectIndex.';
exports.PROXY_ERROR = 'Нельзя трогать свойства отличные от "value".';
//# sourceMappingURL=constants.js.map