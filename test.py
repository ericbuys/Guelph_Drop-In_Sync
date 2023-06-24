from selenium import webdriver 
from selenium.webdriver.chrome.service import Service as ChromeService 
from webdriver_manager.chrome import ChromeDriverManager 
 
url = "https://scrapeme.live/shop/" 
 
options = webdriver.ChromeOptions() 
options.headless = True 
with webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options) as driver: 
	driver.get(url)