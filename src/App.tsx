import { useState, useRef, useEffect } from 'react';
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

// Experiments Database
const EXPERIMENTS_DATABASE: Experiment[] = [
    {
        id: 'vinegar-baking-soda',
        name: 'Vinegar + Baking Soda Volcano',
        category: 'Chemistry',
        chemicalsNeeded: ['vinegar', 'baking-soda'],
        steps: [
            'Place 2 tablespoons of baking soda in a container',
            'Add a few drops of food coloring (optional)',
            'Slowly pour 1/4 cup of vinegar into the container',
            'Watch the fizzing reaction!',
            'Observe the CO₂ gas bubbles forming'
        ],
        whatHappens: 'The mixture fizzes and bubbles vigorously, creating foam that overflows like a volcano',
        scientificExplanation: 'Vinegar (acid) reacts with baking soda (base) to produce carbon dioxide gas, water, and sodium acetate. The CO₂ gas creates the bubbles and fizz you see!',
        expectedOutput: 'Vigorous fizzing, foam, CO₂ bubbles',
        difficulty: 'Beginner',
        durationSeconds: 120,
        funFact: 'This reaction is used in fire extinguishers to produce CO₂ gas that smothers flames!',
        realWorldApplication: 'Used in baking to make cakes rise, and in antacid tablets to neutralize stomach acid',
        emoji: '🌋'
    },
    {
        id: 'milk-soap-colors',
        name: 'Magic Milk Color Explosion',
        category: 'Chemistry',
        chemicalsNeeded: ['milk', 'dish-soap'],
        steps: [
            'Pour milk into a shallow dish until it covers the bottom',
            'Add drops of different food colors around the milk',
            'Dip a cotton swab in dish soap',
            'Touch the soapy swab to the center of the milk',
            'Watch the colors explode and swirl!'
        ],
        whatHappens: 'Colors burst outward in beautiful swirling patterns, creating a kaleidoscope effect',
        scientificExplanation: 'Soap breaks down the fat molecules in milk. As the soap molecules race around trying to attach to fat molecules, they push the food coloring around, creating the swirling patterns!',
        expectedOutput: 'Swirling, dancing colors in beautiful patterns',
        difficulty: 'Beginner',
        durationSeconds: 180,
        funFact: 'This is how soap cleans dishes - it breaks apart grease and fat!',
        realWorldApplication: 'Demonstrates how detergents work to clean oily dishes and clothes',
        emoji: '🎨'
    },
    {
        id: 'lemon-baking-soda',
        name: 'Lemon Juice Fizz',
        category: 'Chemistry',
        chemicalsNeeded: ['lemon-juice', 'baking-soda'],
        steps: [
            'Squeeze fresh lemon juice into a cup (about 1/4 cup)',
            'Add 1 tablespoon of baking soda',
            'Stir gently and observe',
            'Watch the fizzing reaction',
            'Notice the temperature change'
        ],
        whatHappens: 'The mixture fizzes rapidly and may feel slightly warm',
        scientificExplanation: 'Lemon juice contains citric acid which reacts with baking soda (a base) to produce carbon dioxide gas. This is an acid-base neutralization reaction that releases energy as heat!',
        expectedOutput: 'Fizzing, bubbles, slight warming',
        difficulty: 'Beginner',
        durationSeconds: 90,
        funFact: 'Citric acid is what makes lemons sour and is used as a natural preservative!',
        realWorldApplication: 'Similar reactions are used in effervescent tablets and bath bombs',
        emoji: '🍋'
    },
    {
        id: 'elephant-toothpaste',
        name: 'Elephant Toothpaste',
        category: 'Chemistry',
        chemicalsNeeded: ['hydrogen-peroxide', 'dish-soap'],
        steps: [
            'Mix 1/2 cup hydrogen peroxide with dish soap in a bottle',
            'Add food coloring for effect',
            'In a separate cup, mix 1 tablespoon yeast with warm water',
            'Pour the yeast mixture into the bottle',
            'Stand back and watch the foam erupt!',
            'CAUTION: The foam will be warm - do not touch immediately'
        ],
        whatHappens: 'A huge column of foam erupts from the bottle like toothpaste for an elephant!',
        scientificExplanation: 'Yeast acts as a catalyst to break down hydrogen peroxide into water and oxygen gas. The soap traps the oxygen in bubbles, creating the massive foam. The reaction is exothermic (releases heat)!',
        expectedOutput: 'Large foam eruption, warm to touch',
        difficulty: 'Intermediate',
        durationSeconds: 240,
        funFact: 'Your body uses a similar enzyme (catalase) to break down hydrogen peroxide in your cells!',
        realWorldApplication: 'Demonstrates catalytic reactions used in industry and biology',
        emoji: '🐘'
    },
    {
        id: 'ice-salt',
        name: 'Super Cold Ice',
        category: 'Chemistry',
        chemicalsNeeded: ['salt', 'water'],
        steps: [
            'Fill a bowl with ice cubes',
            'Measure the temperature with a thermometer (should be 0°C/32°F)',
            'Sprinkle salt generously over the ice',
            'Wait 2-3 minutes',
            'Measure temperature again - it will be much colder!',
            'The ice will start to melt even though it is colder'
        ],
        whatHappens: 'The ice gets much colder (down to -15°C/5°F) and starts melting',
        scientificExplanation: 'Salt lowers the freezing point of water. To melt at this lower temperature, the ice must absorb heat from its surroundings, making it feel much colder!',
        expectedOutput: 'Temperature drop, ice melting despite being colder',
        difficulty: 'Beginner',
        durationSeconds: 300,
        funFact: 'This is why we put salt on icy roads in winter - it makes ice melt even when it is below freezing!',
        realWorldApplication: 'Used for de-icing roads and making homemade ice cream',
        emoji: '❄️'
    },
    {
        id: 'oobleck',
        name: 'Oobleck - Liquid or Solid?',
        category: 'Physics',
        chemicalsNeeded: ['flour', 'water'],
        steps: [
            'Mix 2 cups cornstarch with 1 cup water in a bowl',
            'Stir slowly - it should flow like liquid',
            'Try to stir quickly - it will resist!',
            'Punch the surface hard - your fist will not go through',
            'Let it rest - it will flow like liquid again',
            'Roll it into a ball and stop - it will melt through your fingers'
        ],
        whatHappens: 'The mixture acts like a solid when hit hard, but flows like a liquid when moved slowly',
        scientificExplanation: 'Oobleck is a non-Newtonian fluid. When you apply quick force, the cornstarch particles jam together and act solid. With slow movement, they slide past each other like a liquid!',
        expectedOutput: 'Substance that is both liquid and solid depending on force',
        difficulty: 'Beginner',
        durationSeconds: 360,
        funFact: 'You can actually walk on a pool of oobleck if you move fast enough!',
        realWorldApplication: 'Similar materials are used in body armor and shock absorbers',
        emoji: '🥣'
    },
    {
        id: 'eggshell-vinegar',
        name: 'Disappearing Eggshell',
        category: 'Chemistry',
        chemicalsNeeded: ['vinegar'],
        steps: [
            'Place a raw egg in a clear glass',
            'Pour vinegar over the egg until completely covered',
            'Observe bubbles forming on the shell immediately',
            'Wait 24 hours',
            'Carefully remove the egg - the shell will be gone!',
            'You will have a "naked egg" held together by a membrane'
        ],
        whatHappens: 'The hard eggshell dissolves, leaving a soft, bouncy egg held by a thin membrane',
        scientificExplanation: 'Eggshells are made of calcium carbonate. Vinegar (acetic acid) reacts with calcium carbonate to produce carbon dioxide gas (the bubbles), water, and calcium acetate. The shell dissolves!',
        expectedOutput: 'Bubbles, dissolved shell, bouncy naked egg',
        difficulty: 'Beginner',
        durationSeconds: 86400,
        funFact: 'This is the same reaction that causes acid rain to damage marble statues and buildings!',
        realWorldApplication: 'Demonstrates how acids can dissolve minerals and cause erosion',
        emoji: '🥚'
    },
    {
        id: 'milk-convection',
        name: 'Milk Convection Currents',
        category: 'Physics',
        chemicalsNeeded: ['milk'],
        steps: [
            'Pour cold milk into a clear glass dish',
            'Add drops of different food colors in different spots',
            'Heat the bottom of the dish gently with a candle or hot plate',
            'Watch the colors start to move and swirl',
            'Observe the patterns of movement',
            'CAUTION: Adult supervision required for heating'
        ],
        whatHappens: 'The food coloring creates beautiful swirling patterns as it moves through the milk',
        scientificExplanation: 'As the milk heats at the bottom, it becomes less dense and rises. Cooler milk at the top sinks down. This creates convection currents that carry the food coloring in circular patterns!',
        expectedOutput: 'Swirling color patterns showing convection',
        difficulty: 'Intermediate',
        durationSeconds: 300,
        funFact: 'Convection currents in the Earth mantle cause tectonic plates to move!',
        realWorldApplication: 'Explains how heat circulates in oceans, atmosphere, and inside Earth',
        emoji: '🌊'
    },
    {
        id: 'sugar-crystals',
        name: 'Sugar Crystal Garden',
        category: 'Chemistry',
        chemicalsNeeded: ['sugar', 'water'],
        steps: [
            'Boil 1 cup of water (adult supervision required)',
            'Stir in 3 cups of sugar until completely dissolved',
            'Pour into a clean jar',
            'Tie a string to a pencil and hang it in the solution',
            'Place in a quiet spot for 3-7 days',
            'Watch crystals grow on the string!'
        ],
        whatHappens: 'Beautiful sugar crystals form on the string over several days',
        scientificExplanation: 'As water evaporates, the solution becomes supersaturated with sugar. Sugar molecules start to stick together in an organized pattern, forming crystals. Each crystal grows as more sugar molecules attach!',
        expectedOutput: 'Rock candy crystals forming on string',
        difficulty: 'Intermediate',
        durationSeconds: 604800,
        funFact: 'This is how rock candy is made! Diamonds and snowflakes form through similar crystallization!',
        realWorldApplication: 'Demonstrates crystal formation seen in gems, minerals, and snowflakes',
        emoji: '💎'
    },
    {
        id: 'oil-water-density',
        name: 'Oil & Water Density Tower',
        category: 'Physics',
        chemicalsNeeded: ['cooking-oil', 'water'],
        steps: [
            'Fill a clear glass halfway with water',
            'Add food coloring to the water and stir',
            'Slowly pour cooking oil on top of the water',
            'Observe the two distinct layers',
            'Try to mix them by stirring - they will separate again',
            'Drop small objects to see which layer they sink to'
        ],
        whatHappens: 'Oil floats on top of water in a distinct layer, and they do not mix',
        scientificExplanation: 'Oil is less dense than water, so it floats on top. Oil and water are also immiscible (do not mix) because water molecules are polar and oil molecules are non-polar!',
        expectedOutput: 'Two distinct layers, oil on top',
        difficulty: 'Beginner',
        durationSeconds: 180,
        funFact: 'This is why oil spills on oceans are so dangerous - oil floats and spreads across the water surface!',
        realWorldApplication: 'Explains oil spills, salad dressing separation, and density in liquids',
        emoji: '🛢️'
    },
    {
        id: 'rainbow-volcano',
        name: 'Rainbow Volcano',
        category: 'Chemistry',
        chemicalsNeeded: ['vinegar', 'baking-soda'],
        steps: [
            'Set up 3-4 small containers',
            'Add baking soda to each container',
            'Add different food coloring to each container',
            'Pour vinegar into each container one at a time',
            'Watch each volcano erupt in different colors!',
            'Mix the colors to create new shades'
        ],
        whatHappens: 'Multiple colorful volcanic eruptions create a rainbow of fizzing foam',
        scientificExplanation: 'Same acid-base reaction as the basic volcano, but with multiple colors! The food coloring does not affect the chemical reaction - it just makes it more colorful and fun to watch!',
        expectedOutput: 'Multiple colored fizzing reactions',
        difficulty: 'Beginner',
        durationSeconds: 240,
        funFact: 'Real volcanoes can produce different colored lava based on their mineral content!',
        realWorldApplication: 'Demonstrates acid-base reactions with visual indicators',
        emoji: '🌈'
    },
    {
        id: 'mentos-coke',
        name: 'Mentos Geyser (OUTDOOR ONLY!)',
        category: 'Physics',
        chemicalsNeeded: [],
        steps: [
            'MUST BE DONE OUTDOORS in an open area',
            'Open a fresh bottle of Diet Coke',
            'Place the bottle on flat ground',
            'Drop 5-6 Mentos candies into the bottle at once',
            'RUN BACK IMMEDIATELY!',
            'Watch the geyser shoot up to 20 feet high!'
        ],
        whatHappens: 'A massive fountain of soda erupts from the bottle, shooting high into the air',
        scientificExplanation: 'Mentos have a rough surface with tiny pits. These create nucleation sites where CO₂ bubbles rapidly form. Thousands of bubbles form instantly, forcing the soda out in a powerful geyser!',
        expectedOutput: 'Explosive fountain of soda shooting upward',
        difficulty: 'Advanced',
        durationSeconds: 60,
        funFact: 'The world record Mentos geyser reached over 30 feet high!',
        realWorldApplication: 'Demonstrates nucleation, the same process that forms bubbles in boiling water and champagne',
        emoji: '💥'
    }
];

// Chemical Database (keeping existing from previous steps)
const CHEMICAL_DATABASE: Chemical[] = [
    {
        id: 'vinegar',
        chemicalName: 'Acetic Acid (CH₃COOH)',
        commonName: 'Vinegar',
        emoji: '🧴',
        description: 'Weak acid commonly used in cooking and cleaning. Typically 4-8% acetic acid in water.',
        safetyLevel: 'SAFE',
        healthHazards: ['Eye irritation at high concentrations'],
        incompatibleWith: ['bleach', 'hydrogen-peroxide'],
        alternativeNames: ['white vinegar', 'acetic acid', 'ethanoic acid']
    },
    {
        id: 'baking-soda',
        chemicalName: 'Sodium Bicarbonate (NaHCO₃)',
        commonName: 'Baking Soda',
        emoji: '📦',
        description: 'Mild alkaline compound used in baking, cleaning, and as an antacid. Safe for most uses.',
        safetyLevel: 'SAFE',
        healthHazards: [],
        incompatibleWith: ['vinegar'],
        alternativeNames: ['sodium bicarbonate', 'bicarbonate of soda', 'nahco3']
    },
    {
        id: 'bleach',
        chemicalName: 'Sodium Hypochlorite (NaClO)',
        commonName: 'Bleach',
        emoji: '⚠️',
        description: 'Strong oxidizing agent and disinfectant. Corrosive and can release toxic chlorine gas when mixed with acids.',
        safetyLevel: 'DANGER',
        healthHazards: ['Skin burns', 'Eye damage', 'Respiratory irritation', 'Toxic if ingested'],
        incompatibleWith: ['ammonia', 'vinegar', 'rubbing-alcohol', 'hydrogen-peroxide', 'lemon-juice'],
        alternativeNames: ['sodium hypochlorite', 'chlorine bleach', 'clorox', 'hypochlorite']
    },
    {
        id: 'ammonia',
        chemicalName: 'Ammonia (NH₃)',
        commonName: 'Ammonia Cleaner',
        emoji: '🧹',
        description: 'Alkaline cleaning agent with strong odor. Effective for glass and surfaces but toxic in high concentrations.',
        safetyLevel: 'DANGER',
        healthHazards: ['Respiratory irritation', 'Eye burns', 'Skin irritation'],
        incompatibleWith: ['bleach', 'hydrogen-peroxide'],
        alternativeNames: ['ammonia', 'ammonium hydroxide', 'nh3', 'windex']
    },
    {
        id: 'hydrogen-peroxide',
        chemicalName: 'Hydrogen Peroxide (H₂O₂)',
        commonName: 'Hydrogen Peroxide',
        emoji: '💧',
        description: 'Mild antiseptic and bleaching agent. Decomposes into water and oxygen. 3% solution is common.',
        safetyLevel: 'CAUTION',
        healthHazards: ['Skin irritation at high concentrations', 'Eye irritation'],
        incompatibleWith: ['vinegar', 'bleach', 'ammonia'],
        alternativeNames: ['hydrogen peroxide', 'h2o2', 'peroxide']
    },
    {
        id: 'lemon-juice',
        chemicalName: 'Citric Acid (C₆H₈O₇)',
        commonName: 'Lemon Juice',
        emoji: '🍋',
        description: 'Natural weak acid found in citrus fruits. Used in cooking, cleaning, and as a preservative.',
        safetyLevel: 'SAFE',
        healthHazards: ['Mild skin irritation in concentrated form'],
        incompatibleWith: ['bleach'],
        alternativeNames: ['lemon juice', 'citric acid', 'lemon', 'lime juice']
    },
    {
        id: 'salt',
        chemicalName: 'Sodium Chloride (NaCl)',
        commonName: 'Table Salt',
        emoji: '🧂',
        description: 'Common seasoning and preservative. Essential mineral but excessive consumption can be harmful.',
        safetyLevel: 'SAFE',
        healthHazards: [],
        incompatibleWith: [],
        alternativeNames: ['salt', 'sodium chloride', 'nacl', 'table salt', 'sea salt']
    },
    {
        id: 'sugar',
        chemicalName: 'Sucrose (C₁₂H₂₂O₁₁)',
        commonName: 'Sugar',
        emoji: '🍬',
        description: 'Common sweetener. Chemically stable and safe for consumption in moderate amounts.',
        safetyLevel: 'SAFE',
        healthHazards: [],
        incompatibleWith: [],
        alternativeNames: ['sugar', 'sucrose', 'white sugar', 'table sugar', 'cane sugar']
    },
    {
        id: 'water',
        chemicalName: 'Water (H₂O)',
        commonName: 'Water',
        emoji: '💧',
        description: 'Universal solvent and essential for life. Neutral pH of 7.',
        safetyLevel: 'SAFE',
        healthHazards: [],
        incompatibleWith: [],
        alternativeNames: ['water', 'h2o', 'distilled water', 'tap water']
    },
    {
        id: 'milk',
        chemicalName: 'Milk (Lactose, Proteins, Fats)',
        commonName: 'Milk',
        emoji: '🥛',
        description: 'Dairy product containing lactose, proteins, and fats. Slightly acidic pH around 6.5-6.7.',
        safetyLevel: 'SAFE',
        healthHazards: [],
        incompatibleWith: [],
        alternativeNames: ['milk', 'dairy', 'whole milk', 'skim milk']
    },
    {
        id: 'cooking-oil',
        chemicalName: 'Triglycerides (Vegetable Oil)',
        commonName: 'Cooking Oil',
        emoji: '🫒',
        description: 'Mixture of fatty acid triglycerides. Flammable at high temperatures.',
        safetyLevel: 'CAUTION',
        healthHazards: ['Fire hazard when heated'],
        incompatibleWith: [],
        alternativeNames: ['oil', 'cooking oil', 'vegetable oil', 'olive oil', 'canola oil']
    },
    {
        id: 'rubbing-alcohol',
        chemicalName: 'Isopropyl Alcohol (C₃H₈O)',
        commonName: 'Rubbing Alcohol',
        emoji: '🍶',
        description: 'Disinfectant and solvent. Flammable and toxic if ingested. Typically 70% or 91% concentration.',
        safetyLevel: 'CAUTION',
        healthHazards: ['Flammable', 'Toxic if ingested', 'Skin drying'],
        incompatibleWith: ['bleach'],
        alternativeNames: ['rubbing alcohol', 'isopropyl alcohol', 'ipa', 'isopropanol', 'alcohol']
    },
    {
        id: 'dish-soap',
        chemicalName: 'Surfactants (Various)',
        commonName: 'Dish Soap',
        emoji: '🧼',
        description: 'Mixture of surfactants that reduce surface tension. Generally safe for skin contact.',
        safetyLevel: 'SAFE',
        healthHazards: ['Eye irritation', 'Mild if ingested'],
        incompatibleWith: [],
        alternativeNames: ['dish soap', 'dishwashing liquid', 'detergent', 'dawn', 'soap']
    },
    {
        id: 'flour',
        chemicalName: 'Starch (C₆H₁₀O₅)ₙ',
        commonName: 'Flour',
        emoji: '🌾',
        description: 'White powder made from ground grains. Combustible in dust form.',
        safetyLevel: 'SAFE',
        healthHazards: ['Dust explosion hazard in large quantities'],
        incompatibleWith: [],
        alternativeNames: ['flour', 'white powder', 'wheat flour', 'all-purpose flour', 'powder', 'cornstarch']
    },
    {
        id: 'acetone',
        chemicalName: 'Acetone (C₃H₆O)',
        commonName: 'Nail Polish Remover',
        emoji: '💅',
        description: 'Organic solvent used in nail polish remover. Highly flammable and volatile.',
        safetyLevel: 'CAUTION',
        healthHazards: ['Highly flammable', 'Respiratory irritation', 'Skin drying'],
        incompatibleWith: ['bleach', 'hydrogen-peroxide'],
        alternativeNames: ['acetone', 'nail polish remover', 'remover', 'solvent']
    }
];

// Dangerous Reactions Database (keeping existing)
const DANGEROUS_REACTIONS: DangerousReaction[] = [
    {
        chemical1: 'bleach',
        chemical2: 'ammonia',
        danger: 'TOXIC CHLORAMINE GAS',
        warning: 'Creates toxic chloramine gas that can cause respiratory damage and death',
        audioMessage: 'WARNING: Bleach and Ammonia create TOXIC CHLORAMINE GAS. Do not mix!'
    },
    {
        chemical1: 'bleach',
        chemical2: 'vinegar',
        danger: 'TOXIC CHLORINE GAS',
        warning: 'Produces toxic chlorine gas that can cause severe respiratory damage',
        audioMessage: 'WARNING: Bleach and Vinegar create TOXIC CHLORINE GAS. Do not mix!'
    },
    {
        chemical1: 'bleach',
        chemical2: 'lemon-juice',
        danger: 'TOXIC CHLORINE GAS',
        warning: 'Produces toxic chlorine gas that can cause severe respiratory damage',
        audioMessage: 'WARNING: Bleach and Lemon Juice create TOXIC CHLORINE GAS. Do not mix!'
    },
    {
        chemical1: 'bleach',
        chemical2: 'rubbing-alcohol',
        danger: 'TOXIC CHLOROFORM',
        warning: 'Creates chloroform and other toxic compounds',
        audioMessage: 'WARNING: Bleach and Rubbing Alcohol create TOXIC CHLOROFORM. Do not mix!'
    },
    {
        chemical1: 'hydrogen-peroxide',
        chemical2: 'ammonia',
        danger: 'TOXIC FUMES',
        warning: 'Produces toxic fumes and can cause violent reactions',
        audioMessage: 'WARNING: Hydrogen Peroxide and Ammonia create TOXIC FUMES. Do not mix!'
    },
    {
        chemical1: 'hydrogen-peroxide',
        chemical2: 'vinegar',
        danger: 'PERACETIC ACID',
        warning: 'Creates corrosive peracetic acid - dangerous exothermic reaction',
        audioMessage: 'WARNING: Hydrogen Peroxide and Vinegar create dangerous PERACETIC ACID. Do not mix!'
    }
];

// Helper functions (keeping existing)
function identifyChemical(label: string): DetectedChemical | null {
    const normalizedLabel = label.toLowerCase().trim();

    for (const chemical of CHEMICAL_DATABASE) {
        if (chemical.commonName.toLowerCase() === normalizedLabel ||
            chemical.chemicalName.toLowerCase() === normalizedLabel) {
            return { chemical, confidence: 100, label };
        }

        for (const altName of chemical.alternativeNames) {
            if (altName === normalizedLabel) {
                return { chemical, confidence: 95, label };
            }

            if (normalizedLabel.includes(altName) || altName.includes(normalizedLabel)) {
                return { chemical, confidence: 75, label };
            }
        }

        if (chemical.commonName.toLowerCase().includes(normalizedLabel) ||
            normalizedLabel.includes(chemical.commonName.toLowerCase())) {
            return { chemical, confidence: 60, label };
        }
    }

    return null;
}

function checkDangerousReaction(chemicals: Chemical[]): DangerousReaction | null {
    if (chemicals.length < 2) return null;

    for (let i = 0; i < chemicals.length; i++) {
        for (let j = i + 1; j < chemicals.length; j++) {
            const id1 = chemicals[i].id;
            const id2 = chemicals[j].id;

            const reaction = DANGEROUS_REACTIONS.find(r =>
                (r.chemical1 === id1 && r.chemical2 === id2) ||
                (r.chemical1 === id2 && r.chemical2 === id1)
            );

            if (reaction) return reaction;
        }
    }

    return null;
}

function checkCompatibility(chemicals: Chemical[]): { level: AlertLevel; warning: string } {
    if (chemicals.length < 2) {
        return { level: 'none', warning: '' };
    }

    const dangerousReaction = checkDangerousReaction(chemicals);
    if (dangerousReaction) {
        return {
            level: 'danger',
            warning: `🚨 STOP! DO NOT MIX - ${dangerousReaction.danger}: ${dangerousReaction.warning}`
        };
    }

    for (let i = 0; i < chemicals.length; i++) {
        for (let j = i + 1; j < chemicals.length; j++) {
            const chem1 = chemicals[i];
            const chem2 = chemicals[j];

            if (chem1.incompatibleWith.includes(chem2.id)) {
                return {
                    level: 'caution',
                    warning: `⚠️ CAUTION: ${chem1.commonName} and ${chem2.commonName} should not be mixed - may cause harmful reactions`
                };
            }

            if (chem2.incompatibleWith.includes(chem1.id)) {
                return {
                    level: 'caution',
                    warning: `⚠️ CAUTION: ${chem2.commonName} and ${chem1.commonName} should not be mixed - may cause harmful reactions`
                };
            }
        }
    }

    return { level: 'safe', warning: '✅ SAFE TO MIX - No known dangerous interactions' };
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

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize camera on mount and when switching to camera tab
    useEffect(() => {
        const initCamera = async () => {
            try {
                // Only initialize camera if we're on the camera tab
                if (activeTab !== 'camera') {
                    // Stop camera if we're not on camera tab
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                        setStream(null);
                        if (videoRef.current) {
                            videoRef.current.srcObject = null;
                        }
                    }
                    return;
                }

                // If camera is already running, don't reinitialize
                if (stream && stream.active) {
                    return;
                }

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
    }, [activeTab]); // Re-run when activeTab changes

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
        window.speechSynthesis.cancel();
        setAnalysisOutput('⏹️ Experiment stopped. Ready to start new experiment.');
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

    // Start experiment function
    const startExperiment = (experiment: Experiment) => {
        setSelectedExperiment(experiment);
        setCurrentStep(0);
        setActiveTab('camera');
        setExperimentStatus('running');

        // Speak the experiment introduction
        speakWarning(`Starting experiment: ${experiment.name}. ${experiment.scientificExplanation}`);

        // Speak first step after a delay
        setTimeout(() => {
            if (experiment.steps.length > 0) {
                speakWarning(`Step 1: ${experiment.steps[0]}`);
            }
        }, 3000);
    };

    // Navigate experiment steps
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

    // Filter experiments
    const filteredExperiments = EXPERIMENTS_DATABASE.filter(exp => {
        const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
        const matchesDifficulty = difficultyFilter === 'All' || exp.difficulty === difficultyFilter;
        const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exp.scientificExplanation.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesDifficulty && matchesSearch;
    });

    const compatibility = checkCompatibility(detectedChemicals.map(d => d.chemical));

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
                    📊 Data
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

                        {/* Active Experiment Steps */}
                        {selectedExperiment && (
                            <div className="experiment-steps-panel">
                                <div className="experiment-header">
                                    <h2>{selectedExperiment.emoji} {selectedExperiment.name}</h2>
                                    <span className="difficulty-badge">{selectedExperiment.difficulty}</span>
                                </div>

                                <div className="step-progress">
                                    Step {currentStep + 1} of {selectedExperiment.steps.length}
                                </div>

                                <div className="current-step">
                                    <h3>Current Step:</h3>
                                    <p>{selectedExperiment.steps[currentStep]}</p>

                                    {/* Animated Step Illustration */}
                                    <div className="step-illustration active">
                                        {/* Step 1: Add baking soda - show powder falling into beaker */}
                                        {currentStep === 0 && (
                                            <>
                                                <div className="beaker">
                                                    <div className="beaker-content"></div>
                                                </div>
                                                <div className="powder"></div>
                                                <div className="hand"></div>
                                            </>
                                        )}

                                        {/* Step 2: Add food coloring (optional) - show dropper */}
                                        {currentStep === 1 && (
                                            <>
                                                <div className="beaker">
                                                    <div className="beaker-content" style={{ height: '40%', background: 'rgba(255, 255, 255, 0.3)' }}></div>
                                                </div>
                                                <div className="hand" style={{ top: '80px' }}></div>
                                            </>
                                        )}

                                        {/* Step 3: Pour vinegar - show bottle pouring */}
                                        {currentStep === 2 && (
                                            <>
                                                <div className="beaker">
                                                    <div className="beaker-content" style={{ height: '40%' }}></div>
                                                </div>
                                                <div className="bottle">
                                                    <div className="bottle-cap"></div>
                                                </div>
                                                <div className="liquid-stream"></div>
                                            </>
                                        )}

                                        {/* Step 4: Watch fizzing - show bubbles */}
                                        {currentStep === 3 && (
                                            <>
                                                <div className="beaker">
                                                    <div className="beaker-content" style={{ height: '60%', background: 'rgba(100, 255, 218, 0.3)' }}></div>
                                                </div>
                                                <div className="bubble"></div>
                                                <div className="bubble"></div>
                                                <div className="bubble"></div>
                                                <div className="bubble"></div>
                                                <div className="fizz-particles">
                                                    {[...Array(10)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="fizz-particle"
                                                            style={{
                                                                left: `${50 + Math.random() * 20 - 10}%`,
                                                                top: `${50 + Math.random() * 20 - 10}%`,
                                                                '--tx': `${(Math.random() - 0.5) * 100}px`,
                                                                '--ty': `${-Math.random() * 100}px`,
                                                                animationDelay: `${i * 0.1}s`
                                                            } as React.CSSProperties}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {/* Step 5: Observe CO2 bubbles - show success */}
                                        {currentStep === 4 && (
                                            <>
                                                <div className="beaker">
                                                    <div className="beaker-content" style={{ height: '80%', background: 'rgba(100, 255, 218, 0.4)' }}></div>
                                                </div>
                                                <div className="bubble"></div>
                                                <div className="bubble"></div>
                                                <div className="bubble"></div>
                                                <div className="bubble"></div>
                                                <div className="checkmark"></div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="step-navigation">
                                    <button
                                        onClick={previousStep}
                                        disabled={currentStep === 0}
                                        className="btn-nav"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        disabled={currentStep === selectedExperiment.steps.length - 1}
                                        className="btn-nav"
                                    >
                                        Next →
                                    </button>
                                </div>

                                <div className="experiment-info">
                                    <p><strong>Expected Output:</strong> {selectedExperiment.expectedOutput}</p>
                                    <p><strong>What Happens:</strong> {selectedExperiment.whatHappens}</p>
                                </div>
                            </div>
                        )}

                        {/* Chemicals in View Indicator */}
                        {detectedChemicals.length > 0 && (
                            <div className="chemicals-in-view">
                                <h3>🔬 Chemicals in View ({detectedChemicals.length})</h3>
                                <div className="chemical-tags">
                                    {detectedChemicals.map((detected) => (
                                        <div key={detected.chemical.id} className={`chemical-tag ${detected.chemical.safetyLevel.toLowerCase()}`}>
                                            <span>{detected.chemical.emoji} {detected.chemical.commonName}</span>
                                            <button
                                                className="remove-btn"
                                                onClick={() => handleRemoveChemical(detected.chemical.id)}
                                                title="Remove from view"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Safety Alert Panel */}
                        {detectedChemicals.length >= 2 && (
                            <div className={`safety-alert ${compatibility.level}`}>
                                <div className="alert-icon">
                                    {compatibility.level === 'safe' && '✅'}
                                    {compatibility.level === 'caution' && '⚠️'}
                                    {compatibility.level === 'danger' && '🚨'}
                                </div>
                                <div className="alert-message">
                                    {compatibility.warning}
                                </div>
                            </div>
                        )}

                        {/* Detected Chemicals Panel */}
                        {detectedChemicals.length > 0 && (
                            <div className="detected-panel">
                                <h3>🧪 Detected Chemicals</h3>
                                <div className="detected-list">
                                    {detectedChemicals.map((detected, idx) => (
                                        <div key={idx} className={`detected-item ${detected.chemical.safetyLevel.toLowerCase()}`}>
                                            <span className="chem-emoji">{detected.chemical.emoji}</span>
                                            <div className="chem-info">
                                                <strong>{detected.chemical.commonName}</strong>
                                                <span className="confidence">{detected.confidence}% match</span>
                                            </div>
                                            <span className={`safety-badge ${detected.chemical.safetyLevel.toLowerCase()}`}>
                                                {detected.chemical.safetyLevel}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Test Input for Chemical Identification */}
                        <div className="test-input-panel">
                            <h3>🔬 Test Chemical Identification</h3>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Enter chemical name (e.g., 'bleach', 'ammonia')"
                                    value={testInput}
                                    onChange={(e) => setTestInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleTestIdentify()}
                                />
                                <button onClick={handleTestIdentify} className="btn-identify">
                                    Identify
                                </button>
                            </div>
                        </div>

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
                        <h2>🧪 Experiments Library ({EXPERIMENTS_DATABASE.length} experiments)</h2>

                        {/* Filters */}
                        <div className="experiment-filters">
                            <div className="filter-group">
                                <label>Category:</label>
                                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ExperimentCategory | 'All')}>
                                    <option value="All">All Categories</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Biology">Biology</option>
                                    <option value="Physics">Physics</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Difficulty:</label>
                                <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value as DifficultyLevel | 'All')}>
                                    <option value="All">All Levels</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            <div className="filter-group search-group">
                                <input
                                    type="text"
                                    placeholder="Search experiments..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Experiment Grid */}
                        <div className="experiment-list">
                            {filteredExperiments.map((experiment) => (
                                <div key={experiment.id} className="experiment-card" onClick={() => startExperiment(experiment)}>
                                    <div className="experiment-emoji">{experiment.emoji}</div>
                                    <h3>{experiment.name}</h3>
                                    <div className="experiment-meta">
                                        <span className="category-badge">{experiment.category}</span>
                                        <span className={`difficulty-badge ${experiment.difficulty.toLowerCase()}`}>
                                            {experiment.difficulty}
                                        </span>
                                    </div>
                                    <p className="experiment-description">{experiment.scientificExplanation}</p>
                                    <div className="experiment-details">
                                        <span>⏱️ {Math.floor(experiment.durationSeconds / 60)} min</span>
                                        <span>🧪 {experiment.chemicalsNeeded.length} chemicals</span>
                                    </div>
                                    <button className="btn-start-exp">Start Experiment →</button>
                                </div>
                            ))}
                        </div>

                        {filteredExperiments.length === 0 && (
                            <div className="no-results">
                                <p>No experiments found matching your filters.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'safety' && (
                    <div className="safety-view">
                        <h2>Chemical Safety Database ({CHEMICAL_DATABASE.length} chemicals)</h2>
                        <div className="safety-info">
                            {CHEMICAL_DATABASE.map((chem) => (
                                <div key={chem.id} className={`safety-card ${chem.safetyLevel.toLowerCase()}`}>
                                    <h3>{chem.emoji} {chem.commonName}</h3>
                                    <p className="chem-formula">{chem.chemicalName}</p>
                                    <p>{chem.description}</p>
                                    {chem.healthHazards.length > 0 && (
                                        <div className="hazards">
                                            <strong>⚠️ Hazards:</strong>
                                            <ul>
                                                {chem.healthHazards.map((h, i) => <li key={i}>{h}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {chem.incompatibleWith.length > 0 && (
                                        <div className="incompatible">
                                            <strong>🚫 Do NOT mix with:</strong> {chem.incompatibleWith.join(', ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="data-view">
                        <h2>Data Logger</h2>
                        <div className="data-placeholder">
                            <p>📈 Experiment data and graphs will appear here</p>
                            <p>Start an experiment to begin logging data</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
