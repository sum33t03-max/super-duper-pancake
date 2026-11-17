// --- Global Telemetry State ---
    let timer = null;
    let packetCount = 0;
    let altitude = 750.0;
    let latitude = 22.3072;
    let longitude = 73.1812;
    let telemetryDataLog = [];
    let cameraStream = null;

    // --- Initialize Leaflet GPS Map ---
    const map = L.map('map').setView([latitude, longitude], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    const marker = L.marker([latitude, longitude]).addTo(map).bindPopup('CanSat Payload').openPopup();
    const pathPolyline = L.polyline([], { color: '#38bdf8', weight: 3 }).addTo(map);

    // --- Initialize Chart.js Graphs ---
    function createChart(id, label, color) {
      return new Chart(document.getElementById(id), {
        type: 'line',
        data: { labels: [], datasets: [{ label: label, data: [], borderColor: color, tension: 0.2, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#e2e8f0' } } }, scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } } }
      });
    }

    const altChart = createChart('altitudeChart', 'Altitude (m)', '#38bdf8');
    const presChart = createChart('pressureChart', 'Pressure (hPa)', '#22c55e');
    const descChart = createChart('descentChart', 'Descent Rate (m/s)', '#eab308');
    const voltChart = createChart('voltageChart', 'Battery Voltage (V)', '#ef4444');

    // --- Telemetry Generator Loop ---
    function updateTelemetry() {
      packetCount++;
      altitude = Math.max(0, altitude - (8.5 + (Math.random() - 0.5)));
      const pressure = 1013.25 * Math.pow((1 - 2.25577e-5 * altitude), 5.25588);
      const descentRate = 8.5 + (Math.random() * 1.5 - 0.75);
      const temp = 28.0 - (altitude * 0.0065);
      const voltage = Math.max(3.3, 4.2 - (packetCount * 0.002));
      const roll = (Math.random() - 0.5) * 15;
      const pitch = (Math.random() - 0.5) * 15;
      const yaw = (packetCount * 2) % 360;

      latitude += 0.00005 * (Math.random() - 0.2);
      longitude += 0.00005 * (Math.random() - 0.2);

      // Error Code Logic (4-Digits)
      let d1 = (descentRate < 8.0 || descentRate > 10.0) ? 1 : 0;
      let d2 = 0; // GPS ok
      let d3 = (altitude > 500) ? 0 : 0; // Payload separation
      let d4 = 0; // Emergency Parachute

      const errorCodeStr = `${d1}${d2}${d3}${d4}`;

      // Update UI Elements
      document.getElementById('pkt-val').innerText = packetCount;
      document.getElementById('alt-val').innerText = altitude.toFixed(1) + ' m';
      document.getElementById('pres-val').innerText = pressure.toFixed(1) + ' hPa';
      document.getElementById('desc-val').innerText = descentRate.toFixed(1) + ' m/s';
      document.getElementById('temp-val').innerText = temp.toFixed(1) + ' °C';
      document.getElementById('volt-val').innerText = voltage.toFixed(2) + ' V';
      document.getElementById('att-val').innerText = `${roll.toFixed(1)}° / ${pitch.toFixed(1)}° / ${yaw.toFixed(1)}°`;
      document.getElementById('gps-val').innerText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      // Update Error Code Digits
      updateDigit('d1', d1);
      updateDigit('d2', d2);
      updateDigit('d3', d3);
      updateDigit('d4', d4);
      document.getElementById('error-code-str').innerText = errorCodeStr;

      // Update Artificial Horizon
      document.getElementById('horizon-line').style.transform = `rotate(${roll}deg) translateY(${pitch * 2}px)`;

      // Update Map
      const newPos = [latitude, longitude];
      marker.setLatLng(newPos);
      pathPolyline.addLatLng(newPos);
      map.panTo(newPos);

      // Update Charts
      const timeLabel = new Date().toLocaleTimeString();
      addChartData(altChart, timeLabel, altitude);
      addChartData(presChart, timeLabel, pressure);
      addChartData(descChart, timeLabel, descentRate);
      addChartData(voltChart, timeLabel, voltage);

      // Save Data Log
      telemetryDataLog.push({ packetCount, altitude, pressure, descentRate, temp, voltage, latitude, longitude, errorCodeStr });
    }

    function updateDigit(id, val) {
      const el = document.getElementById(id);
      el.innerText = val;
      el.className = val === 0 ? 'digit-num digit-ok' : 'digit-num digit-fault';
    }

    function addChartData(chart, label, data) {
      chart.data.labels.push(label);
      chart.data.datasets[0].data.push(data);
      if (chart.data.labels.length > 15) { chart.data.labels.shift(); chart.data.datasets[0].data.shift(); }
      chart.update();
    }

    // --- Control Bar Actions ---
    function startTelemetry() { if (!timer) timer = setInterval(updateTelemetry, 1000); }
    function stopTelemetry() { clearInterval(timer); timer = null; }
    function syncTime() { alert("GCS Clock Synced to PC Time: " + new Date().toLocaleTimeString()); }
    function resetPacket() { packetCount = 0; telemetryDataLog = []; alert("Packet counter reset."); }

    function sendCommand(cmdName) {
      const statusEl = document.getElementById('cmd-status');
      statusEl.innerText = "EXECUTED: " + cmdName;
      statusEl.style.background = "#15803d";
      statusEl.style.color = "#ffffff";
      if(cmdName === 'EMERGENCY PARACHUTE') updateDigit('d4', 1);
      if(cmdName === 'MANUAL SEPARATION') updateDigit('d3', 1);
    }

    function exportCSV() {
      const headers = ["Packet", "Altitude", "Pressure", "DescentRate", "Temp", "Voltage", "Lat", "Lng", "ErrorCode"];
      const rows = telemetryDataLog.map((record) => [
        record.packetCount,
        record.altitude,
        record.pressure,
        record.descentRate,
        record.temp,
        record.voltage,
        record.latitude,
        record.longitude,
        record.errorCodeStr
      ].join(","));
      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "CanSat_Telemetry_Log.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    }

    // --- Local Webcam Preview (not a payload video downlink) ---
    async function toggleCamera() {
      const video = document.getElementById("video-feed");
      const button = document.getElementById("camera-toggle");

      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
        video.srcObject = null;
        button.textContent = "📹 Start Local Camera";
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera access is unavailable in this browser or page context.");
        return;
      }

      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = cameraStream;
        button.textContent = "⏹ Stop Local Camera";
      } catch (error) {
        alert(`Unable to access the local camera: ${error.message}`);
      }
    }
