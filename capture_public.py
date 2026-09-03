import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=1400,900")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")

driver = webdriver.Chrome(options=options)
os.makedirs("project_screenshots", exist_ok=True)

try:
    print("Capturing Landing Page...")
    driver.get("https://digital-skill-passport.vercel.app")
    time.sleep(3)
    driver.save_screenshot("project_screenshots/01_landing_page.png")
    print("Saved 01_landing_page.png")

    print("Capturing Login Portal...")
    driver.get("https://digital-skill-passport.vercel.app/login")
    time.sleep(2)
    driver.save_screenshot("project_screenshots/02_login_portal.png")
    print("Saved 02_login_portal.png")

    print("Capturing Register Portal...")
    driver.get("https://digital-skill-passport.vercel.app/register")
    time.sleep(2)
    driver.save_screenshot("project_screenshots/03_register_portal.png")
    print("Saved 03_register_portal.png")

    print("Capturing Public Passport with QR Code...")
    driver.get("https://digital-skill-passport.vercel.app/passport/CHANDA-69AD7A")
    time.sleep(3)
    driver.save_screenshot("project_screenshots/04_public_passport_qr.png")
    print("Saved 04_public_passport_qr.png")

finally:
    driver.quit()
    print("Finished public captures.")
