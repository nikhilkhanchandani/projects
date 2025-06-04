from flask import Flask, request, jsonify
from flask_cors import CORS  # Import Flask-CORS
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, Conv2D, MaxPooling2D, Flatten, Dropout
from sklearn.utils import shuffle
from sklearn.model_selection import train_test_split
import cv2
import numpy as np
import os
from PIL import Image

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define global variables
MODEL_PATH = 'braintumor.h5'
IMAGE_SIZE = 150
LABELS = ['glioma_tumor', 'meningioma_tumor', 'no_tumor', 'pituitary_tumor']


def load_data():
    """Load and preprocess dataset for training and testing."""
    training_dir = "./Training"
    labels = LABELS

    # Initialize data and labels
    X = []
    Y = []

    # Load training data
    for label in labels:
        folder_path = os.path.join(training_dir, label)
        if not os.path.exists(folder_path):
            raise FileNotFoundError(f"Directory {folder_path} does not exist.")
        for img_file in os.listdir(folder_path):
            img_path = os.path.join(folder_path, img_file)
            img = cv2.imread(img_path)
            if img is not None:
                img = cv2.resize(img, (IMAGE_SIZE, IMAGE_SIZE))
                X.append(img)
                Y.append(labels.index(label))  # Convert label to index

    # Convert to NumPy arrays
    X = np.array(X) / 255.0  # Normalize pixel values
    Y = np.array(Y)

    # Shuffle and split data
    X, Y = shuffle(X, Y, random_state=42)
    X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.1, random_state=42)

    # One-hot encode labels
    Y_train = tf.keras.utils.to_categorical(Y_train, len(labels))
    Y_test = tf.keras.utils.to_categorical(Y_test, len(labels))

    return X_train, X_test, Y_train, Y_test


def train_model():
    """Define, train, and save the model."""
    X_train, X_test, Y_train, Y_test = load_data()

    # Define the model
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3)),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.3),
        Conv2D(64, (3, 3), activation='relu'),
        Conv2D(64, (3, 3), activation='relu'),
        Dropout(0.3),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.3),
        Conv2D(128, (3, 3), activation='relu'),
        Conv2D(128, (3, 3), activation='relu'),
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.3),
        Conv2D(128, (3, 3), activation='relu'),
        Conv2D(256, (3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.3),
        Flatten(),
        Dense(512, activation='relu'),
        Dense(512, activation='relu'),
        Dropout(0.3),
        Dense(len(LABELS), activation='softmax')
    ])

    # Compile the model
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    # Train the model
    print("Training the model...")
    model.fit(X_train, Y_train, epochs=10, validation_split=0.1)
    print("Model training complete!")

    # Save the trained model
    model.save(MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

    return model


def load_or_train_model():
    """Load the model if available, otherwise train it."""
    if os.path.exists(MODEL_PATH):
        print(f"Loading model from {MODEL_PATH}...")
        return load_model(MODEL_PATH)
    else:
        print("No pre-trained model found. Training a new model...")
        return train_model()


# Initialize the model
model = load_or_train_model()


@app.route('/test_model', methods=['GET'])
def test_model():
    try:
        print("Model summary:")
        model.summary()
        return "Model loaded successfully!", 200
    except Exception as e:
        print(f"Error loading model: {e}")
        return f"Error: {e}", 500


@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Save the file to a temporary directory
        temp_dir = 'temp_uploads'
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, file.filename)
        file.save(file_path)

        # Preprocess the image
        img = cv2.imread(file_path)
        if img is None:
            return jsonify({"error": "Invalid image format."}), 400
        img = cv2.resize(img, (IMAGE_SIZE, IMAGE_SIZE))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Predict
        prediction = model.predict(img_array)
        predicted_label = LABELS[np.argmax(prediction)]

        # Clean up
        os.remove(file_path)
        return jsonify({"prediction": predicted_label})
    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
