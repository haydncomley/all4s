# ALL4S (All Fours) 🥾
A simple web crawling automation tool.

This package simplifies and streamlines a puppeteer instance in order to make web crawling and automation a touch easier.

```
npm install all4s
```

> All promises resolve to 'null' if no elements are found. This is done by design in order to make sure automation scripts don't throw, you can handle a null return easily too :)


## Getting Started 🎬
1. Import `all4s`
```typescript
import { ALL4S } from "all4s";
```
1. Create an ALL4S instance within an async scope and kick it off ⚽.
```typescript
(async () => {
    // Setup our new web crawler.
    const allFours = new ALL4S({
        headless: false, // Hide or Show the browser.
        startPage: 'https://www.haydncomley.com/', // The page we initially load
        debug: true // [OPTIONAL] Output actions to the console & show an on-screen event queue when not in 'headless' mode.
        debugHideConsole: false // [OPTIONAL] Show the on-screen queue but suppress console output.
    });

    // Starts the browser instance.
    await allFours.doStart();
})();
```
3. Start automating your web crawler.
```typescript
// Find a button & click on it.
const aButton = await allFours.getAnElement('#my-button');
await allFours.eventClick(cookieButton);

// Find an input & type into it.
const anInput = await allFours.getAnElement('#my-input');
await allFours.eventType(anInput, 'This is some text input.');
```

# Advanced Extras ⚙️

## Get element by text 📝
- You can get an element by searching for it's text content if other selectors are no use. 
```typescript
// This searches for a <button/> element with the specified text inside.
const cookieButton = await allFours.getAnElementThatContainsText('button', 'I Accept');
await allFours.eventClick(cookieButton);
```

- You can also specify how many times this text needs to show up for certain edge cases.
```typescript
// This will only match a <p> tag that has the word 'yes' within it 3 times.
const confirmationParagraph = await allFours.getAnElementThatContainsText('p', 'yes', 3);
```

## Wait for element to show up ⌚
- You can wait until an element shows up and then have it returned. Either wait eternally or set a timeout.
```typescript
// This will wait forever until an element is found.
const cookiePopup = await allFours.doWaitFor(() => allFours.getAnElement('#cookie-consent'));
```
```typescript
// This will return 'null' after 5 seconds if no element is found.
const cookiePopup = await allFours.doWaitFor(() => allFours.getAnElement('#cookie-consent'), 5000);
```
```typescript
// Example: Wait until the a cookie consent button shows up and then dismiss it by clicking.
allFours.doWaitFor(() => allFours.getAnElementThatContainsText('button', 'I Accept')).then((button) => {
    allFours.eventClick(button)
});
```

## Get Element Value / Property / Attribute 👗
- You can grab properties from elements with this simple api.
```typescript
// The first value 'String' defines the type of the object we are getting. The second 'HTMLAnchorElement' allows for typed values in our function for typescript but any string is valid.
const href = await allFours.getValueFromElement<String, HTMLAnchorElement>(element, 'href');
```

## Delay Executing / Sleep 🦥
- All actions have waiting built in, but you can always wait some more if needed.
```typescript
// Wait for 1 second before continuing.
await allFours.doDelay(1000);
```

## Navigation 🗺
- Navigate to another page.
```typescript
// Navigates and then waits for the page to load.
await allFours.doNavigation('https://haydncomley.com');
```