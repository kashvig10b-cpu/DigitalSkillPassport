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
    # 1. Login as Admin
    print("Logging into Admin Dashboard...")
    driver.get("https://digital-skill-passport.vercel.app/login")
    time.sleep(2)
    
    email_input = driver.find_element(By.XPATH, "//input[@type='email']")
    pw_input = driver.find_element(By.XPATH, "//input[@type='password']")
    email_input.clear()
    email_input.send_keys("admin@dsp.gov")
    pw_input.clear()
    pw_input.send_keys("admin123")
    
    submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_btn.click()
    time.sleep(5)
    
    driver.save_screenshot("project_screenshots/05_admin_dashboard_audit.png")
    print("Saved 05_admin_dashboard_audit.png")

    # Click Recruiter Security Tab
    try:
        tabs = driver.find_elements(By.XPATH, "//button[contains(., 'Recruiter') or contains(., 'Security')]")
        if tabs:
            tabs[0].click()
            time.sleep(2)
            driver.save_screenshot("project_screenshots/06_admin_recruiter_security.png")
            print("Saved 06_admin_recruiter_security.png")
    except Exception as e:
        print("Tab exception:", e)

    # 2. Login as Recruiter
    print("Logging into Recruiter Dashboard...")
    driver.get("https://digital-skill-passport.vercel.app/login")
    time.sleep(2)
    
    email_input = driver.find_element(By.XPATH, "//input[@type='email']")
    pw_input = driver.find_element(By.XPATH, "//input[@type='password']")
    email_input.clear()
    email_input.send_keys("recruiter@techhire.com")
    pw_input.clear()
    pw_input.send_keys("recruiter123")
    
    submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_btn.click()
    time.sleep(5)
    
    driver.save_screenshot("project_screenshots/07_recruiter_discovery.png")
    print("Saved 07_recruiter_discovery.png")

finally:
    driver.quit()
    print("All live screenshots captured successfully.")
