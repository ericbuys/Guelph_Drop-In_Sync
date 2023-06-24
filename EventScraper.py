from requests_html import HTMLSession
from pyquery import PyQuery as pq
from lxml import etree
from datetime import datetime, timedelta
from selenium import webdriver 
from selenium.webdriver.chrome.service import Service as ChromeService 
from webdriver_manager.chrome import ChromeDriverManager 
from selenium.webdriver.common.by import By

class Event:
    def __init__(self, eventName, startTime, endTime, location, day, dateRange):
        self.eventName = eventName
        self.location = location
        self.day = day
        self.parseTime(dateRange, startTime, endTime)
    
    def __str__(self):
        return ('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n'
                f'Event Name: {self.eventName}\n'
                f'Location: {self.location}\n'
                f'Start Time: {self.startTime}\n'
                f'End Time: {self.endTime}\n'
                f'Day: {self.day}')

    def parseTime(self, dateRange, startTime, endTime):
        calStartDate = datetime.strptime(dateRange, '%B %d')
        today = datetime.today()

        #Calculating the Event Start and End Time
        eventStartTime = datetime.strptime(startTime[0], '%H:%M')
        eventEndTime = datetime.strptime(endTime[0], '%H:%M')
        if "PM" in startTime[1]:
            eventStartTime += timedelta(hours=12)
        if "PM" in endTime[1]:
            eventEndTime += timedelta(hours=12)

        #Getting start year if calStartDate and calEndDate bracket Dec 31
        if today.month != calStartDate.month and calStartDate.month == 12:
            today.year -= 1

        self.startTime = datetime(today.year, calStartDate.month, calStartDate.day, eventStartTime.hour, eventStartTime.minute) + timedelta(days=self.day)
        self.endTime = datetime(today.year, calStartDate.month, calStartDate.day, eventEndTime.hour, eventEndTime.minute) + timedelta(days=self.day)

        self.startTime = self.startTime.isoformat()
        self.endTime = self.endTime.isoformat()

class EventScraper:
    DAY_INDEX = {
        'day_1': 0,
        'day_2': 1,
        'day_3': 2,
        'day_4': 3,
        'day_5': 4,
        'day_6': 5,
        'day_7': 6
    }

    def __init__(self, url, targetEvent):
        self.url = url
        self.targetEvent = targetEvent
    
    def setupSession(self, retryAmount):
        self.session = HTMLSession()
        count = 0
        pageNotLoaded = True

        self.r = self.session.get(self.url)

        while(count < retryAmount and pageNotLoaded):
            self.r.html.render()
            
            try:
                displayTable = self.r.html.find("#AllEvents")[0]
                pageNotLoaded = False   
            except:
                pass
            
            count += 1

        if pageNotLoaded:
            print("Unable to load dynamic page content")
        else:
            print("Dynamic Page Content loaded")
        
        return (not pageNotLoaded)
            
    def scrapeURL(self):
        dynamicPageContentLoaded = self.setupSession(retryAmount=50)
        scrapedEvents = []

        if dynamicPageContentLoaded:
            displayTable = self.r.html.find("#AllEvents")[0]
            eventBlocks = displayTable.find(".block.day")

            dateRange = self.r.html.find(".col-sm-3.col-md-5.col-xs-12")[0].text
            dateRange = dateRange.split(" ")
            dateRange = ' '.join(dateRange[2:4])

            for eventBlock in eventBlocks:
                events = pq(etree.fromstring(eventBlock.html))
                eventList = events('.event')
                day = self.DAY_INDEX[eventBlock.attrs['class'][2]]

                for event in eventList:
                    event = pq(event)
                    eventName = event('.eventName').text()

                    if(self.targetEvent == eventName):
                        eventLocation = event('.eventLocation').text()
                        startTime = event('.startTime').text().split(' ')
                        endTime = event('.endTime').text().split(' ')
                        
                        newEvent = Event(eventName, startTime, endTime, eventLocation, day, dateRange)
                        scrapedEvents.append(newEvent)
        
        return scrapedEvents
    
    def scrapeWithSelenium(self):
        options = webdriver.ChromeOptions() 
        options.add_argument("--headless=new")
        # userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.56 Safari/537.36"
        # options.add_argument(f'user-agent={userAgent}')

        with webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options) as driver: 
            driver.get(self.url)
            eventBlocks = driver.find_elements(By.XPATH, "//div[contains(@class, 'block day')]")

            for eventBlock in eventBlocks:
                events = eventBlock.find_elements(By.CLASS_NAME, 'event')

                for event in events:
                    eventName = event.find_element(By.CLASS_NAME, 'eventName')

                    if(eventName.text == self.targetEvent):
                        print(event.get_attribute('outerHTML'))
                # print(eventBlock.get_attribute('outerHTML'))

if __name__ == "__main__":
    URL = "https://fitandrec.gryphons.ca/sports-clubs/drop-in-rec"
    TARGET_EVENT = "Badminton"

    scraper = EventScraper(URL, TARGET_EVENT)
    scrapedEvents = scraper.scrapeWithSelenium()

    # scrapedEvents = scraper.scrapeURL()
    
    # for event in scrapedEvents:
    #     print(event.__dict__)