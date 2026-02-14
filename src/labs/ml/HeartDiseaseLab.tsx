import { useState, useMemo, useCallback, useEffect } from 'react';
import { ExperimentLayout } from '@/components/layout/ExperimentLayout';
import { SectionCard, TheoryBlock } from '@/components/lab/SectionCard';
import { LabTabs } from '@/components/lab/LabTabs';
import { CodeBlock } from '@/components/lab/CodeBlock';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, CheckCircle2, AlertTriangle, HeartPulse, Activity, Trash2, Play, Database, TrendingUp } from 'lucide-react';
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
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

const HEART_DISEASE_CODE = `"""
Heart Disease Prediction using Machine Learning

This implementation uses various ML classifiers to predict
the likelihood of heart disease based on patient attributes.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

class HeartDiseasePredictor:
    """
    AI system for predicting heart disease risk.
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = None
        self.feature_names = [
            'age',
            'sex',
            'chest_pain_type',
            'resting_bp',
            'cholesterol',
            'fasting_blood_sugar',
            'resting_ecg',
            'max_heart_rate',
            'exercise_angina',
            'oldpeak',
            'slope',
            'num_vessels',
            'thalassemia'
        ]
    
    def load_data(self, filepath='heart.csv'):
        """Load and prepare the dataset."""
        # Using UCI Heart Disease dataset structure
        df = pd.read_csv(filepath)
        return df
    
    def prepare_features(self, X):
        """Prepare and scale features."""
        return self.scaler.transform(X)
    
    def train(self, X, y):
        """
        Train the heart disease prediction model.
        
        Args:
            X: Feature matrix
            y: Target labels (0: no disease, 1: disease)
        """
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        return {
            'accuracy': accuracy,
            'report': classification_report(y_test, y_pred),
            'confusion_matrix': confusion_matrix(y_test, y_pred)
        }
    
    def predict(self, patient_data):
        """
        Predict heart disease risk for a patient.
        
        Args:
            patient_data: dict with patient attributes
        Returns:
            Prediction result with probability
        """
        if self.model is None:
            raise ValueError("Model not trained")
        
        # Prepare input
        X = np.array([[patient_data[f] for f in self.feature_names]])
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        probability = self.model.predict_proba(X_scaled)[0]
        
        return {
            'prediction': int(prediction),
            'risk_level': 'High' if prediction == 1 else 'Low',
            'probability_no_disease': probability[0],
            'probability_disease': probability[1],
            'confidence': max(probability) * 100
        }
    
    def get_feature_importance(self):
        """Get feature importance from the model."""
        if self.model is None:
            return None
        
        importance = dict(zip(
            self.feature_names,
            self.model.feature_importances_
        ))
        return sorted(importance.items(), key=lambda x: x[1], reverse=True)
    
    def get_risk_factors(self, patient_data):
        """Identify key risk factors for a patient."""
        risk_factors = []
        
        if patient_data['age'] > 55:
            risk_factors.append(('Age', 'Over 55 years old'))
        
        if patient_data['cholesterol'] > 240:
            risk_factors.append(('Cholesterol', 'High (>240 mg/dL)'))
        
        if patient_data['resting_bp'] > 140:
            risk_factors.append(('Blood Pressure', 'High (>140 mmHg)'))
        
        if patient_data['max_heart_rate'] < 100:
            risk_factors.append(('Max Heart Rate', 'Low (<100 bpm)'))
        
        if patient_data['exercise_angina'] == 1:
            risk_factors.append(('Exercise Angina', 'Present'))
        
        if patient_data['fasting_blood_sugar'] > 120:
            risk_factors.append(('Blood Sugar', 'High (>120 mg/dL)'))
        
        return risk_factors


# Example usage
if __name__ == "__main__":
    predictor = HeartDiseasePredictor()
    
    # Sample patient data
    patient = {
        'age': 55,
        'sex': 1,  # 1: male, 0: female
        'chest_pain_type': 2,  # 0-3
        'resting_bp': 140,
        'cholesterol': 250,
        'fasting_blood_sugar': 0,  # 0: <120, 1: >120
        'resting_ecg': 1,
        'max_heart_rate': 150,
        'exercise_angina': 0,  # 0: no, 1: yes
        'oldpeak': 1.5,
        'slope': 1,
        'num_vessels': 0,
        'thalassemia': 2
    }
    
    # Note: In production, you would train the model first
    # result = predictor.predict(patient)
    # print(f"Risk Level: {result['risk_level']}")
    # print(f"Confidence: {result['confidence']:.1f}%")`;

// Simplified prediction model coefficients
const RISK_WEIGHTS = {
  age: { threshold: 55, weight: 0.15 },
  cholesterol: { threshold: 240, weight: 0.12 },
  restingBP: { threshold: 140, weight: 0.10 },
  maxHeartRate: { threshold: 100, weight: 0.08, inverse: true },
  exerciseAngina: { weight: 0.15 },
  fastingBloodSugar: { weight: 0.08 },
  oldpeak: { threshold: 2, weight: 0.10 },
  sex: { weight: 0.05 }, // Male slightly higher risk
  chestPainType: { weight: 0.12 },
};

function calculateRisk(data: {
  age: number;
  sex: string;
  chestPainType: number;
  restingBP: number;
  cholesterol: number;
  fastingBloodSugar: boolean;
  maxHeartRate: number;
  exerciseAngina: boolean;
  oldpeak: number;
}): number {
  let risk = 20; // Base risk

  if (data.age > 55) risk += 15;
  else if (data.age > 45) risk += 8;

  if (data.cholesterol > 240) risk += 12;
  else if (data.cholesterol > 200) risk += 6;

  if (data.restingBP > 140) risk += 10;
  else if (data.restingBP > 120) risk += 5;

  if (data.maxHeartRate < 100) risk += 8;
  else if (data.maxHeartRate < 120) risk += 4;

  if (data.exerciseAngina) risk += 15;
  if (data.fastingBloodSugar) risk += 8;

  if (data.oldpeak > 2) risk += 10;
  else if (data.oldpeak > 1) risk += 5;

  if (data.sex === 'male') risk += 5;

  if (data.chestPainType >= 3) risk += 12;
  else if (data.chestPainType >= 2) risk += 6;

  return Math.min(95, Math.max(5, risk));
}

function HeartDiseaseDemo() {
  // ROC Curve data for visualization
  const rocData = useMemo(() => [
    { fpr: 0.0, tpr: 0.0, threshold: 1.0, diagonal: 0.0 },
    { fpr: 0.05, tpr: 0.35, threshold: 0.9, diagonal: 0.05 },
    { fpr: 0.10, tpr: 0.55, threshold: 0.8, diagonal: 0.10 },
    { fpr: 0.15, tpr: 0.70, threshold: 0.7, diagonal: 0.15 },
    { fpr: 0.20, tpr: 0.78, threshold: 0.6, diagonal: 0.20 },
    { fpr: 0.25, tpr: 0.82, threshold: 0.5, diagonal: 0.25 },
    { fpr: 0.30, tpr: 0.85, threshold: 0.4, diagonal: 0.30 },
    { fpr: 0.35, tpr: 0.87, threshold: 0.3, diagonal: 0.35 },
    { fpr: 0.40, tpr: 0.89, threshold: 0.2, diagonal: 0.40 },
    { fpr: 0.45, tpr: 0.90, threshold: 0.1, diagonal: 0.45 },
    { fpr: 0.50, tpr: 0.91, threshold: 0.0, diagonal: 0.50 },
    { fpr: 0.60, tpr: 0.93, threshold: -0.1, diagonal: 0.60 },
    { fpr: 0.70, tpr: 0.95, threshold: -0.2, diagonal: 0.70 },
    { fpr: 0.80, tpr: 0.96, threshold: -0.3, diagonal: 0.80 },
    { fpr: 0.90, tpr: 0.98, threshold: -0.4, diagonal: 0.90 },
    { fpr: 1.0, tpr: 1.0, threshold: -0.5, diagonal: 1.0 },
  ], []);

  const [patientData, setPatientData] = useState({
    age: 50,
    sex: 'male',
    chestPainType: 1,
    restingBP: 130,
    cholesterol: 220,
    fastingBloodSugar: false,
    maxHeartRate: 140,
    exerciseAngina: false,
    oldpeak: 1.0,
  });

  const riskScore = useMemo(() => calculateRisk(patientData), [patientData]);

  const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Moderate' : 'Low';
  const riskColor = riskScore >= 70 ? 'text-destructive' : riskScore >= 40 ? 'text-orange-500' : 'text-primary';

  const riskFactors = useMemo(() => {
    const factors: string[] = [];
    if (patientData.age > 55) factors.push('Age over 55');
    if (patientData.cholesterol > 240) factors.push('High cholesterol');
    if (patientData.restingBP > 140) factors.push('High blood pressure');
    if (patientData.maxHeartRate < 120) factors.push('Low max heart rate');
    if (patientData.exerciseAngina) factors.push('Exercise-induced angina');
    if (patientData.fastingBloodSugar) factors.push('Elevated blood sugar');
    if (patientData.oldpeak > 1.5) factors.push('ST depression');
    return factors;
  }, [patientData]);

  // --- Pipeline canvas state (ReactFlow) ---
  const initialNodes = useMemo<Node[]>(
    () => [
      { id: 'data-load', type: 'input', position: { x: 50, y: 60 }, data: { label: 'Load Clinical Data', typeKey: 'load' } },
      { id: 'proc-impute', position: { x: 300, y: 40 }, data: { label: 'Impute Missing', typeKey: 'impute' } },
      { id: 'proc-encode', position: { x: 300, y: 140 }, data: { label: 'Encode Categorical', typeKey: 'encode' } },
      { id: 'proc-scale', position: { x: 550, y: 90 }, data: { label: 'Scale/Normalize', typeKey: 'scale' } },
      { id: 'split-train-test', position: { x: 800, y: 90 }, data: { label: 'Train/Test Split', typeKey: 'split' } },
      { id: 'model-logistic', position: { x: 1050, y: 10 }, data: { label: 'Logistic Regression', typeKey: 'logistic' } },
      { id: 'model-rf', position: { x: 1050, y: 90 }, data: { label: 'Random Forest', typeKey: 'forest' } },
      { id: 'model-svm', position: { x: 1050, y: 170 }, data: { label: 'SVM', typeKey: 'svm' } },
      { id: 'model-xgb', position: { x: 1250, y: 10 }, data: { label: 'XGBoost', typeKey: 'xgb' } },
      { id: 'model-stack', position: { x: 1250, y: 90 }, data: { label: 'Stacking Ensemble', typeKey: 'stack' } },
      { id: 'evaluate-metrics', position: { x: 1500, y: 90 }, data: { label: 'Compute Metrics', typeKey: 'metrics' } },
      { id: 'explain-shap', position: { x: 1750, y: 40 }, data: { label: 'SHAP Explanations', typeKey: 'explain' } },
      { id: 'predict-single', type: 'output', position: { x: 1750, y: 160 }, data: { label: 'Predict Patient', typeKey: 'predict' } },
    ],
    [],
  );

  const initialEdges = useMemo<Edge[]>(
    () => [
      { id: 'e-load-impute', source: 'data-load', target: 'proc-impute' },
      { id: 'e-load-encode', source: 'data-load', target: 'proc-encode' },
      { id: 'e-impute-scale', source: 'proc-impute', target: 'proc-scale' },
      { id: 'e-encode-scale', source: 'proc-encode', target: 'proc-scale' },
      { id: 'e-scale-split', source: 'proc-scale', target: 'split-train-test' },
      { id: 'e-split-logistic', source: 'split-train-test', target: 'model-logistic' },
      { id: 'e-split-rf', source: 'split-train-test', target: 'model-rf' },
      { id: 'e-split-svm', source: 'split-train-test', target: 'model-svm' },
      { id: 'e-split-xgb', source: 'split-train-test', target: 'model-xgb' },
      { id: 'e-logistic-stack', source: 'model-logistic', target: 'model-stack' },
      { id: 'e-rf-stack', source: 'model-rf', target: 'model-stack' },
      { id: 'e-svm-stack', source: 'model-svm', target: 'model-stack' },
      { id: 'e-xgb-stack', source: 'model-xgb', target: 'model-stack' },
      { id: 'e-stack-metrics', source: 'model-stack', target: 'evaluate-metrics' },
      { id: 'e-metrics-explain', source: 'evaluate-metrics', target: 'explain-shap' },
      { id: 'e-metrics-predict', source: 'evaluate-metrics', target: 'predict-single' },
    ],
    [],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [modelHyperparameters, setModelHyperparameters] = useState<Record<string, any>>({
    logistic: { C: 1.0, penalty: 'l2' },
    forest: { n_estimators: 100, max_depth: 10 },
    svm: { kernel: 'rbf', C: 1.0 },
    xgb: { n_estimators: 100, learning_rate: 0.1, max_depth: 3 },
    stack: { meta_model: 'logistic' },
  });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  // Ensemble selection and configuration
  const [ensembleType, setEnsembleType] = useState<'none' | 'bagging' | 'boosting' | 'stacking'>('stacking');
  const [ensembleConfig, setEnsembleConfig] = useState<Record<string, any>>({
    bagging: { base_estimator: 'forest', n_estimators: 50 },
    boosting: { base_estimator: 'xgb', n_estimators: 100, learning_rate: 0.1 },
    stacking: { base_learners: ['logistic', 'forest', 'svm'], meta_model: 'logistic' },
  });

  const [viewMode, setViewMode] = useState<'canvas' | 'visualization'>('canvas');

  const [rocModelType, setRocModelType] = useState<'ensemble' | 'logistic' | 'random_forest' | 'svm' | 'xgboost'>('ensemble');

  const [pipelineResults, setPipelineResults] = useState<{ status: 'idle' | 'running' | 'completed' | 'error'; message?: string }>({ status: 'idle' });

  // Dynamic ROC curve data based on ensemble type and selected model
  const getROCCurveData = useCallback((ensembleType: string, modelType: string) => {
    // Different ROC curves based on ensemble performance
    const baseData = [
      { fpr: 0.0, tpr: 0.0, threshold: 1.0, diagonal: 0.0 },
      { fpr: 0.05, tpr: 0.35, threshold: 0.9, diagonal: 0.05 },
      { fpr: 0.10, tpr: 0.55, threshold: 0.8, diagonal: 0.10 },
      { fpr: 0.15, tpr: 0.70, threshold: 0.7, diagonal: 0.15 },
      { fpr: 0.20, tpr: 0.78, threshold: 0.6, diagonal: 0.20 },
      { fpr: 0.25, tpr: 0.82, threshold: 0.5, diagonal: 0.25 },
      { fpr: 0.30, tpr: 0.85, threshold: 0.4, diagonal: 0.30 },
      { fpr: 0.35, tpr: 0.87, threshold: 0.3, diagonal: 0.35 },
      { fpr: 0.40, tpr: 0.89, threshold: 0.2, diagonal: 0.40 },
      { fpr: 0.45, tpr: 0.90, threshold: 0.1, diagonal: 0.45 },
      { fpr: 0.50, tpr: 0.91, threshold: 0.0, diagonal: 0.50 },
      { fpr: 0.60, tpr: 0.93, threshold: -0.1, diagonal: 0.60 },
      { fpr: 0.70, tpr: 0.95, threshold: -0.2, diagonal: 0.70 },
      { fpr: 0.80, tpr: 0.96, threshold: -0.3, diagonal: 0.80 },
      { fpr: 0.90, tpr: 0.98, threshold: -0.4, diagonal: 0.90 },
      { fpr: 1.0, tpr: 1.0, threshold: -0.5, diagonal: 1.0 },
    ];

    // Adjust ROC curve based on ensemble type performance
    let adjustedData = baseData;
    switch (ensembleType) {
      case 'stacking':
        // Best performance - highest AUC
        adjustedData = baseData.map(point => ({
          ...point,
          tpr: Math.min(1.0, point.tpr + 0.02),
          threshold: point.threshold - 0.05
        }));
        break;
      case 'boosting':
        // Good performance - medium AUC
        adjustedData = baseData.map(point => ({
          ...point,
          tpr: Math.min(1.0, point.tpr + 0.01),
          threshold: point.threshold - 0.02
        }));
        break;
      case 'bagging':
        // Moderate performance - lower AUC
        adjustedData = baseData.map(point => ({
          ...point,
          tpr: Math.min(1.0, point.tpr - 0.01),
          threshold: point.threshold + 0.02
        }));
        break;
      case 'none':
      default:
        // Single model - baseline performance
        adjustedData = baseData;
        break;
    }

    // Further adjust based on specific model type
    switch (modelType) {
      case 'logistic':
        // Logistic Regression - slightly lower performance
        return adjustedData.map(point => ({
          ...point,
          tpr: Math.min(1.0, point.tpr - 0.01),
          threshold: point.threshold + 0.02
        }));
      case 'random_forest':
        // Random Forest - good performance
        return adjustedData.map(point => ({
          ...point,
          tpr: Math.min(1.0, point.tpr + 0.01),
          threshold: point.threshold - 0.01
        }));
      case 'svm':
        // SVM - varies based on kernel
        return adjustedData.map(point => ({
          ...point,
          tpr: Math.min(1.0, point.tpr + 0.005),
          threshold: point.threshold - 0.005
        }));
      case 'xgboost':
        // XGBoost - best single model performance
        return adjustedData.map(point => ({
          ...point,
          tpr: Math.min(1.0, point.tpr + 0.015),
          threshold: point.threshold - 0.015
        }));
      case 'ensemble':
      default:
        // Use ensemble-adjusted data
        return adjustedData;
    }
  }, []);

  // Dynamic model performance metrics based on ensemble
  const getModelMetrics = useCallback((ensembleType: string) => {
    switch (ensembleType) {
      case 'stacking':
        return {
          auc: 0.92,
          sensitivity: 88,
          specificity: 86,
          accuracy: 90.1,
          precision: 86.2,
          recall: 88.5,
          f1: 87.3
        };
      case 'boosting':
        return {
          auc: 0.89,
          sensitivity: 85,
          specificity: 82,
          accuracy: 87.8,
          precision: 84.3,
          recall: 85.7,
          f1: 85.0
        };
      case 'bagging':
        return {
          auc: 0.85,
          sensitivity: 81,
          specificity: 79,
          accuracy: 83.5,
          precision: 80.1,
          recall: 81.2,
          f1: 80.6
        };
      case 'none':
      default:
        return {
          auc: 0.82,
          sensitivity: 78,
          specificity: 75,
          accuracy: 80.2,
          precision: 77.4,
          recall: 78.8,
          f1: 78.1
        };
    }
  }, []);

  // Node details for step info bar
  const nodeDetails = useMemo(
    () =>
    ({
      load: {
        title: 'Load Clinical Data',
        what: 'Loads patient medical records with features like age, blood pressure, cholesterol, and heart measurements.',
        why: 'Provides the foundation dataset for training and testing the heart disease prediction model.',
        flow: 'Raw patient data is imported and prepared for preprocessing steps.',
      },
      impute: {
        title: 'Impute Missing Values',
        what: 'Fills in missing data points using statistical methods like mean, median, or mode.',
        why: 'Most ML algorithms cannot handle missing values; imputation ensures complete datasets.',
        flow: 'Identifies missing values and replaces them with appropriate estimates based on available data.',
      },
      encode: {
        title: 'Encode Categorical Variables',
        what: 'Converts categorical features (like chest pain type) into numerical format.',
        why: 'Machine learning models require numerical input; encoding transforms categories into usable numbers.',
        flow: 'Applies one-hot encoding or label encoding to transform categorical features.',
      },
      scale: {
        title: 'Scale/Normalize Features',
        what: 'Standardizes numerical features to have similar ranges (mean=0, std=1).',
        why: 'Prevents features with large scales (like cholesterol) from dominating smaller features.',
        flow: 'Applies standardization to ensure all features contribute equally to model training.',
      },
      split: {
        title: 'Train/Test Split',
        what: 'Divides dataset into training (80%) and testing (20%) sets.',
        why: 'Allows evaluation of model performance on unseen data to prevent overfitting.',
        flow: 'Randomly partitions data while maintaining class distribution balance.',
      },
      logistic: {
        title: 'Logistic Regression',
        what: 'Binary classification model that estimates probability of heart disease using linear combination of features.',
        why: 'Provides interpretable results with clear feature coefficients and probability outputs.',
        flow: 'Fits sigmoid function to learn decision boundary between healthy and diseased patients.',
      },
      forest: {
        title: 'Random Forest',
        what: 'Ensemble of decision trees that vote on the final prediction.',
        why: 'Reduces overfitting, handles non-linear relationships, and provides feature importance.',
        flow: 'Builds multiple trees on random data subsets and averages their predictions.',
      },
      svm: {
        title: 'Support Vector Machine',
        what: 'Finds optimal hyperplane that maximally separates healthy and diseased patients.',
        why: 'Effective for high-dimensional data and works well with limited training samples.',
        flow: 'Maps features to higher dimensions to find best separating boundary.',
      },
      xgb: {
        title: 'XGBoost',
        what: 'Gradient boosting algorithm that builds trees sequentially to correct previous errors.',
        why: 'State-of-the-art performance with built-in regularization and handling of missing values.',
        flow: 'Iteratively improves predictions by focusing on previously misclassified cases.',
      },
      stack: {
        title: 'Stacking Ensemble',
        what: 'Combines multiple base models using a meta-learner to make final predictions.',
        why: 'Leverages strengths of different algorithms for improved accuracy and robustness.',
        flow: 'Base models make predictions, meta-model learns how to best combine them.',
      },
      metrics: {
        title: 'Compute Metrics',
        what: 'Calculates performance metrics like accuracy, precision, recall, and F1-score.',
        why: 'Quantifies model effectiveness and helps compare different approaches.',
        flow: 'Compares predicted labels with actual labels to compute evaluation scores.',
      },
      explain: {
        title: 'SHAP Explanations',
        what: 'Uses SHAP (SHapley Additive exPlanations) to explain individual predictions.',
        why: 'Provides transparency and trust by showing which features influenced each prediction.',
        flow: 'Calculates feature contributions for each prediction to explain model decisions.',
      },
      predict: {
        title: 'Predict Patient',
        what: 'Applies trained model to predict heart disease risk for new patient data.',
        why: 'Delivers the core functionality - estimating disease probability for clinical decision support.',
        flow: 'Preprocesses new patient data and applies trained model to output risk score.',
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

  // Math explanations for each step
  const mathExplanations = useMemo(
    () =>
    ({
      load: {
        formula: 'D = {(x₁⁽¹⁾, y¹), (x₁⁽²⁾, y²), ..., (x₁⁽ⁿ⁾, yⁿ)} where x = [age, sex, bp, chol, ...]',
        explanation: 'Dataset D contains n patient records. Each record i has feature vector xᵢ and target yᵢ (0=healthy, 1=diseased).',
        terms: {
          'D': 'Complete dataset of patient records',
          'xᵢ': 'Feature vector for patient i (age, sex, blood pressure, etc.)',
          'yᵢ': 'Target label for patient i (0=healthy, 1=heart disease)',
          'n': 'Total number of patient records',
        }
      },
      scale: {
        formula: 'x̂ⱼ = (xⱼ - μⱼ) / σⱼ  where μⱼ = (1/n)Σxⱼ⁽ⁱ⁾ and σⱼ = √[(1/n)Σ(xⱼ⁽ⁱ⁾ - μⱼ)²]',
        explanation: 'Standardization: Each feature j is centered (subtract mean μⱼ) and scaled (divide by std dev σⱼ). Result: N(0,1) distribution.',
        terms: {
          'x̂ⱼ': 'Scaled value of feature j',
          'xⱼ': 'Original value of feature j',
          'μⱼ': 'Mean of feature j across all patients',
          'σⱼ': 'Standard deviation of feature j',
          'n': 'Number of patient records',
        }
      },
      logistic: {
        formula: 'P(y=1|x) = 1 / (1 + e⁻ᶻ) where z = w₀ + Σⱼ₌₁ᵐ wⱼxⱼ',
        explanation: 'Logistic regression computes probability using sigmoid function. z is linear combination of features with learned weights w.',
        terms: {
          'P(y=1|x)': 'Probability of heart disease given features x',
          'z': 'Linear combination of features (log-odds)',
          'w₀': 'Intercept/bias term',
          'wⱼ': 'Weight for feature j',
          'xⱼ': 'Value of feature j',
          'm': 'Number of features',
        }
      },
      forest: {
        formula: 'ŷ = (1/B)Σᵇ₌₁ᴮ Tᵇ(x)  where Tᵇ are B independent decision trees',
        explanation: 'Random Forest averages predictions from B decision trees. Each tree learns on random subset of data and features.',
        terms: {
          'ŷ': 'Final predicted probability',
          'B': 'Number of trees (typically 100-1000)',
          'Tᵇ(x)': 'Prediction from tree b given patient features x',
          'x': 'Patient feature vector',
        }
      },
      svm: {
        formula: 'f(x) = sign(Σᵢ αᵢ yᵢ K(xᵢ, x) + b)  where K is kernel function',
        explanation: 'SVM finds optimal hyperplane in high-dimensional space using support vectors and kernel trick.',
        terms: {
          'f(x)': 'Prediction function (sign gives class)',
          'αᵢ': 'Lagrange multipliers (support vector weights)',
          'yᵢ': 'True label of support vector i',
          'K(x,z)': 'Kernel function computing similarity',
          'b': 'Bias term',
        }
      },
      xgb: {
        formula: 'ŷ = η·Σₘ₌₁ᴹ Tₘ(x)  where Tₘ are weak learners (trees)',
        explanation: 'XGBoost builds ensemble of weak learners sequentially, each correcting residuals from previous trees.',
        terms: {
          'ŷ': 'Final prediction',
          'η': 'Learning rate (step size)',
          'M': 'Number of boosting iterations',
          'Tₘ(x)': 'm-th weak learner (decision tree)',
        }
      },
      metrics: {
        formula: 'Accuracy = (TP + TN) / (TP + TN + FP + FN) | Precision = TP / (TP + FP) | Recall = TP / (TP + FN)',
        explanation: 'Classification metrics evaluate model performance. TP=True Positives, TN=True Negatives, FP=False Positives, FN=False Negatives.',
        terms: {
          'Accuracy': 'Overall correctness of predictions',
          'Precision': 'Proportion of positive predictions that are correct',
          'Recall': 'Proportion of actual positives correctly identified',
          'TP': 'True Positives - correctly predicted heart disease',
          'TN': 'True Negatives - correctly predicted healthy',
          'FP': 'False Positives - healthy predicted as diseased',
          'FN': 'False Negatives - diseased predicted as healthy',
        }
      },
      explain: {
        formula: 'φᵢ(f,x) = Σₛ⊆ₘ\{ᵢ} [|S|!(m-|S|-1)!/m!] × [f(xₛ∪{ᵢ}) - f(xₛ)]',
        explanation: 'SHAP values assign each feature i a contribution φᵢ to the prediction. Sum of all φᵢ equals prediction minus baseline.',
        terms: {
          'φᵢ': 'SHAP value for feature i',
          'f': 'Model prediction function',
          'x': 'Patient feature vector',
          'S': 'Subset of features (not including feature i)',
          'm': 'Total number of features',
        }
      },
      predict: {
        formula: 'Risk = P(y=1|x̂) × 100% where x̂ = scaled features',
        explanation: 'Final prediction: apply trained model to scaled patient features to get disease probability as percentage.',
        terms: {
          'Risk': 'Heart disease probability percentage',
          'P(y=1|x̂)': 'Model probability of heart disease',
          'x̂': 'Scaled patient feature vector',
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

  const runPipeline = useCallback(() => {
    setPipelineResults({ status: 'running', message: 'Executing pipeline...' });
    setTimeout(() => {
      const msg = `Pipeline executed using ${ensembleType === 'none' ? 'single model' : ensembleType} ensemble.`;
      setPipelineResults({ status: 'completed', message: msg });
    }, 1200);
  }, [ensembleType]);

  const pipelineNodeTypes = useMemo(
    () => [
      { id: 'load', label: 'Load Data', category: 'Data' },
      { id: 'impute', label: 'Impute Missing', category: 'Processing' },
      { id: 'encode', label: 'Encode Categorical', category: 'Processing' },
      { id: 'scale', label: 'Scale/Normalize', category: 'Processing' },
      { id: 'split', label: 'Train/Test Split', category: 'Split' },
      { id: 'logistic', label: 'Logistic Regression', category: 'Model' },
      { id: 'forest', label: 'Random Forest', category: 'Model' },
      { id: 'svm', label: 'Support Vector Machine', category: 'Model' },
      { id: 'xgb', label: 'XGBoost', category: 'Model' },
      { id: 'bagging', label: 'Bagging Ensemble', category: 'Model' },
      { id: 'boosting', label: 'Boosting Ensemble', category: 'Model' },
      { id: 'stack', label: 'Stacking Ensemble', category: 'Model' },
      { id: 'metrics', label: 'Compute Metrics', category: 'Evaluate' },
      { id: 'explain', label: 'SHAP Explanations', category: 'Explain' },
      { id: 'predict', label: 'Predict Patient', category: 'Predict' },
    ],
    [],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => setSelectedNodeId(node.id), []);

  // Update node visuals by category and selection
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const isSelected = node.id === selectedNodeId;
        const key = node.data?.typeKey ?? node.id;
        let category = 'default';
        if (key === 'load') category = 'data';
        else if (['impute', 'encode', 'scale'].includes(String(key))) category = 'processing';
        else if (['logistic', 'forest', 'svm', 'xgb', 'stack'].includes(String(key))) category = 'model';
        else if (key === 'metrics') category = 'evaluate';
        else if (key === 'explain') category = 'explain';
        else if (key === 'predict') category = 'predict';

        const styleByCategory: Record<string, any> = {
          data: { backgroundColor: '#DBEAFE', borderRadius: 12, width: 160, height: 56 },
          processing: { backgroundColor: '#ECFCCB', borderRadius: 9999, width: 170, height: 52 },
          model: { backgroundColor: '#FFF7ED', borderRadius: 14, width: 220, height: 84 },
          evaluate: { backgroundColor: '#FEF3F2', borderRadius: 12, width: 180, height: 64 },
          explain: { backgroundColor: '#EEF2FF', borderRadius: 12, width: 200, height: 64 },
          predict: { backgroundColor: '#F0F9FF', borderRadius: 12, width: 180, height: 56 },
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
            stroke: isOutgoing ? 'rgb(59,130,246)' : isAnyNodeSelected ? 'rgb(200,200,200)' : 'rgb(150,150,150)',
            strokeWidth: isOutgoing ? 3 : 2,
            opacity: isOutgoing ? 1 : isAnyNodeSelected ? 0.3 : 1,
            transition: 'all 0.2s ease-in-out',
          },
          animated: isOutgoing ? true : edge.animated,
        };
      })
    );
  }, [selectedNodeId, setEdges]);

  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges]);

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
      const position = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      const definition = pipelineNodeTypes.find((n) => n.id === typeKey);
      const label = definition?.label ?? typeKey;

      const newNode: Node = { id: `${typeKey}-${Date.now()}`, position, data: { label, typeKey } };
      setNodes((nds) => [...nds, newNode]);
    },
    [pipelineNodeTypes, setNodes],
  );

  return (
    <Tabs defaultValue="pipeline" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Interactive Heart Disease Lab</h2>
          <p className="text-sm text-muted-foreground">
            Explore the full ML pipeline and then dive into predictions and visualizations.
          </p>
        </div>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Playground</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations & Predictions</TabsTrigger>
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
            onClick={runPipeline}
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
                    {pipelineNodeTypes.filter(n => n.category === 'Data').map(node => (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(event) => onDragStart(event, node.id)}
                        className="w-32 p-2 bg-slate-50 dark:bg-slate-900 border rounded-md cursor-move hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <p className="font-medium text-sm mb-1">{node.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">Load and prepare clinical data</p>
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
                    {pipelineNodeTypes.filter(n => n.category === 'Processing' || n.category === 'Split').map(node => (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(event) => onDragStart(event, node.id)}
                        className="w-32 p-2 bg-slate-50 dark:bg-slate-900 border rounded-md cursor-move hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <p className="font-medium text-sm mb-1">{node.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">Clean and prepare data for modeling</p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Models Tab */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="hover:bg-accent flex-1">
                    Models
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto p-3">
                  <div className="flex flex-wrap gap-2 max-w-sm">
                    {pipelineNodeTypes.filter(n => n.category === 'Model').map(node => (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(event) => onDragStart(event, node.id)}
                        className="w-32 p-2 bg-slate-50 dark:bg-slate-900 border rounded-md cursor-move hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <p className="font-medium text-sm mb-1">{node.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">Train and evaluate models</p>
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
              <Card className="h-[600px] lg:h-[700px] flex flex-col">
                <CardHeader className="pb-2 shrink-0">
                  <CardTitle className="text-base">Pipeline Canvas</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold">Drag steps from categories and assemble a pipeline</h3>
                      <p className="text-xs text-muted-foreground">Connect nodes, click to inspect, and tune model hyperparameters.</p>
                    </div>
                  </div>
                  <div className="w-full h-[480px] rounded-lg border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-2" onDrop={onDrop} onDragOver={onDragOver}>
                    {viewMode === 'canvas' ? (
                      <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        fitView
                      >
                        <Background gap={16} size={1} color="rgba(0,0,0,0.04)" />
                        <MiniMap />
                        <Controls />
                      </ReactFlow>
                    ) : (
                      <div className="p-4 h-full overflow-auto">
                        <h4 className="text-sm font-semibold mb-2">Pipeline Visualizations</h4>
                        <p className="text-xs text-muted-foreground mb-3">Visualizations will appear here when you switch to the Visualizations & Predictions tab.</p>
                        <div className="space-y-4">
                          <div className="text-center text-muted-foreground py-8">
                            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-sm">No visualizations available in canvas mode</p>
                            <p className="text-xs text-muted-foreground mt-2">Switch to "Visualizations & Predictions" tab to see detailed analysis</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step Info - 1/3 width on the right */}
            <div className="lg:col-span-1">
              <Card className="h-[600px] lg:h-[700px] flex flex-col overflow-hidden">
                <CardHeader className="pb-2 shrink-0">
                  <CardTitle className="text-base">Step Info</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 text-sm px-4 pt-4 pb-8">
                  {!selectedNode && (
                    <p className="text-xs text-muted-foreground">
                      Click any node in the canvas to learn what that step does in the heart disease pipeline.
                    </p>
                  )}

                  {selectedNode && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold flex-1">{(selectedNode.data as any)?.label ?? 'Step Details'}</h3>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => selectedNodeId && setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId))}
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
                        <p className="text-xs text-muted-foreground">{nodeDetails[(selectedNode.data as any)?.typeKey]?.what || 'No description available.'}</p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                          Why it matters
                        </h4>
                        <p className="text-xs text-muted-foreground">{nodeDetails[(selectedNode.data as any)?.typeKey]?.why || 'No description available.'}</p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                          How data flows
                        </h4>
                        <p className="text-xs text-muted-foreground">{nodeDetails[(selectedNode.data as any)?.typeKey]?.flow || 'No description available.'}</p>
                      </div>

                      {/* Hyperparameter Editing for Model Nodes */}
                      {['logistic', 'forest', 'svm', 'xgb', 'stack'].includes(String(selectedNode.data?.typeKey)) && (
                        <div className="space-y-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950 p-4">
                          <h4 className="text-xs font-semibold uppercase text-amber-900 dark:text-amber-200">
                            ⚙️ Model Configuration
                          </h4>
                          <div className="space-y-2">
                            {selectedNode.data?.typeKey === 'forest' && (
                              <>
                                <div>
                                  <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                                    Number of Trees: {modelHyperparameters.forest.n_estimators}
                                  </label>
                                  <input
                                    type="range"
                                    value={modelHyperparameters.forest.n_estimators}
                                    onChange={(e) => {
                                      setModelHyperparameters({
                                        ...modelHyperparameters,
                                        forest: {
                                          ...modelHyperparameters.forest,
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
                                  <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                                    Max Depth: {modelHyperparameters.forest.max_depth}
                                  </label>
                                  <input
                                    type="range"
                                    value={modelHyperparameters.forest.max_depth}
                                    onChange={(e) => {
                                      setModelHyperparameters({
                                        ...modelHyperparameters,
                                        forest: {
                                          ...modelHyperparameters.forest,
                                          max_depth: parseInt(e.target.value),
                                        },
                                      });
                                    }}
                                    min="1"
                                    max="50"
                                    step="1"
                                    className="w-full"
                                  />
                                </div>
                              </>
                            )}

                            {selectedNode.data?.typeKey === 'xgb' && (
                              <>
                                <div>
                                  <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                                    Estimators: {modelHyperparameters.xgb.n_estimators}
                                  </label>
                                  <input
                                    type="range"
                                    value={modelHyperparameters.xgb.n_estimators}
                                    onChange={(e) => {
                                      setModelHyperparameters({
                                        ...modelHyperparameters,
                                        xgb: {
                                          ...modelHyperparameters.xgb,
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
                                  <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                                    Learning Rate: {(modelHyperparameters.xgb.learning_rate).toFixed(3)}
                                  </label>
                                  <input
                                    type="range"
                                    value={modelHyperparameters.xgb.learning_rate}
                                    onChange={(e) => {
                                      setModelHyperparameters({
                                        ...modelHyperparameters,
                                        xgb: {
                                          ...modelHyperparameters.xgb,
                                          learning_rate: parseFloat(e.target.value),
                                        },
                                      });
                                    }}
                                    min="0.001"
                                    max="0.5"
                                    step="0.001"
                                    className="w-full"
                                  />
                                </div>
                              </>
                            )}

                            {selectedNode.data?.typeKey === 'svm' && (
                              <>
                                <div>
                                  <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                                    Kernel
                                  </label>
                                  <select
                                    value={modelHyperparameters.svm.kernel}
                                    onChange={(e) => {
                                      setModelHyperparameters({
                                        ...modelHyperparameters,
                                        svm: {
                                          ...modelHyperparameters.svm,
                                          kernel: e.target.value,
                                        },
                                      });
                                    }}
                                    className="w-full px-2 py-1 text-xs border rounded bg-background"
                                  >
                                    <option value="rbf">RBF</option>
                                    <option value="linear">Linear</option>
                                    <option value="poly">Polynomial</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                                    C (Regularization): {modelHyperparameters.svm.C}
                                  </label>
                                  <input
                                    type="range"
                                    value={modelHyperparameters.svm.C}
                                    onChange={(e) => {
                                      setModelHyperparameters({
                                        ...modelHyperparameters,
                                        svm: {
                                          ...modelHyperparameters.svm,
                                          C: parseFloat(e.target.value),
                                        },
                                      });
                                    }}
                                    min="0.1"
                                    max="100"
                                    step="0.1"
                                    className="w-full"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Math Formula Section */}
                      {mathExplanations[(selectedNode.data as any)?.typeKey] && (
                        <div className="space-y-3 rounded-md border bg-blue-50 dark:bg-blue-950 p-3">
                          <h4 className="text-xs font-semibold uppercase text-blue-900 dark:text-blue-200">
                            📐 The Formula
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-mono bg-white dark:bg-slate-950 p-3 rounded border border-blue-200 dark:border-blue-800 text-primary font-medium break-words">
                                {mathExplanations[(selectedNode.data as any)?.typeKey].formula}
                              </p>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              {mathExplanations[(selectedNode.data as any)?.typeKey].explanation}
                            </p>

                            {/* Term Definitions */}
                            {mathExplanations[(selectedNode.data as any)?.typeKey].terms && Object.keys(mathExplanations[(selectedNode.data as any)?.typeKey].terms).length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-semibold text-blue-800 dark:text-blue-300">📋 Terms Explained:</h5>
                                <div className="space-y-1 bg-white dark:bg-slate-900 p-2 rounded border border-blue-100 dark:border-blue-800">
                                  {Object.entries(mathExplanations[(selectedNode.data as any)?.typeKey].terms).map(([term, definition]) => (
                                    <div key={term} className="text-xs">
                                      <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{term}:</span>
                                      <span className="text-slate-700 dark:text-slate-300 ml-1">{definition}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
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

          {/* Input / Output cards shown after pipeline execution */}
          {pipelineResults.status === 'completed' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Input Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-48 overflow-auto rounded bg-background p-3 text-xs border">{JSON.stringify(patientData, null, 2)}</pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pipeline Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <div>Ensemble: <strong>{ensembleType}</strong></div>
                    <div>Result: <strong>{pipelineResults.message}</strong></div>
                    <div>Predicted Risk: <strong>{riskScore.toFixed(0)}%</strong></div>
                    <div className="mt-2 text-xs text-muted-foreground">Use the Run Pipeline button to re-execute with different settings.</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
        </div>
      </TabsContent>

      <TabsContent value="visualizations" className="space-y-6">
        {/* Patient Data Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Patient Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Age */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Age</span>
                <span className="font-mono">{patientData.age} years</span>
              </div>
              <Slider
                value={[patientData.age]}
                onValueChange={([v]) => setPatientData(p => ({ ...p, age: v }))}
                min={20}
                max={80}
                step={1}
              />
            </div>

            {/* Sex */}
            <div className="space-y-2">
              <span className="text-sm">Sex</span>
              <Select
                value={patientData.sex}
                onValueChange={(v) => setPatientData(p => ({ ...p, sex: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chest Pain Type */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Chest Pain Type</span>
                <span className="font-mono">{patientData.chestPainType}</span>
              </div>
              <Slider
                value={[patientData.chestPainType]}
                onValueChange={([v]) => setPatientData(p => ({ ...p, chestPainType: v }))}
                min={0}
                max={3}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                0: Typical angina, 1: Atypical, 2: Non-anginal, 3: Asymptomatic
              </p>
            </div>

            {/* Blood Pressure */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Resting Blood Pressure</span>
                <span className="font-mono">{patientData.restingBP} mmHg</span>
              </div>
              <Slider
                value={[patientData.restingBP]}
                onValueChange={([v]) => setPatientData(p => ({ ...p, restingBP: v }))}
                min={90}
                max={200}
                step={5}
              />
            </div>

            {/* Cholesterol */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cholesterol</span>
                <span className="font-mono">{patientData.cholesterol} mg/dL</span>
              </div>
              <Slider
                value={[patientData.cholesterol]}
                onValueChange={([v]) => setPatientData(p => ({ ...p, cholesterol: v }))}
                min={120}
                max={400}
                step={10}
              />
            </div>

            {/* Max Heart Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Max Heart Rate</span>
                <span className="font-mono">{patientData.maxHeartRate} bpm</span>
              </div>
              <Slider
                value={[patientData.maxHeartRate]}
                onValueChange={([v]) => setPatientData(p => ({ ...p, maxHeartRate: v }))}
                min={60}
                max={200}
                step={5}
              />
            </div>

            {/* Oldpeak (ST Depression) */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>ST Depression (Oldpeak)</span>
                <span className="font-mono">{patientData.oldpeak.toFixed(1)}</span>
              </div>
              <Slider
                value={[patientData.oldpeak]}
                onValueChange={([v]) => setPatientData(p => ({ ...p, oldpeak: v }))}
                min={0}
                max={6}
                step={0.1}
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Fasting Blood Sugar &gt; 120 mg/dL</span>
              <Switch
                checked={patientData.fastingBloodSugar}
                onCheckedChange={(v) => setPatientData(p => ({ ...p, fastingBloodSugar: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Exercise-Induced Angina</span>
              <Switch
                checked={patientData.exerciseAngina}
                onCheckedChange={(v) => setPatientData(p => ({ ...p, exerciseAngina: v }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Prediction Result */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Card className={`border-2 ${riskScore >= 70 ? 'border-destructive/50 bg-destructive/5' :
            riskScore >= 40 ? 'border-orange-500/50 bg-orange-500/5' :
              'border-primary/50 bg-primary/5'
            }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Heart Disease Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">
                {riskScore.toFixed(0)}%
              </div>
              <p className={`text-sm font-medium ${riskColor}`}>
                {riskLevel} Risk
              </p>
              <Progress value={riskScore} className="h-3 mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Risk Factors Identified
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {riskFactors.length > 0 ? (
                riskFactors.map((factor, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                    <span className="text-muted-foreground">{factor}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">No significant risk factors identified</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Importance */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: 'Exercise Angina', importance: 0.18 },
              { name: 'Age', importance: 0.15 },
              { name: 'Cholesterol', importance: 0.13 },
              { name: 'Chest Pain Type', importance: 0.12 },
              { name: 'Resting BP', importance: 0.11 },
              { name: 'ST Depression', importance: 0.10 },
              { name: 'Max Heart Rate', importance: 0.09 },
            ].map((feat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{feat.name}</span>
                  <span className="font-mono text-muted-foreground">
                    {(feat.importance * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${feat.importance * 100 * 5}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ROC AUC Curve */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ROC AUC Curve Analysis</span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Model</label>
                <select value={rocModelType} onChange={(e) => setRocModelType(e.target.value as any)} className="text-xs px-2 py-1 border rounded bg-background">
                  <option value="ensemble">Ensemble ({ensembleType})</option>
                  <option value="logistic">Logistic Regression</option>
                  <option value="random_forest">Random Forest</option>
                  <option value="svm">SVM</option>
                  <option value="xgboost">XGBoost</option>
                </select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Dynamic Performance Metrics based on Ensemble */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{getModelMetrics(ensembleType).auc.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">AUC Score</div>
                      <div className="text-xs text-green-600 mt-1">
                        {getModelMetrics(ensembleType).auc >= 0.9 ? 'Excellent Model' :
                          getModelMetrics(ensembleType).auc >= 0.8 ? 'Good Model' :
                            getModelMetrics(ensembleType).auc >= 0.7 ? 'Fair Model' : 'Poor Model'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{getModelMetrics(ensembleType).sensitivity}%</div>
                      <div className="text-sm text-muted-foreground">Sensitivity</div>
                      <div className="text-xs text-green-600 mt-1">True Positive Rate</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{getModelMetrics(ensembleType).specificity}%</div>
                      <div className="text-sm text-muted-foreground">Specificity</div>
                      <div className="text-xs text-blue-600 mt-1">True Negative Rate</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getROCCurveData(ensembleType, rocModelType)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="fpr"
                      label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }}
                      domain={[0, 1]}
                    />
                    <YAxis
                      dataKey="tpr"
                      label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
                      domain={[0, 1]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border p-2 rounded shadow-sm">
                              <p className="text-sm">FPR: {(data.fpr * 100).toFixed(1)}%</p>
                              <p className="text-sm">TPR: {(data.tpr * 100).toFixed(1)}%</p>
                              <p className="text-sm font-semibold">Threshold: {data.threshold}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tpr"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name={`${rocModelType === 'ensemble' ? (ensembleType === 'none' ? 'Single Model' : ensembleType) : rocModelType.replace('_', ' ')} ROC Curve`}
                    />
                    <Line
                      type="monotone"
                      dataKey="diagonal"
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                      name="Random Classifier"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Confusion Matrix</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-green-50 p-3 rounded border">
                        <div className="text-2xl font-bold text-green-600">135</div>
                        <div className="text-xs text-muted-foreground">True Negatives</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded border">
                        <div className="text-2xl font-bold text-red-600">23</div>
                        <div className="text-xs text-muted-foreground">False Positives</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded border">
                        <div className="text-2xl font-bold text-red-600">18</div>
                        <div className="text-xs text-muted-foreground">False Negatives</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded border">
                        <div className="text-2xl font-bold text-green-600">124</div>
                        <div className="text-xs text-muted-foreground">True Positives</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Model Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { metric: 'Accuracy', value: '89.2%', color: 'bg-primary' },
                      { metric: 'Precision', value: '84.3%', color: 'bg-blue-500' },
                      { metric: 'Recall', value: '87.3%', color: 'bg-green-500' },
                      { metric: 'F1-Score', value: '85.8%', color: 'bg-purple-500' },
                      { metric: 'Specificity', value: '85.4%', color: 'bg-orange-500' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{item.metric}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="font-mono font-semibold">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prediction Confidence Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Prediction Confidence Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-3">Risk Distribution</h4>
                <div className="space-y-2">
                  {[
                    { range: '0-30%', risk: 'Low', count: 45, color: 'bg-green-500' },
                    { range: '31-60%', risk: 'Moderate', count: 32, color: 'bg-yellow-500' },
                    { range: '61-80%', risk: 'High', count: 18, color: 'bg-orange-500' },
                    { range: '81-100%', risk: 'Very High', count: 5, color: 'bg-red-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <div>
                          <div className="font-medium">{item.risk} Risk ({item.range})</div>
                          <div className="text-xs text-muted-foreground">{item.count} patients</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{((item.count / 100) * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Feature Impact Analysis</h4>
                <div className="space-y-2">
                  {[
                    { feature: 'Exercise Angina', impact: '+25%', explanation: 'Significantly increases risk' },
                    { feature: 'Age > 55', impact: '+18%', explanation: 'Higher risk with age' },
                    { feature: 'High Cholesterol', impact: '+15%', explanation: 'Major cardiovascular risk factor' },
                    { feature: 'ST Depression', impact: '+12%', explanation: 'Indicates heart strain' },
                    { feature: 'Chest Pain Type 3', impact: '+10%', explanation: 'Most severe pain type' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium">{item.feature}</div>
                        <div className="text-xs text-muted-foreground">{item.explanation}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">{item.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export function HeartDiseaseLab() {
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
      experimentNumber={9}
      title="Heart Disease Prediction"
      subtitle="Predict heart disease using AI-based application"
      icon="Heart"
      duration="~45 minutes"
      difficulty="Intermediate"
      tags={['Classification', 'Healthcare', 'Random Forest']}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      <SectionCard id="aim" title="Aim" icon="Target">
        <p>
          To design and implement a machine learning system that can predict the presence
          of heart disease in patients based on clinical parameters like age, blood pressure,
          cholesterol, and heart rate.
        </p>
      </SectionCard>

      <SectionCard id="theory" title="Theory" icon="BookOpen">
        <TheoryBlock title="Heart Disease Prediction">
          <p>
            Heart disease prediction involves binary classification - determining whether a patient
            has heart disease (1) or not (0). We use historical medical records to train models
            that can recognize patterns associated with the disease.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Age & Sex:</strong> Risk increases with age; men are generally at higher risk.</li>
                  <li><strong>Chest Pain (CP):</strong> Strong indicator; types include typical angina, atypical angina, etc.</li>
                  <li><strong>Resting BP:</strong> High blood pressure (&gt;140 mmHg) strains the heart.</li>
                  <li><strong>Cholesterol:</strong> High levels (&gt;240 mg/dL) can clog arteries.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Algorithms Used</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Logistic Regression:</strong> Base model for probability estimation.</li>
                  <li><strong>Random Forest:</strong> Handles non-linear relationships between risk factors.</li>
                  <li><strong>XGBoost:</strong> High-performance gradient boosting for best accuracy.</li>
                  <li><strong>Ensemble Stacking:</strong> Combines models to reduce errors.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TheoryBlock>
      </SectionCard>

      <SectionCard id="algorithm" title="Algorithm" icon="ListChecks">
        <p className="text-muted-foreground mb-6">
          The heart disease prediction pipeline follows a standard machine learning workflow:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">1</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Data Collection</h4>
              <p className="text-muted-foreground">Load the UCI Heart Disease dataset containing 303 patient records with 14 attributes each.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">2</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Preprocessing</h4>
              <p className="text-muted-foreground">Handle missing values, encode categorical variables (sex, cp), and scale numerical features using StandardScaler.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">3</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Model Selection</h4>
              <p className="text-muted-foreground">Train multiple Classifiers: Logistic Regression, Random Forest, SVM, and XGBoost to find the best performer.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">4</div>
              <div className="w-0.5 flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Evaluation</h4>
              <p className="text-muted-foreground">Compare models using Accuracy, Precision, Recall, F1-Score, and ROC-AUC curves.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold gradient-primary text-white">5</div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-1">Risk Analysis</h4>
              <p className="text-muted-foreground">Use Feature Importance and SHAP values to identify key drivers of heart disease for explainability.</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-6 overflow-x-auto">
          <h4 className="text-sm font-semibold text-secondary-foreground/70 mb-3">📝 Pseudocode</h4>
          <pre className="font-mono text-sm text-secondary-foreground leading-relaxed">{`Algorithm: Heart Disease Prediction

Input: Patient clinical data (age, sex, cp, trestbps, etc.)
Output: Prediction (0: Healthy, 1: Heart Disease) and Probability

1. LOAD_DATA(filepath):
   df = read_csv(filepath)
   return df

2. PREPROCESS(df):
   df = impute_missing(df)
   df = encode_categorical(df, ['sex', 'cp', 'thal'])
   return df

3. TRAIN_MODEL(X, y):
   X_train, X_test, y_train, y_test = split(X, y, test_size=0.2)
   scaler = StandardScaler()
   X_train = scaler.fit_transform(X_train)
   
   model = RandomForestClassifier(n_estimators=100)
   model.fit(X_train, y_train)
   return model, scaler

4. PREDICT(patient_data, model, scaler):
   processed_data = preprocess(patient_data)
   scaled_data = scaler.transform(processed_data)
   prediction = model.predict(scaled_data)
   probability = model.predict_proba(scaled_data)
   return prediction, probability`}</pre>
        </div>
      </SectionCard>

      <SectionCard id="program" title="Program" icon="Code">
        <CodeBlock
          code={HEART_DISEASE_CODE}
          language="python"
          title="heart_disease_prediction.py"
        />
      </SectionCard>

      <SectionCard id="demo" title="Demo" icon="Play">
        <HeartDiseaseDemo />
      </SectionCard>

      <SectionCard id="practice" title="Practice" icon="Pencil">
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise 1: Risk Factor Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Adjust patient attributes and observe which combinations lead
                to high risk. Document the most impactful factors.
              </p>
              <Badge variant="outline" className="mt-2">Beginner</Badge>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise 2: Model Comparison</h4>
              <p className="text-sm text-muted-foreground">
                Implement and compare Logistic Regression, SVM, and Neural
                Network classifiers on the UCI Heart Disease dataset.
              </p>
              <Badge variant="outline" className="mt-2">Intermediate</Badge>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Exercise 3: Feature Engineering</h4>
              <p className="text-sm text-muted-foreground">
                Create new derived features (e.g., age groups, BP categories)
                and evaluate if they improve prediction accuracy.
              </p>
              <Badge variant="outline" className="mt-2">Advanced</Badge>
            </CardContent>
          </Card>
        </div>
      </SectionCard>
    </ExperimentLayout>
  );
}