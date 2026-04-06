import cv2
import argparse
import time
import sys
import threading
import requests
import numpy as np
from datetime import datetime
from ultralytics import YOLO
from flask import Flask, Response, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global variables for cross-thread access
current_frame = None
latest_occupancy = []
lock = threading.Lock()

TARGET_CLASSES = {
    0:  ("Person",       (0,   200, 100)),   # green
    2:  ("Car",          (255, 100, 0  )),   # orange
    3:  ("Motorcycle",   (255, 200, 0  )),   # yellow
    5:  ("Bus",          (200, 0,   255)),   # purple
    7:  ("Truck",        (0,   100, 255)),   # blue
}
VEHICLE_CLASSES = [2, 3, 5, 7]

CONF_THRESHOLD = 0.45

# Hardcoded demo slots: A1 (left), A2 (right)
PARKING_SLOTS = [
    {"id": "A1", "bbox": [50, 100, 300, 400]},   # [x1, y1, x2, y2]
    {"id": "A2", "bbox": [340, 100, 590, 400]}
]

def check_intersection(boxA, boxB):
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)
    if interArea == 0:
        return 0.0

    boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1)
    
    ratio = interArea / float(boxBArea)
    return ratio

def draw_detection(frame, box, label, color):
    x1, y1, x2, y2 = map(int, box.xyxy[0])
    cv2.rectangle(frame, (x1, y1 - 22), (x2, y1), color, -1)
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    cv2.putText(frame, label, (x1 + 4, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 1, cv2.LINE_AA)

def send_update_to_backend(api_url, space_id, occupancy_status):
    url = f"{api_url}/{space_id}/live-status"
    try:
        response = requests.put(url, json={"occupancy": occupancy_status})
        if response.status_code != 200:
             print(f"Failed to update backend: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error sending update to backend: {e}")

def capture_loop(camera_source, model_path, api_url, space_id):
    try:
        _capture_loop_impl(camera_source, model_path, api_url, space_id)
    except Exception as e:
        print(f"CRITICAL ERROR in capture_loop: {e}", flush=True)
        import traceback
        traceback.print_exc(file=sys.stdout)
        sys.stdout.flush()

def _capture_loop_impl(camera_source, model_path, api_url, space_id):
    global current_frame, latest_occupancy
    model = YOLO(model_path)
    
    def open_camera(source):
        # Try DSHOW for Windows camera index
        backend = cv2.CAP_DSHOW if str(source).isdigit() else cv2.CAP_ANY
        cap = cv2.VideoCapture(int(source) if str(source).isdigit() else source, backend)
        if cap.isOpened():
            ret, _ = cap.read()
            if ret:
                return cap
            cap.release()
        return None

    cap = open_camera(camera_source)
    if cap is None:
        print(f"Warning: Could not open camera source {camera_source}. Searching for other cameras...", flush=True)
        sys.stdout.flush()
        for i in range(5):
            if str(i) == str(camera_source): continue
            cap = open_camera(i)
            if cap:
                print(f"Successfully found and opened camera at index {i}", flush=True)
                sys.stdout.flush()
                break
    
    if cap is None:
        fallback_path = r"c:\Users\ganesh\Downloads\smart_park-main\vision\sample.mp4"
        print(f"Error: No cameras found. Try fallback to {fallback_path}", flush=True)
        sys.stdout.flush()
        cap = cv2.VideoCapture(fallback_path)
        if not cap.isOpened():
            print(f"Error: Could not open {fallback_path} either.", flush=True)
            sys.stdout.flush()
            return
    else:
        if 'i' in locals() and cap:
            print(f"Using camera index {i}", flush=True)
        else:
            print(f"Using camera source {camera_source}", flush=True)
        sys.stdout.flush()
        
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    cap.set(cv2.CAP_PROP_FPS, 30)

    last_update_time = time.time()
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Warning: Failed to read frame from camera.", flush=True)
            time.sleep(0.1)
            continue
        
        # print(f"Debug: Frame captured successfully at {datetime.now().strftime('%H:%M:%S')}", flush=True)
            
        results = model(frame, verbose=False, conf=CONF_THRESHOLD)[0]
        
        occupancy_map = {slot["id"]: False for slot in PARKING_SLOTS}
        
        vehicle_boxes = []
        for box in results.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            if cls not in TARGET_CLASSES:
                continue
                
            name, color = TARGET_CLASSES[cls]
            label = f"{name} {conf:.0%}"
            draw_detection(frame, box, label, color)
            
            if cls in VEHICLE_CLASSES:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                vehicle_boxes.append([x1, y1, x2, y2])
        
        for slot in PARKING_SLOTS:
            slot_box = slot["bbox"]
            color = (0, 255, 0)
            
            for v_box in vehicle_boxes:
                ratio = check_intersection(slot_box, v_box)
                if ratio > 0.3:
                    occupancy_map[slot["id"]] = True
                    break
                    
            if occupancy_map[slot["id"]]:
                color = (0, 0, 255)
                
            cv2.rectangle(frame, (slot_box[0], slot_box[1]), (slot_box[2], slot_box[3]), color, 2)
            cv2.putText(frame, f"Slot {slot['id']} - {'Occupied' if occupancy_map[slot['id']] else 'Free'}", 
                        (slot_box[0], slot_box[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                        
        occupancy_report = [{"slotId": k, "isOccupied": v} for k, v in occupancy_map.items()]
        
        with lock:
            current_frame = frame.copy()
            latest_occupancy = occupancy_report
            
        if time.time() - last_update_time > 3.0:
            if space_id:
                # Poll backend to check if camera was disabled by the host
                try:
                    resp = requests.get(f"{api_url}/{space_id}")
                    if resp.status_code == 200:
                        space_data = resp.json().get("space", {})
                        if not space_data.get("liveStatus", {}).get("isCameraActive", True):
                            print("Camera disabled from dashboard. Stopping monitor...")
                            break
                except Exception as e:
                    pass
                
                threading.Thread(target=send_update_to_backend, args=(api_url, space_id, occupancy_report)).start()
            
            last_update_time = time.time()
            
    cap.release()
    with lock:
        current_frame = None
            

def generate_frames():
    global current_frame
    while True:
        with lock:
            if current_frame is None:
                # Create a blank image with 'Camera Offline' text
                blank = np.zeros((480, 640, 3), dtype=np.uint8)
                msg = f"Camera Offline. Waiting for Host... [{datetime.now().strftime('%H:%M:%S')}]"
                cv2.putText(blank, msg, (10, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                frame = blank
            else:
                frame = current_frame.copy()
            
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
               
        time.sleep(0.05)

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    
@app.route('/status')
def status():
    with lock:
        return jsonify({"occupancy": latest_occupancy})

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="SmartPark Real-Time Monitor")
    parser.add_argument("--source", default="0", help="Camera index or stream URL")
    parser.add_argument("--model", default="yolov8n.pt", help="YOLO model path")
    parser.add_argument("--api_url", default="http://localhost:5000/api/spaces", help="Backend API URL for spaces")
    parser.add_argument("--space_id", default=None, help="The Mongo ID of the Space being monitored")
    parser.add_argument("--port", type=int, default=5001, help="Port to run Flask server on")
    args = parser.parse_args()
    
    capture_thread = threading.Thread(target=capture_loop, args=(args.source, args.model, args.api_url, args.space_id), daemon=True)
    capture_thread.start()
    
    print(f"Starting Flask server on port {args.port}...")
    app.run(host='0.0.0.0', port=args.port, debug=False, use_reloader=False)
