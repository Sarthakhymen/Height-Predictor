import streamlit as st
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

# Page configuration
st.set_page_config(page_title="Height-Weight Predictor", layout="centered")

# Title and description
st.title("📏 Height-Weight Predictor")
st.markdown("Predict height based on weight using Linear Regression")

# Load and prepare data
@st.cache_resource
def train_model():
    # Load data
    df = pd.read_csv("height-weight.csv")
    
    # Prepare features
    x = df[['Weight']]
    y = df['Height']
    
    # Standardize the data
    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(x)
    
    # Train model
    model = LinearRegression()
    model.fit(x_scaled, y)
    
    return model, scaler

# Train model
model, scaler = train_model()

# Create input section
st.markdown("### Enter Weight (kg)")
weight = st.number_input(
    "Weight:", 
    min_value=30.0, 
    max_value=150.0, 
    value=70.0, 
    step=0.5,
    label_visibility="collapsed"
)

# Prediction
if st.button("🔮 Predict Height", type="primary"):
    # Transform input using the same scaler
    weight_scaled = scaler.transform([[weight]])
    
    # Make prediction
    predicted_height = model.predict(weight_scaled)[0]
    
    # Display result
    st.success(f"✅ Predicted Height: **{predicted_height:.2f} cm**")
    
    # Show model details
    with st.expander("Model Details"):
        st.write(f"**Slope (Coefficient):** {model.coef_[0]:.4f}")
        st.write(f"**Intercept:** {model.intercept_:.2f}")
        st.write(f"**Formula:** Height = {model.intercept_:.2f} + {model.coef_[0]:.4f} × (Standardized Weight)")

st.markdown("---")
st.markdown("**📊 Model Info:** Simple Linear Regression trained on height-weight dataset")
