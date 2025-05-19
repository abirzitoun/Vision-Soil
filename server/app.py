from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import logging

# Configuration du logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement du modèle et de l'encodeur
try:
    model = joblib.load(r'C:\Users\PC MSI\Desktop\webVisionSoil-master\server\Sensor1.pkl')
    le = joblib.load(r'C:\Users\PC MSI\Desktop\webVisionSoil-master\server\action_encoder1.pkl')
    logger.info("Modèle et encodeur chargés avec succès.")
except Exception as e:
    logger.error(f"Erreur lors du chargement du modèle ou de l'encodeur : {e}")
    model, le = None, None

# Initialisation de Flask
app = Flask(__name__)
CORS(app, origins=["http://localhost:8081"])  # CORS pour frontend local


@app.route("/recommend_ml", methods=["POST"])
def recommend_ml():
    
    if model is None or le is None:
        logger.error("Modèle ou encodeur non chargé correctement.")
        return jsonify({"error": "Model or Encoder not loaded properly"}), 500

    try:
        data = request.json
        logger.info("Données reçues : %s", data)

        if not data or 'moisture' not in data:
            logger.warning("Champ 'moisture' manquant ou données invalides.")
            return jsonify({"error": "Invalid input data"}), 400

        df = pd.DataFrame([data])
        df.columns = df.columns.str.lower()

        if 'windspeed' in df.columns:
            df.rename(columns={'windspeed': 'windSpeed'}, inplace=True)

        numeric_fields = ['bh1750', 'mq2', 'temperature', 'humidity', 'ph', 'rain', 'windSpeed']
        for field in numeric_fields:
            if field in df.columns:
                df[field] = pd.to_numeric(df[field], errors='coerce')

        df['moisture'] = df['moisture'].map({"Dry": 0, "Moist": 1, "Wet": 2})

        if df.isnull().any().any():
            logger.warning("Données invalides après conversion : %s", df)
            return jsonify({"error": "Some input values are invalid or missing."}), 400

        expected_cols = ['bh1750', 'mq2', 'temperature', 'humidity', 'ph', 'moisture', 'rain', 'windSpeed']
        df = df[expected_cols]

        try:
            prediction = model.predict(df)
            logger.info(f"Raw prediction: {prediction}, type: {type(prediction)}")

            if isinstance(prediction, np.ndarray) and prediction.ndim == 2:
                predicted_classes = prediction[0].tolist()
            elif isinstance(prediction, np.ndarray) and prediction.ndim == 1:
                predicted_classes = prediction.tolist()
            elif isinstance(prediction, list):
                predicted_classes = prediction
            else:
                predicted_classes = [int(prediction)]

            # Actions possibles
            possible_actions = ["Adjust pH", "Check air", "Do nothing ", "Irrigate", "Shade crops"]
            actions = [possible_actions[i] for i in range(len(predicted_classes)) if predicted_classes[i] == 1]
            unique_actions = list(set(actions))
            # Dictionnaire des phrases associées aux actions
            ACTION_MESSAGES = {
                "Irrigate": "Please irrigate the crops to maintain soil moisture.",
                "Adjust pH": "Adjust the soil pH to the optimal range for plant growth.",
                "Check air": "Check the air quality to ensure a healthy environment.",
                "Shade crops": "Provide shading for the crops to protect them from intense sunlight.",
                "Do nothing": "Conditions are optimal. No immediate action is needed."
            }

            # ---- NOUVEAU : utiliser ton modèle de feedback pour calculer la probabilité d'utilité ----
             # Transformer les recommandations en phrases
            detailed_recommendations = []
            for rec in actions:
                message = ACTION_MESSAGES.get(rec, f"No explanation available for {rec}.")
                detailed_recommendations.append(message)


        except Exception as e:
            logger.error(f"Erreur lors de la prédiction : {str(e)}")
            return jsonify({"error": f"Prediction error: {str(e)}"}), 500

        return jsonify({
            
            #"recommended_actions": actions,
            "detailed_recommendations": detailed_recommendations
           
        })


    except Exception as e:
        logger.error(f"Erreur dans le traitement de la demande : {str(e)}")
        return jsonify({"error": f"Error processing the request: {str(e)}"}), 500
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
