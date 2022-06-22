import puppeteer, { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Product } from 'puppeteer';

export interface IALL4Settings {
    startPage: string;
    debug?: boolean;
    debugHideConsole?: boolean;
    browserOptions?: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
        product?: Product;
        extraPrefsFirefox?: Record<string, unknown>;
    }
}

export class ALL4S {
    private options: IALL4Settings;

    private browser: puppeteer.Browser;
    private page: puppeteer.Page;

    constructor(options: IALL4Settings) {
        this.options = options;
    }

    public async doStart() {
        if (this.browser) return;
        this.log('Starting.')

        this.browser = await puppeteer.launch({
            headless: this.options.browserOptions.headless, defaultViewport: null,
            args: ['--start-maximized'],
        });
        this.page = await this.browser.newPage();
        this.watchCurrentPage();
        await this.page.goto(this.options.startPage);
    }

    public async doNavigation(url: string) {
        await this.page.goto(url);
    }

    private log(message: string, ...args: any) {
        if (!this.options.debug || this.options.debugHideConsole) return;
        console.log(`[AllFours] ${message}`, ...args);

    }

    private watchCurrentPage() {
        this.page.on('load', async () => {
            await this.checkEventLogExists();
            const { done } = await this.logAction('Page Load', this.page.url())
            done();
        })
    }

    private async checkEventLogExists() {
        if (!this.options.debug || this.options.browserOptions.headless) return;
        await this.page.evaluate(() => {
            if (document && document.querySelector('#ALLFOUR_EVENT_PARENT')) return;

            const events = document.createElement('div');
            events.style.zIndex = '999999999999';
            events.id = 'ALLFOUR_EVENT_PARENT';
            events.style.position = 'fixed';
            events.style.left = '0rem';
            events.style.bottom = '0rem';
            // events.style.gap = '.5rem';
            events.style.width = '15rem';
            events.style.maxWidth = 'calc(100vw - 2rem)'
            events.style.display = 'flex';
            events.style.flexDirection = 'column';
            events.style.pointerEvents = 'none';
            events.style.filter = 'drop-shadow(0px .1rem .2rem rgba(0,0,0, .2))';
            document.body.appendChild(events);

            window['ALLFOURS'] = {
                event_root: events
            };
        });
    }

    private async logAction(title: string, element: puppeteer.ElementHandle<Element> | string, context?: string) {
        this.log(title);
        if (!this.options.debug || this.options.browserOptions.headless) return {
            started: () => { },
            done: () => { },
        };
        await this.checkEventLogExists();
        const event_id = 'ALLFOUR_EVENT_' + String(Math.floor(Math.random() * 100000000));

        const tag = typeof element === 'string' ? element : await element.evaluate((e) => {
            const tag = e.innerHTML ? e.outerHTML.slice(0, e.outerHTML.indexOf(e.innerHTML)) : e.outerHTML;
            return tag;
        })

        this.page.evaluate((event_id: string, title: string, tag: string, context?: string) => {
            const event_root: HTMLElement = window['ALLFOURS'].event_root;

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
            eventTitle.style.transition = '.2s ease'
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
            }, 5)

            event.appendChild(eventTitle);
            event.appendChild(eventTag);
            event_root.appendChild(event);
        }, event_id, title, tag, context);

        return {
            started: () => {
                this.page.evaluate((event_id: string) => {
                    const event = document.querySelector<HTMLElement>(`#${event_id}`);
                    if (!event) return;
                    event.style.color = '#8d95ff';
                }, event_id);
            },
            done: () => {
                this.page.evaluate((event_id: string) => {
                    const event = document.querySelector<HTMLElement>(`#${event_id}`);
                    if (!event) return;
                    event.style.color = '#70db5c';

                    setTimeout(() => {
                        if (!event) return;
                        event.style.maxHeight = '0';
                        event.style.opacity = '0';
                        setTimeout(() => {
                            if (!event) return;
                            event.remove();
                        }, 500);
                    }, 5000);
                }, event_id);
            },
        }
    }

    private async delayedAction(action: () => Promise<void>) {
        await this.doDelay(500);
        await action();
        await this.doDelay(100);
    }

    public doDelay(time: number) {
        return new Promise<void>((res) => {
            setTimeout(() => res(), time);
        })
    }

    public getAnElement(selector: string): Promise<puppeteer.ElementHandle<Element> | null> {
        return new Promise(async (res) => {
            await this.delayedAction(async () => {
                try {
                    const element = await this.page.waitForSelector(selector, { timeout: 1500 });
                    const { done } = await this.logAction('Get Element', element);
                    done();
                    res(element)
                } catch {
                    res(null);
                }
            });
        });
    }

    public getAnElementThatContainsText(selector: string, text: string, timesFound?: number): Promise<puppeteer.ElementHandle<Element> | null> {
        return new Promise(async (res) => {
            await this.delayedAction(async () => {
                try {
                    const handle: puppeteer.JSHandle<HTMLElement> = await this.page.evaluateHandle((selector, text, timesFound) => {
                        console.log('Testing', selector, text, timesFound)
                        for (const item of document.querySelectorAll<HTMLElement>(selector)) {
                            if (!timesFound) {
                                if (item.textContent.includes(text)) {
                                    return item;
                                }
                            } else {
                                const reg = new RegExp(text, 'gm');
                                const matches = item.textContent.match(reg);
                                if (matches && matches.length === timesFound) {
                                    return item;
                                }
                            }
                        }
                    }, selector, text, timesFound);
                    const { done } = await this.logAction('Get Element', handle.asElement());
                    done();
                    res(handle.asElement())
                } catch (e) {
                    res(null);
                }
            });
        });
    }

    public getValueFromElement<T, X>(element: puppeteer.ElementHandle<Element>, key: keyof X): Promise<T | null> {
        return new Promise(async (res) => {
            try {
                res(await element.evaluate((e, key) => e[key], key as string))
            } catch {
                res(null)
            }
        });
    }

    public async eventClick(element: puppeteer.ElementHandle<Element>) {
        const { started, done } = await this.logAction('Click', element);
        await this.delayedAction(async () => {
            started();
            try {
                await element.click();
            } catch (e) {
                return (null);
            }
        });
        done();
    }

    public async eventType(element: puppeteer.ElementHandle<Element>, text: string) {
        const { started, done } = await this.logAction('Type', element);
        await this.delayedAction(async () => {
            started();
            try {
                await element.type(text, { delay: 75 });
            } catch (e) {
                return (null);
            }
        });
        done();
    }

    public async doWaitFor<T extends Promise<any>>(promise: () => T, timeout?: number): Promise<T> {
        return new Promise(async (res) => {
            let done = false;
            this.log('Started a wait');

            const checkPromise = async () => {
                const val = await promise();

                if (val == null) {
                    setTimeout(() => {
                        checkPromise()
                    }, 500);
                } else {
                    done = true;
                    this.log('Wait resolved');
                    res(val);
                }
            };

            checkPromise();

            if (timeout) {
                setTimeout(() => {
                    if (done) return;
                    this.log('Wait timed out');
                    res(null);
                }, timeout);
            }
        });
    }

}