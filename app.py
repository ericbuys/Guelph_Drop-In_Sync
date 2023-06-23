from flask import Flask, request
from flask_cors import CORS#, cross_origin
import json
import EventScraper

#RUN USING 'flask run -p 8000'

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
def hello():
    print("hello()")
    return 'hello from flask'

@app.route('/add_activities', methods=['POST'])
def handle_add_activities():
    if request.method == 'POST':
        SCRAPING_URL = "https://fitandrec.gryphons.ca/sports-clubs/drop-in-rec"
        data = request.json
        activityList = []

        for activity in data:
            scraper = EventScraper.EventScraper(SCRAPING_URL, activity)
            scrapedEvents = scraper.scrapeURL()

            for event in scrapedEvents():
                activityList.append(event.__dict__)

        return json.dumps(activityList)