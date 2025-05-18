#include <WiFi.h>
#include <HTTPClient.h>
#include <HardwareSerial.h>

HardwareSerial SerialPort(2); // UART2 (RX:16, TX:17)

// WiFi Credentials
const char* ssid = "HUAWEI Y9 Prime 2019";
const char* password = "aaaaaaaaaaaaa";


// Server URL
const char* serverURL = "http://192.168.43.64/insert_data.php";

// Sensor variables with all required fields
int mq2 = 0;          // gas sensor
int rain = 0;         // pluit
int windspeed = 0;    // wind
float soilPH = 0.0;   // PH
float temperature = 0.0;
float humidity = 0.0;
int moisture = 0;
int bh1750 = 0;       // light sensor
int farm_id = 26;      // default farm ID

unsigned long lastDataTime = 0;
const unsigned long dataTimeout = 1000; // 1s to collect all data

void setup() {
  Serial.begin(115200);
  SerialPort.begin(115200, SERIAL_8N1, 16, 17);
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
}

void loop() {
  if (SerialPort.available()) {
    String data = SerialPort.readStringUntil('\n');
    data.trim();
    Serial.println("Received: " + data);

    // Parse all possible sensor data
    if (data.startsWith("Gaz:")) {
      mq2 = data.substring(4).toInt();
      lastDataTime = millis();
    } 
    else if (data.startsWith("Pluit:")) {
      rain = data.substring(6).toInt();
      lastDataTime = millis();
    }
    else if (data.startsWith("wind:")) {
      windspeed = data.substring(5).toInt();
      lastDataTime = millis();
    }
    else if (data.startsWith("PH:")) {
      soilPH = data.substring(3).toFloat();
      lastDataTime = millis();
    }
    else if (data.startsWith("Temp:")) {
      temperature = data.substring(5).toFloat();
      lastDataTime = millis();
    }
    else if (data.startsWith("Humidity:")) {
      humidity = data.substring(9).toFloat();
      lastDataTime = millis();
    }
    else if (data.startsWith("Moisture:")) {
      moisture = data.substring(9).toInt();
      lastDataTime = millis();
    }
    else if (data.startsWith("Light:")) {
      bh1750 = data.substring(6).toInt();
      lastDataTime = millis();
    }
    else if (data.startsWith("FarmID:")) {
      farm_id = data.substring(7).toInt();
      lastDataTime = millis();
    }

    // Check if we have complete data (at least some basic data)
    if (millis() - lastDataTime < dataTimeout && 
        (mq2 >= 0 || rain >= 0 || windspeed >= 0 || soilPH >= 0)) {
      sendToMySQL();
      // Reset after sending (only reset values that were actually received)
      mq2 = -1; rain = -1; windspeed = -1; soilPH = -1.0;
      temperature = -1.0; humidity = -1.0; moisture = -1; bh1750 = -1;
    }
  }
}

void sendToMySQL() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected!");
    return;
  }

  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  // Build POST data with all possible fields
  String postData = "mq2=" + String(mq2 > 0 ? mq2 : 0) 
                  + "&rain=" + String(rain > 0 ? rain : 0)
                  + "&windspeed=" + String(windspeed > 0 ? windspeed : 0)
                  + "&soilPH=" + String(soilPH > 0 ? soilPH : 0, 2)
                  + "&temperature=" + String(temperature > 0 ? temperature : 0, 1)
                  + "&humidity=" + String(humidity > 0 ? humidity : 0, 1)
                  + "&moisture=" + String(moisture > 0 ? moisture : 0)
                  + "&bh1750=" + String(bh1750 > 0 ? bh1750 : 0)
                  + "&farm_id=" + String(farm_id);

  Serial.println("Sending: " + postData);
  
  int httpCode = http.POST(postData);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.println("Response: " + response);
  } else {
    Serial.println("Error code: " + String(httpCode));
  }
  http.end();
}
