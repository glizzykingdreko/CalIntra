function formatDate(element) {
    // Format date to YYYY-MM-DD to let us match it with the calendar dates 
    // (which are also formatted like this from Improved Intra)
    const dayElement = element.querySelector('.date-day');
    const monthElement = element.querySelector('.date-month');
    const day = parseInt(dayElement.textContent, 10);
    const dayFormatted = day < 10 ? '0' + day : day;
    const monthName = monthElement.textContent;
    const currentYear = new Date().getFullYear(); 
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = monthNames.indexOf(monthName) + 1;
    const monthFormatted = monthIndex < 10 ? '0' + monthIndex : monthIndex;

    return `${currentYear}-${monthFormatted}-${dayFormatted}`;
}

async function getSubscribedEvents() {
    // Get the list of subscribed events from the Agenda HTML
    const eventElements = Array.from(document.querySelectorAll('div.event-item'));
    const events = [];
    
    for (const eventElement of eventElements) {
        if (eventElement.querySelector('span.event-registered') === null) {
            // If the event is not subscribed,
            continue;
        }

        // Parse the details of the event
        const eventId = eventElement.querySelector('div.event-metadata > a').getAttribute('data-url');
        events.push({
            id: eventId,
            title: eventElement.querySelector('.event-subname').textContent,
            url: `https://profile.intra.42.fr${eventId}`,
            date: formatDate(eventElement.querySelector('div.event-left')),
            type: eventElement.getAttribute('data-event-category'),
            elementEvent: eventElement.querySelector(`div.event-metadata > a`)
        });
    }

    return events;
}

function fillCalendarTillMonthEnd() {
    // Seriously, why is this not the default?
    // We are going to fill the calendar till the end of the month
    // cause the events you'll care about will happen after today xD

    // Get the last loaded day
    const lastElement = document.querySelector('g[data-iidate]:last-child');

    // Try to get a day with no presence hours, to copy the style. This will let
    // CalIntra ti work with any theme. This part will be improved in the future
    const lastDayWithoutPresence = document.querySelector('g[data-original-title="0h00 (0h00)"]');
    
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
        
        // we select the element to clone
        const newElement = lastDayWithoutPresence ? lastDayWithoutPresence.cloneNode(true) : last.cloneNode(true);
        
        // we get the next day date
        const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        // Format the date to YYYY-MM-DD
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const day = String(newDate.getDate()).padStart(2, '0');

        // Add as attribute
        const newDateFormatted = `${year}-${month}-${day}`;
        newElement.setAttribute('data-iidate', newDateFormatted);
        // no daily hours obv
        // this can be customized in the future
        newElement.setAttribute('data-original-title', '0h00'); 

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
        } else {
            // else we use the same y position, since we may have 
            // parsed the first day with no presence hours
            new_rect.setAttribute('y', rect.getAttribute('y'));
            new_text.setAttribute('y', text.getAttribute('y'));
        }

        // show tooltip on hover, the value is  "data-original-title" attribute
        $(newElement).tooltip({
            container: 'body',
            placement: 'top',
            trigger: 'hover'
        });
        
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

async function initExtension() {
    // Get the list of subscribed events
    const subscribedEvents = await getSubscribedEvents();

    // Update the title of the Logtime section to indicate the number of subscribed events
    document.querySelectorAll("h4.profile-title")[2].textContent = `Calendar (${subscribedEvents.length} subscribed events)`;

    // Add the event icons to the calendar
    subscribedEvents.forEach(event => {
        addIconToCalendarDay(event);
    });
}
const checkForTargetNode = () => {
    // Wait for the logtime section to be loaded from Intra Improved
    const targetNode = document.querySelector("g[data-iidate]");
    if (targetNode) {
        // Start the extension
        fillCalendarTillMonthEnd();
        initExtension();
    } else {
        setTimeout(checkForTargetNode, 500);
    }
};

checkForTargetNode();