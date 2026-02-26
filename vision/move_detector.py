import cv2
from ultralytics import YOLO
import time

def main():
    # Load YOLOv8-tiny model
    print("Loading ML model (YOLOv8-tiny)...")
    model = YOLO('yolov8n.pt')  # Downloads automatically if not present

    # Open camera (0 is usually default webcam / phone connected as webcam)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open camera. Please ensure your phone is connected as a webcam.")
        return

    print("--- SmartPark Movement Detection ---")
    print("Press 'q' to quit.")

    # Detection threshold
    CONF_THRESHOLD = 0.5
    
    # Target classes: person, car, motorcycle, bus, truck (COCO class indices)
    TARGET_CLASSES = [0, 2, 3, 5, 7]

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Run inference
        results = model(frame, verbose=False)[0]

        # Process results
        for box in results.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            
            if conf > CONF_THRESHOLD and cls in TARGET_CLASSES:
                # Get coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                label = f"{model.names[cls]} {conf:.2f}"
                
                # Draw bounding box
                color = (0, 255, 0) # Green for detections
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                
                # Logic: If movement/object detected, we could send a notification or log it
                # For now, we'll just log it to the console
                # print(f"Detected: {model.names[cls]} at {time.strftime('%H:%M:%S')}")

        # Display the frame
        cv2.imshow('SmartPark - Movement Detection', frame)

        # Break on 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
