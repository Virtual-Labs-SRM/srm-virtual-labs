import { useState, useMemo, useCallback, useEffect } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock } from '@/components/lab/SectionCard';
import { LabTabs } from '@/components/lab/LabTabs';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ReactFlow,
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Home, CheckCircle2, TrendingUp, DollarSign, Trash2, Play, Database } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from 'recharts';

type PipelineNodeData = {
  label: string;
  typeKey: string;
};

const HOUSE_PRICE_CODE = `"""
House Price Prediction using Machine Learning

This implementation uses Linear Regression and Random Forest
to predict house prices based on various features.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt

class HousePricePredictor:
    """
    AI System for predicting house prices in different areas.
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.models = {}
        self.feature_names = [
            'area_sqft',
            'bedrooms',
            'bathrooms',
            'location_score',
            'age_years',
            'has_garage',
            'has_pool'
        ]
    
    def prepare_data(self, df):
        """
        Prepare and preprocess the dataset.
        
        Args:
            df: DataFrame with house features and prices
        Returns:
            X_train, X_test, y_train, y_test
        """
        X = df[self.feature_names]
        y = df['price']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        return X_train_scaled, X_test_scaled, y_train, y_test
    
    def train_linear_regression(self, X_train, y_train):
        """Train Linear Regression model."""
        model = LinearRegression()
        model.fit(X_train, y_train)
        self.models['linear'] = model
        return model
    
    def train_random_forest(self, X_train, y_train):
        """Train Random Forest model."""
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        model.fit(X_train, y_train)
        self.models['forest'] = model
        return model
    
    def predict(self, features, model_name='linear'):
        """
        Predict house price for given features.
        
        Args:
            features: dict with feature values
            model_name: 'linear' or 'forest'
        Returns:
            Predicted price
        """
        model = self.models.get(model_name)
        if not model:
            raise ValueError(f"Model {model_name} not trained")
        
        # Prepare input
        X = np.array([[features[f] for f in self.feature_names]])
        X_scaled = self.scaler.transform(X)
        
        # Predict
        price = model.predict(X_scaled)[0]
        return max(0, price)  # Ensure non-negative
    
    def evaluate(self, X_test, y_test, model_name='linear'):
        """Evaluate model performance."""
        model = self.models.get(model_name)
        y_pred = model.predict(X_test)
        
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        return {
            'rmse': rmse,
            'r2': r2,
            'mae': np.mean(np.abs(y_test - y_pred))
        }
    
    def get_feature_importance(self, model_name='forest'):
        """Get feature importance from Random Forest."""
        model = self.models.get(model_name)
        if model_name == 'forest' and model:
            importance = dict(zip(
                self.feature_names, 
                model.feature_importances_
            ))
            return sorted(importance.items(), key=lambda x: x[1], reverse=True)
        return None


# Generate sample dataset
def generate_sample_data(n_samples=1000):
    """Generate synthetic house data."""
    np.random.seed(42)
    
    data = {
        'area_sqft': np.random.randint(800, 5000, n_samples),
        'bedrooms': np.random.randint(1, 6, n_samples),
        'bathrooms': np.random.randint(1, 4, n_samples),
        'location_score': np.random.uniform(1, 10, n_samples),
        'age_years': np.random.randint(0, 50, n_samples),
        'has_garage': np.random.randint(0, 2, n_samples),
        'has_pool': np.random.randint(0, 2, n_samples),
    }
    
    # Generate price based on features
    data['price'] = (
        data['area_sqft'] * 150 +
        data['bedrooms'] * 20000 +
        data['bathrooms'] * 15000 +
        data['location_score'] * 30000 +
        (50 - data['age_years']) * 1000 +
        data['has_garage'] * 25000 +
        data['has_pool'] * 40000 +
        np.random.normal(0, 20000, n_samples)
    )
    
    return pd.DataFrame(data)


if __name__ == "__main__":
    # Generate data
    df = generate_sample_data(1000)
    
    # Initialize predictor
    predictor = HousePricePredictor()
    
    # Prepare data
    X_train, X_test, y_train, y_test = predictor.prepare_data(df)
    
    # Train models
    predictor.train_linear_regression(X_train, y_train)
    predictor.train_random_forest(X_train, y_train)
    
    # Evaluate
    print("Linear Regression:", predictor.evaluate(X_test, y_test, 'linear'))
    print("Random Forest:", predictor.evaluate(X_test, y_test, 'forest'))
    
    # Predict for a sample house
    sample_house = {
        'area_sqft': 2000,
        'bedrooms': 3,
        'bathrooms': 2,
        'location_score': 7.5,
        'age_years': 10,
        'has_garage': 1,
        'has_pool': 0
    }
    
    print(f"\\nPredicted Price: \${predictor.predict(sample_house, 'forest'):,.2f}")`;

const MODEL_COEFFICIENTS = {
  area: 150,
  bedrooms: 20000,
  bathrooms: 15000,
  location: 30000,
  age: -1000,
  garage: 25000,
  pool: 40000,
  base: 50000,
};

const LOCATIONS = [
  { id: 'downtown', name: 'Downtown', score: 9.5 },
  { id: 'suburban', name: 'Suburban', score: 7.0 },
  { id: 'rural', name: 'Rural', score: 5.0 },
  { id: 'beach', name: 'Beachfront', score: 9.0 },
  { id: 'industrial', name: 'Industrial', score: 4.0 },
];

function HousePriceDemo() {
  const [features, setFeatures] = useState({
    area: 2000,
    bedrooms: 3,
    bathrooms: 2,
    location: 'suburban',
    age: 10,
    hasGarage: true,
    hasPool: false,
  });

  const locationScore = LOCATIONS.find((l) => l.id === features.location)?.score || 5;

  const predictedPrice = useMemo(() => {
    const price =
      MODEL_COEFFICIENTS.base +
      features.area * MODEL_COEFFICIENTS.area +
      features.bedrooms * MODEL_COEFFICIENTS.bedrooms +
      features.bathrooms * MODEL_COEFFICIENTS.bathrooms +
      locationScore * MODEL_COEFFICIENTS.location +
      features.age * MODEL_COEFFICIENTS.age +
      (features.hasGarage ? MODEL_COEFFICIENTS.garage : 0) +
      (features.hasPool ? MODEL_COEFFICIENTS.pool : 0);
    return Math.max(0, price);
  }, [features, locationScore]);

  const priceBreakdown = useMemo(
    () => [
      { label: 'Base Price', value: MODEL_COEFFICIENTS.base },
      { label: 'Area Contribution', value: features.area * MODEL_COEFFICIENTS.area },
      { label: 'Bedrooms', value: features.bedrooms * MODEL_COEFFICIENTS.bedrooms },
      { label: 'Bathrooms', value: features.bathrooms * MODEL_COEFFICIENTS.bathrooms },
      { label: 'Location Premium', value: locationScore * MODEL_COEFFICIENTS.location },
      { label: 'Age Factor', value: features.age * MODEL_COEFFICIENTS.age },
      { label: 'Garage', value: features.hasGarage ? MODEL_COEFFICIENTS.garage : 0 },
      { label: 'Pool', value: features.hasPool ? MODEL_COEFFICIENTS.pool : 0 },
    ],
    [features, locationScore],
  );

  const scatterPlotData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      const truePrice = 200000 + Math.random() * 600000;
      const error = (Math.random() - 0.5) * 40000;
      const predicted = truePrice + error;
      data.push({ actual: Math.round(truePrice), predicted: Math.round(predicted) });
    }
    return data.sort((a, b) => a.actual - b.actual);
  }, []);

  const residualData = useMemo(() => {
    return scatterPlotData.map((d) => ({
      predicted: d.predicted,
      residual: d.actual - d.predicted,
    }));
  }, [scatterPlotData]);

  const partialDependenceData = useMemo(() => {
    const data = [];
    for (let area = 500; area <= 5000; area += 200) {
      const basePrice = MODEL_COEFFICIENTS.base;
      const areaContribution = area * MODEL_COEFFICIENTS.area;
      const otherFeatures = 3 * MODEL_COEFFICIENTS.bedrooms + 2 * MODEL_COEFFICIENTS.bathrooms +
        7 * MODEL_COEFFICIENTS.location + 10 * MODEL_COEFFICIENTS.age +
        MODEL_COEFFICIENTS.garage;
      const price = basePrice + areaContribution + otherFeatures;
      data.push({ area, price: Math.round(price) });
    }
    return data;
  }, []);

  const modelMetrics = useMemo(
    () => [
      {
        name: 'Linear Regression',
        description: 'Fast, interpretable baseline model.',
        rmse: 18500,
        r2: 0.87,
        mae: 14200,
      },
      {
        name: 'Random Forest',
        description: 'Ensemble of trees that captures non‑linear relationships.',
        rmse: 16200,
        r2: 0.91,
        mae: 11800,
      },
      {
        name: 'Neural Network',
        description: 'Flexible, high‑capacity model for rich datasets.',
        rmse: 15800,
        r2: 0.92,
        mae: 11200,
      },
    ],
    [],
  );

  const initialNodes = useMemo<Node<PipelineNodeData>[]>(
    () => [
      {
        id: 'data-generate',
        type: 'input',
        position: { x: 50, y: 60 },
        data: { label: 'Generate Synthetic Houses', typeKey: 'generate' },
      },
      {
        id: 'proc-scale',
        position: { x: 300, y: 40 },
        data: { label: 'Scale Features', typeKey: 'scale' },
      },
      {
        id: 'proc-derived',
        position: { x: 300, y: 140 },
        data: { label: 'Create Derived Features', typeKey: 'derive' },
      },
      {
        id: 'split-train-test',
        position: { x: 550, y: 90 },
        data: { label: 'Train/Test Split', typeKey: 'split' },
      },
      {
        id: 'model-linear',
        position: { x: 800, y: 10 },
        data: { label: 'Linear Regression', typeKey: 'linear' },
      },
      {
        id: 'model-forest',
        position: { x: 800, y: 90 },
        data: { label: 'Random Forest', typeKey: 'forest' },
      },
      {
        id: 'model-neural',
        position: { x: 800, y: 170 },
        data: { label: 'Neural Network', typeKey: 'neural' },
      },
      {
        id: 'model-svr',
        position: { x: 800, y: 250 },
        data: { label: 'Support Vector Regression', typeKey: 'svr' },
      },
      {
        id: 'model-gbm',
        position: { x: 1000, y: 10 },
        data: { label: 'Gradient Boosting', typeKey: 'gbm' },
      },
      {
        id: 'model-knn',
        position: { x: 1000, y: 90 },
        data: { label: 'K-Nearest Neighbors', typeKey: 'knn' },
      },
      {
        id: 'evaluate-metrics',
        position: { x: 1250, y: 90 },
        data: { label: 'Compute Metrics', typeKey: 'metrics' },
      },
      {
        id: 'explain-importance',
        position: { x: 1500, y: 40 },
        data: { label: 'Feature Importance / SHAP', typeKey: 'explain' },
      },
      {
        id: 'predict-single',
        type: 'output',
        position: { x: 1500, y: 160 },
        data: { label: 'Predict Single House', typeKey: 'predict' },
      },
    ],
    [],
  );

  const initialEdges = useMemo<Edge[]>(
    () => [
      { id: 'e-generate-scale', source: 'data-generate', target: 'proc-scale' },
      { id: 'e-generate-derived', source: 'data-generate', target: 'proc-derived' },
      { id: 'e-scale-split', source: 'proc-scale', target: 'split-train-test' },
      { id: 'e-derived-split', source: 'proc-derived', target: 'split-train-test' },
      { id: 'e-split-linear', source: 'split-train-test', target: 'model-linear' },
      { id: 'e-split-forest', source: 'split-train-test', target: 'model-forest' },
      { id: 'e-split-neural', source: 'split-train-test', target: 'model-neural' },
      { id: 'e-split-svr', source: 'split-train-test', target: 'model-svr' },
      { id: 'e-split-gbm', source: 'split-train-test', target: 'model-gbm' },
      { id: 'e-split-knn', source: 'split-train-test', target: 'model-knn' },
      { id: 'e-linear-metrics', source: 'model-linear', target: 'evaluate-metrics' },
      { id: 'e-forest-metrics', source: 'model-forest', target: 'evaluate-metrics' },
      { id: 'e-neural-metrics', source: 'model-neural', target: 'evaluate-metrics' },
      { id: 'e-svr-metrics', source: 'model-svr', target: 'evaluate-metrics' },
      { id: 'e-gbm-metrics', source: 'model-gbm', target: 'evaluate-metrics' },
      { id: 'e-knn-metrics', source: 'model-knn', target: 'evaluate-metrics' },
      { id: 'e-metrics-explain', source: 'evaluate-metrics', target: 'explain-importance' },
      { id: 'e-metrics-predict', source: 'evaluate-metrics', target: 'predict-single' },
    ],
    [],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<PipelineNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [pipelineResults, setPipelineResults] = useState<{
    status: 'idle' | 'running' | 'completed' | 'error';
    message?: string;
    executionTime?: number;
  }>({ status: 'idle' });
  const [nodeDataExamples, setNodeDataExamples] = useState<
    Record<string, { input?: any; output?: any; description?: string }>
  >({});

  // Hyperparameters state for models
  const [modelHyperparameters, setModelHyperparameters] = useState<Record<string, any>>({
    'model-linear': {},
    'model-forest': { n_estimators: 100, max_depth: 10 },
    'model-neural': { layers: [64, 32], activations: ['relu', 'relu'], learning_rate: 0.001 },
    'model-svr': { kernel: 'rbf', C: 100, epsilon: 0.1 },
    'model-gbm': { n_estimators: 100, learning_rate: 0.1, max_depth: 3 },
    'model-knn': { n_neighbors: 5, weights: 'uniform' },
  });

  const pipelineNodeTypes = useMemo(
    () => [
      { id: 'generate', label: 'Generate Synthetic Houses', category: 'Data' },
      { id: 'scale', label: 'Scale Features', category: 'Processing' },
      { id: 'derive', label: 'Create Derived Features', category: 'Processing' },
      { id: 'split', label: 'Train/Test Split', category: 'Split' },
      { id: 'linear', label: 'Linear Regression', category: 'Model' },
      { id: 'forest', label: 'Random Forest', category: 'Model' },
      { id: 'neural', label: 'Neural Network', category: 'Model' },
      { id: 'svr', label: 'Support Vector Regression', category: 'Model' },
      { id: 'gbm', label: 'Gradient Boosting', category: 'Model' },
      { id: 'knn', label: 'K-Nearest Neighbors', category: 'Model' },
      { id: 'metrics', label: 'Compute Metrics', category: 'Evaluate' },
      { id: 'explain', label: 'Feature Importance / SHAP', category: 'Explain' },
      { id: 'predict', label: 'Predict Single House', category: 'Predict' },
    ],
    [],
  );

  const nodeDetails = useMemo(
    () =>
    ({
      generate: {
        title: 'Generate Synthetic Houses',
        what: 'Creates a simulated dataset of houses with features like area, bedrooms, location score, and amenities. This mirrors what a real-world property dataset might look like.',
        why: 'Lets you explore the full ML pipeline without needing to download a real dataset. Great for learning and quick experimentation.',
        flow: 'The generated table of houses is passed to the preprocessing steps (scaling and feature engineering).',
      },
      scale: {
        title: 'Scale Features',
        what: 'Standardizes numerical features so they share a similar range (for example, mean 0 and standard deviation 1).',
        why: 'Prevents large-scale features like area (thousands of sqft) from overwhelming small-scale features like number of bathrooms (1–5). Many ML models perform much better when features are scaled.',
        flow: 'Takes the raw numeric columns and outputs a scaled version used by the models.',
      },
      derive: {
        title: 'Create Derived Features',
        what: 'Builds new, more informative features from the raw data, such as price-per-square-foot or age buckets.',
        why: 'Good derived features can make patterns easier for models to learn and often boost accuracy.',
        flow: 'Adds new columns to the dataset that are later fed into the train/test split and models.',
      },
      split: {
        title: 'Train/Test Split',
        what: 'Splits the dataset into a training set (to fit the model) and a test set (to measure how well it generalizes).',
        why: 'Prevents overfitting by checking performance on data the model has never seen during training.',
        flow: 'Outputs two datasets: one for training models and one for evaluation.',
      },
      linear: {
        title: 'Linear Regression',
        what: 'Fits a straight-line relationship between features and price, learning one weight (coefficient) per feature.',
        why: 'Simple, fast, and very interpretable — you can see exactly how each feature pushes the price up or down.',
        flow: 'Consumes the scaled training data and outputs predicted prices and learned coefficients.',
      },
      forest: {
        title: 'Random Forest',
        what: 'Builds many decision trees on random subsets of the data and averages their predictions.',
        why: 'Captures complex, non-linear relationships and interactions between features with minimal tuning.',
        flow: 'Uses the same train/test split but can achieve higher accuracy at the cost of interpretability.',
      },
      neural: {
        title: 'Neural Network',
        what: 'Stacked layers of neurons that learn flexible, non-linear mappings from features to price.',
        why: 'Very powerful for large, rich datasets, but needs good preprocessing and more careful training.',
        flow: 'Takes scaled inputs and produces predictions after many passes (epochs) over the data.',
      },
      svr: {
        title: 'Support Vector Regression',
        what: 'Finds the best hyperplane that fits the data with a margin tolerance, adapting to non-linear patterns via kernel tricks.',
        why: 'Excellent for high-dimensional data and smaller datasets; very robust to outliers.',
        flow: 'Maps features to a higher-dimensional space to find patterns, then predicts prices with minimal error tolerance.',
      },
      gbm: {
        title: 'Gradient Boosting',
        what: 'Sequentially builds many weak learners (typically trees) and combines them, with each new tree correcting previous errors.',
        why: 'State-of-the-art performance on tabular data; naturally handles non-linearity and interactions between features.',
        flow: 'Iteratively fits residuals from earlier trees, creating an ensemble that learns both linear and non-linear patterns.',
      },
      knn: {
        title: 'K-Nearest Neighbors',
        what: 'Predicts price by averaging the K nearest neighbors in the feature space (simple, non-parametric method).',
        why: 'Intuitive and requires almost no training; works well when similar houses are priced similarly.',
        flow: 'For each test sample, finds K closest training samples and averages their prices as the prediction.',
      },
      metrics: {
        title: 'Compute Metrics',
        what: 'Calculates metrics like RMSE, MAE, and R² to summarize how well each model predicts house prices.',
        why: 'Gives a quantitative way to compare models instead of relying on gut feeling or a few examples.',
        flow: 'Takes model predictions on the test set and outputs metric values per model.',
      },
      explain: {
        title: 'Feature Importance / SHAP',
        what: 'Analyzes which features contribute most to the model\'s predictions, globally and for individual houses.',
        why: 'Helps you build trust in the model and explain predictions to non‑technical stakeholders.',
        flow: 'Consumes a trained model and dataset, and outputs importance scores or SHAP values per feature.',
      },
      predict: {
        title: 'Predict Single House',
        what: 'Uses the trained model to predict the price of one specific house, based on the sliders you set below.',
        why: 'Connects the abstract pipeline to a concrete example you can interact with.',
        flow: 'Takes the single-house features, applies the same preprocessing steps, and outputs a single predicted price.',
      },
    } as Record<
      string,
      {
        title: string;
        what: string;
        why: string;
        flow: string;
      }
    >),
    [],
  );

  const mathExplanations = useMemo(
    () =>
    ({
      generate: {
        formula: 'D = {(x₁⁽¹⁾, y¹), (x₁⁽²⁾, y²), ..., (x₁⁽ⁿ⁾, yⁿ)} where x = [area, beds, baths, location, ...]',
        explanation: 'Creates n=1000 synthetic house samples. Each sample i has feature vector xᵢ (area, bedrooms, etc.) and target price yᵢ.',
        terms: {
          'D': 'Dataset containing all samples',
          'xᵢ': 'Feature vector for house i (contains area, beds, baths, etc.)',
          'yᵢ': 'Target price for house i',
          'n': 'Total number of samples (1000)',
        }
      },
      scale: {
        formula: 'x̂ⱼ = (xⱼ - μⱼ) / σⱼ  where μⱼ = (1/n)Σxⱼ⁽ⁱ⁾ and σⱼ = √[(1/n)Σ(xⱼ⁽ⁱ⁾ - μⱼ)²]',
        explanation: 'Standardization: Each feature j is centered (subtract mean μⱼ) and scaled (divide by std dev σⱼ). Result: N(0,1) distribution.',
        terms: {
          'x̂ⱼ': 'Scaled value of feature j',
          'xⱼ': 'Original value of feature j',
          'μⱼ': 'Mean of feature j across all samples',
          'σⱼ': 'Standard deviation of feature j',
          'n': 'Number of samples',
          'Σ': 'Summation symbol (sum across all samples)',
        }
      },
      derive: {
        formula: 'x_new = f(x₁, x₂, x₃, ...) | Examples: age_group = binning(age), price_per_sqft = price / area',
        explanation: 'Feature engineering creates new informative features from existing ones using functions f. Improves model expressiveness.',
        terms: {
          'x_new': 'Newly created feature',
          'f(...)': 'Function that transforms original features into new ones',
          'x₁, x₂, x₃': 'Original input features',
        }
      },
      split: {
        formula: 'D_train ∪ D_test = D  where |D_train| = 0.8n, |D_test| = 0.2n, and D_train ∩ D_test = ∅',
        explanation: 'Dataset D partitioned into disjoint training set (80%) and test set (20%). Prevents overfitting by testing on unseen data.',
        terms: {
          'D_train': 'Training dataset (80% of total)',
          'D_test': 'Test dataset (20% of total)',
          'D': 'Complete dataset',
          '∪': 'Union - combining two sets',
          '∩': 'Intersection - common elements',
          '∅': 'Empty set - no overlap between train and test',
          '|D|': 'Cardinality - size/count of elements in set D',
          'n': 'Total number of samples',
        }
      },
      linear: {
        formula: 'ŷ = w₀ + w₁x₁ + w₂x₂ + ... + wₘxₘ = w₀ + Σⱼ₌₁ᵐ wⱼxⱼ  (solve via least squares)',
        explanation: 'Linear regression finds weights w=[w₀, w₁, ..., wₘ] minimizing MSE = (1/n)Σ(yᵢ - ŷᵢ)². w₀ is bias, wⱼ is coefficient.',
        terms: {
          'ŷ': 'Predicted price',
          'w₀': 'Intercept/bias term (base price)',
          'wⱼ': 'Weight/coefficient for feature j (how much feature j impacts price)',
          'xⱼ': 'Value of feature j',
          'm': 'Number of features',
          'Σⱼ₌₁ᵐ': 'Sum from j=1 to j=m',
          'MSE': 'Mean squared error - average of squared differences',
          'yᵢ': 'Actual price for sample i',
        }
      },
      forest: {
        formula: 'ŷ = (1/B)Σᵇ₌₁ᴮ Tᵇ(x)  where Tᵇ are B=100 independent decision trees trained on bootstrap samples',
        explanation: 'Random Forest aggregates B independent tree predictions via averaging. Each tree learns on random feature/sample subsets.',
        terms: {
          'ŷ': 'Final predicted price (ensemble prediction)',
          'B': 'Number of trees (100)',
          'Tᵇ(x)': 'Prediction from tree b given input features x',
          '(1/B)Σᵇ₌₁ᴮ': 'Average of all B tree predictions',
          'x': 'Feature vector (input)',
        }
      },
      neural: {
        formula: 'h = σ(W₁x + b₁), ŷ = σ(W₂h + b₂)  where σ(z) = 1/(1+e⁻ᶻ) [sigmoid] or ReLU(z) = max(0,z)',
        explanation: 'Neural network with one hidden layer. Input x→hidden layer h via W₁,b₁→output ŷ via W₂,b₂. Learns non-linear mappings.',
        terms: {
          'h': 'Hidden layer activations (intermediate layer)',
          'x': 'Input features',
          'W₁': 'Weight matrix from input to hidden layer',
          'b₁': 'Bias vector for hidden layer',
          'W₂': 'Weight matrix from hidden to output layer',
          'b₂': 'Bias for output layer',
          'σ(z)': 'Activation function (sigmoid or ReLU)',
          'ŷ': 'Predicted price',
        }
      },
      svr: {
        formula: 'ŷ = Σᵢ αᵢ K(xᵢ, x) + b  where K is kernel function (RBF: K(x,z) = exp(-γ||x-z||²))',
        explanation: 'Support Vector Regression minimizes error within ε-tube. Data points are mapped to higher dimension via kernel K to find best fit hyperplane.',
        terms: {
          'αᵢ': 'Support vector coefficients learned during training',
          'K(x,z)': 'Kernel function computing similarity between data points',
          'γ': 'Kernel parameter controlling influence range (RBF bandwidth)',
          'ε': 'Margin tolerance - errors within ε are ignored',
          'b': 'Bias term',
          'ŷ': 'Predicted price',
        }
      },
      gbm: {
        formula: 'ŷ = y₀ + η·Σₘ₌₁ᴹ Tₘ(x)  where Tₘ(x) are weak learners, η is learning rate',
        explanation: 'Gradient boosting builds ensemble of weak learners (trees) iteratively. Each tree learns residuals of previous trees.',
        terms: {
          'y₀': 'Initial prediction (e.g., mean price)',
          'Tₘ(x)': 'm-th weak learner (decision tree)',
          'η': 'Learning rate - scales each tree\'s contribution (smaller = slower learning)',
          'M': 'Number of boosting iterations',
          'Σ': 'Sum of all weak learner predictions',
          'ŷ': 'Final ensemble prediction',
        }
      },
      knn: {
        formula: 'ŷ = (1/K)·Σₖ∈N(x) yₖ  where N(x) are K nearest neighbors by distance d(x,xᵢ)',
        explanation: 'K-Nearest Neighbors: for each test sample, find K closest training samples in feature space, average their prices.',
        terms: {
          'K': 'Number of neighbors to consider (hyperparameter)',
          'N(x)': 'Set of K nearest neighbors to point x',
          'yₖ': 'Price of k-th nearest neighbor',
          'd(x,xᵢ)': 'Distance function (typically Euclidean)',
          'ŷ': 'Predicted price as average of K neighbors\' prices',
        }
      },
      metrics: {
        formula: 'RMSE = √[(1/n)Σ(yᵢ - ŷᵢ)²] | MAE = (1/n)Σ|yᵢ - ŷᵢ| | R² = 1 - (SS_res/SS_tot)',
        explanation: 'RMSE: root mean squared error (penalizes large errors). MAE: mean absolute error (dollars). R²: % of variance explained [0,1].',
        terms: {
          'RMSE': 'Root Mean Squared Error - average prediction error in same units as target',
          'MAE': 'Mean Absolute Error - average absolute difference between actual and predicted',
          'R²': 'Coefficient of determination - proportion of variance explained (0=bad, 1=perfect)',
          'yᵢ': 'Actual price for sample i',
          'ŷᵢ': 'Predicted price for sample i',
          'n': 'Number of samples',
          'SS_res': 'Sum of squared residuals = Σ(yᵢ - ŷᵢ)²',
          'SS_tot': 'Total sum of squares = Σ(yᵢ - ȳ)²',
          'ȳ': 'Mean of actual prices',
        }
      },
      explain: {
        formula: 'SHAP: φᵢ(f,x) = Σₛ⊆ₘ\{ᵢ} [|S|!(m-|S|-1)!/m!] × [f(xₛ∪{ᵢ}) - f(xₛ)]',
        explanation: 'SHAP assigns each feature i a contribution φᵢ to the final prediction. Sum of all φᵢ = prediction - baseline.',
        terms: {
          'φᵢ': 'SHAP value for feature i (contribution to prediction)',
          'f': 'Model/function',
          'x': 'Input features',
          'S': 'Subset of features (not including feature i)',
          'm': 'Total number of features',
          'f(xₛ∪{ᵢ})': 'Model output with feature i included in subset S',
          'f(xₛ)': 'Model output without feature i in subset S',
          'Σₛ': 'Summation over all possible subsets',
        }
      },
      predict: {
        formula: 'ŷ_single = f(x̂_user) where x̂_user = [(area-μ_area)/σ_area, (beds-μ_beds)/σ_beds, ...]',
        explanation: 'Single prediction: scale user inputs x_user using training data statistics, then pass through trained model f.',
        terms: {
          'ŷ_single': 'Predicted price for one house',
          'f': 'Trained model',
          'x̂_user': 'Scaled user input features',
          'area': 'Raw area value entered by user',
          'μ_area': 'Mean area from training data',
          'σ_area': 'Standard deviation of area from training data',
          'beds': 'Number of bedrooms',
        }
      },
    } as Record<
      string,
      {
        formula: string;
        explanation: string;
        terms: Record<string, string>;
      }
    >),
    [],
  );

  // Activation function descriptions
  const activationFunctions = useMemo(
    () => ({
      relu: {
        name: 'ReLU (Rectified Linear Unit)',
        description: 'Outputs max(0, x). Introduces non-linearity. Fast, commonly used in hidden layers.',
        formula: 'f(x) = max(0, x)',
      },
      sigmoid: {
        name: 'Sigmoid',
        description: 'Outputs values between 0 and 1. Good for binary classification. Can suffer from vanishing gradients.',
        formula: 'f(x) = 1 / (1 + e⁻ˣ)',
      },
      tanh: {
        name: 'Tanh (Hyperbolic Tangent)',
        description: 'Outputs values between -1 and 1. Stronger gradient than sigmoid. Better than sigmoid for hidden layers.',
        formula: 'f(x) = (eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)',
      },
      linear: {
        name: 'Linear',
        description: 'No activation f(x) = x. Used in output layer for regression tasks.',
        formula: 'f(x) = x',
      },
      softmax: {
        name: 'Softmax',
        description: 'Outputs probability distribution. Used in output layer for multi-class classification.',
        formula: 'f(xᵢ) = eˣⁱ / Σⱼ eˣʲ',
      },
      elu: {
        name: 'ELU (Exponential Linear Unit)',
        description: 'Smooth version of ReLU. Better convergence than ReLU with no dying ReLU problem.',
        formula: 'f(x) = x if x > 0, else α(eˣ - 1)',
      },
    }),
    [],
  );

  // Helper function to generate activation function graph points
  const getActivationGraphPoints = (funcType: string): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = [];
    const range = 30; // x range from -5 to 5
    const step = 0.2;

    for (let x = -range / 6; x <= range / 6; x += step) {
      let y = 0;
      switch (funcType) {
        case 'relu':
          y = Math.max(0, x);
          break;
        case 'sigmoid':
          y = 1 / (1 + Math.exp(-x));
          break;
        case 'tanh':
          y = Math.tanh(x);
          break;
        case 'elu':
          y = x > 0 ? x : 0.5 * (Math.exp(x) - 1);
          break;
        case 'linear':
          y = x;
          break;
        default:
          y = x;
      }
      points.push({ x, y });
    }
    return points;
  };

  // Component to render small activation function graph
  const ActivationGraph = ({ funcType }: { funcType: string }) => {
    const points = getActivationGraphPoints(funcType);
    const width = 140;
    const height = 100;
    const padding = 12;

    // Find min/max for scaling
    const xMin = -5;
    const xMax = 5;
    const yMin = -2;
    const yMax = 2;

    const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
    const scaleY = (y: number) => height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);

    const pathData = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`)
      .join(' ');

    const originX = scaleX(0);
    const originY = scaleY(0);

    return (
      <div className="flex justify-center">
        <svg width={width} height={height} className="border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-950">
          {/* Axes */}
          <line x1={originX} y1={padding} x2={originX} y2={height - padding} stroke="rgb(120, 120, 120)" strokeWidth="1.5" />
          <line x1={padding} y1={originY} x2={width - padding} y2={originY} stroke="rgb(120, 120, 120)" strokeWidth="1.5" />

          {/* Origin marker */}
          <circle cx={originX} cy={originY} r="1.5" fill="rgb(120, 120, 120)" />

          {/* Grid lines */}
          <line x1={padding} y1={originY} x2={width - padding} y2={originY} stroke="rgba(150,150,150,0.3)" strokeWidth="0.5" />
          <line x1={originX} y1={padding} x2={originX} y2={height - padding} stroke="rgba(150,150,150,0.3)" strokeWidth="0.5" />

          {/* Function curve */}
          <path d={pathData} stroke="rgb(59, 130, 246)" strokeWidth="2.5" fill="none" />
        </svg>
      </div>
    );
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [setNodes, setEdges, selectedNodeId],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          return;
        }
        event.preventDefault();
        deleteNode(selectedNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, deleteNode]);

  // Update node styling when selection changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const isSelected = node.id === selectedNodeId;

        // determine category from typeKey or node id patterns
        const key = node.data?.typeKey ?? node.id;
        let category: 'data' | 'processing' | 'model' | 'evaluate' | 'explain' | 'predict' | 'default' = 'default';
        if (key === 'generate') category = 'data';
        else if (['scale', 'derive', 'split'].includes(String(key))) category = 'processing';
        else if (['linear', 'forest', 'neural', 'svr', 'gbm', 'knn'].includes(String(key))) category = 'model';
        else if (key === 'metrics') category = 'evaluate';
        else if (key === 'explain') category = 'explain';
        else if (key === 'predict') category = 'predict';

        // visual mapping per category
        const styleByCategory: Record<string, any> = {
          data: { backgroundColor: '#DBEAFE', borderRadius: 12, width: 160, height: 56 }, // blue-100
          processing: { backgroundColor: '#ECFCCB', borderRadius: 9999, width: 170, height: 52 }, // green-100 (pill)
          model: { backgroundColor: '#FFF7ED', borderRadius: 14, width: 220, height: 84 }, // amber-50 (larger)
          evaluate: { backgroundColor: '#FEF3F2', borderRadius: 12, width: 180, height: 64 }, // red-50
          explain: { backgroundColor: '#EEF2FF', borderRadius: 12, width: 200, height: 64 }, // indigo-50
          predict: { backgroundColor: '#F0F9FF', borderRadius: 12, width: 180, height: 56 }, // sky-50
          default: { backgroundColor: node.style?.backgroundColor || 'white', borderRadius: 10 },
        };

        const base = styleByCategory[category] || styleByCategory.default;

        return {
          ...node,
          style: {
            ...node.style,
            border: isSelected ? '3px solid rgb(59, 130, 246)' : '2px solid rgba(15,23,42,0.06)',
            boxShadow: isSelected ? '0 8px 24px rgba(59,130,246,0.12)' : 'none',
            backgroundColor: isSelected ? 'rgba(219,234,254,0.5)' : base.backgroundColor,
            transition: 'all 0.2s ease-in-out',
            borderRadius: base.borderRadius,
            width: base.width,
            height: base.height,
          },
        };
      })
    );
  }, [selectedNodeId, setNodes]);

  // Update edge styling when selection changes
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => {
        const isOutgoing = edge.source === selectedNodeId;
        const isAnyNodeSelected = selectedNodeId !== null;

        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: isOutgoing ? 'rgb(59, 130, 246)' : isAnyNodeSelected ? 'rgb(200, 200, 200)' : 'rgb(150, 150, 150)',
            strokeWidth: isOutgoing ? 3 : 2,
            opacity: isOutgoing ? 1 : isAnyNodeSelected ? 0.3 : 1,
            transition: 'all 0.2s ease-in-out',
          },
          animated: isOutgoing ? true : edge.animated,
        };
      })
    );
  }, [selectedNodeId, setEdges]);

  const generateNodeDataExamples = useCallback(() => {
    const examples: Record<string, { input?: any; output?: any; description?: string }> = {};

    const exampleHouse = {
      area_sqft: 2000,
      bedrooms: 3,
      bathrooms: 2,
      location_score: 7.5,
      age_years: 10,
      has_garage: 1,
      has_pool: 0,
      price: 485000,
    };

    examples.generate = {
      output: {
        sample_rows: [
          { ...exampleHouse, id: 1 },
          {
            area_sqft: 1500,
            bedrooms: 2,
            bathrooms: 1,
            location_score: 6.0,
            age_years: 15,
            has_garage: 0,
            has_pool: 0,
            price: 320000,
            id: 2,
          },
          {
            area_sqft: 3500,
            bedrooms: 4,
            bathrooms: 3,
            location_score: 9.0,
            age_years: 5,
            has_garage: 1,
            has_pool: 1,
            price: 750000,
            id: 3,
          },
        ],
        total_samples: 1000,
        columns: Object.keys(exampleHouse),
      },
      description: 'Generated 1000 synthetic house records with features and prices',
    };

    examples.scale = {
      input: {
        area_sqft: 2000,
        bedrooms: 3,
        bathrooms: 2,
        location_score: 7.5,
        age_years: 10,
        has_garage: 1,
        has_pool: 0,
      },
      output: {
        area_sqft: 0.12,
        bedrooms: 0.0,
        bathrooms: 0.0,
        location_score: 0.45,
        age_years: -0.15,
        has_garage: 1.2,
        has_pool: -0.8,
      },
      description:
        'Standardized features: mean=0, std=1. Large values (area) scaled down, small values (bedrooms) scaled up.',
    };

    examples.derive = {
      input: exampleHouse,
      output: {
        ...exampleHouse,
        price_per_sqft: 242.5,
        total_rooms: 5,
        age_category: 'moderate',
        luxury_score: 0.6,
      },
      description:
        'Created derived features: price_per_sqft, total_rooms, age_category, luxury_score',
    };

    examples.split = {
      input: { total_samples: 1000 },
      output: {
        train_set: { samples: 800, percentage: 80 },
        test_set: { samples: 200, percentage: 20 },
        example_train_row: { ...exampleHouse, id: 1 },
        example_test_row: {
          area_sqft: 1800,
          bedrooms: 3,
          bathrooms: 2,
          location_score: 8.0,
          age_years: 8,
          has_garage: 1,
          has_pool: 0,
          price: 520000,
          id: 201,
        },
      },
      description: 'Split dataset: 800 samples for training, 200 for testing',
    };

    examples.linear = {
      input: {
        train_samples: 800,
        features: ['area_sqft', 'bedrooms', 'bathrooms', 'location_score', 'age_years', 'has_garage', 'has_pool'],
      },
      output: {
        coefficients: {
          area_sqft: 148.5,
          bedrooms: 19800,
          bathrooms: 15200,
          location_score: 29800,
          age_years: -980,
          has_garage: 24800,
          has_pool: 39800,
          intercept: 52000,
        },
        training_loss: 0.023,
        r2_score: 0.87,
        example_prediction: {
          input: exampleHouse,
          predicted_price: 485200,
          actual_price: 485000,
          error: 200,
        },
      },
      description:
        'Trained Linear Regression: learned coefficients for each feature. Price = intercept + Σ(coefficient × feature)',
    };

    examples.forest = {
      input: {
        train_samples: 800,
        n_estimators: 100,
        max_depth: 10,
      },
      output: {
        n_trees: 100,
        avg_tree_depth: 8.5,
        feature_importance: {
          area_sqft: 0.42,
          location_score: 0.23,
          bedrooms: 0.12,
          bathrooms: 0.09,
          age_years: 0.06,
          has_pool: 0.05,
          has_garage: 0.03,
        },
        example_prediction: {
          input: exampleHouse,
          predicted_price: 487500,
          actual_price: 485000,
          error: 2500,
        },
      },
      description:
        'Trained Random Forest: 100 decision trees, averaged predictions. Captures non-linear relationships.',
    };

    examples.neural = {
      input: {
        train_samples: 800,
        layers: [7, 32, 16, 1],
        epochs: 50,
      },
      output: {
        architecture: 'Input(7) → Hidden(32) → Hidden(16) → Output(1)',
        epochs_completed: 50,
        final_loss: 0.018,
        example_prediction: {
          input: exampleHouse,
          predicted_price: 486800,
          actual_price: 485000,
          error: 1800,
        },
      },
      description:
        'Trained Neural Network: 3-layer network with ReLU activation. Learned complex feature interactions.',
    };

    examples.metrics = {
      input: {
        model: 'Linear Regression',
        test_samples: 200,
      },
      output: {
        rmse: 18500,
        mae: 14200,
        r2: 0.87,
        example_predictions: [
          { actual: 320000, predicted: 318500, error: 1500 },
          { actual: 485000, predicted: 485200, error: 200 },
          { actual: 750000, predicted: 748200, error: 1800 },
        ],
      },
      description:
        'Evaluated model on test set: RMSE=$18,500, MAE=$14,200, R²=0.87. Lower errors = better model.',
    };

    examples.explain = {
      input: {
        model: 'Random Forest',
        sample_house: exampleHouse,
      },
      output: {
        feature_contributions: {
          area_sqft: 84000,
          location_score: 69000,
          bedrooms: 39600,
          bathrooms: 30400,
          has_garage: 24800,
          age_years: -9800,
          has_pool: 0,
        },
        base_value: 50000,
        predicted_price: 487500,
      },
      description:
        'SHAP values show how each feature contributes to the prediction. Positive = increases price, Negative = decreases.',
    };

    examples.predict = {
      input: {
        area: features.area,
        bedrooms: features.bedrooms,
        bathrooms: features.bathrooms,
        location: features.location,
        age: features.age,
        hasGarage: features.hasGarage,
        hasPool: features.hasPool,
      },
      output: {
        predicted_price: predictedPrice,
        confidence_interval: [predictedPrice * 0.92, predictedPrice * 1.08],
        feature_breakdown: priceBreakdown,
      },
      description: `Predicted price: $${predictedPrice.toLocaleString()}. Based on current house features.`,
    };

    return examples;
  }, [features, predictedPrice, priceBreakdown]);

  const onRunPipeline = useCallback(() => {
    if (nodes.length === 0) {
      setPipelineResults({
        status: 'error',
        message: 'Please add at least one node to the pipeline before running.',
      });
      return;
    }

    setPipelineResults({ status: 'running', message: 'Executing pipeline...' });

    setTimeout(() => {
      const nodeCount = nodes.length;
      const edgeCount = edges.length;
      const hasDataNode = nodes.some((n) => n.data.typeKey === 'generate');
      const hasModelNode = nodes.some((n) =>
        ['linear', 'forest', 'neural'].includes(n.data.typeKey),
      );
      const hasPredictNode = nodes.some((n) => n.data.typeKey === 'predict');

      const examples = generateNodeDataExamples();
      setNodeDataExamples(examples);

      let message = `Pipeline executed successfully!\n\n`;
      message += `• Processed ${nodeCount} pipeline step(s)\n`;
      message += `• Connected ${edgeCount} edge(s)\n`;

      if (hasDataNode) {
        message += `• Generated synthetic house dataset (1000 samples)\n`;
      }
      if (hasModelNode) {
        message += `• Trained model(s) on training data\n`;
        message += `• Model performance: RMSE ≈ $18,500, R² ≈ 0.87\n`;
      }
      if (hasPredictNode) {
        const price = predictedPrice;
        message += `• Predicted price for current house: $${price.toLocaleString()}\n`;
      }

      message += `\n💡 Click on any node to see how data flows through that step!`;

      setPipelineResults({
        status: 'completed',
        message,
        executionTime: Math.random() * 2000 + 500,
      });
    }, 1500);
  }, [nodes, edges, features, predictedPrice, generateNodeDataExamples]);

  const onDragStart = useCallback((event: React.DragEvent, typeKey: string) => {
    event.dataTransfer.setData('application/reactflow', typeKey);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const typeKey = event.dataTransfer.getData('application/reactflow');
      if (!typeKey) return;

      const bounds = (event.target as HTMLDivElement).getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      const definition = pipelineNodeTypes.find((n) => n.id === typeKey);
      const label = definition?.label ?? typeKey;

      const newNode: Node<PipelineNodeData> = {
        id: `${typeKey}-${Date.now()}`,
        position,
        data: { label, typeKey },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [pipelineNodeTypes, setNodes],
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const typeKey = selectedNode?.data?.typeKey;
  const selectedExplanation = typeKey && nodeDetails[typeKey]
    ? nodeDetails[typeKey]
    : null;

  return (
    <Tabs defaultValue="pipeline" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Interactive House Price Lab</h2>
          <p className="text-sm text-muted-foreground">
            Explore the full ML pipeline and then dive into predictions and visualizations.
          </p>
        </div>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Playground</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations &amp; Predictions</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="pipeline" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Pipeline Playground</h3>
            <p className="text-xs text-muted-foreground">
              Drag steps from the left, connect them in the canvas, and inspect each stage on the right.
            </p>
          </div>
          <Button
            onClick={onRunPipeline}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 transform"
            disabled={pipelineResults.status === 'running'}
          >
            <Play className="mr-2 h-4 w-4" />
            {pipelineResults.status === 'running' ? 'Running...' : 'Run Pipeline'}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Horizontal Pipeline Menu Tabs */}
          <div className="bg-card border rounded-lg p-2">
            <div className="flex flex-1 gap-2 items-center">
              {/* Data Tab */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="hover:bg-accent flex-1">
                    Data
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto p-3">
                  <div className="flex flex-wrap gap-2 max-w-sm">
                    {pipelineNodeTypes.filter(n => n.category === 'Data').map((node) => (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(event) => onDragStart(event, node.id)}
                        className="w-32 p-2 bg-slate-50 dark:bg-slate-900 border rounded-md cursor-move hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <p className="font-medium text-sm mb-1">{node.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{nodeDetails[node.id]?.what}</p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Preprocessing Tab */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="hover:bg-accent flex-1">
                    Preprocessing
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto p-3">
                  <div className="flex flex-wrap gap-2 max-w-sm">
                    {pipelineNodeTypes.filter(n => n.category === 'Processing' || n.category === 'Split').map((node) => (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(event) => onDragStart(event, node.id)}
                        className="w-32 p-2 bg-slate-50 dark:bg-slate-900 border rounded-md cursor-move hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <p className="font-medium text-sm mb-1">{node.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{nodeDetails[node.id]?.what}</p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Training Tab */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="hover:bg-accent flex-1">
                    Training
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto p-3">
                  <div className="flex flex-wrap gap-2 max-w-sm">
                    {pipelineNodeTypes.filter(n => n.category === 'Model').map((node) => (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(event) => onDragStart(event, node.id)}
                        className="w-32 p-2 bg-slate-50 dark:bg-slate-900 border rounded-md cursor-move hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <p className="font-medium text-sm mb-1">{node.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{nodeDetails[node.id]?.what}</p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Evaluation Tab */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="hover:bg-accent flex-1">
                    Evaluation
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto p-3">
                  <div className="flex flex-wrap gap-2 max-w-sm">
                    {pipelineNodeTypes.filter(n => n.category === 'Evaluate' || n.category === 'Explain').map((node) => (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(event) => onDragStart(event, node.id)}
                        className="w-32 p-2 bg-slate-50 dark:bg-slate-900 border rounded-md cursor-move hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <p className="font-medium text-sm mb-1">{node.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{nodeDetails[node.id]?.what}</p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Prediction Tab */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="hover:bg-accent flex-1">
                    Prediction
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto p-3">
                  <div className="flex flex-wrap gap-2 max-w-sm">
                    {pipelineNodeTypes.filter(n => n.category === 'Predict').map((node) => (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(event) => onDragStart(event, node.id)}
                        className="w-32 p-2 bg-slate-50 dark:bg-slate-900 border rounded-md cursor-move hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <p className="font-medium text-sm mb-1">{node.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{nodeDetails[node.id]?.what}</p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Canvas and Step Explanation - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Canvas - 2/3 width */}
            <div className="lg:col-span-2">
              <Card className="h-[700px] lg:h-[800px] flex flex-col">
                <CardHeader className="pb-2 shrink-0">
                  <CardTitle className="text-base">Pipeline Canvas</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <div
                    className="w-full h-full rounded-lg border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-3"
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                  >
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      onNodeClick={onNodeClick}
                      fitView
                      nodeTypes={{}}
                    >
                      <Background gap={16} size={1} color="rgba(0,0,0,0.04)" />
                      <MiniMap />
                      <Controls />
                      <Background gap={16} size={1} />
                    </ReactFlow>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step Explanation - 1/3 width on the right */}
            <div className="lg:col-span-1">
              <Card className="h-[700px] lg:h-[800px] flex flex-col overflow-hidden">
                <CardHeader className="pb-2 shrink-0">
                  <CardTitle className="text-base">Step Info</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 text-sm px-4 pt-4 pb-8">
                  {!selectedExplanation && (
                    <p className="text-xs text-muted-foreground">
                      Click any node in the canvas to learn what that step does in the house price pipeline.
                    </p>
                  )}

                  {selectedExplanation && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold flex-1">{selectedExplanation.title}</h3>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => selectedNodeId && deleteNode(selectedNodeId)}
                          className="h-7 w-7 p-0 shrink-0"
                          title="Delete node (or press Delete/Backspace)"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                          What this does
                        </h4>
                        <p className="text-xs text-muted-foreground">{selectedExplanation.what}</p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                          Why it matters
                        </h4>
                        <p className="text-xs text-muted-foreground">{selectedExplanation.why}</p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                          How data flows
                        </h4>
                        <p className="text-xs text-muted-foreground">{selectedExplanation.flow}</p>
                      </div>

                      {/* Hyperparameter Editing for Neural Network */}
                      {typeKey === 'neural' && selectedNodeId && (
                        <div className="space-y-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950 p-4">
                          <h4 className="text-xs font-semibold uppercase text-amber-900 dark:text-amber-200">
                            ⚙️ Network Architecture
                          </h4>
                          <div className="space-y-3">
                            {/* Layers and Activations */}
                            <div className="space-y-2">
                              <h5 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Hidden Layers:</h5>
                              <div className="space-y-2 bg-white dark:bg-slate-900 p-2 rounded border border-amber-200 dark:border-amber-800">
                                {(modelHyperparameters[selectedNodeId]?.layers || []).map((layerSize: number, idx: number) => (
                                  <div key={idx} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                      <label className="text-xs text-muted-foreground block mb-1">
                                        Layer {idx + 1} Neurons
                                      </label>
                                      <input
                                        type="number"
                                        value={layerSize}
                                        onChange={(e) => {
                                          const newLayers = [...(modelHyperparameters[selectedNodeId]?.layers || [])];
                                          newLayers[idx] = parseInt(e.target.value) || 32;
                                          setModelHyperparameters({
                                            ...modelHyperparameters,
                                            [selectedNodeId]: {
                                              ...modelHyperparameters[selectedNodeId],
                                              layers: newLayers,
                                            },
                                          });
                                        }}
                                        className="w-full px-2 py-1 text-xs border rounded bg-background"
                                        min="8"
                                        max="256"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <label className="text-xs text-muted-foreground block mb-1">
                                        Activation
                                      </label>
                                      <select
                                        value={modelHyperparameters[selectedNodeId]?.activations?.[idx] || 'relu'}
                                        onChange={(e) => {
                                          const newActivations = [...(modelHyperparameters[selectedNodeId]?.activations || [])];
                                          newActivations[idx] = e.target.value;
                                          setModelHyperparameters({
                                            ...modelHyperparameters,
                                            [selectedNodeId]: {
                                              ...modelHyperparameters[selectedNodeId],
                                              activations: newActivations,
                                            },
                                          });
                                        }}
                                        className="w-full px-2 py-1 text-xs border rounded bg-background"
                                      >
                                        <option value="relu">ReLU</option>
                                        <option value="tanh">Tanh</option>
                                        <option value="sigmoid">Sigmoid</option>
                                        <option value="elu">ELU</option>
                                      </select>
                                    </div>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        const newLayers = (modelHyperparameters[selectedNodeId]?.layers || []).filter((_: number, i: number) => i !== idx);
                                        const newActivations = (modelHyperparameters[selectedNodeId]?.activations || []).filter((_: string, i: number) => i !== idx);
                                        setModelHyperparameters({
                                          ...modelHyperparameters,
                                          [selectedNodeId]: {
                                            ...modelHyperparameters[selectedNodeId],
                                            layers: newLayers,
                                            activations: newActivations,
                                          },
                                        });
                                      }}
                                      className="h-8 px-2"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      layers: [...(modelHyperparameters[selectedNodeId]?.layers || []), 32],
                                      activations: [...(modelHyperparameters[selectedNodeId]?.activations || []), 'relu'],
                                    },
                                  });
                                }}
                                className="w-full text-xs"
                              >
                                + Add Layer
                              </Button>
                            </div>

                            {/* Activation Function Reference */}
                            <div className="space-y-1">
                              <h5 className="text-xs font-semibold text-amber-800 dark:text-amber-300">📚 Activation Functions:</h5>
                              <div className="bg-white dark:bg-slate-900 p-2 rounded border border-amber-100 dark:border-amber-800 space-y-2">
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {['relu', 'tanh', 'sigmoid', 'elu'].map((func) => (
                                    <div key={func} className="text-xs">
                                      <p className="font-semibold text-amber-700 dark:text-amber-300">
                                        {activationFunctions[func as keyof typeof activationFunctions].name}
                                      </p>
                                      <p className="text-muted-foreground text-xs leading-tight">
                                        {activationFunctions[func as keyof typeof activationFunctions].description}
                                      </p>
                                      <p className="font-mono text-xs text-primary mt-0.5">
                                        {activationFunctions[func as keyof typeof activationFunctions].formula}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Dynamic Graph Display */}
                                {(modelHyperparameters[selectedNodeId]?.activations || []).length > 0 && (
                                  <div className="border-t-2 border-amber-300 dark:border-amber-600 mt-3 pt-3">
                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-3 pb-2 border-b border-amber-200 dark:border-amber-700">
                                      📊 Selected Functions Visualization:
                                    </p>
                                    <div className="space-y-3">
                                      {(modelHyperparameters[selectedNodeId]?.activations || []).map((funcType: string, idx: number) => (
                                        <div key={idx} className="space-y-1.5 p-2 bg-amber-50 dark:bg-amber-950 rounded">
                                          <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                                            Layer {idx + 1}: {activationFunctions[funcType as keyof typeof activationFunctions].name}
                                          </p>
                                          <ActivationGraph funcType={funcType} />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Learning Rate */}
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                Learning Rate: {modelHyperparameters[selectedNodeId]?.learning_rate || 0.001}
                              </label>
                              <input
                                type="range"
                                value={modelHyperparameters[selectedNodeId]?.learning_rate || 0.001}
                                onChange={(e) => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      learning_rate: parseFloat(e.target.value),
                                    },
                                  });
                                }}
                                min="0.0001"
                                max="0.1"
                                step="0.001"
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hyperparameter Editing for Random Forest */}
                      {typeKey === 'forest' && selectedNodeId && (
                        <div className="space-y-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950 p-4">
                          <h4 className="text-xs font-semibold uppercase text-amber-900 dark:text-amber-200">
                            ⚙️ Forest Configuration
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                                Number of Trees: {modelHyperparameters[selectedNodeId]?.n_estimators || 100}
                              </label>
                              <input
                                type="range"
                                value={modelHyperparameters[selectedNodeId]?.n_estimators || 100}
                                onChange={(e) => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      n_estimators: parseInt(e.target.value),
                                    },
                                  });
                                }}
                                min="10"
                                max="500"
                                step="10"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-green-800 dark:text-green-300 block mb-1">
                                Max Depth: {modelHyperparameters[selectedNodeId]?.max_depth || 10}
                              </label>
                              <input
                                type="range"
                                value={modelHyperparameters[selectedNodeId]?.max_depth || 10}
                                onChange={(e) => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      max_depth: parseInt(e.target.value),
                                    },
                                  });
                                }}
                                min="2"
                                max="30"
                                step="1"
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hyperparameter Editing for SVR */}
                      {typeKey === 'svr' && selectedNodeId && (
                        <div className="space-y-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950 p-4">
                          <h4 className="text-xs font-semibold uppercase text-amber-900 dark:text-amber-200">
                            ⚙️ Support Vector Configuration
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                                Kernel Function
                              </label>
                              <select
                                value={modelHyperparameters[selectedNodeId]?.kernel || 'rbf'}
                                onChange={(e) => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      kernel: e.target.value,
                                    },
                                  });
                                }}
                                className="w-full px-2 py-1 text-xs border rounded bg-background"
                              >
                                <option value="linear">Linear - f(x) = x·z</option>
                                <option value="rbf">RBF - exp(-γ||x-z||²) [Non-linear]</option>
                                <option value="poly">Polynomial - (x·z + c)^d</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-purple-800 dark:text-purple-300 block mb-1">
                                C (Regularization): {modelHyperparameters[selectedNodeId]?.C || 100}
                              </label>
                              <input
                                type="range"
                                value={modelHyperparameters[selectedNodeId]?.C || 100}
                                onChange={(e) => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      C: parseInt(e.target.value),
                                    },
                                  });
                                }}
                                min="1"
                                max="1000"
                                step="10"
                                className="w-full"
                              />
                              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Higher C = stricter fit, more prone to overfitting</p>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-purple-800 dark:text-purple-300 block mb-1">
                                Epsilon (Margin): {(modelHyperparameters[selectedNodeId]?.epsilon || 0.1).toFixed(2)}
                              </label>
                              <input
                                type="range"
                                value={modelHyperparameters[selectedNodeId]?.epsilon || 0.1}
                                onChange={(e) => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      epsilon: parseFloat(e.target.value),
                                    },
                                  });
                                }}
                                min="0.01"
                                max="1"
                                step="0.05"
                                className="w-full"
                              />
                              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Errors within ε are tolerated (not penalized)</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hyperparameter Editing for Gradient Boosting */}
                      {typeKey === 'gbm' && selectedNodeId && (
                        <div className="space-y-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950 p-4">
                          <h4 className="text-xs font-semibold uppercase text-amber-900 dark:text-amber-200">
                            ⚙️ Gradient Boosting Configuration
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                                Number of Estimators: {modelHyperparameters[selectedNodeId]?.n_estimators || 100}
                              </label>
                              <input
                                type="range"
                                value={modelHyperparameters[selectedNodeId]?.n_estimators || 100}
                                onChange={(e) => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      n_estimators: parseInt(e.target.value),
                                    },
                                  });
                                }}
                                min="10"
                                max="500"
                                step="10"
                                className="w-full"
                              />
                              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Number of boosting iterations (weak learners)</p>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-orange-800 dark:text-orange-300 block mb-1">
                                Learning Rate: {(modelHyperparameters[selectedNodeId]?.learning_rate || 0.1).toFixed(3)}
                              </label>
                              <input
                                type="range"
                                value={modelHyperparameters[selectedNodeId]?.learning_rate || 0.1}
                                onChange={(e) => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      learning_rate: parseFloat(e.target.value),
                                    },
                                  });
                                }}
                                min="0.001"
                                max="0.5"
                                step="0.01"
                                className="w-full"
                              />
                              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Lower = slower but more stable learning</p>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-orange-800 dark:text-orange-300 block mb-1">
                                Max Tree Depth: {modelHyperparameters[selectedNodeId]?.max_depth || 3}
                              </label>
                              <input
                                type="range"
                                value={modelHyperparameters[selectedNodeId]?.max_depth || 3}
                                onChange={(e) => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      max_depth: parseInt(e.target.value),
                                    },
                                  });
                                }}
                                min="1"
                                max="15"
                                step="1"
                                className="w-full"
                              />
                              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Depth of each weak learner tree</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hyperparameter Editing for KNN */}
                      {typeKey === 'knn' && selectedNodeId && (
                        <div className="space-y-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950 p-4">
                          <h4 className="text-xs font-semibold uppercase text-amber-900 dark:text-amber-200">
                            ⚙️ K-Nearest Neighbors Configuration
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                                K (Number of Neighbors): {modelHyperparameters[selectedNodeId]?.n_neighbors || 5}
                              </label>
                              <input
                                type="range"
                                value={modelHyperparameters[selectedNodeId]?.n_neighbors || 5}
                                onChange={(e) => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      n_neighbors: parseInt(e.target.value),
                                    },
                                  });
                                }}
                                min="1"
                                max="30"
                                step="1"
                                className="w-full"
                              />
                              <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">How many similar houses to average for prediction</p>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 block mb-1">
                                Weights
                              </label>
                              <select
                                value={modelHyperparameters[selectedNodeId]?.weights || 'uniform'}
                                onChange={(e) => {
                                  setModelHyperparameters({
                                    ...modelHyperparameters,
                                    [selectedNodeId]: {
                                      ...modelHyperparameters[selectedNodeId],
                                      weights: e.target.value,
                                    },
                                  });
                                }}
                                className="w-full px-2 py-1 text-xs border rounded bg-background"
                              >
                                <option value="uniform">Uniform - All neighbors weighted equally</option>
                                <option value="distance">Distance - Closer neighbors weighted more</option>
                              </select>
                              <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">How to average K neighbors' prices</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Math Formula Section */}
                      {typeKey && mathExplanations[typeKey] && (
                        <div className="space-y-3 rounded-md border bg-blue-50 dark:bg-blue-950 p-3">
                          <h4 className="text-xs font-semibold uppercase text-blue-900 dark:text-blue-200">
                            📐 The Formula
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-mono bg-white dark:bg-slate-950 p-3 rounded border border-blue-200 dark:border-blue-800 text-primary font-medium break-words">
                                {mathExplanations[typeKey].formula}
                              </p>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              {mathExplanations[typeKey].explanation}
                            </p>

                            {/* Term Definitions */}
                            {mathExplanations[typeKey].terms && Object.keys(mathExplanations[typeKey].terms).length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-semibold text-blue-800 dark:text-blue-300">📋 Terms Explained:</h5>
                                <div className="space-y-1 bg-white dark:bg-slate-900 p-2 rounded border border-blue-100 dark:border-blue-800">
                                  {Object.entries(mathExplanations[typeKey].terms).map(([term, definition]) => (
                                    <div key={term} className="text-xs">
                                      <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{term}:</span>
                                      <span className="text-slate-700 dark:text-slate-300 ml-1">{definition}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {pipelineResults.status === 'completed' && (
                              <p className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 p-2 rounded">
                                ✓ Check the <strong>Input & Output cards below</strong> to see this step in action with real data!
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {pipelineResults.status !== 'completed' && (
                        <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                          Click <span className="font-semibold">Run Pipeline</span> above to see how data
                          flows through this step with real examples.
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        💡 Tip: Press <kbd className="px-1 py-0.5 rounded bg-background border text-xs">Delete</kbd> or{' '}
                        <kbd className="px-1 py-0.5 rounded bg-background border text-xs">Backspace</kbd> to remove
                        this node
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Input/Output Data - Below Canvas */}
          {pipelineResults.status === 'completed' && selectedExplanation && typeKey && nodeDataExamples[typeKey] && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Input Data - Left */}
              {nodeDataExamples[typeKey].input && (
                <Card>
                  <CardHeader className="pb-2 shrink-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      Input Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-64 overflow-auto rounded bg-background p-3 text-xs border">
                      {JSON.stringify(nodeDataExamples[typeKey].input, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Output Data - Right */}
              {nodeDataExamples[typeKey].output && (
                <Card>
                  <CardHeader className="pb-2 shrink-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-600" />
                      Output Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-64 overflow-auto rounded bg-background p-3 text-xs border">
                      {JSON.stringify(nodeDataExamples[typeKey].output, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Description below input/output if available */}
          {pipelineResults.status === 'completed' && selectedExplanation && typeKey && nodeDataExamples[typeKey]?.description && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  {nodeDataExamples[typeKey].description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pipeline Execution Results */}
        {pipelineResults.status !== 'idle' && (
          <Card
            className={
              pipelineResults.status === 'error'
                ? 'border-destructive'
                : pipelineResults.status === 'running'
                  ? 'border-primary'
                  : 'border-green-500'
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {pipelineResults.status === 'running' && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                {pipelineResults.status === 'completed' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {pipelineResults.status === 'error' && (
                  <div className="h-5 w-5 rounded-full bg-destructive" />
                )}
                Pipeline Execution Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pipelineResults.status === 'running' && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{pipelineResults.message}</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full animate-pulse bg-primary" style={{ width: '60%' }} />
                  </div>
                </div>
              )}
              {(pipelineResults.status === 'completed' || pipelineResults.status === 'error') && (
                <div className="space-y-3">
                  <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                    {pipelineResults.message}
                  </pre>
                  {pipelineResults.executionTime && (
                    <p className="text-xs text-muted-foreground">
                      Execution time: {(pipelineResults.executionTime / 1000).toFixed(2)}s
                    </p>
                  )}
                  {pipelineResults.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPipelineResults({ status: 'idle' })}
                    >
                      Clear Results
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Compact single-house inputs inside the playground tab */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Home className="h-4 w-4 text-primary" />
              Single House Inputs (used by &quot;Predict Single House&quot;)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Area */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Area (sq ft)</span>
                <span className="font-mono text-[11px]">
                  {features.area.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[features.area]}
                onValueChange={([v]) => setFeatures((p) => ({ ...p, area: v }))}
                min={500}
                max={6000}
                step={100}
              />
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Bedrooms</span>
                <span className="font-mono text-[11px]">{features.bedrooms}</span>
              </div>
              <Slider
                value={[features.bedrooms]}
                onValueChange={([v]) => setFeatures((p) => ({ ...p, bedrooms: v }))}
                min={1}
                max={6}
                step={1}
              />
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Bathrooms</span>
                <span className="font-mono text-[11px]">{features.bathrooms}</span>
              </div>
              <Slider
                value={[features.bathrooms]}
                onValueChange={([v]) => setFeatures((p) => ({ ...p, bathrooms: v }))}
                min={1}
                max={5}
                step={1}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <span className="text-xs">Location</span>
              <Select
                value={features.location}
                onValueChange={(v) => setFeatures((p) => ({ ...p, location: v }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name} (Score: {loc.score})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Property Age (years)</span>
                <span className="font-mono text-[11px]">{features.age}</span>
              </div>
              <Slider
                value={[features.age]}
                onValueChange={([v]) => setFeatures((p) => ({ ...p, age: v }))}
                min={0}
                max={50}
                step={1}
              />
            </div>

            {/* Amenities */}
            <div className="flex gap-2">
              <Button
                variant={features.hasGarage ? 'default' : 'outline'}
                onClick={() => setFeatures((p) => ({ ...p, hasGarage: !p.hasGarage }))}
                className="flex-1 h-8 text-xs"
              >
                🚗 Garage
              </Button>
              <Button
                variant={features.hasPool ? 'default' : 'outline'}
                onClick={() => setFeatures((p) => ({ ...p, hasPool: !p.hasPool }))}
                className="flex-1 h-8 text-xs"
              >
                🏊 Pool
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="visualizations" className="space-y-6">
        {/* Sliders at the top for interactive prediction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              House Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Area */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Area (sq ft)</span>
                <span className="font-mono">{features.area.toLocaleString()}</span>
              </div>
              <Slider
                value={[features.area]}
                onValueChange={([v]) => setFeatures((p) => ({ ...p, area: v }))}
                min={500}
                max={6000}
                step={100}
              />
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bedrooms</span>
                <span className="font-mono">{features.bedrooms}</span>
              </div>
              <Slider
                value={[features.bedrooms]}
                onValueChange={([v]) => setFeatures((p) => ({ ...p, bedrooms: v }))}
                min={1}
                max={6}
                step={1}
              />
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bathrooms</span>
                <span className="font-mono">{features.bathrooms}</span>
              </div>
              <Slider
                value={[features.bathrooms]}
                onValueChange={([v]) => setFeatures((p) => ({ ...p, bathrooms: v }))}
                min={1}
                max={5}
                step={1}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <span className="text-sm">Location</span>
              <Select
                value={features.location}
                onValueChange={(v) => setFeatures((p) => ({ ...p, location: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name} (Score: {loc.score})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Property Age (years)</span>
                <span className="font-mono">{features.age}</span>
              </div>
              <Slider
                value={[features.age]}
                onValueChange={([v]) => setFeatures((p) => ({ ...p, age: v }))}
                min={0}
                max={50}
                step={1}
              />
            </div>

            {/* Amenities */}
            <div className="flex gap-4">
              <Button
                variant={features.hasGarage ? 'default' : 'outline'}
                onClick={() => setFeatures((p) => ({ ...p, hasGarage: !p.hasGarage }))}
                className="flex-1"
              >
                🚗 Garage
              </Button>
              <Button
                variant={features.hasPool ? 'default' : 'outline'}
                onClick={() => setFeatures((p) => ({ ...p, hasPool: !p.hasPool }))}
                className="flex-1"
              >
                🏊 Pool
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prediction + Breakdown */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Predicted Price (Baseline Linear Model)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">
                ${predictedPrice.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                This simple baseline uses fixed coefficients for each feature. Advanced models will
                be compared against this estimate.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Price Breakdown by Feature
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {priceBreakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-mono ${item.value < 0 ? 'text-destructive' : ''}`}>
                    {item.value < 0 ? '-' : '+'}${Math.abs(item.value).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">${predictedPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Model Comparison (Metrics Overview)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {modelMetrics.map((model) => (
                <Card key={model.name} className="border-2">
                  <CardContent className="pt-4 space-y-2 text-sm">
                    <div className="font-semibold">{model.name}</div>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="font-semibold text-muted-foreground">RMSE</div>
                        <div className="font-mono text-primary">${model.rmse.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-muted-foreground">R²</div>
                        <div className="font-mono text-primary">{model.r2.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-muted-foreground">MAE</div>
                        <div className="font-mono text-primary">${model.mae.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts & diagnostics */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-base">
                True vs Predicted Prices (Scatter Plot)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart data={scatterPlotData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="actual"
                    name="Actual Price"
                    unit="$"
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <YAxis
                    dataKey="predicted"
                    name="Predicted Price"
                    unit="$"
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    labelFormatter={(label) => `Actual: $${Number(label).toLocaleString()}`}
                  />
                  <Scatter name="Predictions" data={scatterPlotData} fill="#8884d8" />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={false}
                    name="Perfect Prediction"
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-muted-foreground">
                Points closer to the diagonal line indicate better predictions. Ideal model would have all
                points on the green line.
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-base">Residuals vs Predicted (Error Plot)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart data={residualData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="predicted"
                    name="Predicted Price"
                    unit="$"
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <YAxis
                    dataKey="residual"
                    name="Residual (Error)"
                    unit="$"
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Scatter name="Residuals" data={residualData} fill="#ff7300" />
                  <Line
                    type="monotone"
                    dataKey={() => 0}
                    stroke="#888888"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Zero Error"
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-muted-foreground">
                Residuals should be randomly distributed around zero (gray line). Patterns indicate model
                bias.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature importance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Feature Importance (Random Forest &amp; Explainability)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Feature importance scores from a Random Forest model show which features most influence
              house price predictions. Higher values indicate stronger predictive power.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Area (sq ft)', importance: 0.42 },
                  { name: 'Location Score', importance: 0.23 },
                  { name: 'Bedrooms', importance: 0.12 },
                  { name: 'Bathrooms', importance: 0.09 },
                  { name: 'Age', importance: 0.06 },
                  { name: 'Has Pool', importance: 0.05 },
                  { name: 'Has Garage', importance: 0.03 },
                ].sort((a, b) => b.importance - a.importance)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 0.5]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                <Bar dataKey="importance" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <p>
                <strong>Area</strong> is the most important feature (42%), followed by{' '}
                <strong>Location Score</strong> (23%). This makes intuitive sense: larger houses in
                better locations command higher prices.
              </p>
              <p>
                Amenities like garage and pool have lower importance (3-5%) but still contribute to
                price predictions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Partial dependence */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Partial Dependence: Price vs Area</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={partialDependenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="area"
                  name="Area (sq ft)"
                  label={{ value: 'Area (sq ft)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  dataKey="price"
                  name="Price"
                  tickFormatter={(value) => `$${value / 1000}k`}
                  label={{ value: 'Predicted Price', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  labelFormatter={(label) => `Area: ${label} sq ft`}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Predicted Price"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-muted-foreground">
              Partial dependence plots show how price changes as area increases while other features
              (bedrooms, location, age, etc.) are held constant. This reveals a roughly linear
              relationship: larger houses command higher prices.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export function HousePriceLab() {
  const [activeSection, setActiveSection] = useState('aim');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ExperimentLayout
      experimentNumber={6}
      title="House Price Prediction"
      subtitle="Interactive ML Pipeline for Price Estimation"
      icon="Home"
      duration="120 min"
      difficulty="Intermediate"
      tags={["Machine Learning", "Regression", "Neural Networks"]}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      <SectionCard id="aim" title="Aim" icon="Target">
        <div className="space-y-6">
          <p className="text-muted-foreground">
            To develop an AI-based system that predicts house prices based on various
            features such as area, location, number of rooms, and amenities using
            machine learning regression techniques.
          </p>

          <div className="space-y-3">
            <h4 className="font-semibold">Objectives</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span>Understand regression-based price prediction</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span>Implement Linear Regression and Random Forest models</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span>Analyze feature importance in price determination</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span>Evaluate model performance using RMSE and R² metrics</span>
              </li>
            </ul>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="Regression Analysis">
          <p className="text-muted-foreground mb-4">
            <strong>Regression</strong> is a supervised learning technique used to
            predict continuous numerical values. For house prices, we model the
            relationship between features (inputs) and price (output).
          </p>
        </TheoryBlock>

        <TheoryBlock title="Linear Regression">
          <div className="p-3 bg-muted/30 rounded-lg font-mono text-sm mb-4">
            Price = β₀ + β₁×Area + β₂×Bedrooms + β₃×Location + ...
          </div>
          <p className="text-muted-foreground">
            Finds optimal coefficients (β) that minimize the sum of squared errors.
          </p>
        </TheoryBlock>

        <TheoryBlock title="Random Forest">
          <p className="text-muted-foreground">
            An ensemble method that builds multiple decision trees and averages their
            predictions. Better handles non-linear relationships and feature interactions.
          </p>
        </TheoryBlock>

        <TheoryBlock title="Evaluation Metrics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">RMSE</h4>
                <p className="text-sm text-muted-foreground">
                  Root Mean Squared Error - average prediction error in dollars
                </p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">R² Score</h4>
                <p className="text-sm text-muted-foreground">
                  Proportion of variance explained (0 to 1, higher is better)
                </p>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>
      </SectionCard>

      <SectionCard id="algorithm" title="Algorithm" icon="Cog">
        <p className="text-muted-foreground mb-6">
          The pipeline for predicting house prices involves data processing, model training, and evaluation:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Data Preparation</h4>
              <p className="text-muted-foreground">Load dataset, handle missing values, encode categorical variables, split into training/test sets, and standardize numerical features.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Model Training</h4>
              <p className="text-muted-foreground">Train models like Linear Regression (minimizing squared error) or Random Forest (averaging multiple decision trees).</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Prediction</h4>
              <p className="text-muted-foreground">Process new house features, apply standardization, and compute the estimated price using the trained model.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Evaluation</h4>
              <p className="text-muted-foreground">Compute predictions on the test set, calculate metrics like RMSE and R² score, and analyze feature importance.</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-6 overflow-x-auto">
          <h4 className="text-sm font-semibold text-secondary-foreground/70 mb-3">📝 Pseudocode</h4>
          <pre className="font-mono text-sm text-secondary-foreground leading-relaxed">{`Algorithm: House Price Prediction

Input: House features (area, rooms, location, etc.)
Output: Predicted price

1. DATA PREPARATION:
   a. Load dataset & handle missing values
   b. Encode categorical & standardize numerical features
   c. Split into training (80%) and test (20%)

2. MODEL TRAINING:
   For Linear Regression: Minimize Σ(y - ŷ)²
   For Random Forest: Average N decision trees

3. PREDICTION:
   Price = Model(New_Features)

4. EVALUATION:
   Calculate RMSE and R² score`}</pre>
        </div>
      </SectionCard>

      <SectionCard id="program" title="Program" icon="Code">
        <CodeBlock
          code={HOUSE_PRICE_CODE}
          language="python"
          title="house_price_prediction.py"
        />
      </SectionCard>

      <SectionCard id="demo" title="Demo" icon="Play">
        <HousePriceDemo />
      </SectionCard>

      <SectionCard id="practice" title="Practice" icon="Pencil">
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise 1: Feature Impact</h4>
              <p className="text-sm text-muted-foreground">
                Adjust each feature individually and observe its impact on price.
                Which feature has the biggest effect?
              </p>
              <Badge variant="outline" className="mt-2">Beginner</Badge>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise 2: Add Features</h4>
              <p className="text-sm text-muted-foreground">
                Extend the model to include additional features like "school rating"
                or "crime rate". How does this affect accuracy?
              </p>
              <Badge variant="outline" className="mt-2">Intermediate</Badge>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise 3: Compare Models</h4>
              <p className="text-sm text-muted-foreground">
                Implement and compare Linear Regression, Random Forest, and
                Gradient Boosting. Which performs best?
              </p>
              <Badge variant="outline" className="mt-2">Advanced</Badge>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}
