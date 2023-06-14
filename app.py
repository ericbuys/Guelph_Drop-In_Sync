from flask import Flask
from flask_cors import CORS#, cross_origin

#RUN USING 'flask run -p 8000'

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
# @cross_origin()
def hello():
    print("hello()")
    return 'hello from flask'

@app.route('/heloooooo')
# @cross_origin()
def test():
    print("hellooooooooooooooo")
    return 'hellooooooooooooooo'