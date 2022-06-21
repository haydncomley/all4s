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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL4S = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class ALL4S {
    constructor(options) {
        this.options = options;
    }
    doStart() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser)
                return;
            this.log('Starting.');
            this.browser = yield puppeteer_1.default.launch({
                headless: this.options.headless, defaultViewport: null,
                args: ['--start-maximized'],
            });
            this.page = yield this.browser.newPage();
            this.watchCurrentPage();
            yield this.page.goto(this.options.startPage);
        });
    }
    doNavigation(url) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.goto(url);
        });
    }
    log(message, ...args) {
        if (!this.options.debug || this.options.debugHideConsole)
            return;
        console.log(`[AllFours] ${message}`, ...args);
    }
    watchCurrentPage() {
        this.page.on('load', () => __awaiter(this, void 0, void 0, function* () {
            yield this.checkEventLogExists();
            const { done } = yield this.logAction('Page Load', this.page.url());
            done();
        }));
    }
    checkEventLogExists() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.options.debug || this.options.headless)
                return;
            yield this.page.evaluate(() => {
                if (document && document.querySelector('#ALLFOUR_EVENT_PARENT'))
                    return;
                const events = document.createElement('div');
                events.style.zIndex = '999999999999';
                events.id = 'ALLFOUR_EVENT_PARENT';
                events.style.position = 'fixed';
                events.style.left = '0rem';
                events.style.bottom = '0rem';
                // events.style.gap = '.5rem';
                events.style.width = '15rem';
                events.style.maxWidth = 'calc(100vw - 2rem)';
                events.style.display = 'flex';
                events.style.flexDirection = 'column';
                events.style.pointerEvents = 'none';
                events.style.filter = 'drop-shadow(0px .1rem .2rem rgba(0,0,0, .2))';
                document.body.appendChild(events);
                window['ALLFOURS'] = {
                    event_root: events
                };
            });
        });
    }
    logAction(title, element, context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(title);
            if (!this.options.debug || this.options.headless)
                return {
                    started: () => { },
                    done: () => { },
                };
            yield this.checkEventLogExists();
            const event_id = 'ALLFOUR_EVENT_' + String(Math.floor(Math.random() * 100000000));
            const tag = typeof element === 'string' ? element : yield element.evaluate((e) => {
                const tag = e.innerHTML ? e.outerHTML.slice(0, e.outerHTML.indexOf(e.innerHTML)) : e.outerHTML;
                return tag;
            });
            this.page.evaluate((event_id, title, tag, context) => {
                const event_root = window['ALLFOURS'].event_root;
                const event = document.createElement('div');
                event.id = event_id;
                event.style.background = 'linear-gradient(to bottom right, white, #e5e5e5)';
                event.style.color = '#b9b9b9';
                event.style.padding = '.5rem .8rem';
                event.style.overflow = 'hidden';
                event.style.maxHeight = '0px';
                event.style.transition = '.3s ease';
                event.style.opacity = '0';
                const eventTitle = document.createElement('p');
                eventTitle.innerText = title;
                eventTitle.style.transition = '.2s ease';
                eventTitle.style.margin = '0';
                eventTitle.style.textTransform = 'uppercase';
                eventTitle.style.fontWeight = 'bold';
                eventTitle.style.fontSize = '1.15rem';
                eventTitle.style.fontFamily = 'sans-serif';
                const eventTag = document.createElement('p');
                eventTag.innerText = tag;
                eventTag.style.margin = '0';
                eventTag.style.color = 'black';
                eventTag.style.fontWeight = '200';
                eventTag.style.fontSize = '.8rem';
                eventTag.style.fontFamily = 'monospace';
                eventTag.style.whiteSpace = 'nowrap';
                eventTag.style.marginTop = '-.4rem';
                eventTag.style.overflow = 'hidden';
                eventTag.style.textOverflow = 'ellipsis';
                setTimeout(() => {
                    event.style.maxHeight = '5rem';
                    event.style.opacity = '1';
                }, 5);
                event.appendChild(eventTitle);
                event.appendChild(eventTag);
                event_root.appendChild(event);
            }, event_id, title, tag, context);
            return {
                started: () => {
                    this.page.evaluate((event_id) => {
                        const event = document.querySelector(`#${event_id}`);
                        if (!event)
                            return;
                        event.style.color = '#8d95ff';
                    }, event_id);
                },
                done: () => {
                    this.page.evaluate((event_id) => {
                        const event = document.querySelector(`#${event_id}`);
                        if (!event)
                            return;
                        event.style.color = '#70db5c';
                        setTimeout(() => {
                            if (!event)
                                return;
                            event.style.maxHeight = '0';
                            event.style.opacity = '0';
                            setTimeout(() => {
                                if (!event)
                                    return;
                                event.remove();
                            }, 500);
                        }, 5000);
                    }, event_id);
                },
            };
        });
    }
    delayedAction(action) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doDelay(500);
            yield action();
            yield this.doDelay(100);
        });
    }
    doDelay(time) {
        return new Promise((res) => {
            setTimeout(() => res(), time);
        });
    }
    getAnElement(selector) {
        return new Promise((res) => __awaiter(this, void 0, void 0, function* () {
            yield this.delayedAction(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const element = yield this.page.waitForSelector(selector, { timeout: 1500 });
                    const { done } = yield this.logAction('Get Element', element);
                    done();
                    res(element);
                }
                catch (_a) {
                    res(null);
                }
            }));
        }));
    }
    getAnElementThatContainsText(selector, text, timesFound) {
        return new Promise((res) => __awaiter(this, void 0, void 0, function* () {
            yield this.delayedAction(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const handle = yield this.page.evaluateHandle((selector, text, timesFound) => {
                        console.log('Testing', selector, text, timesFound);
                        for (const item of document.querySelectorAll(selector)) {
                            if (!timesFound) {
                                if (item.textContent.includes(text)) {
                                    return item;
                                }
                            }
                            else {
                                const reg = new RegExp(text, 'gm');
                                const matches = item.textContent.match(reg);
                                if (matches && matches.length === timesFound) {
                                    return item;
                                }
                            }
                        }
                    }, selector, text, timesFound);
                    const { done } = yield this.logAction('Get Element', handle.asElement());
                    done();
                    res(handle.asElement());
                }
                catch (e) {
                    res(null);
                }
            }));
        }));
    }
    getValueFromElement(element, key) {
        return new Promise((res) => __awaiter(this, void 0, void 0, function* () {
            try {
                res(yield element.evaluate((e, key) => e[key], key));
            }
            catch (_a) {
                res(null);
            }
        }));
    }
    eventClick(element) {
        return __awaiter(this, void 0, void 0, function* () {
            const { started, done } = yield this.logAction('Click', element);
            yield this.delayedAction(() => __awaiter(this, void 0, void 0, function* () {
                started();
                try {
                    yield element.click();
                }
                catch (e) {
                    return (null);
                }
            }));
            done();
        });
    }
    eventType(element, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const { started, done } = yield this.logAction('Type', element);
            yield this.delayedAction(() => __awaiter(this, void 0, void 0, function* () {
                started();
                try {
                    yield element.type(text, { delay: 75 });
                }
                catch (e) {
                    return (null);
                }
            }));
            done();
        });
    }
    doWaitFor(promise, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res) => __awaiter(this, void 0, void 0, function* () {
                let done = false;
                this.log('Started a wait');
                const checkPromise = () => __awaiter(this, void 0, void 0, function* () {
                    const val = yield promise();
                    if (val == null) {
                        setTimeout(() => {
                            checkPromise();
                        }, 500);
                    }
                    else {
                        done = true;
                        this.log('Wait resolved');
                        res(val);
                    }
                });
                checkPromise();
                if (timeout) {
                    setTimeout(() => {
                        if (done)
                            return;
                        this.log('Wait timed out');
                        res(null);
                    }, timeout);
                }
            }));
        });
    }
}
exports.ALL4S = ALL4S;
//# sourceMappingURL=index.js.map