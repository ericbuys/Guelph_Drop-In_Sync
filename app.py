from flask import Flask, request
from flask_cors import CORS#, cross_origin
import json

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
        data = request.json
        print(data)

        return json.dumps('POST requests handled successfully')