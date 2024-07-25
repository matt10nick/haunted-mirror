const byte numChars = 128;
char receivedChars[numChars];

const float minTriggerDistance = 1;
const float maxTriggerDistance = 100; 


boolean newData = false;

const int ledPin = LED_BUILTIN;
const int buttonPin = 2;  // the number of the pushbutton pin
const int trigPin = 9;  
const int echoPin = 10; 

unsigned long signalDelay = 200000;

int buttonState = 0;  // variable for reading the pushbutton status
bool pressSent = false; 
bool handShake = false;  





void setup() {
      
    pinMode(LED_BUILTIN, OUTPUT);
    pinMode(buttonPin, INPUT);
   	pinMode(trigPin, OUTPUT);  
  	pinMode(echoPin, INPUT);  

    Serial.begin(9600);
    Serial.println("<Arduino is ready>");
}

void loop() {
    
    float distance = 0; 

    
    recvWithStartEndMarkers();
    showNewData();

    distance = getDistance();
    checkDistance(distance);

    listenForButton();

}


bool checkDistance(float distance) {

  bool inRange = false;

  if ((distance >= minTriggerDistance) && (distance <= maxTriggerDistance)) {
    inRange = true;
    Serial.println("Trigger Startle");
  }


  return inRange; 

}


float getDistance() {
  unsigned long duration;
  float distance;

  digitalWrite(trigPin, LOW);  
  delayMicroseconds(2);  
  digitalWrite(trigPin, HIGH);  
  delayMicroseconds(10);  
  digitalWrite(trigPin, LOW);
  
  duration = pulseIn(echoPin, HIGH, signalDelay); 
  distance = (duration*.0343)/2;  

  return distance; 

}


void listenForButton() {
  
  buttonState = digitalRead(buttonPin);
  // check if the pushbutton is pressed. If it is, the buttonState is HIGH:
  if (buttonState == HIGH) {
    // turn LED on:
    digitalWrite(ledPin, HIGH);
    pressSent = sendOnce(pressSent);
  } else {
    // turn LED off:
    digitalWrite(ledPin, LOW);
    pressSent = false;
  }
}


bool sendOnce(bool hasBeenSent) {

  if (!hasBeenSent) {
    Serial.println("Sending an event");
  }
  return true; 
}


void recvWithStartEndMarkers() {
    static boolean recvInProgress = false;
    static byte ndx = 0;
    char startMarker = '<';
    char endMarker = '>';
    char rc;
 
    while (Serial.available() > 0 && newData == false) {
        rc = Serial.read();

        if (recvInProgress == true) {
            if (rc != endMarker) {
                receivedChars[ndx] = rc;
                ndx++;
                if (ndx >= numChars) {
                    ndx = numChars - 1;
                }
            }
            else {
                receivedChars[ndx] = '\0'; // terminate the string
                recvInProgress = false;
                ndx = 0;
                newData = true;
            }
        }

        else if (rc == startMarker) {
            recvInProgress = true;
        }
    }
}

void processData() {
    if (newData == true) {
        Serial.print("This just in ... ");
        Serial.println(receivedChars);
        newData = false;
    }
}

void showNewData() {
    if (newData == true) {
        if (strcmp (receivedChars, 'Hi, I am a computer!')) {          
          Serial.println("Hi, I'm an Arduino");
        } else {
          Serial.print("This just in ... ");
          Serial.println(receivedChars);
        }
        newData = false;
    }
}