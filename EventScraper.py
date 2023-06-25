from selenium import webdriver 
from selenium.webdriver.chrome.service import Service as ChromeService 
from webdriver_manager.chrome import ChromeDriverManager 
from selenium.webdriver.common.by import By
from datetime import datetime, timedelta

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

        #Converting Start and End times to lists 
        startTime = startTime.split(" ")
        endTime = endTime.split(" ")

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

    def __init__(self, url, targetEvents):
        self.url = url

        if type(targetEvents) is not list:
            self.targetEvents = [targetEvents]
        else:
            self.targetEvents = targetEvents
    
    def scrapeURL(self):
        scrapedEvents = []

        #Running in headless mode (no browser)
        options = webdriver.ChromeOptions() 
        options.add_argument("--headless=new")

        with webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options) as driver: 
            driver.get(self.url)
            eventBlocks = driver.find_elements(By.XPATH, '//*[@id="AllEvents"]//div[contains(@class, "block day")]')
            
            #Getting the start date for the current week
            dateRange = driver.find_element(By.XPATH, '//*[@id="EventsModule_1456"]/div[1]/form/div[1]/strong').text
            dateRange = dateRange.split(" ")
            dateRange = ' '.join(dateRange[2:4])

            for eventBlock in eventBlocks:
                events = eventBlock.find_elements(By.CLASS_NAME, 'event')
                eventDay = self.DAY_INDEX[eventBlock.get_attribute('class').split()[2]]

                for event in events:
                    eventName = event.find_element(By.CLASS_NAME, 'eventName').text

                    if(eventName in self.targetEvents):
                        eventLocation = event.find_element(By.CLASS_NAME, 'eventLocation').text
                        eventStartTime = event.find_element(By.CLASS_NAME, 'startTime').text
                        eventEndTime = event.find_element(By.CLASS_NAME, 'endTime').text

                        newEvent = Event(eventName, eventStartTime, eventEndTime, eventLocation, eventDay, dateRange)
                        scrapedEvents.append(newEvent)

        return scrapedEvents

if __name__ == "__main__":
    URL = "https://fitandrec.gryphons.ca/sports-clubs/drop-in-rec"
    TARGET_EVENT = "Badminton"

    scraper = EventScraper(URL, TARGET_EVENT)
    scrapedEvents = scraper.scrapeURL()
    
    for event in scrapedEvents:
        print(event.__dict__)