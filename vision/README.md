# SmartPark Vision Module

Two Python scripts for camera-based features.

---

## 1. Movement Detector (`move_detector.py`)

Detects **vehicles and persons** in real-time using **YOLOv8** + OpenCV.

### Setup
```bash
pip install -r vision/requirements.txt
```

> **First run** downloads `yolov8n.pt` (~6 MB) automatically.

### Usage
```bash
# Auto-detect best camera (prefers USB phone camera)
python vision/move_detector.py

# Force a specific camera index (0 = built-in, 1 = USB/phone)
python vision/move_detector.py --source 1

# Use an IP camera / RTSP stream
python vision/move_detector.py --source rtsp://192.168.1.10:8080/video
```

### Phone as USB Webcam (Windows)
1. Install **DroidCam** on Android or **EpocCam** on iPhone
2. Open the app → select **USB** mode
3. Run `python vision/move_detector.py --source 1`

---

## 2. Python QR Scanner (`qr_scanner.py`)

Scans **SmartPark booking QR codes**, calls the backend API for check-in / check-out, and displays the driver's name, vehicle, slot, and bill on screen.

### Extra setup
> `pyzbar` is already installed. No extra steps needed.

### Auth token (one-time)
1. Go to `http://localhost:3000/host` and log in as a Host
2. Open **DevTools → Application → Local Storage → localhost:3000**
3. Copy the value of `token`
4. Open `backend/.env` and paste it:
   ```
   HOST_AUTH_TOKEN=eyJhbGci...
   ```

### Usage
```bash
# Auto-detect best camera
python vision/qr_scanner.py

# Specific camera index
python vision/qr_scanner.py --source 1
```

### What happens when you scan
- **Green overlay** = Check-in / Check-out successful + person details
- **Red overlay** = Error message
- Hold the same QR code again after 5 seconds to rescan (cooldown)
