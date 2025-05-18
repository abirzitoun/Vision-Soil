
# VisionSoil 🌱  
A cutting-edge smart agriculture system integrating robotics, AI, embedded systems, and cross-platform interfaces.

## Overview  
**VisionSoil** is an innovative project developed as part of an academic initiative at **Esprit School of Engineering**.  
It aims to revolutionize modern agriculture by leveraging **artificial intelligence**, **robotics**to automate crop monitoring and smart irrigation through interconnected modules.

## Features  
- 🔧 **Multi-platform system**: mobile app (real-time monitoring + control), web platform, embedded STM32 board, AI-based analysis.
- 🤖 **Two autonomous robots**: one for environmental monitoring and video streaming, one for targeted irrigation.
- 📱 **Mobile App**:  
  - Real-time display of temperature, humidity, pressure, pH, wind speed.  
  - Navigation control of the main robot.  
  - Watering calendar + SMS confirmation system.  
  - Live video stream of robot activity.
- 💻 **Web Platform**:
  - Real-time sensor dashboard.  
  - PDF report generation.  
  - Role-based access (farmer, engineer, admin).  
  - Secure authentication.
- 🧠 **Artificial Intelligence**:  
  - Leaf analysis for disease detection .  
  - Fruit detection and count.
- ⚙️ **Embedded System**:
  - Based on **STM32F407VG** with integrated pH, temperature, wind sensors.  
  - Transmits data to the web and mobile platforms.
- 🚜 **Smart Irrigation Robot**:
  - Bluetooth-based moisture detection near plants.  
  - **Arduino Mega**-controlled water pump system.  
  - Color detection for target identification.  
  - Autonomous watering and return-to-base mechanism.

## Tech Stack  
### Frontend  
- Arduino (Mobile App)  
- React.js + Material UI (Web)  

### Backend  
- Mysql 

### Embedded  
- STM32F407VG  
- Arduino Mega  
- HC-05 / HC-06 Bluetooth modules  
- Rain sensor, gas sensor, light sensor, pH sensor, wind speed sensor 

### AI / CV  
- yolo  

### Tools & Deployment  
- GitHub  
- Live streaming: Raspberry Pi Camera module with video transmission over HTTP protocol

## Directory Structure  
- /mobile-app
- /web-platform
- /ai-module
- /embedded-system


## Getting Started  
1. Clone this repository  
2. Use the mobile app for real-time interaction and navigation  
3. Launch the AI model locally or via cloud  
4. View reports and data on the web platform  

## Acknowledgments  
Developed at Esprit School of Engineering under the supervision of Mrs. Wiem Smida, Mrs. Ghofrane Souaki, and Mr. Hazem Kalboussi, as part of the Smart Agriculture Capstone Project 2025.

Presented at **Esprit 2025**.  

Special thanks to GitHub Education for providing cloud infrastructure via **Heroku**, **DigitalOcean**, and **Namecheap**.

---

## Keywords  
- smart-agriculture  
- robotics  
- embedded-systems  
- artificial-intelligence  
- IoT  
- stm32  
- arduino  
- computer-vision  
- web-development  
- react-native  
- espoir-school-of-engineering  
