from tensorflow.keras.callbacks import Callback
import mlflow

class MetricsLogger(Callback):
    """Responsible for logging metrics during training"""
    
    def __init__(self):
        super().__init__()
        mlflow.start_run()

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        for metric_name, metric_value in logs.items():
            mlflow.log_metric(metric_name, metric_value, step=epoch)

    def on_train_end(self, logs=None):
        mlflow.end_run() 