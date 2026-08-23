// -----------------------------
// Viewport Scaling & Calibration Logic
// -----------------------------
let userScaleX = parseFloat(localStorage.getItem('calScaleX')) || 1.0;
let userScaleY = parseFloat(localStorage.getItem('calScaleY')) || 1.0;
let userTransX = parseFloat(localStorage.getItem('calTransX')) || 0;
let userTransY = parseFloat(localStorage.getItem('calTransY')) || 0;

function resizeTFT() {
    const screen = document.querySelector('.tft-screen');
    // Default base scale set to 1.0 to make it physically small (approx 2.8 inches)
    const baseScale = 1.0;
    const finalScaleX = baseScale * userScaleX;
    const finalScaleY = baseScale * userScaleY;
    screen.style.transform = `translate(${userTransX}px, ${userTransY}px) scale(${finalScaleX}, ${finalScaleY})`;
}

function calShift(x, y) {
    userTransX += x;
    userTransY += y;
    localStorage.setItem('calTransX', userTransX);
    localStorage.setItem('calTransY', userTransY);
    resizeTFT();
}

function calScale(dx, dy) {
    userScaleX += dx;
    userScaleY += dy;
    localStorage.setItem('calScaleX', userScaleX);
    localStorage.setItem('calScaleY', userScaleY);
    resizeTFT();
}

function calReset() {
    userScaleX = 1.0;
    userScaleY = 1.0;
    userTransX = 0;
    userTransY = 0;
    localStorage.removeItem('calScaleX');
    localStorage.removeItem('calScaleY');
    localStorage.removeItem('calTransX');
    localStorage.removeItem('calTransY');
    localStorage.removeItem('panelLeft');
    localStorage.removeItem('panelTop');
    const panel = document.getElementById('calibration-panel');
    if (panel) {
        panel.style.left = '50%';
        panel.style.top = 'auto';
        panel.style.bottom = '20px';
        panel.style.transform = 'translateX(-50%)';
    }
    resizeTFT();
}

window.addEventListener('resize', resizeTFT);
window.addEventListener('load', resizeTFT);

// -----------------------------
// Calibration Panel Drag Logic
// -----------------------------
window.addEventListener('load', () => {
    const panel = document.getElementById('calibration-panel');
    const handle = document.getElementById('cal-drag-handle');
    
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    // Check if there is saved position
    const savedLeft = localStorage.getItem('panelLeft');
    const savedTop = localStorage.getItem('panelTop');
    if (savedLeft && savedTop) {
        panel.style.left = savedLeft;
        panel.style.top = savedTop;
        panel.style.transform = 'none'; // Remove horizontal centering to allow free movement
    }

    function onDragStart(e) {
        isDragging = true;
        // Support touch and mouse
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;
        
        const rect = panel.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        
        panel.style.transform = 'none'; // Disconnect from centered transform
        
        e.preventDefault(); // prevent text selection
    }

    function onDragMove(e) {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        panel.style.left = (initialLeft + dx) + 'px';
        panel.style.top = (initialTop + dy) + 'px';
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        localStorage.setItem('panelLeft', panel.style.left);
        localStorage.setItem('panelTop', panel.style.top);
    }

    handle.addEventListener('mousedown', onDragStart);
    handle.addEventListener('touchstart', onDragStart, {passive: false});
    
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('touchmove', onDragMove, {passive: false});
    
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchend', onDragEnd);
});

// -----------------------------
// Custom Dropdown Logic
// -----------------------------
window.addEventListener('load', () => {
    let sel = document.getElementById("custom-lang-select");
    let selected = document.getElementById("select-selected-val");
    let items = document.getElementById("select-items-list");
    
    selected.addEventListener("click", function(e) {
        e.stopPropagation();
        items.classList.toggle("select-hide");
    });
    
    let options = items.getElementsByTagName("div");
    for (let i = 0; i < options.length; i++) {
        options[i].addEventListener("click", function(e) {
            selected.innerText = this.innerText;
            selectedLang = this.getAttribute("data-val");
            items.classList.add("select-hide");
        });
    }
    
    document.addEventListener("click", function() {
        items.classList.add("select-hide");
    });
});

// -----------------------------
// Application State & Navigation
// -----------------------------
const SCENARIOS = {
    "en": {
        "text": "Your temperature is 38.2 °C and oxygen saturation is 97%. Since you are experiencing breathing difficulty, please sit upright and stay calm. We suggest consulting a doctor immediately.",
        "cameraText": "Based on the captured image, it appears to be a mild skin rash. Please keep the area clean and apply a soothing ointment. Consult a dermatologist if it persists.",
        "langCode": "en-US"
    },
    "ta": {
        "text": "உங்களுக்கு நெஞ்சு வலி மற்றும் படபடப்பு இருப்பதாகக் கூறினீர்கள். உங்களது நாடி துடிப்பு நிமிடத்திற்கு 82 துடிப்புகளாக உள்ளது மற்றும் இதய துடிப்பு வரைபடம் சீராக உள்ளது. நெஞ்சு வலி என்பதால், தாமதிக்காமல் உடனடியாக மருத்துவரை அணுகுமாறு அறிவுறுத்துகிறோம்.",
        "cameraText": "படம் மூலம், இது ஒரு சாதாரண தோல் தடிப்பு (rash) போல் தெரிகிறது. அப்பகுதியை சுத்தமாக வைத்து, தகுந்த களிம்பு தடவவும். இது தொடர்ந்தால் தோல் மருத்துவரை அணுகவும்.",
        "langCode": "ta-IN"
    },
    "hi": {
        "text": "आपको सिरदर्द and चक्कर आने की शिकायत है। आपका तापमान 38.2 °C और नाड़ी दर 82 BPM है। कृपया आराम करें, अधिक मात्रा में तरल पदार्थ लें और जल्द से जल्द किसी डॉक्टर से परामर्श करें।",
        "cameraText": "छवि के आधार पर, यह त्वचा पर चकत्ते (rash) जैसा लगता है। कृपया क्षेत्र को साफ रखें और मरहम लगाएं। यदि यह बना रहता है तो त्वचा विशेषज्ञ से परामर्श लें।",
        "langCode": "hi-IN"
    },
    "ml": {
        "text": "നിങ്ങൾക്ക് പനിയും ജലദോഷവും ഉള്ളതായി കാണുന്നു. നിങ്ങളുടെ ശരീര താപനില 38.2 °C ആയി ഉയർന്നിരിക്കുന്നു, എങ്കിലും ഓക്സിജൻ്റെ അളവ് 97% ലും നാഡിമിടിപ്പ് 82 BPM ലും സുരക്ഷിതമാണ്. ധാരാളം വെള്ളം കുടിക്കുകയും നന്നായി വിശ്രമിക്കുകയും ചെയ്യുക. ലക്ഷണങ്ങൾ തുടരുകയാണെങ്കിൽ ദയവായി ഒരു ഡോക്ടറെ കാണുക.",
        "cameraText": "ചിത്രം അടിസ്ഥാനമാക്കി, ഇതൊരു സാധാരണ ചർമ്മ തിണർപ്പ് (rash) ആണെന്ന് തോന്നുന്നു. ദയവായി വൃത്തിയായി സൂക്ഷിക്കുകയും തൈലം പുരട്ടുകയും ചെയ്യുക. ഇത് തുടരുകയാണെങ്കിൽ ഡോക്ടറെ കാണുക.",
        "langCode": "ml-IN"
    },
    "te": {
        "text": "మీకు కడుపు నొప్పి మరియు వికారం ఉన్నట్లు తెలుస్తోంది. మీ నాడి వేగం 82 BPM మరియు ఉష్ణోగ్రత 38.2 °C స్థిరంగా ఉన్నాయి. దయచేసి వెంటనే ఒక వైద్యుడిని సంప్రదించండి.",
        "cameraText": "చిత్రం ఆధారంగా, ఇది సాధారణ చర్మపు దద్దుర్లు (rash) లాగా కనిపిస్తుంది. దయచేసి శుభ్రంగా ఉంచి లేపనం రాయండి. ఇది తగ్గకపోతే వైద్యుడిని సంప్రదించండి.",
        "langCode": "te-IN"
    }
};

let selectedLang = 'en';
let currentMode = 'recording';
let vitalsStage = 0; // 0=Init, 1=Temp, 2=SpO2, 3=ECG, 4=Done
let cameraStage = 0; // 0=Doc, 1=Skin
let mockData = { temp: '--', spo2: '--', ecg: '--', docResult: 'Skipped', diagnosis: '' };
let videoStream = null;

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function startWorkflow(mode) {
    currentMode = mode;
    mockData = { temp: '--', spo2: '--', ecg: '--', docResult: 'Skipped', diagnosis: '' };
    
    vitalsStage = 0;
    showVitalsScreen();
}

// --- VITALS WORKFLOW ---
function showVitalsScreen() {
    showScreen('screen-vitals');
    let title = document.getElementById('vitals-title');
    let content = document.getElementById('vitals-content');
    let status = document.getElementById('vitals-status');
    let btn = document.getElementById('vitals-btn');
    
    btn.style.display = 'none';
    
    if (vitalsStage === 0) {
        title.innerText = "INITIALIZING SYSTEM";
        title.style.color = "#00e5ff";
        status.innerText = "Initializing healthcare assessment...";
        
        let checks = ['Display', 'Speaker', 'Microphone', 'Camera', 'Sensors'];
        let html = '';
        checks.forEach(c => {
            html += `<div class="check-row"><div class="check-icon">●</div><div class="check-text">${c} module</div></div>`;
        });
        content.innerHTML = `<div class="tk-card">${html}</div>`;
        
        // Simulate checking
        let rows = content.querySelectorAll('.check-icon');
        let idx = 0;
        let intv = setInterval(() => {
            if(idx < rows.length) {
                rows[idx].innerText = '✓';
                rows[idx].classList.add('done');
                idx++;
            } else {
                clearInterval(intv);
                status.innerText = "All systems ready.";
                btn.innerText = "CONTINUE";
                btn.style.display = 'block';
            }
        }, 800);
        
    } else if (vitalsStage === 1) {
        title.innerText = "TEMPERATURE SENSOR";
        title.style.color = "#FF9100";
        status.innerText = "Place finger on Temp sensor.";
        content.innerHTML = `
            <div class="tk-card">
                <p style="font-size:11px;color:#aaa;text-align:center;margin-bottom:15px;">Please place your finger on the MLX90614 Temperature Sensor to begin reading.</p>
                <div class="vital-card" style="width:100%;">
                    <div class="vital-title">Temp</div>
                    <div class="vital-bar"><div class="fill temp" id="temp-fill"></div></div>
                    <div class="vital-val" id="temp-val">--°C</div>
                </div>
            </div>`;
        btn.innerText = "CHECK";
        btn.style.display = 'block';
        
    } else if (vitalsStage === 2) {
        title.innerText = "SpO2 / PULSE SENSOR";
        title.style.color = "#00E676";
        status.innerText = "Place finger on SpO2 sensor.";
        content.innerHTML = `
            <div class="tk-card">
                <p style="font-size:11px;color:#aaa;text-align:center;margin-bottom:15px;">Please place your finger on the MAX30102 Oximeter Sensor.</p>
                <div class="vital-card" style="width:100%;">
                    <div class="vital-title">SpO2</div>
                    <div class="vital-bar"><div class="fill spo2" id="spo2-fill"></div></div>
                    <div class="vital-val" id="spo2-val">--%</div>
                </div>
            </div>`;
        btn.innerText = "CHECK";
        btn.style.display = 'block';
        
    } else if (vitalsStage === 3) {
        title.innerText = "ECG SENSOR";
        title.style.color = "#FF1744";
        status.innerText = "Hold ECG electrodes.";
        content.innerHTML = `
            <div class="tk-card">
                <p style="font-size:11px;color:#aaa;text-align:center;margin-bottom:10px;">Please hold the AD8232 ECG electrodes.</p>
                <div class="ecg-box" id="ecg-box"></div>
                <div style="font-size:16px; font-weight:bold; color:#FF1744; margin-top:10px;" id="ecg-val">-- BPM</div>
            </div>`;
        btn.innerText = "CHECK";
        btn.style.display = 'block';
        
    } else if (vitalsStage === 4) {
        title.innerText = "VITALS CAPTURED";
        title.style.color = "#ffffff";
        status.innerText = "Ready for next step.";
        content.innerHTML = `
            <div class="tk-card">
                <div class="result-row" style="width:100%"><span>Temp:</span><strong style="color:#ff9100">${mockData.temp} °C</strong></div>
                <div class="result-row" style="width:100%"><span>SpO2:</span><strong style="color:#00e676">${mockData.spo2} %</strong></div>
                <div class="result-row" style="width:100%; border:none;"><span>ECG:</span><strong style="color:#ff1744">${mockData.ecg} BPM</strong></div>
            </div>`;
        btn.innerText = "CONTINUE";
        btn.style.display = 'block';
    }
}

function vitalsNext() {
    if (vitalsStage === 0) {
        vitalsStage++; showVitalsScreen();
    } else if (vitalsStage === 1) {
        let btn = document.getElementById('vitals-btn');
        if (btn.innerText === "CHECK") {
            btn.style.display = 'none';
            document.getElementById('vitals-status').innerText = "Measuring Temperature...";
            document.getElementById('temp-fill').style.width = '100%';
            setTimeout(() => {
                mockData.temp = 38.2;
                document.getElementById('temp-val').innerText = mockData.temp + ' °C';
                document.getElementById('vitals-status').innerText = "Measurement complete.";
                btn.innerText = "NEXT"; btn.style.display = 'block';
            }, 3000);
        } else {
            vitalsStage++; showVitalsScreen();
        }
    } else if (vitalsStage === 2) {
        let btn = document.getElementById('vitals-btn');
        if (btn.innerText === "CHECK") {
            btn.style.display = 'none';
            document.getElementById('vitals-status').innerText = "Measuring SpO2...";
            document.getElementById('spo2-fill').style.width = '100%';
            setTimeout(() => {
                mockData.spo2 = 97;
                document.getElementById('spo2-val').innerText = mockData.spo2 + ' %';
                document.getElementById('vitals-status').innerText = "Measurement complete.";
                btn.innerText = "NEXT"; btn.style.display = 'block';
            }, 3000);
        } else {
            vitalsStage++; showVitalsScreen();
        }
    } else if (vitalsStage === 3) {
        let btn = document.getElementById('vitals-btn');
        if (btn.innerText === "CHECK") {
            btn.style.display = 'none';
            document.getElementById('vitals-status').innerText = "Reading ECG...";
            
            // Animate ECG line
            let box = document.getElementById('ecg-box');
            let line = document.createElement('div');
            line.className = 'ecg-line';
            box.appendChild(line);
            
            // Simulate moving line using CSS animation
            line.style.animation = 'move-bg 1s infinite linear';
            
            setTimeout(() => {
                mockData.ecg = 82;
                document.getElementById('ecg-val').innerText = mockData.ecg + ' BPM';
                document.getElementById('vitals-status').innerText = "ECG complete.";
                btn.innerText = "NEXT"; btn.style.display = 'block';
            }, 3000);
        } else {
            vitalsStage++; showVitalsScreen();
        }
    } else if (vitalsStage === 4) {
        if (currentMode === 'recording') {
            startVoiceScreen();
        } else {
            cameraStage = 0;
            showCameraScreen();
        }
    }
}

// --- CAMERA WORKFLOW ---
function showCameraScreen() {
    showScreen('screen-camera');
    let title = document.getElementById('camera-title');
    let capBtn = document.getElementById('cam-capture-btn');
    let skipBtn = document.getElementById('cam-skip-btn');
    let overlay = document.getElementById('camera-overlay');
    
    overlay.classList.add('hidden');
    capBtn.disabled = false; skipBtn.disabled = false;
    capBtn.style.backgroundColor = '#FF1744';
    
    if (cameraStage === 0) {
        title.innerText = "X-RAY / LAB REPORT CAPTURE";
        title.style.color = "#00D2FC";
        capBtn.innerText = "📷 CAPTURE DOC";
    } else {
        title.innerText = "SKIN ISSUE CAPTURE";
        title.style.color = "#FF9100";
        capBtn.innerText = "📷 CAPTURE ISSUE";
    }
    
    // Start Webcam (Back Camera)
    if (!videoStream && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
            videoStream = stream;
            let videoElement = document.getElementById('live-camera');
            if (videoElement) {
                videoElement.srcObject = stream;
            }
        }).catch(function(err) {
            console.error("Camera error:", err);
        });
    }
}

function cameraCapture() {
    let capBtn = document.getElementById('cam-capture-btn');
    let skipBtn = document.getElementById('cam-skip-btn');
    let overlay = document.getElementById('camera-overlay');
    let otxt = document.getElementById('camera-overlay-text');
    
    capBtn.disabled = true; skipBtn.disabled = true;
    capBtn.style.backgroundColor = '#555';
    overlay.classList.remove('hidden');
    otxt.innerText = "Image Captured!\n\nAnalyzing...\n2 seconds remaining";
    
    setTimeout(() => otxt.innerText = "Image Captured!\n\nAnalyzing...\n1 seconds remaining", 1000);
    
    setTimeout(() => {
        otxt.innerText = "Analysis Complete!\nGenerating Diagnosis...";
        if(cameraStage === 0) mockData.docResult = "X-Ray Analyzed";
        
        setTimeout(() => {
            if (cameraStage === 0) {
                cameraStage++; showCameraScreen();
            } else {
                stopCamera();
                startVoiceScreen();
            }
        }, 1500);
    }, 2000);
}

function cameraSkip() {
    if (cameraStage === 0) {
        cameraStage++; showCameraScreen();
    } else {
        stopCamera();
        startVoiceScreen();
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

// --- VOICE WORKFLOW ---
function startVoiceScreen() {
    showScreen('screen-voice');
    let title = document.getElementById('voice-title');
    let status = document.getElementById('voice-status');
    let sub = document.getElementById('voice-sub');
    let mic = document.getElementById('mic-icon');
    
    // Init state (0s - 7s)
    title.innerText = "VOICE RECORDING";
    title.style.color = "#00E676";
    status.innerText = "Listening...";
    status.style.color = "#00E676";
    sub.innerText = "Please describe your symptoms";
    mic.style.color = "#00E676";
    mic.className = "mic-icon pulse";
    
    // Processing state (7s)
    setTimeout(() => {
        title.innerText = "PROCESSING";
        status.innerText = "Initializing ASR...";
        status.style.color = "#FF9100";
        sub.innerText = "Please wait";
        mic.style.color = "#FF9100";
        mic.className = "mic-icon"; // Stop pulsing
    }, 7000);

    // NMT Processing (10s)
    setTimeout(() => {
        status.innerText = "NMT Processing...";
    }, 10000);

    // TTS Providing Answer (13s)
    setTimeout(() => {
        status.innerText = "TTS Providing Answer...";
    }, 13000);
    
    // Output (16s)
    setTimeout(() => {
        // Play pre-recorded WAV audio for Assistant Response
        let audioSrc = 'audio/' + selectedLang + '/response.wav';
        let audio = new Audio(audioSrc);
        audio.play().catch(e => console.error("Audio play failed: ", e));
        
        showResultScreen();
    }, 16000);
}

// --- RESULT WORKFLOW ---
function showResultScreen() {
    document.getElementById('res-temp').innerText = mockData.temp + ' °C';
    document.getElementById('res-spo2').innerText = mockData.spo2 + ' %';
    document.getElementById('res-ecg').innerText = mockData.ecg + ' BPM';
    document.getElementById('res-doc').innerText = mockData.docResult;
    
    let diag = "Based on the assessment, the patient's vitals are generally stable.";
    let scenario = SCENARIOS[selectedLang];
    if (scenario) {
        if (currentMode === 'camera' && scenario.cameraText) {
            diag = scenario.cameraText;
        } else {
            diag = scenario.text;
        }
    }
    document.getElementById('res-diagnosis').innerText = diag;
    
    // Populate the print layout elements
    document.getElementById('print-temp').innerText = mockData.temp + ' °C';
    document.getElementById('print-spo2').innerText = mockData.spo2 + ' %';
    document.getElementById('print-ecg').innerText = mockData.ecg + ' BPM';
    document.getElementById('print-doc').innerText = mockData.docResult;
    document.getElementById('print-diag').innerText = diag;
    
    showScreen('screen-result');
}

function playResultAudio() {
    let audioSrc = 'audio/' + selectedLang + '/response.wav';
    let audio = new Audio(audioSrc);
    audio.play().catch(e => console.error("Audio play failed: ", e));
}

function resetApp() {
    showScreen('screen-main');
}
