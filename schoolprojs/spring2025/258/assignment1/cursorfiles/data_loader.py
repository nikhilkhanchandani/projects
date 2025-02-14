from tensorflow.keras.datasets import mnist
from tensorflow.keras.utils import to_categorical

class DataLoader:
    """Responsible for loading and preprocessing MNIST data"""
    
    def __init__(self):
        self.num_classes = 10
        self.input_shape = (28, 28, 1)

    def load_data(self):
        # Load MNIST dataset
        (x_train, y_train), (x_test, y_test) = mnist.load_data()
        
        # Preprocess features
        x_train = x_train.astype('float32') / 255.0
        x_test = x_test.astype('float32') / 255.0
        
        # Reshape data
        x_train = x_train.reshape(x_train.shape[0], *self.input_shape)
        x_test = x_test.reshape(x_test.shape[0], *self.input_shape)
        
        # Convert labels to categorical
        y_train = to_categorical(y_train, self.num_classes)
        y_test = to_categorical(y_test, self.num_classes)
        
        return (x_train, y_train), (x_test, y_test) 