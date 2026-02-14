
// import * as tf from '@tensorflow/tfjs';

// Access the global tf object from the CDN script
const tf = (window as any).tf;

// URL for a pre-trained MNIST model (hosted by TensorFlow team or similar stable source)
// This model expects 28x28x1 input and outputs 10 probabilities
const MODEL_URL = 'https://storage.googleapis.com/tfjs-models/tfjs/mnist_transfer_cnn_v1/model.json';

// Define types locally or assume any since we are bypassing import
// But for cleaner code, we can just use 'any' for the model variable or try to infer if possible.
// For now, to avoid build errors with types, we'll use 'any' or simplified interfaces.

let model: any | null = null;
let isLoading = false;

export interface NeuralPrediction {
    digit: number;
    confidence: number;
    allScores: number[];
}

// Load the model from the CDN
export async function loadNeuralModel(): Promise<void> {
    if (model || isLoading) return;

    if (!tf) {
        console.error("TensorFlow.js not loaded from CDN!");
        return;
    }

    try {
        isLoading = true;
        console.log('Loading Neural Network (MNIST CNN)...');
        model = await tf.loadLayersModel(MODEL_URL);
        console.log('Neural Network loaded successfully');

        // Warmup the model
        const dummyInput = tf.zeros([1, 28, 28, 1]);
        model.predict(dummyInput);
        dummyInput.dispose();

    } catch (error) {
        console.error('Failed to load Neural Network:', error);
        throw error;
    } finally {
        isLoading = false;
    }
}

export function isNeuralModelReady(): boolean {
    return model !== null;
}

// Preprocess input grid for the Neural Network
// Input: 28x28 array of numbers (0-1)
// Output: Tensor of shape [1, 28, 28, 1]
function preprocessForNeuralNet(grid: number[][]): any {
    return tf.tidy(() => {
        // 1. Convert to tensor
        let tensor = tf.tensor(grid).expandDims(2); // [28, 28, 1]

        // 2. The input grid is already 28x28 and roughly centered by our fuzzy logic preprocessor
        // However, the neural net expects specific normalization if it was trained that way.
        // The standard MNIST model expects black background (0) and white digits (1), which matches our grid.

        // 3. Add batch dimension
        return tensor.expandDims(0); // [1, 28, 28, 1]
    });
}

// Run inference
export async function predictWithNeuralNet(grid: number[][]): Promise<NeuralPrediction> {
    if (!model) {
        if (!isLoading) loadNeuralModel();
        throw new Error('Neural Network not loaded yet');
    }

    const tensor = preprocessForNeuralNet(grid);

    const prediction = model.predict(tensor);
    const scores = await prediction.data(); // Float32Array of 10 probabilities

    tensor.dispose();
    prediction.dispose();

    // Find best digit
    let maxScore = -1;
    let bestDigit = -1;
    const allScores = Array.from(scores as number[]); // Convert to normal array

    for (let i = 0; i < 10; i++) {
        if (allScores[i] > maxScore) {
            maxScore = allScores[i];
            bestDigit = i;
        }
    }

    return {
        digit: bestDigit,
        confidence: maxScore,
        allScores
    };
}
