/**
 * SmartPark - ESP32 Gate Controller
 * ------------------------------------
 * Hardware : ESP32 Dev Module + Servo Motor
 * Libraries: PubSubClient, ESP32Servo, ArduinoJson
 *
 * How to install libraries (Arduino IDE -> Sketch -> Manage Libraries):
 *   1. PubSubClient   by Nick O'Leary
 *   2. ESP32Servo     by Kevin Harrington
 *   3. ArduinoJson    by Benoit Blanchon
 *
 * Board    : "ESP32 Dev Module"
 *
 * Behaviour:
 *   - Connects to WiFi and HiveMQ MQTT broker
 *   - Subscribes to "smartpark/gate/control"
 *   - On  {"action":"open_gate","duration":5000}
 *       -> Servo opens (90 deg) for [duration] ms -> closes (0 deg)
 *   - Built-in LED (GPIO 2) blinks while gate is open
 *   - Non-blocking reconnect for both WiFi and MQTT
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

// --------------------------------------------------
// WiFi Credentials
// --------------------------------------------------c
const char* ssid     = "Ganesh";
const char* password = "123456789";

// --------------------------------------------------
// MQTT (must match backend .env MQTT_TOPIC)
// --------------------------------------------------
const char* mqtt_server = "broker.hivemq.com";
const int   mqtt_port   = 1883;
const char* mqtt_topic  = "smartpark/gate/control";

// --------------------------------------------------
// Hardware pins
// --------------------------------------------------
const int SERVO_PIN    = 22;   // GPIO22 - servo signal wire
const int LED_PIN      = 2;    // GPIO2  - built-in LED

const int SERVO_OPEN   = 90;   // servo angle when gate is OPEN
const int SERVO_CLOSED = 0;    // servo angle when gate is CLOSED

// --------------------------------------------------
// Globals
// --------------------------------------------------
WiFiClient   espClient;
PubSubClient mqttClient(espClient);
Servo        gateServo;

// --------------------------------------------------
// WiFi: connect (blocking until up)
// --------------------------------------------------
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.printf("\n[WiFi] Connecting to '%s'", ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n[WiFi] Connected - IP: %s\n", WiFi.localIP().toString().c_str());
}

// --------------------------------------------------
// MQTT: single connect attempt (non-blocking)
// --------------------------------------------------
void connectMQTT() {
  String clientId = "SmartPark-";
  clientId += String((uint32_t)ESP.getEfuseMac(), HEX);

  Serial.printf("[MQTT] Connecting as %s ... ", clientId.c_str());
  if (mqttClient.connect(clientId.c_str())) {
    Serial.println("OK");
    mqttClient.subscribe(mqtt_topic);
    Serial.printf("[MQTT] Subscribed to: %s\n", mqtt_topic);
  } else {
    Serial.printf("FAILED rc=%d\n", mqttClient.state());
  }
}

// --------------------------------------------------
// Gate: open servo for durationMs, then close
// --------------------------------------------------
void openGate(int durationMs) {
  Serial.printf("[GATE] Opening for %d ms\n", durationMs);
  gateServo.write(SERVO_OPEN);

  unsigned long start = millis();
  while (millis() - start < (unsigned long)durationMs) {
    // Blink LED every 300 ms while gate is open
    digitalWrite(LED_PIN, (millis() / 300) % 2);
    mqttClient.loop();          // keep MQTT alive during the wait
    delay(50);
  }

  gateServo.write(SERVO_CLOSED);
  digitalWrite(LED_PIN, LOW);
  Serial.println("[GATE] Closed.");
}

// --------------------------------------------------
// MQTT message callback
// --------------------------------------------------
void onMessage(char* topic, byte* payload, unsigned int length) {
  String raw;
  for (unsigned int i = 0; i < length; i++) raw += (char)payload[i];
  Serial.printf("[MQTT] <- [%s] %s\n", topic, raw.c_str());

  // Parse JSON:  { "action": "open_gate", "duration": 5000 }
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, raw);
  if (err) {
    Serial.printf("[MQTT] JSON error: %s\n", err.c_str());
    return;
  }

  const char* action = doc["action"] | "";
  int duration       = doc["duration"] | 5000;   // default 5 s

  if (strcmp(action, "open_gate") == 0) {
    openGate(duration);
  } else {
    Serial.printf("[MQTT] Unknown action: %s\n", action);
  }
}

// --------------------------------------------------
// setup()
// --------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Essential for ESP32Servo
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  gateServo.setPeriodHertz(50); // Standard 50Hz servo

  gateServo.attach(SERVO_PIN, 500, 2400); // using standard microsecond range
  gateServo.write(SERVO_CLOSED);
  Serial.println("[SERVO] Attached - gate CLOSED.");

  connectWiFi();

  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(onMessage);
  mqttClient.setKeepAlive(60);
  mqttClient.setBufferSize(512);
  connectMQTT();
}

// --------------------------------------------------
// loop()
// --------------------------------------------------
void loop() {
  // Re-connect WiFi if dropped
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Lost - reconnecting...");
    connectWiFi();
  }

  // Re-connect MQTT if dropped (retry every 5 s)
  if (!mqttClient.connected()) {
    static unsigned long lastRetry = 0;
    if (millis() - lastRetry > 5000) {
      lastRetry = millis();
      connectMQTT();
    }
  }

  mqttClient.loop();
}
