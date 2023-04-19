# How does the code work?
This is a quick guide to the code. It is not a tutorial, but it should help you understand the code and how it works.
Take a look into the [content_script.js](./js/content_script.js) file to see how the extension works, the code is fully commented.
It is the main file of the extension, as you can see in the [manifest.json](./manifest.json) file.

![CalIntra](/images/banner.png)

## Table of contents

- [How does the code work?](#how-does-the-code-work)
  - [Table of contents](#table-of-contents)
  - [Let's go step by step](#lets-go-step-by-step)
    - [1. Fill the calendar with the missing days](#1-fill-the-calendar-with-the-missing-days)
    - [2. Parse the subscribed events](#2-parse-the-subscribed-events)
    - [3. Change 'Logtime' text into 'Caòendar (x subscribed events)'](#3-change-logtime-text-into-caòendar-x-subscribed-events)
    - [4. Add the events to the calendar](#4-add-the-events-to-the-calendar)
    - [And that's it!](#and-thats-it)
  - [Stay in touch with me](#stay-in-touch-with-me)


## Let's go step by step

### 1. Fill the calendar with the missing days
```js
function fillCalendarTillMonthEnd() {
    // Seriously, why is this not the default?
    // We are going to fill the calendar till the end of the month
    // cause the events you'll care about will happen after today xD

    // Get the last loaded day
    const lastElement = document.querySelector('g[data-iidate]:last-child');

    // it should be today but let's parse the date just in case
    const date = new Date(lastElement.getAttribute('data-iidate'));

    // then we load the last day of the month
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const currentDay = date.getDate();

    // we get the difference days
    let daysLeft = lastDay - currentDay;

    // we need to parse the first X of both the elements, to know where the 
    // new lines are going to start
    var lastX = parseInt(lastElement.querySelector('rect').getAttribute('x'), 10);
    const firxtRectX = lastX - (date.getDay() * 18);
    var lastX = parseInt(lastElement.querySelector('text').getAttribute('x'), 10);
    const firxtTextX = lastX - (date.getDay() * 18);
    var last = lastElement;

    // and we loop till there's no days left
    while (daysLeft > 0) {
        // we parse the last created sub-elements
        var rect = last.querySelector('rect');
        var text = last.querySelector('text');
        
        // we clone the element
        const newElement = last.cloneNode(true);
        
        // we get the next day date
        const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        // Format the date to YYYY-MM-DD
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const day = String(newDate.getDate()).padStart(2, '0');

        // Add as attribute
        const newDateFormatted = `${year}-${month}-${day}`;
        newElement.setAttribute('data-iidate', newDateFormatted);
        newElement.setAttribute('data-original-title', ''); // no daily hours obv

        // We set other details
        let new_rect = newElement.querySelector('rect')
        let new_text = newElement.querySelector('text')
        new_rect.setAttribute('data-event-filled', 'false');
        new_text.textContent = newDate.getDate();


        // set position rect
        var x = parseInt(rect.getAttribute('x'), 10);
        new_rect.setAttribute('x', x + 18);

        // set position rect
        var x = parseInt(text.getAttribute('x'), 10);
        new_text.setAttribute('x', x + 18);

        // if is last day of week, change y position of rect and text
        if (date.getDay() === 6) {
            var y = parseInt(rect.getAttribute('y'), 10);
            new_rect.setAttribute('y', y + 18);
            var y = parseInt(text.getAttribute('y'), 10);
            new_text.setAttribute('y', y + 18);

            // reset x position of rect and text
            new_rect.setAttribute('x', firxtRectX);
            new_text.setAttribute('x', firxtTextX);
        }

        // show tooltip on hover, the value is  "data-original-title" attribute
        $(newElement).tooltip();
        
        // Add the day to the page
        lastElement.parentNode.appendChild(newElement);
        
        // change the date
        date.setDate(date.getDate() + 1);

        // switch last element
        var last = newElement;

        // decrase to continue loop
        daysLeft--;
    }
}
```
I know it's a lot of code, but it's not that complicated. It's just a lot of DOM manipulation.

I don't know why intra didn't add the missing days to the calendar, but I guess it's because it's not a calendar, it's a time tracker. But I think it's a good idea to have the whole month visible, so I added this function, or we'll be not able to display the upcoming days events.

[Improved Intra](https://chrome.google.com/webstore/detail/improved-intra-42/hmflgigeigiejaogcgamkecmlibcpdgo) is required to use the extension, this because it injects the `data-iidate` attribute to the calendar days, so we can know which day is which. Without having to calculate it, but just parsing the attribute.
As you can see in [CHANGELOG.md](CHANGELOG.md) I plan to remove the dependency in the future.

### 2. Parse the subscribed events
```js
async function getSubscribedEvents() {
    const eventElements = Array.from(document.querySelectorAll('div.event-item'));
    const events = [];
    
    for (const eventElement of eventElements) {
        if (eventElement.querySelector('span.event-registered') === null) {
            // If the event is not subscribed,
            continue;
        }

        // Parse the details of the event
        // ...
    }
}
```
This function gets all the subscribed events, and parses the details of each one.

### 3. Change 'Logtime' text into 'Caòendar (x subscribed events)'
```js
document.querySelectorAll("h4.profile-title")[2].textContent = `Calendar (${subscribedEvents.length} subscribed events)`;
```
This is just a simple DOM manipulation, to change the title of the calendar.

### 4. Add the events to the calendar
```js

function addIconToCalendarDay(eventDetails) {
    const calendarDayElement = document.querySelector(`g[data-iidate="${eventDetails.date}"]`);

    if (!calendarDayElement) {
        // Don't do anything if the event day is not displayed in the calendar yet
        // (Intra diplays only the current week)
        return;
    }
    // Define the colors for different event types
    // those are the default colors from Intra
    const colors = {
        'pedago': '#ED8179',
        'meet': '#a74eff', // This is not the default color, but it's better for the eyes
        'association': '#a2b3e5',
        'speed_working': '#39D88F',
        'other': '#c0c0c0',
        'multiple': '#7bc677'
    };

    // Check if there's already an event on this day
    let textElement = calendarDayElement.querySelector('rect');

    if (textElement.getAttribute('data-event-filled') === 'true') {
        // If there's already an event circle, set the color to indicate multiple events
        // and add the count of other events to the tooltip
        textElement.style.setProperty('fill', colors.multiple, 'important');
        textElement.style.setProperty("color", "initial", "important");
        const otherCaledarEvent = calendarDayElement.getAttribute('data-original-title');
        const newEventsCount = parseInt(calendarDayElement.getAttribute('dayEventCountCount')) + 1;
        calendarDayElement.setAttribute('dayEventCountCount', newEventsCount);
        calendarDayElement.setAttribute('data-original-title', otherCaledarEvent + ` + ${newEventsCount - 1} other event${newEventsCount > 2 ? 's' : ''}`);
    } else {
        // If there's not event displayed yet, change the day color and sett attributes to indicate that there's an event
        textElement.setAttribute('data-event-filled', 'true');
        textElement.style.setProperty('fill', colors[eventDetails.type], 'important');
        textElement.style.setProperty("color", "initial", "important");
        calendarDayElement.setAttribute('dayEventCountCount', '1')

        // Add event title as tooltip
        calendarDayElement.setAttribute('data-original-title', eventDetails.title);

        // Add some styles to the text element to make it look better
        const element = calendarDayElement.querySelector('text');
        element.style.setProperty('fill', '#fff', 'important');
        element.style.setProperty('color', '#fff', 'important');
        element.style.setProperty('cursor', 'pointer', 'important');
        element.style.setProperty('font-weight', '500', 'important');

        // Open event page on click
        calendarDayElement.addEventListener('click', () => {
            // Work smarter, not harder
            // We already have the event element, so we can just click it
            eventDetails.elementEvent.click();
        });

    }
}
```
This function adds the event icon to the calendar day, and adds the event title as tooltip.
It is executed for each subscribed event.
Since the calendar is made of SVG elements, we have to use the `querySelector` function to get the element, and then we can manipulate it and place the next days in the correct X and Y position.
It also adds the event title as tooltip, and opens the event page on click.

It may seem complicated, but it's just a lot of DOM manipulation and a bit of logic.

### And that's it!
I hope you enjoyed this post, and if you have any questions, feel free to ask them in the comments.

I plan to implement all the fatures listed in the [CHANGELOG.md](CHANGELOG.md) file, so stay tuned for updates. I'm open to suggestions and [CONTIBUTING.md](CONTRIBUTING.md) is open for everyone.

## Stay in touch with me
- [Twitter](https://twitter.com/glizzykingdreko)
- [Medium](https://medium.com/@glizzykingdreko)
- [GitHub](https://github.com/GlizzyKingDreko)

Remember to add a star ⭐ to the repository to show your support!
