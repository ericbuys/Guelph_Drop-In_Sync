from requests_html import HTMLSession
from pyquery import PyQuery as pq
from lxml import etree

DAY_INDEX = {
    'day_1': 'Sunday',
    'day_2': 'Monday',
    'day_3': 'Tuesday',
    'day_4': 'Wednesday',
    'day_5': 'Thursday',
    'day_6': 'Friday',
    'day_7': 'Saturday'
}

URL = "https://fitandrec.gryphons.ca/sports-clubs/drop-in-rec"
TARGET_EVENT = "Rec Skating"

session = HTMLSession();
r = session.get(URL)
r.html.render(retries=8)

tot_events = []

displayTable = r.html.find("#AllEvents")[0]
eventBlocks = displayTable.find(".block.day")

for eventBlock in eventBlocks:
    events = pq(etree.fromstring(eventBlock.html))
    eventList = events('.event')
    day = DAY_INDEX[eventBlock.attrs['class'][2]]

    for event in eventList:
        event = pq(event)
        eventName = event('.eventName')

        if(TARGET_EVENT == eventName.text()):
            tot_events.append(event)
        
print(tot_events)
