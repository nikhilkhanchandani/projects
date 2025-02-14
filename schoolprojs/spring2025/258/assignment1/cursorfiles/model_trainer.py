from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
import tensorflow as tf

class ModelTrainer:
    """Responsible for training and evaluating the model"""
    
    def __init__(self, model, metrics_callback=None):
        self.model = model
        self.metrics_callback = metrics_callback
        self.callbacks = self._setup_callbacks()

    def _setup_callbacks(self):
        callbacks = [
            ModelCheckpoint('best_model.h5', save_best_only=True),
            EarlyStopping(patience=5, restore_best_weights=True)
        ]
        if self.metrics_callback:
            callbacks.append(self.metrics_callback)
        return callbacks

    def compile_model(self):
        self.model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy', 
                    tf.keras.metrics.Precision(),
                    tf.keras.metrics.Recall(),
                    tf.keras.metrics.AUC()]
        )

    def train(self, x_train, y_train, x_val, y_val, batch_size=128, epochs=20):
        return self.model.fit(
            x_train, y_train,
            batch_size=batch_size,
            epochs=epochs,
            validation_data=(x_val, y_val),
            callbacks=self.callbacks
        )

    def evaluate(self, x_test, y_test):
        return self.model.evaluate(x_test, y_test) 