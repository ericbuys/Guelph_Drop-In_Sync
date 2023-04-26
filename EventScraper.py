from requests_html import HTMLSession
from pyquery import PyQuery as pq
from lxml import etree

class Event:
    def __init__(self, eventName, startTime, endTime, location, day):
        self.eventName = eventName
        self.startTime = startTime
        self.endTime = endTime
        self.location = location
        self.day = day
    
    def __str__(self):
        return ('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n'
                f'Event Name: {self.eventName}\n'
                f'Location: {self.location}\n'
                f'Start Time: {self.startTime}\n'
                f'End Time: {self.endTime}\n'
                f'Day: {self.day}')

class EventScraper:
    DAY_INDEX = {
        'day_1': 'Sunday',
        'day_2': 'Monday',
        'day_3': 'Tuesday',
        'day_4': 'Wednesday',
        'day_5': 'Thursday',
        'day_6': 'Friday',
        'day_7': 'Saturday'
    }

    def __init__(self, url, targetEvent):
        self.url = url
        self.targetEvent = targetEvent
        self.session = HTMLSession()
        
    def scrapeURL(self):
        r = self.session.get(self.url)
        r.html.render()
        scrapedEvents = []

        try:
            displayTable = r.html.find("#AllEvents")[0]
            eventBlocks = displayTable.find(".block.day")

            for eventBlock in eventBlocks:
                events = pq(etree.fromstring(eventBlock.html))
                eventList = events('.event')
                day = self.DAY_INDEX[eventBlock.attrs['class'][2]]

                for event in eventList:
                    event = pq(event)
                    eventName = event('.eventName').text()

                    if(TARGET_EVENT == eventName):
                        eventLocation = event('.eventLocation').text()
                        startTime = event('.startTime').text()
                        endTime = event('.endTime').text()
                        
                        newEvent = Event(eventName, startTime, endTime, eventLocation, day)
                        scrapedEvents.append(newEvent)
        except IndexError:
            print("Failed to render html...., why?")
        
        return scrapedEvents

if __name__ == "__main__":
    URL = "https://fitandrec.gryphons.ca/sports-clubs/drop-in-rec"
    TARGET_EVENT = "Badminton"

    scraper = EventScraper(URL, TARGET_EVENT)
    scrapedEvents = scraper.scrapeURL()
    
    # for event in scrapedEvents:
    #     print(event)