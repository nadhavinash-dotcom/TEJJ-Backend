"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logEvent = logEvent;
const PlatformEvent_1 = require("../models/PlatformEvent");
async function logEvent(userId, eventType, metadata) {
    try {
        await PlatformEvent_1.PlatformEvent.create({ user_id: userId, event_type: eventType, metadata: metadata ?? {} });
    }
    catch {
        // Non-fatal — don't throw
    }
}
//# sourceMappingURL=platformEventService.js.map