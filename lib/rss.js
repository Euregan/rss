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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.addFeed = exports.refresh = void 0;
var rss_parser_1 = __importDefault(require("rss-parser"));
var database_1 = __importDefault(require("./database"));
var rss = new rss_parser_1["default"]();
exports["default"] = rss;
var refresh = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var rawFeed, updateDate, feed, existingItems, itemsToCreate, users, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, rss.parseURL(url)];
            case 1:
                rawFeed = _a.sent();
                updateDate = new Date();
                return [4 /*yield*/, database_1["default"].feed.findUniqueOrThrow({
                        where: {
                            url: url
                        }
                    })];
            case 2:
                feed = _a.sent();
                return [4 /*yield*/, database_1["default"].item.findMany({
                        where: {
                            feedId: feed.id,
                            itemId: {
                                "in": rawFeed.items.map(function (_a) {
                                    var guid = _a.guid;
                                    return guid;
                                }).filter(function (x) { return x; })
                            }
                        }
                    })];
            case 3:
                existingItems = _a.sent();
                itemsToCreate = rawFeed.items.filter(function (item) { return !existingItems.some(function (existing) { return existing.itemId !== item.guid; }); });
                return [4 /*yield*/, database_1["default"].item.createMany({
                        data: itemsToCreate.map(function (item) { return ({
                            itemId: item.guid,
                            label: item.title || "",
                            link: item.link,
                            description: item.content || item.summary,
                            picture: null,
                            publishedAt: new Date(item.isoDate),
                            feedId: feed.id
                        }); }),
                        skipDuplicates: true
                    })];
            case 4:
                _a.sent();
                return [4 /*yield*/, database_1["default"].user.findMany({
                        where: {
                            subscriptions: {
                                some: { feedId: feed.id }
                            }
                        }
                    })];
            case 5:
                users = _a.sent();
                return [4 /*yield*/, database_1["default"].item.findMany({
                        where: {
                            createdAt: {
                                gte: updateDate
                            },
                            feedId: feed.id
                        }
                    })];
            case 6:
                items = _a.sent();
                return [4 /*yield*/, database_1["default"].usersItems.createMany({
                        data: users.flatMap(function (user) {
                            return items.map(function (item) { return ({
                                itemId: item.id,
                                userId: user.id
                            }); });
                        }),
                        skipDuplicates: true
                    })];
            case 7:
                _a.sent();
                return [4 /*yield*/, database_1["default"].feed.update({
                        where: {
                            id: feed.id
                        },
                        data: {
                            updatedAt: updateDate
                        }
                    })];
            case 8:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.refresh = refresh;
var addFeed = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var rawFeed, feed, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, rss.parseURL(url)];
            case 1:
                rawFeed = _c.sent();
                return [4 /*yield*/, database_1["default"].feed.create({
                        data: {
                            url: url,
                            label: rawFeed.title || "",
                            link: rawFeed.link,
                            picture: null,
                            lastUpdated: new Date()
                        }
                    })];
            case 2:
                feed = _c.sent();
                return [4 /*yield*/, database_1["default"].item.createMany({
                        data: rawFeed.items.map(function (item) { return ({
                            itemId: item.guid,
                            label: item.title || "",
                            link: item.link,
                            description: item.content || item.summary,
                            picture: null,
                            publishedAt: new Date(item.isoDate),
                            feedId: feed.id
                        }); }),
                        skipDuplicates: true
                    })];
            case 3:
                _c.sent();
                if (!(process.env.CRON_SAAS_URL && process.env.CRON_SAAS_API_KEY)) return [3 /*break*/, 5];
                _b = (_a = console).log;
                return [4 /*yield*/, fetch(process.env.CRON_SAAS_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer ".concat(process.env.CRON_SAAS_API_KEY)
                        },
                        body: JSON.stringify({
                            url: "".concat(process.env.URL, "/api/refresh/").concat(encodeURIComponent(url)),
                            cron: "".concat(Math.round(Math.random() * 59), " * * * *")
                        })
                    }).then(function (response) { return response.json(); })];
            case 4:
                _b.apply(_a, [_c.sent()]);
                _c.label = 5;
            case 5: return [4 /*yield*/, database_1["default"].feed.findUnique({
                    where: {
                        id: feed.id
                    },
                    include: { items: true }
                })];
            case 6: return [2 /*return*/, _c.sent()];
        }
    });
}); };
exports.addFeed = addFeed;
