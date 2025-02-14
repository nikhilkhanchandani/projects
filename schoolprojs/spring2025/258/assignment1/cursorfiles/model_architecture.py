from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Dense, Flatten, Dropout
from abc import ABC, abstractmethod

class ModelBuilder(ABC):
    """Abstract base class for model architectures"""
    
    @abstractmethod
    def build(self, input_shape, num_classes):
        pass

class CNNModelBuilder(ModelBuilder):
    """Concrete implementation of CNN architecture"""
    
    def build(self, input_shape, num_classes):
        model = Sequential([
            Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=input_shape),
            MaxPooling2D(pool_size=(2, 2)),
            Conv2D(64, kernel_size=(3, 3), activation='relu'),
            MaxPooling2D(pool_size=(2, 2)),
            Dropout(0.25),
            Flatten(),
            Dense(128, activation='relu'),
            Dropout(0.5),
            Dense(num_classes, activation='softmax')
        ])
        return model 