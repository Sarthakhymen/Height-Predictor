from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
# sklearn imports are moved into load_model() to avoid heavy imports at module import time
import os

app = Flask(__name__, template_folder='templates', static_folder='static')

# App metadata
APP_NAME = "HEIGHT PREDICTOR"
DEVELOPER_NAME = "SARTHAK SHAVARN"

# Train the model
def load_model():
    # Use absolute path for Vercel environment
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, "height-weight.csv")
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        # Create dummy data if file missing to prevent crash
        df = pd.DataFrame({'Weight': [30, 150], 'Height': [120, 200]})
    else:
        df = pd.read_csv(csv_path)
    x = df[['Weight']]
    y = df['Height']

    # import heavy ML libraries only when needed
    from sklearn.linear_model import LinearRegression
    from sklearn.preprocessing import StandardScaler

    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(x)

    model = LinearRegression()
    model.fit(x_scaled, y)

    app.model = model
    app.scaler = scaler

# Load model at startup so endpoint responses are fast
load_model()

@app.route('/')
def index():
    return render_template('index.html', app_name=APP_NAME, developer_name=DEVELOPER_NAME)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        weight = float(data.get('weight'))
        
        if weight < 30 or weight > 150:
            return jsonify({'error': 'Weight should be between 30-150 kg'}), 400
        
        # Scale the weight using a DataFrame with the same feature name
        weight_scaled = app.scaler.transform(pd.DataFrame({'Weight': [weight]}))
        
        # Make prediction
        height = float(app.model.predict(weight_scaled)[0])
        
        return jsonify({
            'height': round(height, 2),
            'coefficient': round(float(app.model.coef_[0]), 4),
            'intercept': round(float(app.model.intercept_), 2)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    # disable reloader to avoid import/restart loops during development here
    app.run(debug=True, use_reloader=False)
