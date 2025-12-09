# Step 5: Real-Time Data Tracking & Live Graphing - Implementation Guide

## ✅ COMPLETED FEATURES

### 1. **Data Tracking System** (Updates every 500ms)
- ✅ Time elapsed tracking
- ✅ Foam/bubble height estimation via pixel analysis
- ✅ Color intensity change (RGB values)
- ✅ Reaction intensity score (0-100)
- ✅ Bubbling rate calculation
- ✅ Motion detection from video

### 2. **Pixel Analyzer Class**
```typescript
class PixelAnalyzer {
  - Samples 100x100 pixel region from video center
  - Detects color changes (RGB values)
  - Counts bubble movements via motion detection
  - Calculates rate of change
  - Returns numerical data for graphing
}
```

**Metrics Calculated:**
- **Reaction Intensity**: Combination of motion + color change (0-100%)
- **Foam Height**: Based on brightness in upper 1/3 of frame (0-100%)
- **Bubbling Rate**: Motion pixels detected per frame (0-100%)
- **Color Change**: RGB difference from previous frame (0-100%)
- **RGB Values**: Average red, green, blue values in sample area

### 3. **Live Graphs** (Using Recharts)

#### A. **Reaction Intensity Over Time** (Line Chart)
- X-axis: Time in seconds
- Y-axis: Intensity percentage (0-100%)
- Updates every 500ms
- Shows last 20 data points for clarity

#### B. **Foam Height Over Time** (Line Chart)
- Tracks estimated foam/bubble height
- Green line (#10b981)
- Smooth curve showing height changes

#### C. **Bubbling Rate** (Bar Chart)
- Shows rate per 5-second intervals
- Orange bars (#f59e0b)
- Displays activity bursts

#### D. **RGB Color Values** (Multi-Line Chart)
- Three lines: Red, Green, Blue
- Shows color changes during reaction
- Useful for detecting chemical color changes

### 4. **Interactive Features**

#### Recording Controls:
- **"Start Recording Data"** button - Begins 500ms interval tracking
- **"Pause Recording"** button - Stops data collection
- **"Export CSV"** button - Downloads data as CSV file

#### Live Metrics Overlay (on video):
- Current Reaction Intensity: XX%
- Current Foam Height: XX%
- Reaction Speed: Slow/Medium/Fast/Very Fast
- Elapsed Time: XX.Xs

#### Speed Classification:
- **Slow**: Intensity < 30%
- **Medium**: Intensity 30-60%
- **Fast**: Intensity 60-80%
- **Very Fast**: Intensity > 80%

### 5. **Data Display Panel**

#### Metrics Cards (4 large cards):
1. **Reaction Intensity** - Current percentage
2. **Foam Height** - Estimated height
3. **Bubbling Rate** - Per second rate
4. **Reaction Speed** - Classification

#### Experiment Summary (After stopping):
- **Peak Intensity**: Highest value recorded
- **Peak Foam Height**: Maximum height reached
- **Peak Bubbling Rate**: Fastest bubbling detected
- **Average Intensity**: Mean value over experiment
- **Total Duration**: Experiment length in seconds
- **Data Points**: Number of samples collected

### 6. **CSV Export Format**
```csv
Time (s),Reaction Intensity,Foam Height,Bubbling Rate,Color Change,Red,Green,Blue
0.0,0,0,0,0,120,130,140
0.5,15,8,12,5,125,135,145
1.0,32,18,28,15,140,150,160
...
```

## 📊 HOW IT WORKS

### Data Collection Flow:
1. User clicks "Start Recording Data"
2. `setInterval` runs every 500ms
3. `PixelAnalyzer.analyzeFrame()` processes current video frame
4. Extracts metrics: intensity, height, bubbling, RGB
5. Creates `DataPoint` object with timestamp
6. Adds to `liveData` array
7. Updates `currentMetrics` state
8. Recharts automatically re-renders graphs

### Pixel Analysis Algorithm:
```typescript
1. Draw video frame to hidden canvas
2. Sample 100x100 pixel region from center
3. Calculate average RGB values
4. Compare to previous frame for motion detection
5. Count pixels with significant change (diff > 30)
6. Calculate brightness in upper region for foam height
7. Combine metrics into reaction intensity score
```

### Performance Optimization:
- Only last 20 data points shown in charts (prevents lag)
- Canvas operations done off-screen
- Interval cleared when recording stops
- Data saved to state only when experiment ends

## 🎯 USER EXPERIENCE

### Typical Workflow:
1. **Select Experiment** → "Vinegar + Baking Soda Volcano"
2. **Start Experiment** → Camera activates
3. **Click "Start Recording Data"** → Metrics appear on video
4. **Pour vinegar into baking soda** → Graphs spike!
5. **Watch live graphs update** → See intensity climb to 80%
6. **Reaction slows down** → Graphs level off
7. **Click "Stop"** → Summary panel appears
8. **Click "Export CSV"** → Download data for analysis

### Visual Feedback:
- **Live overlay** shows real-time numbers on video
- **Speed indicator** changes color (green→yellow→orange→red)
- **Graphs animate** smoothly as data arrives
- **Peak values** highlighted in summary

## 🔧 TECHNICAL IMPLEMENTATION

### Key State Variables:
```typescript
const [isRecording, setIsRecording] = useState<boolean>(false);
const [liveData, setLiveData] = useState<DataPoint[]>([]);
const [currentMetrics, setCurrentMetrics] = useState({...});
const [reactionSpeed, setReactionSpeed] = useState<'Slow' | 'Medium' | 'Fast' | 'Very Fast'>('Slow');
const [experimentData, setExperimentData] = useState<ExperimentData | null>(null);
```

### Key Refs:
```typescript
const pixelAnalyzerRef = useRef<PixelAnalyzer>(new PixelAnalyzer());
const recordingStartTimeRef = useRef<number>(0);
const dataIntervalRef = useRef<NodeJS.Timeout | null>(null);
```

### Data Structures:
```typescript
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
```

## 📈 EXAMPLE DATA OUTPUT

### Vinegar + Baking Soda Reaction:
```
Time: 0.0s → Intensity: 0%, Height: 0%, Bubbling: 0%
Time: 1.0s → Intensity: 25%, Height: 15%, Bubbling: 30% (pouring vinegar)
Time: 2.0s → Intensity: 65%, Height: 45%, Bubbling: 70% (rapid fizzing!)
Time: 3.0s → Intensity: 85%, Height: 75%, Bubbling: 90% (peak reaction)
Time: 5.0s → Intensity: 60%, Height: 55%, Bubbling: 50% (slowing down)
Time: 10.0s → Intensity: 20%, Height: 25%, Bubbling: 15% (nearly done)
Time: 15.0s → Intensity: 5%, Height: 10%, Bubbling: 5% (complete)

SUMMARY:
- Peak Intensity: 85%
- Peak Foam Height: 75%
- Peak Bubbling: 90%
- Average Intensity: 42.8%
- Total Duration: 15.0s
- Classification: FAST reaction
```

## 🎨 STYLING NOTES

### CSS Classes Added:
- `.live-metrics-overlay` - Floating metrics on video
- `.recording-controls` - Record/Export buttons
- `.data-dashboard` - Main data view container
- `.metrics-grid` - 4-card grid layout
- `.metric-card` - Individual metric display
- `.charts-container` - Graph grid
- `.chart-panel` - Individual chart wrapper
- `.summary-panel` - Experiment summary
- `.summary-grid` - Summary stats grid
- `.speed-slow`, `.speed-medium`, `.speed-fast`, `.speed-very-fast` - Color coding

### Color Scheme:
- **Cyan (#64ffda)**: Reaction intensity
- **Green (#10b981)**: Foam height, safe values
- **Orange (#f59e0b)**: Bubbling rate, caution
- **Red (#ef4444)**: Danger, very fast
- **Blue (#3b82f6)**: Blue RGB channel

## ✅ TESTING CHECKLIST

- [x] Video pixel sampling works
- [x] Motion detection calculates correctly
- [x] Graphs update every 500ms
- [x] CSV export downloads properly
- [x] Peak values calculated accurately
- [x] Speed classification updates
- [x] Recording can pause/resume
- [x] Data persists after stopping
- [x] Multiple experiments can be recorded
- [x] Responsive on mobile

## 🚀 NEXT STEPS (Future Enhancements)

1. **AI-Powered Analysis**: Use Gemini API to analyze video and provide insights
2. **Comparison Mode**: Compare current experiment to previous attempts
3. **Expected vs Actual**: Show expected reaction curve vs actual
4. **Temperature Sensor**: Integrate device temperature sensors if available
5. **Sound Analysis**: Detect fizzing sounds for additional metrics
6. **PDF Reports**: Generate printable experiment reports
7. **Cloud Storage**: Save experiments to cloud for later review
8. **Social Sharing**: Share experiment results with friends

---

## 📝 IMPLEMENTATION STATUS

**Step 5 is COMPLETE!** ✅

All requested features have been implemented:
- ✅ Real-time data tracking (500ms intervals)
- ✅ Pixel analyzer with motion detection
- ✅ Live graphs (4 different chart types)
- ✅ Recording controls
- ✅ Live metrics overlay
- ✅ CSV export
- ✅ Peak/average calculations
- ✅ Speed classification
- ✅ Experiment summary

The Lab Partner AI app now has a complete data logging and analysis system!
