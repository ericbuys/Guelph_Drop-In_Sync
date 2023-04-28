from __future__ import print_function

import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

import EventScraper

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']
TARGET_CALENDAR = 'Drop-In Rec'
TIMEZONE = 'America/Toronto'

#Sets up the connection to the users Google Calendar
def getCalendarSerivce():
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('calendar', 'v3', credentials=creds)
    return service

#Returns the Drop-In Calendar ID if it has already been created, otherwise it returns None
def fetchDropInCalendar():
    service = getCalendarSerivce()

    #Getting list of Calendars
    calendars_result = service.calendarList().list().execute()
    calendars = calendars_result.get('items', [])

    if not calendars:
        print('No calendars found.')
        return None

    for calendar in calendars:
        if(calendar['summary'] == TARGET_CALENDAR):
            print('Found')
            return calendar['id']

#Creates a new Drop-In Rec Calendar and returns its ID    
def createDropInCalendar():
    service = getCalendarSerivce()

    newCalendar = {
        'summary': TARGET_CALENDAR
    }

    createdCalendar = service.calendars().insert(body=newCalendar).execute()
    print("Created a new Drop-In Rec Calendar!")

    return createdCalendar['id']

#Gets the Drop-In Rec Calendar ID
def getCalendarID():
    calID = fetchDropInCalendar()
    if not calID:
        calID = createDropInCalendar()
    
    return calID

#Adds a new Events to a Calendar specified by calID
def createCalendarEvent(calID, event :EventScraper.Event):
    service = getCalendarSerivce()

    eventBody = {
        "summary": event.eventName,
        "location": event.location,
        "start": {
            'dateTime': event.startTime,
            'timeZone': TIMEZONE,
        },
        "end": {
            'dateTime': event.endTime,
            'timeZone': TIMEZONE,
        },
    }

    newEvent = service.events().insert(calendarId=calID, body=eventBody).execute()


if __name__ == '__main__':
    id = getCalendarID()

    URL = "https://fitandrec.gryphons.ca/sports-clubs/drop-in-rec"
    TARGET_EVENT = "Badminton"

    scraper = EventScraper.EventScraper(URL, TARGET_EVENT)
    scrapedEvents = scraper.scrapeURL()
    
    for event in scrapedEvents:
        createCalendarEvent(id, event)
