document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('prediction-form');
    const resultBox = document.getElementById('result-box');
    const predText = document.getElementById('pred-text');
    const probText = document.getElementById('prob-text');
    const statusText = document.getElementById('status-text');
    const battery3d = document.getElementById('battery3d');
    const stageContainer = document.getElementById('stage-container');

    /* =========================================================
       1. INTERACTIVE 3D MOUSE & TOUCH DRAG ROTATION
    ========================================================= */
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let currentRotation = { x: -15, y: 0 };

    // Pause CSS auto-rotation animation when dragging starts
    stageContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        battery3d.style.animation = 'none';
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        // Apply rotation deltas
        currentRotation.y += deltaX * 0.5;
        currentRotation.x -= deltaY * 0.5;

        // Clamp vertical rotation so battery doesn't flip upside down completely
        currentRotation.x = Math.max(-80, Math.min(80, currentRotation.x));

        battery3d.style.transform = `rotateX(${currentRotation.x}deg) rotateY(${currentRotation.y}deg)`;

        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            // Smoothly resume CSS keyframe orbit after 3 seconds of inactivity
            setTimeout(() => {
                if (!isDragging) {
                    battery3d.style.animation = 'orbit3d 12s linear infinite';
                }
            }, 3000);
        }
    });

    /* =========================================================
       2. FASTAPI BACKEND INTEGRATION
    ========================================================= */
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Extract and cast input fields to match Pydantic schema
        const payload = {
            battery_capacity_kwh: parseFloat(document.getElementById('battery_capacity_kwh').value),
            odometer_km: parseFloat(document.getElementById('odometer_km').value),
            vehicle_age_years: parseFloat(document.getElementById('vehicle_age_years').value),
            cycle_count: parseInt(document.getElementById('cycle_count').value, 10),
            battery_health_percent: parseFloat(document.getElementById('battery_health_percent').value),
            state_of_charge: parseFloat(document.getElementById('state_of_charge').value),
            depth_of_discharge: parseFloat(document.getElementById('depth_of_discharge').value),
            state_of_health: parseFloat(document.getElementById('state_of_health').value),
            cell_voltage_std: parseFloat(document.getElementById('cell_voltage_std').value),
            cell_temperature_max: parseFloat(document.getElementById('cell_temperature_max').value),
            internal_resistance: parseFloat(document.getElementById('internal_resistance').value),
            capacity_loss_percent: parseFloat(document.getElementById('capacity_loss_percent').value),
            charging_interruptions: parseInt(document.getElementById('charging_interruptions').value, 10),
            overcharge_events: parseInt(document.getElementById('overcharge_events').value, 10)
        };

        // Update UI state to loading
        updateStatus("Analyzing...", "#fbbf24");

        try {
            const response = await fetch('https://ev-faliure-1-auyq.onrender.com', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Server returned status code: ${response.status}`);
            }

            const data = await response.json();
            renderPredictionResults(data);

        } catch (error) {
            console.error("Prediction Request Failed:", error);
            updateStatus("Connection Error", "var(--danger)");
            alert("Could not reach FastAPI server at http://127.0.0.1:5643/predict. Make sure CORS is enabled and your server is running.");
        }
    });

    /* =========================================================
       3. UI & 3D STATE RENDERING HELPERS
    ========================================================= */
    function renderPredictionResults(data) {
        resultBox.style.display = "block";

        // Check for boolean, string "1", or integer 1 predictions
        const isFailure = (data.prediction === "1" || data.prediction === "True" || data.prediction === 1 || data.prediction === true);

        if (isFailure) {
            predText.innerText = "⚠️ CRITICAL: Failure Predicted";
            predText.style.color = "var(--danger)";
            updateStatus("Failure Hazard", "var(--danger)");
            
            // Apply red glowing failure class to 3D battery
            battery3d.classList.add('state-failure');
        } else {
            predText.innerText = "✅ Battery Operating Normally";
            predText.style.color = "var(--primary)";
            updateStatus("Optimal Health", "var(--primary)");

            // Revert 3D battery to healthy green glow
            battery3d.classList.remove('state-failure');
        }

        if (data.probability !== undefined) {
            const confidencePercent = (data.probability * 100).toFixed(1);
            probText.innerText = `Confidence Score: ${confidencePercent}%`;
        }
    }

    function updateStatus(text, color) {
        statusText.innerText = text;
        statusText.style.color = color;
    }
});
