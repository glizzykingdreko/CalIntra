function formatDate(element) {
    // Format date to YYYY-MM-DD to let us match it with the calendar dates (which are also formatted like this from Improved Intra)
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
        'other': '#c0c0c0'
    };

    // Check if there's already an event on this day
    let textElement = calendarDayElement.querySelector('rect');

    if (textElement.getAttribute('data-event-filled') === 'true') {
        // If there's already an event circle, set the color to indicate multiple events
        // and add the count of other events to the tooltip
        textElement.style.setProperty('fill', colors.other, 'important');
        textElement.style.setProperty("color", "initial", "important");
        const otherCaledarEvent = calendarDayElement.getAttribute('data-original-title');
        const newEventsCount = parseInt(calendarDayElement.getAttribute('dayEventCountCount')) + 1;
        calendarDayElement.setAttribute('dayEventCountCount', newEventsCount);
        calendarDayElement.setAttribute('data-original-title', otherCaledarEvent + ` + ${newEventsCount} other events`);
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
        initExtension();
    } else {
        setTimeout(checkForTargetNode, 500);
    }
};

checkForTargetNode();
