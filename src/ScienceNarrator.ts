import { useRef, useState, useEffect } from 'react';

// Narration modes
export type NarrationMode = 'kid' | 'student' | 'teacher' | 'silent';
export type NarrationPhase = 'intro' | 'realtime' | 'outcome' | 'explanation';

// Language support
export type Language = 'en' | 'es' | 'zh' | 'hi';

interface NarrationConfig {
    mode: NarrationMode;
    language: Language;
    speed: number; // 0.75 to 2.0
    enabled: boolean;
}

interface ExperimentNarration {
    experimentId: string;
    intro: {
        kid: string;
        student: string;
        teacher: string;
    };
    steps: {
        kid: string[];
        student: string[];
        teacher: string[];
    };
    outcome: {
        kid: string;
        student: string;
        teacher: string;
    };
    explanation: {
        kid: string;
        student: string;
        teacher: string;
    };
}

// Narration database for experiments
const EXPERIMENT_NARRATIONS: { [key: string]: ExperimentNarration } = {
    'vinegar-baking-soda': {
        experimentId: 'vinegar-baking-soda',
        intro: {
            kid: "Hi! Today we're going to make a volcano! We'll mix vinegar and baking soda to make bubbles and foam. It's going to be super cool!",
            student: "Welcome to the acid-base reaction experiment. We'll observe how vinegar, an acid, reacts with baking soda, a base, to produce carbon dioxide gas, water, and sodium acetate.",
            teacher: "This experiment demonstrates a classic acid-base neutralization reaction. Acetic acid from vinegar will react with sodium bicarbonate to produce carbonic acid, which immediately decomposes into carbon dioxide gas, resulting in the characteristic effervescence."
        },
        steps: {
            kid: [
                "First, put some baking soda in your cup. Make a little mountain!",
                "Now add a few drops of food coloring if you want. This makes it colorful!",
                "Get ready! Pour the vinegar slowly into the cup.",
                "Wow! Look at all those bubbles! The volcano is erupting!",
                "Watch the foam rise up and overflow. So cool!"
            ],
            student: [
                "Place two tablespoons of sodium bicarbonate in your container.",
                "Optional: Add food coloring to visualize the reaction better.",
                "Slowly pour one-quarter cup of acetic acid solution into the container.",
                "Observe the vigorous effervescence as carbon dioxide gas is produced.",
                "Note how the CO2 bubbles create foam that overflows like a volcanic eruption."
            ],
            teacher: [
                "Prepare the base reactant by measuring 2 tablespoons of sodium bicarbonate.",
                "Food coloring can be added as a visual indicator without affecting the reaction kinetics.",
                "Introduce the acetic acid slowly to control the reaction rate and observe the exothermic nature.",
                "The rapid production of CO2 gas demonstrates the decomposition of carbonic acid intermediate.",
                "Observe the foam formation as gas bubbles are trapped in the aqueous solution."
            ]
        },
        outcome: {
            kid: "Amazing! Your volcano made lots of bubbles and foam! The bubbles are actually a gas called carbon dioxide. That's the same gas that makes soda fizzy!",
            student: "The reaction has produced carbon dioxide gas, which created the bubbling effect. The foam is a mixture of CO2 bubbles trapped in the liquid. Water and sodium acetate were also formed as products.",
            teacher: "The reaction is complete. We've successfully demonstrated the neutralization of acetic acid with sodium bicarbonate, producing carbon dioxide gas at a rate dependent on concentration and temperature. The foam represents a gas-liquid dispersion system."
        },
        explanation: {
            kid: "When you mix vinegar and baking soda, they don't like each other! They fight and make new stuff: bubbles of gas, water, and salt. The bubbles are what make it look like a volcano!",
            student: "This is an acid-base reaction. The acetic acid in vinegar donates hydrogen ions to the bicarbonate in baking soda. This forms carbonic acid, which is unstable and immediately breaks down into carbon dioxide gas and water. Sodium acetate, a type of salt, is also produced.",
            teacher: "The mechanism involves proton transfer from the weak acid, acetic acid, to the bicarbonate ion. The resulting carbonic acid is thermodynamically unstable and undergoes spontaneous decomposition via a decarboxylation reaction, yielding carbon dioxide and water. The sodium cation from the bicarbonate combines with the acetate anion to form sodium acetate, demonstrating the general acid-base neutralization pattern: acid plus base yields salt plus water, with CO2 as an additional product due to the bicarbonate's unique chemistry."
        }
    },
    'hydrogen-peroxide-yeast': {
        experimentId: 'hydrogen-peroxide-yeast',
        intro: {
            kid: "Get ready to make elephant toothpaste! We're going to make a huge tower of foam that looks like toothpaste for an elephant!",
            student: "Today we'll demonstrate a catalytic decomposition reaction. Yeast contains an enzyme called catalase that will break down hydrogen peroxide into water and oxygen gas, creating a dramatic foam eruption.",
            teacher: "This experiment illustrates enzymatic catalysis. The catalase enzyme in yeast will catalyze the decomposition of hydrogen peroxide into water and molecular oxygen, demonstrating the effect of biological catalysts on reaction rates."
        },
        steps: {
            kid: [
                "Mix hydrogen peroxide with dish soap in a bottle. The soap will catch the bubbles!",
                "Add food coloring to make it colorful!",
                "In another cup, mix yeast with warm water. This wakes up the yeast!",
                "Pour the yeast mixture into the bottle and step back!",
                "Whoa! Look at that foam shoot up! It's like toothpaste for an elephant!",
                "Be careful - the foam might be warm! Don't touch it right away."
            ],
            student: [
                "Combine half a cup of hydrogen peroxide with dish soap in a bottle.",
                "Add food coloring for visual effect.",
                "Prepare the catalyst by mixing one tablespoon of yeast with warm water.",
                "Pour the yeast solution into the hydrogen peroxide mixture.",
                "Observe the rapid foam production as oxygen gas is released.",
                "Note: The reaction is exothermic, so the foam will be warm to the touch."
            ],
            teacher: [
                "Prepare the substrate solution with 6% hydrogen peroxide and surfactant.",
                "Food coloring serves as a visual tracer for the foam expansion.",
                "Activate the catalase enzyme by suspending yeast in warm water at optimal temperature.",
                "Introduce the catalyst to initiate the decomposition reaction.",
                "Observe the exponential increase in oxygen production rate as the enzyme-substrate complex forms.",
                "The exothermic nature of the reaction will be evident from the heat released."
            ]
        },
        outcome: {
            kid: "Wow! That was a huge tower of foam! The yeast helped break apart the hydrogen peroxide into water and oxygen. The oxygen made all those bubbles!",
            student: "The catalase enzyme in yeast successfully catalyzed the decomposition of hydrogen peroxide. The oxygen gas produced was trapped by the soap, creating the foam. The reaction also released heat, which is why the foam feels warm.",
            teacher: "The catalytic decomposition proceeded efficiently, with the catalase enzyme lowering the activation energy barrier. The rate of oxygen evolution was sufficient to create a foam column, demonstrating the power of enzymatic catalysis. The exothermic nature resulted in a temperature increase of approximately 40-50 degrees Celsius."
        },
        explanation: {
            kid: "Hydrogen peroxide wants to break into water and oxygen, but it needs help. Yeast has tiny helpers called enzymes that make it happen super fast! The oxygen makes bubbles, and the soap catches them to make foam!",
            student: "Hydrogen peroxide naturally decomposes into water and oxygen, but very slowly. The catalase enzyme in yeast speeds up this reaction by providing an alternative pathway with lower activation energy. The oxygen gas produced is trapped by the soap molecules, creating the foam.",
            teacher: "Catalase is a highly efficient enzyme that catalyzes the disproportionation of hydrogen peroxide into water and molecular oxygen. The enzyme active site contains iron, which facilitates the redox reaction. The mechanism involves the formation of an enzyme-substrate complex, followed by rapid decomposition. The turnover number of catalase is exceptionally high, approximately 40 million molecules per second, explaining the vigorous reaction observed."
        }
    },
    'oil-water-density': {
        experimentId: 'oil-water-density',
        intro: {
            kid: "Let's see why oil and water don't mix! We're going to make two layers that stay separate, like magic!",
            student: "This experiment demonstrates the concept of density and immiscibility. We'll observe how oil floats on water due to its lower density and how the two liquids don't mix due to their different polarities.",
            teacher: "This demonstration illustrates the principles of density, buoyancy, and molecular polarity. We'll examine why non-polar substances like oil are immiscible with polar solvents like water, and how density differences result in stratification."
        },
        steps: {
            kid: [
                "Fill a glass halfway with water.",
                "Add food coloring to the water and stir it. Make it your favorite color!",
                "Slowly pour oil on top of the water.",
                "Look! The oil floats on top! They make two layers!",
                "Try to mix them by stirring. Watch what happens!",
                "The oil and water separate again! They don't want to mix!"
            ],
            student: [
                "Fill a clear glass halfway with water.",
                "Add food coloring to the water and mix thoroughly.",
                "Carefully pour cooking oil on top of the water.",
                "Observe the formation of two distinct layers.",
                "Attempt to mix the liquids by stirring vigorously.",
                "Note how the liquids quickly separate back into layers."
            ],
            teacher: [
                "Prepare the aqueous phase by filling a transparent container to 50% capacity.",
                "Introduce a hydrophilic dye to the water for visualization.",
                "Add the lipophilic phase (vegetable oil) slowly to minimize mixing.",
                "Observe the density-driven stratification with oil (ρ ≈ 0.92 g/cm³) floating on water (ρ = 1.00 g/cm³).",
                "Induce turbulence through mechanical agitation.",
                "Observe the rapid phase separation due to immiscibility and interfacial tension."
            ]
        },
        outcome: {
            kid: "The oil always floats on top of the water! They're like two friends who don't want to hold hands. Oil is lighter than water, so it stays on top!",
            student: "The oil and water remain separated in distinct layers. Oil has a lower density than water, causing it to float. The two liquids are immiscible because water molecules are polar and oil molecules are non-polar.",
            teacher: "The system demonstrates thermodynamic immiscibility. The density difference (Δρ ≈ 0.08 g/cm³) drives the stratification. The immiscibility arises from the unfavorable entropy of mixing between polar and non-polar phases, as described by the Flory-Huggins theory. The interfacial tension prevents stable emulsion formation without surfactants."
        },
        explanation: {
            kid: "Water molecules like to stick together because they have positive and negative parts, like magnets. Oil molecules don't have these parts, so water doesn't want to mix with oil. Plus, oil is lighter, so it floats!",
            student: "Water is a polar molecule with partial positive and negative charges. Oil is non-polar and has no charge separation. Polar and non-polar substances don't mix because water molecules prefer to bond with each other rather than with oil. Additionally, oil is less dense than water, so it floats on top.",
            teacher: "The immiscibility stems from the hydrophobic effect. Water molecules form hydrogen bonds with each other, creating a highly ordered structure. Introducing non-polar oil molecules would disrupt this structure, decreasing entropy. The system minimizes free energy by phase separation. The density difference arises from the molecular packing efficiency: water's hydrogen bonding network creates higher density than the van der Waals interactions in oil."
        }
    }
};

// Real-time commentary templates
const REALTIME_COMMENTARY = {
    bubbling: {
        kid: [
            "Ooh! I see bubbles starting!",
            "More bubbles are coming!",
            "Wow, look at all those bubbles!",
            "The bubbles are getting bigger!"
        ],
        student: [
            "Bubbling has initiated.",
            "Gas production is increasing.",
            "Vigorous effervescence is occurring.",
            "Bubble formation rate is accelerating."
        ],
        teacher: [
            "Gas evolution has commenced.",
            "The reaction rate is increasing as evidenced by bubble formation.",
            "We're observing rapid gas production consistent with the reaction mechanism.",
            "The nucleation sites are producing steady gas evolution."
        ]
    },
    colorChange: {
        kid: [
            "The color is changing!",
            "It's turning a different color!",
            "Look! The colors are mixing!",
            "The mixture is changing color!"
        ],
        student: [
            "A color change is being observed.",
            "The solution is undergoing a color transformation.",
            "Visual indicators show the reaction is proceeding.",
            "The chromatic properties are changing."
        ],
        teacher: [
            "We're observing a chromophore transition.",
            "The spectral properties of the solution are changing.",
            "This color change indicates a chemical transformation.",
            "The absorption spectrum is shifting as the reaction proceeds."
        ]
    },
    foamRising: {
        kid: [
            "The foam is growing!",
            "It's getting taller!",
            "The foam is rising up!",
            "Look how high it's going!"
        ],
        student: [
            "Foam height is increasing.",
            "The foam is expanding vertically.",
            "Gas bubbles are creating a foam column.",
            "The foam is rising at a measurable rate."
        ],
        teacher: [
            "Foam expansion is occurring due to gas entrapment.",
            "The gas-liquid dispersion is increasing in volume.",
            "We're observing foam propagation driven by gas production.",
            "The foam height is increasing proportionally to gas evolution rate."
        ]
    },
    peakIntensity: {
        kid: [
            "This is the most exciting part!",
            "It's going super fast now!",
            "Wow! This is the biggest reaction!",
            "Look how crazy it's getting!"
        ],
        student: [
            "The reaction has reached peak intensity.",
            "Maximum reaction rate is being observed.",
            "We're at the peak of the reaction curve.",
            "The highest activity level has been reached."
        ],
        teacher: [
            "We've reached the maximum reaction rate.",
            "The system is at peak kinetic activity.",
            "This represents the inflection point in the reaction progress curve.",
            "Maximum turnover frequency has been achieved."
        ]
    },
    slowingDown: {
        kid: [
            "It's slowing down now.",
            "The reaction is getting slower.",
            "The bubbles are stopping.",
            "It's almost done!"
        ],
        student: [
            "The reaction rate is decreasing.",
            "We're observing a reduction in activity.",
            "The reaction is approaching completion.",
            "Gas production is slowing down."
        ],
        teacher: [
            "The reaction rate is declining as reactants are depleted.",
            "We're entering the final phase of the reaction.",
            "The kinetics are showing first-order decay.",
            "Reactant concentration is approaching the equilibrium state."
        ]
    },
    complete: {
        kid: [
            "All done! Great job!",
            "The experiment is finished!",
            "You did it! That was awesome!",
            "Experiment complete! Well done!"
        ],
        student: [
            "The reaction is complete.",
            "Experiment finished successfully.",
            "All reactants have been consumed.",
            "The reaction has reached completion."
        ],
        teacher: [
            "The reaction has reached equilibrium.",
            "All reactants have been converted to products.",
            "The system has achieved thermodynamic completion.",
            "The reaction progress is at 100%."
        ]
    }
};

// Science Narrator Hook
export function useScienceNarrator(config: NarrationConfig) {
    const [currentNarration, setCurrentNarration] = useState<string>('');
    const [isNarrating, setIsNarrating] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const queueRef = useRef<string[]>([]);

    // Initialize speech synthesis
    useEffect(() => {
        if (!('speechSynthesis' in window)) {
            console.error('Speech synthesis not supported');
        }
    }, []);

    const speak = (text: string, interrupt: boolean = false) => {
        if (config.mode === 'silent' || !config.enabled) {
            setCurrentNarration(text);
            return;
        }

        if (interrupt) {
            window.speechSynthesis.cancel();
            queueRef.current = [];
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = config.speed;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Set language
        const langMap: { [key in Language]: string } = {
            en: 'en-US',
            es: 'es-ES',
            zh: 'zh-CN',
            hi: 'hi-IN'
        };
        utterance.lang = langMap[config.language];

        utterance.onstart = () => {
            setIsNarrating(true);
            setCurrentNarration(text);
        };

        utterance.onend = () => {
            setIsNarrating(false);
            // Process queue
            if (queueRef.current.length > 0) {
                const next = queueRef.current.shift();
                if (next) speak(next);
            }
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsNarrating(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const speakQueued = (text: string) => {
        if (isNarrating) {
            queueRef.current.push(text);
        } else {
            speak(text);
        }
    };

    const pause = () => {
        window.speechSynthesis.pause();
    };

    const resume = () => {
        window.speechSynthesis.resume();
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        queueRef.current = [];
        setIsNarrating(false);
        setCurrentNarration('');
    };

    return {
        speak,
        speakQueued,
        pause,
        resume,
        stop,
        currentNarration,
        isNarrating
    };
}

// Get narration for experiment
export function getExperimentNarration(
    experimentId: string,
    phase: NarrationPhase,
    mode: NarrationMode,
    stepIndex?: number
): string {
    const narration = EXPERIMENT_NARRATIONS[experimentId];
    if (!narration) return '';

    if (mode === 'silent') return '';

    switch (phase) {
        case 'intro':
            return narration.intro[mode];
        case 'realtime':
            if (stepIndex !== undefined && narration.steps[mode][stepIndex]) {
                return narration.steps[mode][stepIndex];
            }
            return '';
        case 'outcome':
            return narration.outcome[mode];
        case 'explanation':
            return narration.explanation[mode];
        default:
            return '';
    }
}

// Get real-time commentary based on metrics
export function getRealtimeCommentary(
    mode: NarrationMode,
    metrics: {
        reactionIntensity: number;
        foamHeight: number;
        bubblingRate: number;
        colorChange: number;
    },
    previousMetrics: {
        reactionIntensity: number;
        foamHeight: number;
        bubblingRate: number;
        colorChange: number;
    }
): string | null {
    if (mode === 'silent') return null;

    // Detect significant changes
    const intensityChange = metrics.reactionIntensity - previousMetrics.reactionIntensity;
    const foamChange = metrics.foamHeight - previousMetrics.foamHeight;
    const bubblingChange = metrics.bubblingRate - previousMetrics.bubblingRate;
    const colorChangeDetected = metrics.colorChange > 20;

    // Peak intensity
    if (metrics.reactionIntensity > 80 && previousMetrics.reactionIntensity <= 80) {
        const comments = REALTIME_COMMENTARY.peakIntensity[mode];
        return comments[Math.floor(Math.random() * comments.length)];
    }

    // Slowing down
    if (metrics.reactionIntensity < 30 && previousMetrics.reactionIntensity >= 30) {
        const comments = REALTIME_COMMENTARY.slowingDown[mode];
        return comments[Math.floor(Math.random() * comments.length)];
    }

    // Complete
    if (metrics.reactionIntensity < 5 && previousMetrics.reactionIntensity >= 5) {
        const comments = REALTIME_COMMENTARY.complete[mode];
        return comments[Math.floor(Math.random() * comments.length)];
    }

    // Foam rising
    if (foamChange > 10) {
        const comments = REALTIME_COMMENTARY.foamRising[mode];
        return comments[Math.floor(Math.random() * comments.length)];
    }

    // Bubbling
    if (bubblingChange > 15) {
        const comments = REALTIME_COMMENTARY.bubbling[mode];
        return comments[Math.floor(Math.random() * comments.length)];
    }

    // Color change
    if (colorChangeDetected && !previousMetrics.colorChange) {
        const comments = REALTIME_COMMENTARY.colorChange[mode];
        return comments[Math.floor(Math.random() * comments.length)];
    }

    return null;
}

// Sound effects
export function playSoundEffect(type: 'bubble' | 'success' | 'warning') {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
        case 'bubble':
            oscillator.frequency.value = 200;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'success':
            oscillator.frequency.value = 523.25; // C5
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            // Add second note
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 659.25; // E5
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.5);
            }, 200);
            break;
        case 'warning':
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
    }
}

export default useScienceNarrator;
