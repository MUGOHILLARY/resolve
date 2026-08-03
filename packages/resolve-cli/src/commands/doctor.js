"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctor = doctor;
var fs = require("fs-extra");
var path = require("node:path");
function findWorkspaceRoot(startDir) {
    return __awaiter(this, void 0, void 0, function () {
        var current, workspaceFile, parent_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    current = startDir;
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    workspaceFile = path.join(current, "pnpm-workspace.yaml");
                    return [4 /*yield*/, fs.pathExists(workspaceFile)];
                case 2:
                    if (_a.sent()) {
                        return [2 /*return*/, current];
                    }
                    parent_1 = path.dirname(current);
                    if (parent_1 === current) {
                        throw new Error("Could not locate the Resolve workspace.");
                    }
                    current = parent_1;
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function report(ok, label) {
    console.log("".concat(ok ? "✅" : "❌", " ").concat(label));
}
function doctor() {
    return __awaiter(this, void 0, void 0, function () {
        var root, _a, _b, _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: return [4 /*yield*/, findWorkspaceRoot(process.cwd())];
                case 1:
                    root = _j.sent();
                    console.log("\n🩺 Resolve Doctor\n");
                    _a = report;
                    return [4 /*yield*/, fs.pathExists(path.join(root, "pnpm-workspace.yaml"))];
                case 2:
                    _a.apply(void 0, [_j.sent(), "Workspace"]);
                    _b = report;
                    return [4 /*yield*/, fs.pathExists(path.join(root, "apps", "api"))];
                case 3:
                    _b.apply(void 0, [_j.sent(), "API"]);
                    _c = report;
                    return [4 /*yield*/, fs.pathExists(path.join(root, "apps", "web"))];
                case 4:
                    _c.apply(void 0, [_j.sent(), "Web App"]);
                    _d = report;
                    return [4 /*yield*/, fs.pathExists(path.join(root, "apps", "extension"))];
                case 5:
                    _d.apply(void 0, [_j.sent(), "Chrome Extension"]);
                    _e = report;
                    return [4 /*yield*/, fs.pathExists(path.join(root, "packages", "blocker-engine"))];
                case 6:
                    _e.apply(void 0, [_j.sent(), "Blocker Engine"]);
                    _f = report;
                    return [4 /*yield*/, fs.pathExists(path.join(root, "packages", "blocklist-manager"))];
                case 7:
                    _f.apply(void 0, [_j.sent(), "Blocklist Manager"]);
                    _g = report;
                    return [4 /*yield*/, fs.pathExists(path.join(root, "packages", "resolve-cli"))];
                case 8:
                    _g.apply(void 0, [_j.sent(), "Resolve CLI"]);
                    _h = report;
                    return [4 /*yield*/, fs.pathExists(path.join(root, "packages", "blocker-engine", "repository", "manifest.json"))];
                case 9:
                    _h.apply(void 0, [_j.sent(), "Blocklist Manifest"]);
                    console.log("\n✅ Doctor finished.\n");
                    return [2 /*return*/];
            }
        });
    });
}
