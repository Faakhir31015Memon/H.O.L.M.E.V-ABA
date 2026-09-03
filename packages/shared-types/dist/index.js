"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionLevel = void 0;
// ==========================================
// 3. TOOL SYSTEM & PERMISSION LEVELS
// ==========================================
var PermissionLevel;
(function (PermissionLevel) {
    PermissionLevel[PermissionLevel["LEVEL_0_READONLY"] = 0] = "LEVEL_0_READONLY";
    PermissionLevel[PermissionLevel["LEVEL_1_LOW_RISK"] = 1] = "LEVEL_1_LOW_RISK";
    PermissionLevel[PermissionLevel["LEVEL_2_DEVICE_EXT"] = 2] = "LEVEL_2_DEVICE_EXT";
    PermissionLevel[PermissionLevel["LEVEL_3_DESTRUCTIVE"] = 3] = "LEVEL_3_DESTRUCTIVE";
    PermissionLevel[PermissionLevel["LEVEL_4_SENSITIVE"] = 4] = "LEVEL_4_SENSITIVE";
})(PermissionLevel || (exports.PermissionLevel = PermissionLevel = {}));
