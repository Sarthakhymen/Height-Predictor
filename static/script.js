// Global variables
let predictionChart = null;
let predictionHistory = JSON.parse(localStorage.getItem('predictionHistory')) || [];

// Sync input and range slider
document.getElementById('weightInput').addEventListener('input', function () {
    document.getElementById('weightRange').value = this.value;
});

document.getElementById('weightRange').addEventListener('input', function () {
    document.getElementById('weightInput').value = this.value;
});

// Predict height function with enhanced features
async function predictHeight() {
    const weight = document.getElementById('weightInput').value;
    const errorContainer = document.getElementById('errorContainer');
    const resultContainer = document.getElementById('resultContainer');

    // Clear previous messages
    errorContainer.style.display = 'none';
    resultContainer.style.display = 'none';

    // Validate input
    if (!weight || weight < 30 || weight > 150) {
        showError('Please enter a valid weight between 30-150 kg');
        return;
    }

    try {
        // Show loading state
        const btn = document.querySelector('.btn-primary');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Predicting...';

        // Make API call
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ weight: parseFloat(weight) })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Prediction failed');
        }

        const data = await response.json();

        // Display results with interactive features
        displayResult(data, weight);

        // Restore button
        btn.disabled = false;
        btn.textContent = originalText;

        // Trigger confetti celebration! 🎉
        celebrateSuccess();

    } catch (error) {
        showError(error.message);
        const btn = document.querySelector('.btn-primary');
        btn.disabled = false;
        btn.textContent = '🔮 Predict Height';
    }
}

function displayResult(data, weight) {
    document.getElementById('heightResult').textContent = data.height;
    document.getElementById('coefficient').textContent = data.coefficient;
    document.getElementById('intercept').textContent = data.intercept;
    document.getElementById('intercept-formula').textContent = data.intercept;
    document.getElementById('coeff-formula').textContent = data.coefficient;

    document.getElementById('resultContainer').style.display = 'block';
    document.getElementById('errorContainer').style.display = 'none';

    // Subtle glow animation on result
    const box = document.querySelector('.result-box');
    box.classList.remove('glow');
    void box.offsetWidth;
    box.classList.add('glow');

    // Calculate and display BMI
    calculateAndDisplayBMI(weight, data.height);

    // Add to prediction history
    addToPredictionHistory(weight, data.height);

    // Update chart
    updateChart();

    // Animate human figure
    animateHumanFigure(weight, data.height);

    // Scroll to results
    setTimeout(() => {
        document.getElementById('resultContainer').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 100);
}

// Animate Human Figure based on weight and height
function animateHumanFigure(weight, heightCm) {
    const humanViz = document.getElementById('humanVisualization');
    humanViz.style.display = 'block';

    // Update stats
    document.getElementById('humanHeight').textContent = `${heightCm} cm`;
    document.getElementById('humanWeight').textContent = `${weight} kg`;

    // Calculate body proportions based on weight
    // Base values
    const baseWeight = 70; // reference weight
    const weightRatio = weight / baseWeight;

    // Torso dimensions - increases with weight
    const torsoRx = Math.max(25, Math.min(50, 35 * weightRatio));
    const torsoRy = Math.max(50, Math.min(75, 60 * Math.sqrt(weightRatio)));

    // Leg and arm thickness
    const legWidth = Math.max(6, Math.min(16, 10 * Math.sqrt(weightRatio)));
    const armWidth = Math.max(5, Math.min(12, 8 * Math.sqrt(weightRatio)));

    // Head size (slightly increases with weight)
    const headRadius = Math.max(20, Math.min(30, 25 + (weightRatio - 1) * 5));

    // Color based on BMI
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    let bodyColor, bodyStroke;

    if (bmi < 18.5) {
        bodyColor = '#3b82f6'; // Blue - underweight
        bodyStroke = '#2563eb';
    } else if (bmi < 25) {
        bodyColor = '#10b981'; // Green - normal
        bodyStroke = '#059669';
    } else if (bmi < 30) {
        bodyColor = '#f59e0b'; // Orange - overweight
        bodyStroke = '#d97706';
    } else {
        bodyColor = '#ef4444'; // Red - obese
        bodyStroke = '#dc2626';
    }

    // Animate the changes
    const torso = document.getElementById('torso');
    const head = document.getElementById('head');
    const leftLeg = document.getElementById('leftLeg');
    const rightLeg = document.getElementById('rightLeg');
    const leftArm = document.getElementById('leftArm');
    const rightArm = document.getElementById('rightArm');

    // Add scale animation
    const svg = document.getElementById('humanSvg');
    svg.style.transform = 'scale(0)';
    svg.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

    setTimeout(() => {
        svg.style.transform = 'scale(1)';
    }, 100);

    // Animate body parts with smooth transitions
    setTimeout(() => {
        // Torso
        torso.setAttribute('rx', torsoRx);
        torso.setAttribute('ry', torsoRy);
        torso.setAttribute('fill', bodyColor);
        torso.setAttribute('stroke', bodyStroke);
        torso.style.transition = 'all 0.8s ease-out';

        // Head
        head.setAttribute('r', headRadius);
        head.style.transition = 'all 0.6s ease-out';

        // Legs
        leftLeg.setAttribute('stroke-width', legWidth);
        rightLeg.setAttribute('stroke-width', legWidth);
        leftLeg.setAttribute('stroke', bodyStroke);
        rightLeg.setAttribute('stroke', bodyStroke);
        leftLeg.style.transition = 'all 0.7s ease-out';
        rightLeg.style.transition = 'all 0.7s ease-out';

        // Arms
        leftArm.setAttribute('stroke-width', armWidth);
        rightArm.setAttribute('stroke-width', armWidth);
        leftArm.setAttribute('stroke', bodyStroke);
        rightArm.setAttribute('stroke', bodyStroke);
        leftArm.style.transition = 'all 0.7s ease-out';
        rightArm.style.transition = 'all 0.7s ease-out';
    }, 200);

    // Add a wave animation to arms
    setTimeout(() => {
        animateWave();
    }, 1000);
}

// Fun wave animation for the human
function animateWave() {
    const leftArm = document.getElementById('leftArm');
    const rightArm = document.getElementById('rightArm');

    // Wave right arm
    let waveCount = 0;
    const waveInterval = setInterval(() => {
        if (waveCount % 2 === 0) {
            rightArm.setAttribute('x2', '160');
            rightArm.setAttribute('y2', '120');
        } else {
            rightArm.setAttribute('x2', '160');
            rightArm.setAttribute('y2', '140');
        }
        waveCount++;

        if (waveCount > 4) {
            clearInterval(waveInterval);
            // Reset to original position
            rightArm.setAttribute('x2', '160');
            rightArm.setAttribute('y2', '140');
        }
    }, 300);
}

// BMI Calculator
function calculateAndDisplayBMI(weight, heightCm) {
    const heightM = heightCm / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    document.getElementById('bmiValue').textContent = bmi;

    // Determine BMI category
    let category, color, position;
    if (bmi < 18.5) {
        category = 'Underweight';
        color = '#3b82f6';
        position = 10;
    } else if (bmi < 25) {
        category = 'Normal Weight';
        color = '#10b981';
        position = 35;
    } else if (bmi < 30) {
        category = 'Overweight';
        color = '#f59e0b';
        position = 60;
    } else {
        category = 'Obese';
        color = '#ef4444';
        position = 85;
    }

    document.getElementById('bmiCategory').innerHTML = `<span class="category-badge" style="background: ${color}">${category}</span>`;
    document.getElementById('bmiMarker').style.left = position + '%';
    document.getElementById('bmiMarker').style.background = color;

    document.getElementById('bmiContainer').style.display = 'block';
}

// Prediction History Management
function addToPredictionHistory(weight, height) {
    const prediction = {
        weight: parseFloat(weight),
        height: parseFloat(height),
        timestamp: new Date().toISOString(),
        id: Date.now()
    };

    predictionHistory.unshift(prediction);

    // Keep only last 10 predictions
    if (predictionHistory.length > 10) {
        predictionHistory = predictionHistory.slice(0, 10);
    }

    localStorage.setItem('predictionHistory', JSON.stringify(predictionHistory));
    displayHistory();
}

function displayHistory() {
    const historyList = document.getElementById('historyList');

    if (predictionHistory.length === 0) {
        document.getElementById('historyContainer').style.display = 'none';
        return;
    }

    document.getElementById('historyContainer').style.display = 'block';

    historyList.innerHTML = predictionHistory.map(item => {
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return `
            <div class="history-item">
                <div class="history-main">
                    <span class="history-weight">⚖️ ${item.weight} kg</span>
                    <span class="history-arrow">→</span>
                    <span class="history-height">📏 ${item.height} cm</span>
                </div>
                <div class="history-time">${timeStr} • ${dateStr}</div>
            </div>
        `;
    }).join('');
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all prediction history?')) {
        predictionHistory = [];
        localStorage.removeItem('predictionHistory');
        displayHistory();

        // Also clear chart
        if (predictionChart) {
            predictionChart.destroy();
            predictionChart = null;
        }
        document.getElementById('chartContainer').style.display = 'none';
    }
}

// Interactive Chart Visualization
function updateChart() {
    const ctx = document.getElementById('predictionChart');

    if (predictionHistory.length === 0) {
        return;
    }

    document.getElementById('chartContainer').style.display = 'block';

    const chartData = {
        labels: predictionHistory.slice().reverse().map((_, idx) => `#${idx + 1}`),
        datasets: [{
            label: 'Height (cm)',
            data: predictionHistory.slice().reverse().map(item => item.height),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }]
    };

    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    callbacks: {
                        title: function (context) {
                            const idx = context[0].dataIndex;
                            return `Weight: ${predictionHistory.slice().reverse()[idx].weight} kg`;
                        },
                        label: function (context) {
                            return `Height: ${context.parsed.y} cm`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function (value) {
                            return value + ' cm';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    };

    if (predictionChart) {
        predictionChart.destroy();
    }

    predictionChart = new Chart(ctx, config);
}

// Confetti celebration effect
function celebrateSuccess() {
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            clearInterval(interval);
            return;
        }

        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981']
        });

        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981']
        });
    }, 100);
}

function showError(message) {
    document.getElementById('errorMessage').textContent = '❌ Error: ' + message;
    document.getElementById('errorContainer').style.display = 'block';
    document.getElementById('resultContainer').style.display = 'none';
}

// Allow Enter key to predict
document.getElementById('weightInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        predictHeight();
    }
});

// Initialize on page load
window.addEventListener('load', function () {
    displayHistory();
    if (predictionHistory.length > 0) {
        updateChart();
    }
});
