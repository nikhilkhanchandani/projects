from data_loader import DataLoader
from model_architecture import CNNModelBuilder
from model_trainer import ModelTrainer
from metrics_logger import MetricsLogger

def main():
    # Initialize components
    data_loader = DataLoader()
    model_builder = CNNModelBuilder()
    metrics_logger = MetricsLogger()

    # Load and preprocess data
    (x_train, y_train), (x_test, y_test) = data_loader.load_data()

    # Build model
    model = model_builder.build(data_loader.input_shape, data_loader.num_classes)

    # Setup trainer
    trainer = ModelTrainer(model, metrics_logger)
    trainer.compile_model()

    # Train model
    history = trainer.train(
        x_train, y_train,
        x_test, y_test,  # Using test set as validation for simplicity
        batch_size=128,
        epochs=20
    )

    # Evaluate model
    test_results = trainer.evaluate(x_test, y_test)
    print(f"Test results: {test_results}")

if __name__ == "__main__":
    main() 