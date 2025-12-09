import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import * as THREE from 'three';

// Atom colors based on element
const ATOM_COLORS = {
    C: '#000000',  // Carbon - black
    H: '#FFFFFF',  // Hydrogen - white
    O: '#FF0000',  // Oxygen - red
    N: '#0000FF',  // Nitrogen - blue
    Na: '#FFFF00', // Sodium - yellow
    Cl: '#00FF00', // Chlorine - green
};

// Atom properties
const ATOM_DATA = {
    C: { name: 'Carbon', atomicNumber: 6, mass: 12.01 },
    H: { name: 'Hydrogen', atomicNumber: 1, mass: 1.008 },
    O: { name: 'Oxygen', atomicNumber: 8, mass: 16.00 },
    N: { name: 'Nitrogen', atomicNumber: 7, mass: 14.01 },
    Na: { name: 'Sodium', atomicNumber: 11, mass: 22.99 },
    Cl: { name: 'Chlorine', atomicNumber: 17, mass: 35.45 },
};

interface AtomPosition {
    element: keyof typeof ATOM_COLORS;
    position: [number, number, number];
    id: string;
}

interface Bond {
    from: string;
    to: string;
    strength: number;
}

interface MoleculeData {
    name: string;
    formula: string;
    atoms: AtomPosition[];
    bonds: Bond[];
    position: [number, number, number];
}

interface ReactionData {
    name: string;
    reactants: MoleculeData[];
    products: MoleculeData[];
    description: string;
    warning?: string;
}

// Molecular data for key reactions
const REACTIONS: { [key: string]: ReactionData } = {
    'vinegar-baking-soda': {
        name: 'Vinegar + Baking Soda',
        description: 'Acid-base reaction producing CO₂ gas',
        reactants: [
            {
                name: 'Acetic Acid',
                formula: 'CH₃COOH',
                position: [-3, 0, 0],
                atoms: [
                    { element: 'C', position: [0, 0, 0], id: 'c1' },
                    { element: 'C', position: [1.5, 0, 0], id: 'c2' },
                    { element: 'O', position: [2.5, 0.8, 0], id: 'o1' },
                    { element: 'O', position: [2.5, -0.8, 0], id: 'o2' },
                    { element: 'H', position: [3.5, -0.8, 0], id: 'h1' },
                    { element: 'H', position: [-0.5, 0.8, 0], id: 'h2' },
                    { element: 'H', position: [-0.5, -0.8, 0], id: 'h3' },
                    { element: 'H', position: [0, 0, 1], id: 'h4' },
                ],
                bonds: [
                    { from: 'c1', to: 'c2', strength: 1 },
                    { from: 'c2', to: 'o1', strength: 2 },
                    { from: 'c2', to: 'o2', strength: 1 },
                    { from: 'o2', to: 'h1', strength: 1 },
                    { from: 'c1', to: 'h2', strength: 1 },
                    { from: 'c1', to: 'h3', strength: 1 },
                    { from: 'c1', to: 'h4', strength: 1 },
                ]
            },
            {
                name: 'Sodium Bicarbonate',
                formula: 'NaHCO₃',
                position: [3, 0, 0],
                atoms: [
                    { element: 'Na', position: [0, 0, 0], id: 'na1' },
                    { element: 'H', position: [1, 0, 0], id: 'h5' },
                    { element: 'C', position: [2, 0, 0], id: 'c3' },
                    { element: 'O', position: [2.8, 0.8, 0], id: 'o3' },
                    { element: 'O', position: [2.8, -0.8, 0], id: 'o4' },
                    { element: 'O', position: [2, 0, 1.2], id: 'o5' },
                ],
                bonds: [
                    { from: 'na1', to: 'h5', strength: 1 },
                    { from: 'h5', to: 'c3', strength: 1 },
                    { from: 'c3', to: 'o3', strength: 2 },
                    { from: 'c3', to: 'o4', strength: 1 },
                    { from: 'c3', to: 'o5', strength: 1 },
                ]
            }
        ],
        products: [
            {
                name: 'Carbon Dioxide',
                formula: 'CO₂',
                position: [0, 2, 0],
                atoms: [
                    { element: 'C', position: [0, 0, 0], id: 'c4' },
                    { element: 'O', position: [-1.2, 0, 0], id: 'o6' },
                    { element: 'O', position: [1.2, 0, 0], id: 'o7' },
                ],
                bonds: [
                    { from: 'c4', to: 'o6', strength: 2 },
                    { from: 'c4', to: 'o7', strength: 2 },
                ]
            },
            {
                name: 'Water',
                formula: 'H₂O',
                position: [-2, 2, 0],
                atoms: [
                    { element: 'O', position: [0, 0, 0], id: 'o8' },
                    { element: 'H', position: [-0.8, 0.6, 0], id: 'h6' },
                    { element: 'H', position: [0.8, 0.6, 0], id: 'h7' },
                ],
                bonds: [
                    { from: 'o8', to: 'h6', strength: 1 },
                    { from: 'o8', to: 'h7', strength: 1 },
                ]
            },
            {
                name: 'Sodium Acetate',
                formula: 'NaCH₃COO',
                position: [2, 2, 0],
                atoms: [
                    { element: 'Na', position: [0, 0, 0], id: 'na2' },
                    { element: 'C', position: [1.5, 0, 0], id: 'c5' },
                    { element: 'C', position: [2.5, 0, 0], id: 'c6' },
                    { element: 'O', position: [3.5, 0.8, 0], id: 'o9' },
                    { element: 'O', position: [3.5, -0.8, 0], id: 'o10' },
                    { element: 'H', position: [1, 0.8, 0], id: 'h8' },
                    { element: 'H', position: [1, -0.8, 0], id: 'h9' },
                    { element: 'H', position: [1.5, 0, 1], id: 'h10' },
                ],
                bonds: [
                    { from: 'na2', to: 'c5', strength: 1 },
                    { from: 'c5', to: 'c6', strength: 1 },
                    { from: 'c6', to: 'o9', strength: 2 },
                    { from: 'c6', to: 'o10', strength: 1 },
                    { from: 'c5', to: 'h8', strength: 1 },
                    { from: 'c5', to: 'h9', strength: 1 },
                    { from: 'c5', to: 'h10', strength: 1 },
                ]
            }
        ]
    },
    'hydrogen-peroxide-yeast': {
        name: 'Hydrogen Peroxide + Yeast',
        description: 'Catalytic decomposition producing oxygen gas',
        reactants: [
            {
                name: 'Hydrogen Peroxide',
                formula: 'H₂O₂',
                position: [0, 0, 0],
                atoms: [
                    { element: 'H', position: [0, 0, 0], id: 'h1' },
                    { element: 'O', position: [0.8, 0, 0], id: 'o1' },
                    { element: 'O', position: [1.6, 0, 0], id: 'o2' },
                    { element: 'H', position: [2.4, 0, 0], id: 'h2' },
                ],
                bonds: [
                    { from: 'h1', to: 'o1', strength: 1 },
                    { from: 'o1', to: 'o2', strength: 1 },
                    { from: 'o2', to: 'h2', strength: 1 },
                ]
            }
        ],
        products: [
            {
                name: 'Water',
                formula: 'H₂O',
                position: [-2, 2, 0],
                atoms: [
                    { element: 'O', position: [0, 0, 0], id: 'o3' },
                    { element: 'H', position: [-0.8, 0.6, 0], id: 'h3' },
                    { element: 'H', position: [0.8, 0.6, 0], id: 'h4' },
                ],
                bonds: [
                    { from: 'o3', to: 'h3', strength: 1 },
                    { from: 'o3', to: 'h4', strength: 1 },
                ]
            },
            {
                name: 'Oxygen Gas',
                formula: 'O₂',
                position: [2, 2, 0],
                atoms: [
                    { element: 'O', position: [0, 0, 0], id: 'o4' },
                    { element: 'O', position: [1.2, 0, 0], id: 'o5' },
                ],
                bonds: [
                    { from: 'o4', to: 'o5', strength: 2 },
                ]
            }
        ]
    },
    'bleach-ammonia': {
        name: 'Bleach + Ammonia',
        description: 'DANGEROUS: Produces toxic chloramine gas',
        warning: '⚠️ TOXIC REACTION - NEVER MIX IN REAL LIFE!',
        reactants: [
            {
                name: 'Sodium Hypochlorite',
                formula: 'NaClO',
                position: [-2, 0, 0],
                atoms: [
                    { element: 'Na', position: [0, 0, 0], id: 'na1' },
                    { element: 'Cl', position: [1.5, 0, 0], id: 'cl1' },
                    { element: 'O', position: [2.5, 0, 0], id: 'o1' },
                ],
                bonds: [
                    { from: 'na1', to: 'cl1', strength: 1 },
                    { from: 'cl1', to: 'o1', strength: 1 },
                ]
            },
            {
                name: 'Ammonia',
                formula: 'NH₃',
                position: [2, 0, 0],
                atoms: [
                    { element: 'N', position: [0, 0, 0], id: 'n1' },
                    { element: 'H', position: [-0.8, 0.6, 0], id: 'h1' },
                    { element: 'H', position: [0.8, 0.6, 0], id: 'h2' },
                    { element: 'H', position: [0, -0.8, 0], id: 'h3' },
                ],
                bonds: [
                    { from: 'n1', to: 'h1', strength: 1 },
                    { from: 'n1', to: 'h2', strength: 1 },
                    { from: 'n1', to: 'h3', strength: 1 },
                ]
            }
        ],
        products: [
            {
                name: 'Chloramine (TOXIC)',
                formula: 'NH₂Cl',
                position: [0, 2, 0],
                atoms: [
                    { element: 'N', position: [0, 0, 0], id: 'n2' },
                    { element: 'H', position: [-0.8, 0.6, 0], id: 'h4' },
                    { element: 'H', position: [0.8, 0.6, 0], id: 'h5' },
                    { element: 'Cl', position: [0, -1.2, 0], id: 'cl2' },
                ],
                bonds: [
                    { from: 'n2', to: 'h4', strength: 1 },
                    { from: 'n2', to: 'h5', strength: 1 },
                    { from: 'n2', to: 'cl2', strength: 1 },
                ]
            }
        ]
    }
};

// Atom component
interface AtomProps {
    element: keyof typeof ATOM_COLORS;
    position: [number, number, number];
    onClick: () => void;
    scale?: number;
}

const Atom: React.FC<AtomProps> = ({ element, position, onClick, scale = 1 }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame(() => {
        if (meshRef.current && hovered) {
            meshRef.current.scale.setScalar(0.35 * scale);
        } else if (meshRef.current) {
            meshRef.current.scale.setScalar(0.3 * scale);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <sphereGeometry args={[0.3 * scale, 32, 32]} />
            <meshStandardMaterial
                color={ATOM_COLORS[element]}
                emissive={hovered ? ATOM_COLORS[element] : '#000000'}
                emissiveIntensity={hovered ? 0.3 : 0}
            />
        </mesh>
    );
};

// Bond component
interface BondProps {
    start: [number, number, number];
    end: [number, number, number];
    strength: number;
    opacity?: number;
}

const Bond: React.FC<BondProps> = ({ start, end, strength, opacity = 1 }) => {
    const direction = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
    const length = direction.length();
    const midpoint: [number, number, number] = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2
    ];

    direction.normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    return (
        <mesh position={midpoint} quaternion={quaternion}>
            <cylinderGeometry args={[0.05 * strength, 0.05 * strength, length, 8]} />
            <meshStandardMaterial color="#888888" transparent opacity={opacity} />
        </mesh>
    );
};

// Molecule component
interface MoleculeProps {
    data: MoleculeData;
    onAtomClick: (element: keyof typeof ATOM_COLORS) => void;
    bondOpacity?: number;
    scale?: number;
}

const Molecule: React.FC<MoleculeProps> = ({ data, onAtomClick, bondOpacity = 1, scale = 1 }) => {
    const groupRef = useRef<THREE.Group>(null);

    return (
        <group ref={groupRef} position={data.position}>
            {/* Render bonds */}
            {data.bonds.map((bond, idx) => {
                const fromAtom = data.atoms.find(a => a.id === bond.from);
                const toAtom = data.atoms.find(a => a.id === bond.to);
                if (!fromAtom || !toAtom) return null;

                return (
                    <Bond
                        key={idx}
                        start={fromAtom.position}
                        end={toAtom.position}
                        strength={bond.strength}
                        opacity={bondOpacity}
                    />
                );
            })}

            {/* Render atoms */}
            {data.atoms.map((atom, idx) => (
                <Atom
                    key={idx}
                    element={atom.element}
                    position={atom.position}
                    onClick={() => onAtomClick(atom.element)}
                    scale={scale}
                />
            ))}

            {/* Label */}
            <Text
                position={[0, -2, 0]}
                fontSize={0.4}
                color="#64ffda"
                anchorX="center"
                anchorY="middle"
            >
                {data.formula}
            </Text>
        </group>
    );
};

// Main 3D Molecular Viewer component
interface MolecularViewerProps {
    reactionId: string;
    isPlaying: boolean;
    speed: number;
}

export const MolecularViewer: React.FC<MolecularViewerProps> = ({
    reactionId,
    isPlaying,
    speed
}) => {
    const [selectedAtom, setSelectedAtom] = useState<keyof typeof ATOM_COLORS | null>(null);
    const [animationProgress, setAnimationProgress] = useState(0);

    const reaction = REACTIONS[reactionId];

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setAnimationProgress(prev => {
                const newProgress = prev + (0.01 * speed);
                return newProgress > 1 ? 0 : newProgress;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [isPlaying, speed]);

    if (!reaction) {
        return <div>Reaction not found</div>;
    }

    const handleAtomClick = (element: keyof typeof ATOM_COLORS) => {
        setSelectedAtom(element);
    };

    // Calculate interpolated positions for animation
    const bondOpacity = animationProgress < 0.3 ? 1 : animationProgress < 0.5 ? 1 - ((animationProgress - 0.3) / 0.2) : animationProgress < 0.7 ? 0 : (animationProgress - 0.7) / 0.3;

    return (
        <div style={{ width: '100%', height: '600px', position: 'relative', background: '#0a0e27', borderRadius: '12px', overflow: 'hidden' }}>
            {reaction.warning && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    zIndex: 10,
                    animation: 'pulse 2s infinite'
                }}>
                    {reaction.warning}
                </div>
            )}

            <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                {/* Reactants (fade out during animation) */}
                {animationProgress < 0.5 && reaction.reactants.map((reactant, idx) => (
                    <Molecule
                        key={`reactant-${idx}`}
                        data={reactant}
                        onAtomClick={handleAtomClick}
                        bondOpacity={animationProgress < 0.3 ? 1 : 1 - ((animationProgress - 0.3) / 0.2)}
                        scale={1 - (animationProgress * 0.5)}
                    />
                ))}

                {/* Products (fade in during animation) */}
                {animationProgress > 0.5 && reaction.products.map((product, idx) => (
                    <Molecule
                        key={`product-${idx}`}
                        data={product}
                        onAtomClick={handleAtomClick}
                        bondOpacity={(animationProgress - 0.5) / 0.5}
                        scale={0.5 + ((animationProgress - 0.5) * 0.5)}
                    />
                ))}

                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    minDistance={5}
                    maxDistance={30}
                />
            </Canvas>

            {/* Atom Info Panel */}
            {selectedAtom && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    background: 'rgba(26, 31, 58, 0.95)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '2px solid #64ffda',
                    color: 'white',
                    minWidth: '200px'
                }}>
                    <h3 style={{ color: '#64ffda', marginBottom: '10px' }}>
                        {ATOM_DATA[selectedAtom].name}
                    </h3>
                    <p><strong>Symbol:</strong> {selectedAtom}</p>
                    <p><strong>Atomic Number:</strong> {ATOM_DATA[selectedAtom].atomicNumber}</p>
                    <p><strong>Atomic Mass:</strong> {ATOM_DATA[selectedAtom].mass} u</p>
                    <button
                        onClick={() => setSelectedAtom(null)}
                        style={{
                            marginTop: '10px',
                            padding: '5px 15px',
                            background: '#64ffda',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Animation Progress Bar */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                width: '200px',
                background: 'rgba(26, 31, 58, 0.95)',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #64ffda'
            }}>
                <div style={{ color: '#64ffda', fontSize: '12px', marginBottom: '5px' }}>
                    Animation Progress
                </div>
                <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#0d1128',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${animationProgress * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #64ffda, #10b981)',
                        transition: 'width 0.05s linear'
                    }} />
                </div>
                <div style={{ color: '#8892b0', fontSize: '10px', marginTop: '5px' }}>
                    {animationProgress < 0.3 ? 'Reactants' : animationProgress < 0.7 ? 'Transforming...' : 'Products'}
                </div>
            </div>
        </div>
    );
};

export default MolecularViewer;
