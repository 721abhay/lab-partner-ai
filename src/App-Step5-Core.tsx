import { useState, useRef, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

type TabType = 'camera' | 'experiments' | 'safety' | 'data';
type ExperimentStatus = 'idle' | 'running' | 'paused';
type SafetyLevel = 'SAFE' | 'CAUTION' | 'DANGER';
type AlertLevel = 'none' | 'safe' | 'caution' | 'danger';
type ExperimentCategory = 'Chemistry' | 'Biology' | 'Physics';
type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

interface Chemical {
    id: string;
    chemicalName: string;
    commonName: string;
    emoji: string;
    description: string;
    safetyLevel: SafetyLevel;
    healthHazards: string[];
    incompatibleWith: string[];
    alternativeNames: string[];
}

interface DetectedChemical {
    chemical: Chemical;
    confidence: number;
    label: string;
}

interface DangerousReaction {
    chemical1: string;
    chemical2: string;
    danger: string;
    warning: string;
    audioMessage: string;
}

interface Experiment {
    id: string;
    name: string;
    category: ExperimentCategory;
    chemicalsNeeded: string[];
    steps: string[];
    whatHappens: string;
    scientificExplanation: string;
    expectedOutput: string;
    difficulty: DifficultyLevel;
    durationSeconds: number;
    funFact: string;
    realWorldApplication: string;
    emoji: string;
}

interface DataPoint {
    time: number;
    reactionIntensity: number;
    foamHeight: number;
    bubblingRate: number;
    colorChange: number;
    redValue: number;
    greenValue: number;
    blueValue: number;
}

interface ExperimentData {
    experimentName: string;
    startTime: number;
    dataPoints: DataPoint[];
    peakIntensity: number;
    peakFoamHeight: number;
    peakBubblingRate: number;
    averageIntensity: number;
    totalDuration: number;
}

// [Previous CHEMICAL_DATABASE, DANGEROUS_REACTIONS, and EXPERIMENTS_DATABASE arrays remain the same - keeping them from Step 4]
// I'll include abbreviated versions here for space, but the full arrays should be preserved

const CHEMICAL_DATABASE: Chemical[] = [
    // ... (keeping all 15 chemicals from previous step)
    {
        id: 'vinegar',
        chemicalName: 'Acetic Acid (CH₃COOH)',
        commonName: 'Vinegar',
        emoji: '🧴',
        description: 'Weak acid commonly used in cooking and cleaning.',
        safetyLevel: 'SAFE',
        healthHazards: ['Eye irritation at high concentrations'],
        incompatibleWith: ['bleach', 'hydrogen-peroxide'],
        alternativeNames: ['white vinegar', 'acetic acid']
    },
    // ... rest of chemicals
];

const DANGEROUS_REACTIONS: DangerousReaction[] = [
    // ... (keeping all reactions from previous step)
];

const EXPERIMENTS_DATABASE: Experiment[] = [
    // ... (keeping all 12 experiments from previous step)
];

// Pixel Analyzer Class
class PixelAnalyzer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private previousFrame: ImageData | null = null;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
    }

    analyzeFrame(video: HTMLVideoElement): {
        reactionIntensity: number;
        foamHeight: number;
        bubblingRate: number;
        colorChange: number;
        rgbValues: { r: number; g: number; b: number };
    } {
        if (!video || video.readyState < 2) {
            return {
                reactionIntensity: 0,
                foamHeight: 0,
                bubblingRate: 0,
                colorChange: 0,
                rgbValues: { r: 0, g: 0, b: 0 }
            };
        }

        // Set canvas size to match video
        this.canvas.width = video.videoWidth || 640;
        this.canvas.height = video.videoHeight || 480;

        // Draw current frame
        this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
        const currentFrame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // Sample center region (where reaction typically occurs)
        const centerX = Math.floor(this.canvas.width / 2);
        const centerY = Math.floor(this.canvas.height / 2);
        const sampleSize = 100; // 100x100 pixel sample

        // Calculate average RGB values
        let totalR = 0, totalG = 0, totalB = 0, pixelCount = 0;
        let brightnessSum = 0;
        let motionPixels = 0;

        for (let y = centerY - sampleSize / 2; y < centerY + sampleSize / 2; y++) {
            for (let x = centerX - sampleSize / 2; x < centerX + sampleSize / 2; x++) {
                if (x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height) {
                    const i = (y * this.canvas.width + x) * 4;
                    const r = currentFrame.data[i];
                    const g = currentFrame.data[i + 1];
                    const b = currentFrame.data[i + 2];

                    totalR += r;
                    totalG += g;
                    totalB += b;
                    brightnessSum += (r + g + b) / 3;
                    pixelCount++;

                    // Motion detection
                    if (this.previousFrame) {
                        const prevR = this.previousFrame.data[i];
                        const prevG = this.previousFrame.data[i + 1];
                        const prevB = this.previousFrame.data[i + 2];
                        const diff = Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB);
                        if (diff > 30) motionPixels++;
                    }
                }
            }
        }

        const avgR = totalR / pixelCount;
        const avgG = totalG / pixelCount;
        const avgB = totalB / pixelCount;
        const avgBrightness = brightnessSum / pixelCount;

        // Calculate metrics
        const colorChange = this.previousFrame ?
            Math.min(100, (motionPixels / pixelCount) * 500) : 0;

        const bubblingRate = Math.min(100, (motionPixels / pixelCount) * 1000);

        // Foam height estimation (based on brightness in upper region)
        let upperBrightness = 0;
        let upperPixels = 0;
        for (let y = 0; y < this.canvas.height / 3; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const i = (y * this.canvas.width + x) * 4;
                upperBrightness += (currentFrame.data[i] + currentFrame.data[i + 1] + currentFrame.data[i + 2]) / 3;
                upperPixels++;
            }
        }
        const avgUpperBrightness = upperBrightness / upperPixels;
        const foamHeight = Math.min(100, (avgUpperBrightness / 255) * 100);

        // Reaction intensity (combination of motion and color change)
        const reactionIntensity = Math.min(100, (bubblingRate * 0.6 + colorChange * 0.4));

        this.previousFrame = currentFrame;

        return {
            reactionIntensity,
            foamHeight,
            bubblingRate,
            colorChange,
            rgbValues: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) }
        };
    }
}

// Helper functions (keeping from previous steps)
function identifyChemical(label: string): DetectedChemical | null {
    // ... (same as before)
    return null;
}

function checkDangerousReaction(chemicals: Chemical[]): DangerousReaction | null {
    // ... (same as before)
    return null;
}

function checkCompatibility(chemicals: Chemical[]): { level: AlertLevel; warning: string } {
    // ... (same as before)
    return { level: 'none', warning: '' };
}

function App() {
    const [activeTab, setActiveTab] = useState<TabType>('camera');
    const [experimentStatus, setExperimentStatus] = useState<ExperimentStatus>('idle');
    const [analysisOutput, setAnalysisOutput] = useState<string>('Ready to start experiment...');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [detectedChemicals, setDetectedChemicals] = useState<DetectedChemical[]>([]);
    const [testInput, setTestInput] = useState<string>('');
    const [safetyMode, setSafetyMode] = useState<boolean>(true);
    const [countdown, setCountdown] = useState<number>(0);
    const [alertLevel, setAlertLevel] = useState<AlertLevel>('none');

    // Experiment-related state
    const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [categoryFilter, setCategoryFilter] = useState<ExperimentCategory | 'All'>('All');
    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Data tracking state
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [experimentData, setExperimentData] = useState<ExperimentData | null>(null);
    const [liveData, setLiveData] = useState<DataPoint[]>([]);
    const [currentMetrics, setCurrentMetrics] = useState({
        reactionIntensity: 0,
        foamHeight: 0,
        bubblingRate: 0,
        colorChange: 0,
        elapsedTime: 0
    });
    const [reactionSpeed, setReactionSpeed] = useState<'Slow' | 'Medium' | 'Fast' | 'Very Fast'>('Slow');

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const pixelAnalyzerRef = useRef<PixelAnalyzer>(new PixelAnalyzer());
    const recordingStartTimeRef = useRef<number>(0);
    const dataIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize camera
    useEffect(() => {
        const initCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false
                });

                setStream(mediaStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (error) {
                console.error('Camera access error:', error);
                setAnalysisOutput('❌ Camera access denied. Please allow camera permissions.');
            }
        };

        initCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Data recording loop
    useEffect(() => {
        if (isRecording && videoRef.current) {
            recordingStartTimeRef.current = Date.now();

            dataIntervalRef.current = setInterval(() => {
                const analysis = pixelAnalyzerRef.current.analyzeFrame(videoRef.current!);
                const elapsedTime = (Date.now() - recordingStartTimeRef.current) / 1000;

                const newDataPoint: DataPoint = {
                    time: Math.round(elapsedTime * 10) / 10,
                    reactionIntensity: Math.round(analysis.reactionIntensity),
                    foamHeight: Math.round(analysis.foamHeight),
                    bubblingRate: Math.round(analysis.bubblingRate),
                    colorChange: Math.round(analysis.colorChange),
                    redValue: analysis.rgbValues.r,
                    greenValue: analysis.rgbValues.g,
                    blueValue: analysis.rgbValues.b
                };

                setLiveData(prev => [...prev, newDataPoint]);
                setCurrentMetrics({
                    reactionIntensity: newDataPoint.reactionIntensity,
                    foamHeight: newDataPoint.foamHeight,
                    bubblingRate: newDataPoint.bubblingRate,
                    colorChange: newDataPoint.colorChange,
                    elapsedTime: newDataPoint.time
                });

                // Determine reaction speed
                if (newDataPoint.reactionIntensity > 80) setReactionSpeed('Very Fast');
                else if (newDataPoint.reactionIntensity > 60) setReactionSpeed('Fast');
                else if (newDataPoint.reactionIntensity > 30) setReactionSpeed('Medium');
                else setReactionSpeed('Slow');

            }, 500); // Update every 500ms
        }

        return () => {
            if (dataIntervalRef.current) {
                clearInterval(dataIntervalRef.current);
            }
        };
    }, [isRecording]);

    const playWarningBeep = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    };

    const speakWarning = (message: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Monitor chemical compatibility
    useEffect(() => {
        const chemicals = detectedChemicals.map(d => d.chemical);
        const compatibility = checkCompatibility(chemicals);
        setAlertLevel(compatibility.level);

        if (safetyMode && compatibility.level === 'danger') {
            const reaction = checkDangerousReaction(chemicals);
            if (reaction) {
                playWarningBeep();
                speakWarning(reaction.audioMessage);
                setCountdown(3);
            }
        }
    }, [detectedChemicals, safetyMode]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);

                if (countdown === 1) {
                    speakWarning('Remove chemicals from camera view immediately!');
                } else {
                    speakWarning(`You have ${countdown - 1} seconds to separate these chemicals`);
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleStartExperiment = () => {
        setExperimentStatus('running');
        setAnalysisOutput('🔬 Experiment started. Analyzing...');
    };

    const handlePauseResume = () => {
        if (experimentStatus === 'running') {
            setExperimentStatus('paused');
            setIsRecording(false);
            setAnalysisOutput('⏸️ Experiment paused.');
        } else if (experimentStatus === 'paused') {
            setExperimentStatus('running');
            setAnalysisOutput('▶️ Experiment resumed.');
        }
    };

    const handleStop = () => {
        setExperimentStatus('idle');
        setDetectedChemicals([]);
        setCountdown(0);
        setAlertLevel('none');
        setSelectedExperiment(null);
        setCurrentStep(0);
        setIsRecording(false);

        // Save experiment data
        if (liveData.length > 0) {
            const peakIntensity = Math.max(...liveData.map(d => d.reactionIntensity));
            const peakFoamHeight = Math.max(...liveData.map(d => d.foamHeight));
            const peakBubblingRate = Math.max(...liveData.map(d => d.bubblingRate));
            const averageIntensity = liveData.reduce((sum, d) => sum + d.reactionIntensity, 0) / liveData.length;
            const totalDuration = liveData[liveData.length - 1].time;

            setExperimentData({
                experimentName: selectedExperiment?.name || 'Unknown Experiment',
                startTime: recordingStartTimeRef.current,
                dataPoints: liveData,
                peakIntensity,
                peakFoamHeight,
                peakBubblingRate,
                averageIntensity,
                totalDuration
            });
        }

        window.speechSynthesis.cancel();
        setAnalysisOutput('⏹️ Experiment stopped. Data saved.');
    };

    const handleTestIdentify = () => {
        if (!testInput.trim()) return;

        const result = identifyChemical(testInput);
        if (result) {
            const exists = detectedChemicals.some(d => d.chemical.id === result.chemical.id);
            if (!exists) {
                setDetectedChemicals(prev => [...prev, result]);
            }
            setAnalysisOutput(`✅ Identified: ${result.chemical.commonName} (${result.confidence}% confidence)`);
        } else {
            setAnalysisOutput(`❌ Chemical "${testInput}" not found in database`);
        }
        setTestInput('');
    };

    const handleRemoveChemical = (id: string) => {
        setDetectedChemicals(prev => prev.filter(d => d.chemical.id !== id));
        setCountdown(0);
        window.speechSynthesis.cancel();
    };

    const startExperiment = (experiment: Experiment) => {
        setSelectedExperiment(experiment);
        setCurrentStep(0);
        setActiveTab('camera');
        setExperimentStatus('running');
        setLiveData([]);

        speakWarning(`Starting experiment: ${experiment.name}. ${experiment.scientificExplanation}`);

        setTimeout(() => {
            if (experiment.steps.length > 0) {
                speakWarning(`Step 1: ${experiment.steps[0]}`);
            }
        }, 3000);
    };

    const nextStep = () => {
        if (selectedExperiment && currentStep < selectedExperiment.steps.length - 1) {
            const newStep = currentStep + 1;
            setCurrentStep(newStep);
            speakWarning(`Step ${newStep + 1}: ${selectedExperiment.steps[newStep]}`);
        } else if (selectedExperiment && currentStep === selectedExperiment.steps.length - 1) {
            speakWarning(`Experiment complete! ${selectedExperiment.whatHappens}`);
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            const newStep = currentStep - 1;
            setCurrentStep(newStep);
            if (selectedExperiment) {
                speakWarning(`Step ${newStep + 1}: ${selectedExperiment.steps[newStep]}`);
            }
        }
    };

    const toggleRecording = () => {
        if (!isRecording) {
            setLiveData([]);
            setIsRecording(true);
            setAnalysisOutput('📊 Recording data...');
        } else {
            setIsRecording(false);
            setAnalysisOutput('⏸️ Data recording paused.');
        }
    };

    const exportDataCSV = () => {
        if (liveData.length === 0) return;

        const headers = ['Time (s)', 'Reaction Intensity', 'Foam Height', 'Bubbling Rate', 'Color Change', 'Red', 'Green', 'Blue'];
        const rows = liveData.map(d => [
            d.time,
            d.reactionIntensity,
            d.foamHeight,
            d.bubblingRate,
            d.colorChange,
            d.redValue,
            d.greenValue,
            d.blueValue
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `experiment_data_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredExperiments = EXPERIMENTS_DATABASE.filter(exp => {
        const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
        const matchesDifficulty = difficultyFilter === 'All' || exp.difficulty === difficultyFilter;
        const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesDifficulty && matchesSearch;
    });

    const compatibility = checkCompatibility(detectedChemicals.map(d => d.chemical));

    // Prepare chart data (last 20 points for better visibility)
    const chartData = liveData.slice(-20);

    return (
        <div className={`app ${alertLevel === 'danger' ? 'danger-alert' : ''}`}>
            {/* Tab Navigation */}
            <nav className="tab-nav">
                <button
                    className={`tab ${activeTab === 'camera' ? 'active' : ''}`}
                    onClick={() => setActiveTab('camera')}
                >
                    📹 Camera
                </button>
                <button
                    className={`tab ${activeTab === 'experiments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('experiments')}
                >
                    🧪 Experiments
                </button>
                <button
                    className={`tab ${activeTab === 'safety' ? 'active' : ''}`}
                    onClick={() => setActiveTab('safety')}
                >
                    ⚠️ Safety
                </button>
                <button
                    className={`tab ${activeTab === 'data' ? 'active' : ''}`}
                    onClick={() => setActiveTab('data')}
                >
                    📊 Data Logger
                </button>
            </nav>

            {/* Main Content */}
            <main className="content">
                {activeTab === 'camera' && (
                    <div className="camera-view">
                        {/* Safety Mode Toggle */}
                        <div className="safety-mode-toggle">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={safetyMode}
                                    onChange={(e) => setSafetyMode(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">
                                    {safetyMode ? '🛡️ Safety Mode: ON' : '⚠️ Safety Mode: OFF (Advanced Users Only)'}
                                </span>
                            </label>
                        </div>

                        <div className="video-container">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="video-feed"
                            />
                            <div className={`status-indicator ${experimentStatus}`}>
                                {experimentStatus === 'running' && '🔴 RECORDING'}
                                {experimentStatus === 'paused' && '⏸️ PAUSED'}
                                {experimentStatus === 'idle' && '⚪ IDLE'}
                            </div>

                            {/* Live Metrics Overlay */}
                            {isRecording && (
                                <div className="live-metrics-overlay">
                                    <div className="metric-item">
                                        <span className="metric-label">Intensity:</span>
                                        <span className="metric-value">{currentMetrics.reactionIntensity}%</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">Foam Height:</span>
                                        <span className="metric-value">{currentMetrics.foamHeight}%</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">Speed:</span>
                                        <span className={`metric-value speed-${reactionSpeed.toLowerCase().replace(' ', '-')}`}>
                                            {reactionSpeed}
                                        </span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">Time:</span>
                                        <span className="metric-value">{currentMetrics.elapsedTime.toFixed(1)}s</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Countdown Overlay */}
                        {countdown > 0 && (
                            <div className="countdown-overlay">
                                <div className="countdown-number">{countdown}</div>
                                <div className="countdown-text">
                                    SEPARATE CHEMICALS NOW!
                                </div>
                            </div>
                        )}

                        {/* Recording Controls */}
                        <div className="recording-controls">
                            <button
                                onClick={toggleRecording}
                                className={`btn-record ${isRecording ? 'recording' : ''}`}
                                disabled={experimentStatus === 'idle'}
                            >
                                {isRecording ? '⏸️ Pause Recording' : '📊 Start Recording Data'}
                            </button>
                            {liveData.length > 0 && (
                                <button onClick={exportDataCSV} className="btn-export">
                                    📥 Export CSV
                                </button>
                            )}
                        </div>

                        {/* Active Experiment Steps - keeping from Step 4 */}
                        {selectedExperiment && (
                            <div className="experiment-steps-panel">
                                {/* ... (same as Step 4) */}
                            </div>
                        )}

                        {/* Rest of camera view components from previous steps */}
                        {/* ... (chemicals in view, safety alerts, detected chemicals, test input, controls, analysis panel) */}

                        <div className="controls">
                            <button
                                className="btn btn-start"
                                onClick={handleStartExperiment}
                                disabled={experimentStatus === 'running'}
                            >
                                ▶️ Start Experiment
                            </button>

                            <button
                                className="btn btn-pause"
                                onClick={handlePauseResume}
                                disabled={experimentStatus === 'idle'}
                            >
                                {experimentStatus === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
                            </button>

                            <button
                                className="btn btn-stop"
                                onClick={handleStop}
                                disabled={experimentStatus === 'idle'}
                            >
                                ⏹️ Stop
                            </button>
                        </div>

                        <div className="analysis-panel">
                            <h3>Analysis Output</h3>
                            <div className="analysis-text">
                                {analysisOutput}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'experiments' && (
                    <div className="experiments-view">
                        {/* ... (keeping from Step 4) */}
                    </div>
                )}

                {activeTab === 'safety' && (
                    <div className="safety-view">
                        {/* ... (keeping from previous steps) */}
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="data-view">
                        <h2>📊 Data Logger & Live Analysis</h2>

                        {liveData.length === 0 && !experimentData && (
                            <div className="data-placeholder">
                                <p>📈 No data recorded yet</p>
                                <p>Start an experiment and click "Start Recording Data" to begin tracking</p>
                            </div>
                        )}

                        {liveData.length > 0 && (
                            <div className="data-dashboard">
                                {/* Live Metrics Cards */}
                                <div className="metrics-grid">
                                    <div className="metric-card">
                                        <h3>Reaction Intensity</h3>
                                        <div className="metric-big">{currentMetrics.reactionIntensity}%</div>
                                        <div className="metric-label">Current</div>
                                    </div>
                                    <div className="metric-card">
                                        <h3>Foam Height</h3>
                                        <div className="metric-big">{currentMetrics.foamHeight}%</div>
                                        <div className="metric-label">Estimated</div>
                                    </div>
                                    <div className="metric-card">
                                        <h3>Bubbling Rate</h3>
                                        <div className="metric-big">{currentMetrics.bubblingRate}%</div>
                                        <div className="metric-label">Per Second</div>
                                    </div>
                                    <div className="metric-card">
                                        <h3>Reaction Speed</h3>
                                        <div className={`metric-big speed-${reactionSpeed.toLowerCase().replace(' ', '-')}`}>
                                            {reactionSpeed}
                                        </div>
                                        <div className="metric-label">Classification</div>
                                    </div>
                                </div>

                                {/* Live Charts */}
                                <div className="charts-container">
                                    {/* Reaction Intensity Over Time */}
                                    <div className="chart-panel">
                                        <h3>Reaction Intensity Over Time</h3>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3561" />
                                                <XAxis
                                                    dataKey="time"
                                                    stroke="#8892b0"
                                                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8892b0' }}
                                                />
                                                <YAxis
                                                    stroke="#8892b0"
                                                    label={{ value: 'Intensity (%)', angle: -90, position: 'insideLeft', fill: '#8892b0' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ background: '#1a1f3a', border: '1px solid #64ffda' }}
                                                    labelStyle={{ color: '#64ffda' }}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="reactionIntensity"
                                                    stroke="#64ffda"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    name="Intensity"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Foam Height Over Time */}
                                    <div className="chart-panel">
                                        <h3>Foam Height Over Time</h3>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3561" />
                                                <XAxis
                                                    dataKey="time"
                                                    stroke="#8892b0"
                                                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8892b0' }}
                                                />
                                                <YAxis
                                                    stroke="#8892b0"
                                                    label={{ value: 'Height (%)', angle: -90, position: 'insideLeft', fill: '#8892b0' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ background: '#1a1f3a', border: '1px solid #10b981' }}
                                                    labelStyle={{ color: '#10b981' }}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="foamHeight"
                                                    stroke="#10b981"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    name="Foam Height"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Bubbling Rate */}
                                    <div className="chart-panel">
                                        <h3>Bubbling Rate (5s intervals)</h3>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={chartData.filter((_, i) => i % 10 === 0)}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3561" />
                                                <XAxis
                                                    dataKey="time"
                                                    stroke="#8892b0"
                                                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8892b0' }}
                                                />
                                                <YAxis
                                                    stroke="#8892b0"
                                                    label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft', fill: '#8892b0' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ background: '#1a1f3a', border: '1px solid #f59e0b' }}
                                                    labelStyle={{ color: '#f59e0b' }}
                                                />
                                                <Legend />
                                                <Bar dataKey="bubblingRate" fill="#f59e0b" name="Bubbling Rate" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* RGB Color Values */}
                                    <div className="chart-panel">
                                        <h3>Color Intensity (RGB Values)</h3>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3561" />
                                                <XAxis
                                                    dataKey="time"
                                                    stroke="#8892b0"
                                                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8892b0' }}
                                                />
                                                <YAxis
                                                    stroke="#8892b0"
                                                    label={{ value: 'RGB Value', angle: -90, position: 'insideLeft', fill: '#8892b0' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ background: '#1a1f3a', border: '1px solid #fff' }}
                                                />
                                                <Legend />
                                                <Line type="monotone" dataKey="redValue" stroke="#ef4444" strokeWidth={2} dot={false} name="Red" />
                                                <Line type="monotone" dataKey="greenValue" stroke="#10b981" strokeWidth={2} dot={false} name="Green" />
                                                <Line type="monotone" dataKey="blueValue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Blue" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Peak Values Summary */}
                                {experimentData && (
                                    <div className="summary-panel">
                                        <h3>📈 Experiment Summary</h3>
                                        <div className="summary-grid">
                                            <div className="summary-item">
                                                <span className="summary-label">Peak Intensity:</span>
                                                <span className="summary-value">{experimentData.peakIntensity.toFixed(1)}%</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="summary-label">Peak Foam Height:</span>
                                                <span className="summary-value">{experimentData.peakFoamHeight.toFixed(1)}%</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="summary-label">Peak Bubbling:</span>
                                                <span className="summary-value">{experimentData.peakBubblingRate.toFixed(1)}%</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="summary-label">Average Intensity:</span>
                                                <span className="summary-value">{experimentData.averageIntensity.toFixed(1)}%</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="summary-label">Total Duration:</span>
                                                <span className="summary-value">{experimentData.totalDuration.toFixed(1)}s</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="summary-label">Data Points:</span>
                                                <span className="summary-value">{experimentData.dataPoints.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
