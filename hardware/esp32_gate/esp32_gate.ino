#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>

// ---------------------------
// Configuration Configuration
// ---------------------------
// Replace with your WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker settings (using a free public broker for simplicity)
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

// The topic our backend will publish to
const char* mqtt_topic = "smartpark/door/12345/control";

// Hardware pins
const int servoPin = 18; // Data wire connects to GPIO 18 (D18)

// ---------------------------
// Globals
// ---------------------------
WiFiClient espClient;
PubSubClient client(espClient);
Servo gateServo;

// Setup WiFi connection
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

// Handle incoming MQTT messages
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  // If the message contains "open_gate", we actuate the servo
  if (message.indexOf("open_gate") >= 0) {
    Serial.println("Action received! Opening gate...");
    
    // Open gate (turn servo to 90 degrees)
    gateServo.write(90);
    
    // You can parse duration from JSON, but we'll default to 5 seconds
    delay(5000); 
    
    // Close gate (return servo to 0 degrees)
    Serial.println("Closing gate...");
    gateServo.write(0);
  }
}

// Auto-reconnect to MQTT if connection drops
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Create a random client ID
    String clientId = "ESP32GateClient-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Subscribe to our topic
      client.subscribe(mqtt_topic);
      Serial.print("Subscribed to topic: ");
      Serial.println(mqtt_topic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  // Attach the servo motor and set initial position to 0 (Closed)
  gateServo.attach(servoPin);
  gateServo.write(0);

  // Connect networking
  setup_wifi();
  
  // Setup MQTT server configuration
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    setup_wifi();
  }
  
  // Check MQTT connection
  if (!client.connected()) {
    reconnect();
  }
  
  // Keep the MQTT client alive and listening for messages
  client.loop();
}
