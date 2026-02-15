import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Ingredient database - rebalanced so each has tradeoffs
const INGREDIENTS = {
  // High umami, low sweet/sour
  mushroom: { name: 'Mushroom', cost: 3, sour: 0, sweet: 1, bitter: 2, salty: 1, umami: 8, spicy: 0, emoji: '🍄', allergen: 'fungi' },
  miso: { name: 'Miso', cost: 4, sour: 0, sweet: 0, bitter: 1, salty: 7, umami: 9, spicy: 0, emoji: '🥣', allergen: 'soy' },
  soySauce: { name: 'Soy Sauce', cost: 2, sour: 0, sweet: 0, bitter: 0, salty: 9, umami: 8, spicy: 0, emoji: '🫙', allergen: 'soy' },
  
  // High sweet, low umami/salty
  carrot: { name: 'Carrot', cost: 1, sour: 0, sweet: 8, bitter: 0, salty: 0, umami: 1, spicy: 0, emoji: '🥕', allergen: null },
  bellPepper: { name: 'Bell Pepper', cost: 2, sour: 0, sweet: 7, bitter: 1, salty: 0, umami: 2, spicy: 0, emoji: '🫑', allergen: 'nightshade' },
  maple: { name: 'Maple Syrup', cost: 3, sour: 0, sweet: 9, bitter: 0, salty: 0, umami: 0, spicy: 0, emoji: '🍯', allergen: null },
  
  // High sour, low sweet
  lemon: { name: 'Lemon', cost: 1, sour: 9, sweet: 0, bitter: 1, salty: 0, umami: 0, spicy: 0, emoji: '🍋', allergen: 'citrus' },
  lime: { name: 'Lime', cost: 1, sour: 8, sweet: 1, bitter: 0, salty: 0, umami: 0, spicy: 0, emoji: '🫒', allergen: 'citrus' },
  vinegar: { name: 'Vinegar', cost: 2, sour: 9, sweet: 0, bitter: 0, salty: 0, umami: 1, spicy: 0, emoji: '🧪', allergen: null },
  
  // High spicy, low sweet
  chili: { name: 'Chili', cost: 2, sour: 0, sweet: 0, bitter: 1, salty: 0, umami: 2, spicy: 9, emoji: '🌶️', allergen: 'nightshade' },
  pepper: { name: 'Black Pepper', cost: 1, sour: 0, sweet: 0, bitter: 2, salty: 0, umami: 1, spicy: 7, emoji: '🫚', allergen: null },
  
  // Balanced/versatile (slightly lower values overall)
  tomato: { name: 'Tomato', cost: 2, sour: 3, sweet: 4, bitter: 1, salty: 1, umami: 5, spicy: 0, emoji: '🍅', allergen: 'nightshade' },
  garlic: { name: 'Garlic', cost: 1, sour: 0, sweet: 1, bitter: 1, salty: 1, umami: 6, spicy: 3, emoji: '🧄', allergen: 'allium' },
  tofu: { name: 'Tofu', cost: 3, sour: 0, sweet: 1, bitter: 0, salty: 1, umami: 4, spicy: 0, emoji: '🧈', allergen: 'soy' },
  basil: { name: 'Basil', cost: 1, sour: 0, sweet: 2, bitter: 3, salty: 0, umami: 2, spicy: 0, emoji: '🌿', allergen: null },
  
  // High bitter, low sweet
  kale: { name: 'Kale', cost: 2, sour: 0, sweet: 0, bitter: 8, salty: 0, umami: 2, spicy: 0, emoji: '🥬', allergen: null },
  coffee: { name: 'Coffee', cost: 2, sour: 1, sweet: 0, bitter: 9, salty: 0, umami: 2, spicy: 0, emoji: '☕', allergen: null },
  
  // High salty, low sweet
  olives: { name: 'Olives', cost: 2, sour: 1, sweet: 0, bitter: 2, salty: 8, umami: 4, spicy: 0, emoji: '🫒', allergen: null },
  seaweed: { name: 'Seaweed', cost: 3, sour: 0, sweet: 0, bitter: 1, salty: 7, umami: 7, spicy: 0, emoji: '🌊', allergen: null },
};

// Customer avatar pool
const CUSTOMER_AVATARS = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👴', '👵', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '🧑‍🎨', '👨‍🔬', '👩‍🔬', '🧙‍♂️', '🧙‍♀️', '🤴', '👸', '🧑‍🌾', '👨‍🏫', '👩‍🏫', '🧑‍⚕️'];

const CUSTOMER_NAMES = [
  'Chef Mario', 'Baker Betty', 'Professor Chen', 'Detective Davis', 'Artist Amy',
  'Scientist Sam', 'Wizard Walter', 'Queen Quincy', 'Farmer Fred', 'Teacher Tina',
  'Doctor Diana', 'Critic Carlos', 'Foodie Fiona', 'Gourmet Gary', 'Epicurean Emma',
  'Connoisseur Connor', 'Taste-tester Tara', 'Savant Steven', 'Maven Maya', 'Expert Eric'
];

// Allergen categories
const ALLERGENS = ['soy', 'citrus', 'nightshade', 'fungi', 'allium'];

// Generate random customer profile
const generateCustomer = (currentDay) => {
  const intensity = Math.random(); // 0-1, determines if they want mild or strong flavors
  
  // Pick dominant flavor profile
  const profiles = [
    'sweet-lover', 'umami-lover', 'sour-lover', 'spicy-lover', 'salty-lover', 'bitter-lover', 'balanced'
  ];
  const profile = profiles[Math.floor(Math.random() * profiles.length)];
  
  let target = { sour: 0, sweet: 0, bitter: 0, salty: 0, umami: 0, spicy: 0 };
  
  // Strong taste (intensity > 0.6) vs mild taste (intensity < 0.6)
  const strongValue = Math.floor(7 + Math.random() * 3); // 7-9
  const mildValue = Math.floor(2 + Math.random() * 3); // 2-4
  const baseValue = Math.floor(1 + Math.random() * 2); // 1-2
  
  if (intensity > 0.6) {
    // Strong, bold flavors
    switch(profile) {
      case 'sweet-lover':
        target = { sour: baseValue, sweet: strongValue, bitter: 0, salty: mildValue, umami: mildValue, spicy: baseValue };
        break;
      case 'umami-lover':
        target = { sour: baseValue, sweet: mildValue, bitter: baseValue, salty: mildValue + 2, umami: strongValue, spicy: baseValue };
        break;
      case 'sour-lover':
        target = { sour: strongValue, sweet: mildValue, bitter: baseValue, salty: mildValue, umami: mildValue, spicy: baseValue };
        break;
      case 'spicy-lover':
        target = { sour: mildValue, sweet: baseValue, bitter: baseValue, salty: mildValue, umami: mildValue + 1, spicy: strongValue };
        break;
      case 'salty-lover':
        target = { sour: baseValue, sweet: mildValue, bitter: baseValue, salty: strongValue, umami: mildValue + 2, spicy: baseValue };
        break;
      case 'bitter-lover':
        target = { sour: mildValue, sweet: baseValue, bitter: strongValue, salty: mildValue, umami: mildValue, spicy: baseValue };
        break;
      case 'balanced':
        target = { sour: mildValue + 1, sweet: mildValue + 1, bitter: mildValue, salty: mildValue + 1, umami: mildValue + 2, spicy: mildValue };
        break;
    }
  } else {
    // Mild, subtle flavors (all values lower)
    const lowValue = Math.floor(2 + Math.random() * 2); // 2-3
    const veryLowValue = Math.floor(0 + Math.random() * 2); // 0-1
    
    switch(profile) {
      case 'sweet-lover':
        target = { sour: veryLowValue, sweet: mildValue + 1, bitter: veryLowValue, salty: lowValue, umami: lowValue, spicy: veryLowValue };
        break;
      case 'umami-lover':
        target = { sour: veryLowValue, sweet: lowValue, bitter: veryLowValue, salty: lowValue + 1, umami: mildValue + 1, spicy: veryLowValue };
        break;
      case 'sour-lover':
        target = { sour: mildValue + 1, sweet: lowValue, bitter: veryLowValue, salty: lowValue, umami: lowValue, spicy: veryLowValue };
        break;
      case 'spicy-lover':
        target = { sour: lowValue, sweet: veryLowValue, bitter: veryLowValue, salty: lowValue, umami: lowValue, spicy: mildValue + 1 };
        break;
      case 'salty-lover':
        target = { sour: veryLowValue, sweet: lowValue, bitter: veryLowValue, salty: mildValue + 1, umami: lowValue + 1, spicy: veryLowValue };
        break;
      case 'bitter-lover':
        target = { sour: lowValue, sweet: veryLowValue, bitter: mildValue + 1, salty: lowValue, umami: lowValue, spicy: veryLowValue };
        break;
      case 'balanced':
        target = { sour: lowValue, sweet: lowValue, bitter: lowValue, salty: lowValue, umami: lowValue + 1, spicy: lowValue };
        break;
    }
  }
  
  // Tolerance based on intensity - mild customers are more forgiving
  const tolerance = intensity > 0.6 ? 2 + Math.random() : 3 + Math.random() * 1.5;
  
  // Add allergies starting from day 5
  let allergy = null;
  if (currentDay >= 5) {
    // 40% chance of having an allergy
    if (Math.random() < 0.4) {
      allergy = ALLERGENS[Math.floor(Math.random() * ALLERGENS.length)];
    }
  }
  
  const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
  const avatar = CUSTOMER_AVATARS[Math.floor(Math.random() * CUSTOMER_AVATARS.length)];
  const tip = Math.floor(5 + Math.random() * 5); // $5-9 base tip
  
  return {
    name,
    avatar,
    target,
    tolerance,
    patience: 60,
    tip,
    intensity,
    profile,
    allergy,
    id: Date.now() + Math.random()
  };
};

function UmamiLab() {
  const [gameState, setGameState] = useState('market'); // 'market', 'service', 'results'
  const [day, setDay] = useState(1);
  const [money, setMoney] = useState(50);
  const [reputation, setReputation] = useState(0);
  const [inventory, setInventory] = useState({});
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [customerQueue, setCustomerQueue] = useState([]);
  const [dayResults, setDayResults] = useState([]);
  const [showFlavorPreview, setShowFlavorPreview] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [dayStartMoney, setDayStartMoney] = useState(50);
  const [dayEarnings, setDayEarnings] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');
  const [upgrades, setUpgrades] = useState({
    betterTips: false, // Costs 20 rep, increases tips by 50%
    fasterService: false, // Costs 30 rep, adds 15 seconds to timer
    skillBoost: false // Costs 40 rep, increases tolerance on all dishes
  });
  const [showIntro, setShowIntro] = useState(true);

  // Start new day
  useEffect(() => {
    if (gameState === 'service' && customerQueue.length === 0) {
      // Generate customers for the day (2-3 customers in early game, up to 4 later)
      const numCustomers = Math.min(2 + Math.floor(day / 3), 4);
      const newQueue = [];
      for (let i = 0; i < numCustomers; i++) {
        newQueue.push(generateCustomer(day));
      }
      setCustomerQueue(newQueue);
      
      // Set time limit (only after day 2)
      if (day > 2) {
        // Start at 60 seconds for day 3, decrease by 5 seconds each day (minimum 30s)
        const baseTime = 60 - ((day - 3) * 5);
        const timeLimit = Math.max(30, baseTime + (upgrades.fasterService ? 15 : 0));
        setTimeRemaining(timeLimit);
      } else {
        setTimeRemaining(null); // No time limit for days 1-2
      }
    }
  }, [gameState, day, upgrades.fasterService]);

  // Serve next customer
  useEffect(() => {
    if (gameState === 'service' && !currentCustomer && customerQueue.length > 0) {
      setCurrentCustomer(customerQueue[0]);
      setCustomerQueue(prev => prev.slice(1));
    }
  }, [gameState, currentCustomer, customerQueue]);

  // Timer countdown
  useEffect(() => {
    if (gameState === 'service' && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up!
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameState, timeRemaining]);

  // Buy ingredient
  const buyIngredient = (ingredientKey) => {
    const ingredient = INGREDIENTS[ingredientKey];
    if (money >= ingredient.cost) {
      setMoney(prev => prev - ingredient.cost);
      setInventory(prev => ({
        ...prev,
        [ingredientKey]: (prev[ingredientKey] || 0) + 1
      }));
    }
  };

  // Buy upgrade with reputation
  const buyUpgrade = (upgradeKey, cost) => {
    if (reputation >= cost && !upgrades[upgradeKey]) {
      setReputation(prev => prev - cost);
      setUpgrades(prev => ({ ...prev, [upgradeKey]: true }));
    }
  };

  // Handle time running out
  const handleTimeUp = () => {
    // Auto-fail remaining customers
    const remainingCustomers = [currentCustomer, ...customerQueue].filter(Boolean);
    remainingCustomers.forEach(customer => {
      setDayResults(prev => [...prev, {
        customer: customer.name,
        accuracy: 0,
        earnings: 0,
        repChange: -5,
        feedback: 'Time ran out! No dish served. 😞',
        dishFlavor: null,
        targetFlavor: customer.target
      }]);
      setReputation(prev => Math.max(0, prev - 5));
    });
    
    setCurrentCustomer(null);
    setCustomerQueue([]);
    setSelectedIngredients([]);
  };

  // Calculate minimum earnings needed for the day
  const getMinimumEarnings = (dayNum) => {
    // Day 1: $10, then increases by $5 each day
    return 10 + ((dayNum - 1) * 5);
  };

  // Add ingredient to dish
  const addIngredient = (ingredientKey) => {
    if (inventory[ingredientKey] > 0 && selectedIngredients.length < 5) {
      setSelectedIngredients(prev => [...prev, ingredientKey]);
      setInventory(prev => ({
        ...prev,
        [ingredientKey]: prev[ingredientKey] - 1
      }));
    }
  };

  // Remove ingredient from dish
  const removeIngredient = (index) => {
    const ingredientKey = selectedIngredients[index];
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
    setInventory(prev => ({
      ...prev,
      [ingredientKey]: (prev[ingredientKey] || 0) + 1
    }));
  };

  // Calculate dish flavor with dilution effect
  const calculateDishFlavor = () => {
    if (selectedIngredients.length === 0) {
      return { sour: 0, sweet: 0, bitter: 0, salty: 0, umami: 0, spicy: 0 };
    }
    
    // Sum all raw values
    const rawFlavor = { sour: 0, sweet: 0, bitter: 0, salty: 0, umami: 0, spicy: 0 };
    selectedIngredients.forEach(key => {
      const ing = INGREDIENTS[key];
      rawFlavor.sour += ing.sour;
      rawFlavor.sweet += ing.sweet;
      rawFlavor.bitter += ing.bitter;
      rawFlavor.salty += ing.salty;
      rawFlavor.umami += ing.umami;
      rawFlavor.spicy += ing.spicy;
    });
    
    // Apply MORE DRASTIC dilution - each additional ingredient reduces concentration significantly
    // Formula: divide by (1 + (numIngredients - 1) * 0.35)
    // 1 ingredient = 100% strength
    // 2 ingredients = 74% strength  
    // 3 ingredients = 59% strength
    // 4 ingredients = 49% strength
    // 5 ingredients = 42% strength
    const dilutionFactor = 1 + ((selectedIngredients.length - 1) * 0.35);
    
    const flavor = {
      sour: rawFlavor.sour / dilutionFactor,
      sweet: rawFlavor.sweet / dilutionFactor,
      bitter: rawFlavor.bitter / dilutionFactor,
      salty: rawFlavor.salty / dilutionFactor,
      umami: rawFlavor.umami / dilutionFactor,
      spicy: rawFlavor.spicy / dilutionFactor
    };
    
    return flavor;
  };

  // Calculate accuracy score
  const calculateAccuracy = (dishFlavor, target, tolerance) => {
    // Euclidean distance
    const distance = Math.sqrt(
      Math.pow(dishFlavor.sour - target.sour, 2) +
      Math.pow(dishFlavor.sweet - target.sweet, 2) +
      Math.pow(dishFlavor.bitter - target.bitter, 2) +
      Math.pow(dishFlavor.salty - target.salty, 2) +
      Math.pow(dishFlavor.umami - target.umami, 2) +
      Math.pow(dishFlavor.spicy - target.spicy, 2)
    );
    
    // Normalize (max distance is ~24.5 for 0-10 scale on 6 dimensions)
    const normalizedDistance = distance / 24.5;
    
    // Apply skill boost upgrade (more forgiving)
    const effectiveTolerance = tolerance + (upgrades.skillBoost ? 1.5 : 0);
    
    // Convert to 0-100 score with tolerance modifier
    const baseScore = Math.max(0, 100 - (normalizedDistance * 100));
    const tolerancePenalty = Math.max(0, (normalizedDistance * 100) - (effectiveTolerance * 10));
    const finalScore = Math.max(0, Math.min(100, baseScore - tolerancePenalty));
    
    return Math.round(finalScore);
  };

  // Calculate tip based on base tip, reputation, and upgrades
  const calculateTip = (baseTip, accuracy) => {
    let tip = baseTip;
    
    // Reputation bonus: +1% tip per reputation point
    const repBonus = reputation * 0.01;
    tip = tip * (1 + repBonus);
    
    // Better tips upgrade: +50%
    if (upgrades.betterTips) {
      tip = tip * 1.5;
    }
    
    // Accuracy bonus
    if (accuracy >= 90) {
      tip = tip * 1.3;
    }
    
    return Math.round(tip);
  };

  // Serve dish
  const serveDish = () => {
    if (selectedIngredients.length === 0 || !currentCustomer) return;

    const dishFlavor = calculateDishFlavor();
    
    // Check for allergens FIRST - immediate failure
    if (currentCustomer.allergy) {
      const hasAllergen = selectedIngredients.some(key => 
        INGREDIENTS[key].allergen === currentCustomer.allergy
      );
      
      if (hasAllergen) {
        // ALLERGIC REACTION - severe penalty!
        setMoney(prev => prev + 1); // Barely any money
        setDayEarnings(prev => prev + 1);
        setReputation(prev => Math.max(0, prev - 10)); // BIG reputation hit
        
        setDayResults(prev => [...prev, {
          customer: currentCustomer.name,
          avatar: currentCustomer.avatar,
          accuracy: 0,
          earnings: 1,
          repChange: -10,
          feedback: `🚨 ALLERGIC REACTION! I told you I'm allergic to ${currentCustomer.allergy}! This is unacceptable! 😡`,
          dishFlavor,
          targetFlavor: currentCustomer.target,
          intensity: currentCustomer.intensity,
          allergyIncident: true
        }]);

        setSelectedIngredients([]);
        setCurrentCustomer(null);
        return;
      }
    }
    
    // No allergy issue - proceed with normal accuracy calculation
    const accuracy = calculateAccuracy(dishFlavor, currentCustomer.target, currentCustomer.tolerance);
    
    // Calculate earnings and reputation
    let earnings = 0;
    let repChange = 0;
    let feedback = '';
    
    const calculatedTip = calculateTip(currentCustomer.tip, accuracy);
    
    if (accuracy >= 90) {
      earnings = 15 + calculatedTip;
      repChange = 5;
      feedback = 'Perfection! This is exactly what I wanted! 🌟';
    } else if (accuracy >= 75) {
      earnings = 12 + calculatedTip;
      repChange = 3;
      feedback = 'Delicious! Really enjoyed this. 😊';
    } else if (accuracy >= 60) {
      earnings = 8 + Math.floor(calculatedTip * 0.5);
      repChange = 1;
      feedback = 'Pretty good, but not quite what I expected. 😐';
    } else if (accuracy >= 40) {
      earnings = 5;
      repChange = -2;
      feedback = 'Hmm, this wasn\'t really what I ordered... 😕';
    } else {
      earnings = 2;
      repChange = -5;
      feedback = 'I\'m sorry, but this isn\'t what I asked for. 😞';
    }

    setMoney(prev => prev + earnings);
    setDayEarnings(prev => prev + earnings);
    setReputation(prev => Math.max(0, Math.min(100, prev + repChange)));
    
    setDayResults(prev => [...prev, {
      customer: currentCustomer.name,
      avatar: currentCustomer.avatar,
      accuracy,
      earnings,
      repChange,
      feedback,
      dishFlavor,
      targetFlavor: currentCustomer.target,
      intensity: currentCustomer.intensity
    }]);

    setSelectedIngredients([]);
    setCurrentCustomer(null);
  };

  // End service phase - auto transition when done
  useEffect(() => {
    if (gameState === 'service' && customerQueue.length === 0 && !currentCustomer && dayResults.length > 0) {
      // Small delay for last result to register
      setTimeout(() => {
        setGameState('results');
      }, 500);
    }
  }, [gameState, customerQueue, currentCustomer, dayResults]);

  // Start next day
  const nextDay = () => {
    const minimumEarnings = getMinimumEarnings(day);
    
    // Check if player met minimum earnings
    if (dayEarnings < minimumEarnings) {
      setGameOver(true);
      setGameOverReason(`You needed to earn at least $${minimumEarnings} but only earned $${dayEarnings}. The restaurant couldn't survive!`);
      return;
    }
    
    // Check for WIN condition - Day 15 with 80+ reputation
    if (day >= 15 && reputation >= 80) {
      setGameState('victory');
      return;
    }
    
    // Success - continue to next day
    setDay(prev => prev + 1);
    setDayResults([]);
    setDayStartMoney(money);
    setDayEarnings(0);
    setGameState('market');
  };

  // Restart game
  const restartGame = () => {
    setGameState('market');
    setDay(1);
    setMoney(50);
    setReputation(0);
    setInventory({});
    setCurrentCustomer(null);
    setSelectedIngredients([]);
    setCustomerQueue([]);
    setDayResults([]);
    setTimeRemaining(null);
    setDayStartMoney(50);
    setDayEarnings(0);
    setGameOver(false);
    setGameOverReason('');
    setUpgrades({
      betterTips: false,
      fasterService: false,
      skillBoost: false
    });
    setShowIntro(true);
  };

  // Flavor radar chart component
  const FlavorRadar = ({ flavor, target, size = 120 }) => {
    const dimensions = ['Sour', 'Sweet', 'Bitter', 'Salty', 'Umami', 'Spicy'];
    const values = [flavor.sour, flavor.sweet, flavor.bitter, flavor.salty, flavor.umami, flavor.spicy];
    const targetValues = target ? [target.sour, target.sweet, target.bitter, target.salty, target.umami, target.spicy] : null;
    
    const angleStep = (Math.PI * 2) / 6;
    const center = size / 2;
    const radius = size / 2 - 20;
    
    // Create polygon path
    const createPath = (vals) => {
      return vals.map((val, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (val / 10) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ') + ' Z';
    };

    return (
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Grid circles */}
        {[2, 4, 6, 8, 10].map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 10) * radius}
            fill="none"
            stroke="rgba(139, 69, 19, 0.1)"
            strokeWidth="1"
          />
        ))}
        
        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(139, 69, 19, 0.2)"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Target flavor (if provided) */}
        {targetValues && (
          <path
            d={createPath(targetValues)}
            fill="rgba(255, 140, 0, 0.2)"
            stroke="#ff8c00"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
        )}
        
        {/* Current flavor */}
        <path
          d={createPath(values)}
          fill="rgba(34, 139, 34, 0.3)"
          stroke="#228b22"
          strokeWidth="2"
        />
        
        {/* Labels */}
        {dimensions.map((label, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + (radius + 15) * Math.cos(angle);
          const y = center + (radius + 15) * Math.sin(angle);
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="#5c4033"
              fontWeight="600"
            >
              {label}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5c4 100%)',
      fontFamily: '"Quicksand", "Nunito", sans-serif',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
      
      {/* Main content container with max width for desktop */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
      
      {/* Background decorations */}
      <div style={{
        position: 'fixed',
        top: '-100px',
        right: '-100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255,140,0,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-150px',
        left: '-150px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(34,139,34,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
          padding: '25px 35px',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(139, 69, 19, 0.3)',
          marginBottom: '30px',
          border: '3px solid #5c4033',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
          pointerEvents: 'none'
        }} />
        <h1 style={{
          margin: 0,
          fontSize: '42px',
          color: '#fff',
          textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
          fontFamily: '"Pacifico", cursive',
          letterSpacing: '2px',
          position: 'relative'
        }}>
          🍜 Umami Lab 🍜
        </h1>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '15px',
          gap: '20px',
          position: 'relative'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '12px 24px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '14px', color: '#ffe4b5', fontWeight: '600' }}>Day</div>
            <div style={{ fontSize: '28px', color: '#fff', fontWeight: 'bold' }}>{day}</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '12px 24px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '14px', color: '#ffe4b5', fontWeight: '600' }}>Money</div>
            <div style={{ fontSize: '28px', color: '#ffd700', fontWeight: 'bold' }}>${money}</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '12px 24px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '14px', color: '#ffe4b5', fontWeight: '600' }}>Reputation</div>
            <div style={{ fontSize: '28px', color: '#90ee90', fontWeight: 'bold' }}>{reputation}/100</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '12px 24px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '14px', color: '#ffe4b5', fontWeight: '600' }}>⭐ Mission</div>
            <div style={{ fontSize: '18px', color: '#ffd700', fontWeight: 'bold' }}>
              Day {day}/15
            </div>
            <div style={{ fontSize: '12px', color: '#ffe4b5', marginTop: '2px' }}>
              {reputation >= 80 ? '✓' : `${reputation}/80`} Rep
            </div>
          </div>
          {gameState === 'service' && timeRemaining !== null && (
            <div style={{
              background: timeRemaining < 30 ? 'rgba(255,99,71,0.3)' : 'rgba(255,255,255,0.2)',
              padding: '12px 24px',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: `2px solid ${timeRemaining < 30 ? 'rgba(255,99,71,0.5)' : 'rgba(255,255,255,0.3)'}`,
              animation: timeRemaining < 10 ? 'pulse 1s infinite' : 'none'
            }}>
              <div style={{ fontSize: '14px', color: '#ffe4b5', fontWeight: '600' }}>⏰ Time</div>
              <div style={{ 
                fontSize: '28px', 
                color: timeRemaining < 30 ? '#ff6347' : '#fff', 
                fontWeight: 'bold' 
              }}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Intro Story Modal */}
      {showIntro && gameState === 'market' && day === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'linear-gradient(135deg, #fff8dc 0%, #fffacd 100%)',
              padding: '30px',
              borderRadius: '25px',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '4px solid #daa520',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              margin: 'auto'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '60px', marginBottom: '10px' }}>🌟</div>
              <h2 style={{
                margin: 0,
                fontSize: '32px',
                color: '#8b4513',
                fontFamily: '"Fredoka One", cursive',
                marginBottom: '10px'
              }}>
                Welcome to Umami Lab!
              </h2>
            </div>

            <div style={{
              background: 'rgba(139, 69, 19, 0.1)',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '20px',
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#5c4033'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                You've just opened a vegan restaurant with one dream: <strong>earn a Michelin star</strong>. 
              </p>
              <p style={{ margin: '0' }}>
                The inspectors visit on <strong>Day 15</strong>. Build your reputation to <strong>80+</strong> by mastering flavor balancing and satisfying demanding customers.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
              padding: '18px',
              borderRadius: '15px',
              marginBottom: '20px',
              border: '3px solid #ff6347'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                color: '#fff',
                fontSize: '20px',
                fontFamily: '"Fredoka One", cursive',
                textAlign: 'center'
              }}>
                🎯 Your Mission
              </h3>
              <ul style={{
                margin: 0,
                padding: '0 0 0 20px',
                color: '#fff',
                fontSize: '14px',
                lineHeight: '1.8'
              }}>
                <li><strong>Survive to Day 15</strong> - Meet daily earnings targets</li>
                <li><strong>Reach 80+ Reputation</strong> - Precision flavor matching</li>
                <li><strong>Master the mechanics</strong> - Balance ingredients & time</li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowIntro(false)}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '22px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #228b22 0%, #32cd32 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(34, 139, 34, 0.4)',
                fontFamily: '"Fredoka One", cursive'
              }}
            >
              🍽️ Start Your Journey!
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Market Phase */}
      {gameState === 'market' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #fff8dc 0%, #fffacd 100%)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '3px solid #daa520',
            position: 'relative'
          }}
        >
          {/* Day info banner */}
          <div style={{
            background: day <= 2 ? 'linear-gradient(135deg, #87ceeb 0%, #4682b4 100%)' : 'linear-gradient(135deg, #ff8c00 0%, #ff6347 100%)',
            padding: '15px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '2px solid rgba(255,255,255,0.3)',
            textAlign: 'center'
          }}>
            {day <= 2 ? (
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                📚 Learning Phase - No time limit! Take your time to learn the game.
              </div>
            ) : (
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                ⚡ Day {day} Challenge - Time Limit: {Math.max(30, 60 - ((day - 3) * 5) + (upgrades.fasterService ? 15 : 0))} seconds | 
                Minimum Earnings: ${getMinimumEarnings(day)}
              </div>
            )}
          </div>
          
          <h2 style={{
            margin: '0 0 25px 0',
            fontSize: '32px',
            color: '#8b4513',
            fontFamily: '"Fredoka One", cursive',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            🛒 Ingredient Market
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '15px',
            marginBottom: '25px'
          }}>
            {Object.entries(INGREDIENTS).map(([key, ing]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => buyIngredient(key)}
                style={{
                  background: money >= ing.cost ? 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)' : 'linear-gradient(135deg, #ddd 0%, #ccc 100%)',
                  padding: '15px',
                  borderRadius: '15px',
                  cursor: money >= ing.cost ? 'pointer' : 'not-allowed',
                  border: '2px solid #8b4513',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  opacity: money >= ing.cost ? 1 : 0.5,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '40px', textAlign: 'center', marginBottom: '8px' }}>{ing.emoji}</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#5c4033', textAlign: 'center', marginBottom: '5px' }}>
                  {ing.name}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#228b22', textAlign: 'center' }}>
                  ${ing.cost}
                </div>
                {inventory[key] > 0 && (
                  <div style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    background: '#90ee90',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#2d5016'
                  }}>
                    Owned: {inventory[key]}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div style={{
            background: 'rgba(139, 69, 19, 0.1)',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#8b4513', fontSize: '20px' }}>📦 Your Inventory</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(inventory).filter(([_, count]) => count > 0).map(([key, count]) => (
                <div key={key} style={{
                  background: '#fff',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  border: '2px solid #8b4513',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#5c4033'
                }}>
                  {INGREDIENTS[key].emoji} {INGREDIENTS[key].name} x{count}
                </div>
              ))}
              {Object.values(inventory).every(count => count === 0) && (
                <div style={{ color: '#999', fontStyle: 'italic' }}>No ingredients yet. Buy some above!</div>
              )}
            </div>
          </div>

          {/* Upgrades Shop */}
          <div style={{
            background: 'linear-gradient(135deg, #e6e6fa 0%, #d8bfd8 100%)',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px',
            border: '3px solid #9370db'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#4b0082', fontSize: '20px' }}>⭐ Upgrades (Buy with Reputation)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <motion.div
                whileHover={{ scale: upgrades.betterTips ? 1 : 1.05 }}
                onClick={() => buyUpgrade('betterTips', 20)}
                style={{
                  background: upgrades.betterTips ? '#d3d3d3' : (reputation >= 20 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' : '#f0f0f0'),
                  padding: '15px',
                  borderRadius: '12px',
                  cursor: upgrades.betterTips ? 'not-allowed' : (reputation >= 20 ? 'pointer' : 'not-allowed'),
                  border: '2px solid #daa520',
                  opacity: upgrades.betterTips ? 0.6 : (reputation >= 20 ? 1 : 0.5)
                }}
              >
                <div style={{ fontSize: '30px', textAlign: 'center', marginBottom: '8px' }}>💰</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#5c4033', textAlign: 'center', marginBottom: '5px' }}>
                  {upgrades.betterTips ? '✓ Purchased' : 'Better Tips'}
                </div>
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '8px' }}>
                  +50% tip earnings
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9370db', textAlign: 'center' }}>
                  {upgrades.betterTips ? 'Owned' : '20 Rep'}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: upgrades.fasterService ? 1 : 1.05 }}
                onClick={() => buyUpgrade('fasterService', 30)}
                style={{
                  background: upgrades.fasterService ? '#d3d3d3' : (reputation >= 30 ? 'linear-gradient(135deg, #87ceeb 0%, #4682b4 100%)' : '#f0f0f0'),
                  padding: '15px',
                  borderRadius: '12px',
                  cursor: upgrades.fasterService ? 'not-allowed' : (reputation >= 30 ? 'pointer' : 'not-allowed'),
                  border: '2px solid #4682b4',
                  opacity: upgrades.fasterService ? 0.6 : (reputation >= 30 ? 1 : 0.5)
                }}
              >
                <div style={{ fontSize: '30px', textAlign: 'center', marginBottom: '8px' }}>⏱️</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#5c4033', textAlign: 'center', marginBottom: '5px' }}>
                  {upgrades.fasterService ? '✓ Purchased' : 'More Time'}
                </div>
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '8px' }}>
                  +15 seconds per day
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9370db', textAlign: 'center' }}>
                  {upgrades.fasterService ? 'Owned' : '30 Rep'}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: upgrades.skillBoost ? 1 : 1.05 }}
                onClick={() => buyUpgrade('skillBoost', 40)}
                style={{
                  background: upgrades.skillBoost ? '#d3d3d3' : (reputation >= 40 ? 'linear-gradient(135deg, #90ee90 0%, #7cdb7c 100%)' : '#f0f0f0'),
                  padding: '15px',
                  borderRadius: '12px',
                  cursor: upgrades.skillBoost ? 'not-allowed' : (reputation >= 40 ? 'pointer' : 'not-allowed'),
                  border: '2px solid #228b22',
                  opacity: upgrades.skillBoost ? 0.6 : (reputation >= 40 ? 1 : 0.5)
                }}
              >
                <div style={{ fontSize: '30px', textAlign: 'center', marginBottom: '8px' }}>🎯</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#5c4033', textAlign: 'center', marginBottom: '5px' }}>
                  {upgrades.skillBoost ? '✓ Purchased' : 'Skill Boost'}
                </div>
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '8px' }}>
                  Customers more forgiving
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9370db', textAlign: 'center' }}>
                  {upgrades.skillBoost ? 'Owned' : '40 Rep'}
                </div>
              </motion.div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGameState('service')}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #228b22 0%, #32cd32 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(34, 139, 34, 0.4)',
              fontFamily: '"Fredoka One", cursive',
              letterSpacing: '1px'
            }}
          >
            🍽️ Start Service!
          </motion.button>
        </motion.div>
      )}

      {/* Service Phase */}
      {gameState === 'service' && (
        <div>
          {/* Large Timer Display */}
          {timeRemaining !== null && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: timeRemaining < 15 ? 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)' : timeRemaining < 30 ? 'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)' : 'linear-gradient(135deg, #4682b4 0%, #5a9fd4 100%)',
                padding: '20px 40px',
                borderRadius: '20px',
                marginBottom: '20px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                border: '4px solid rgba(255,255,255,0.3)',
                animation: timeRemaining < 10 ? 'pulse 1s infinite' : 'none'
              }}
            >
              <div style={{ fontSize: '18px', color: '#fff', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>
                {timeRemaining < 15 ? '⚠️ HURRY! ⚠️' : 'Time Remaining'}
              </div>
              <div style={{ fontSize: '56px', color: '#fff', fontWeight: 'bold', fontFamily: '"Fredoka One", cursive', textShadow: '3px 3px 6px rgba(0,0,0,0.3)' }}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
              {customerQueue.length > 0 && (
                <div style={{ fontSize: '14px', color: '#fff', marginTop: '8px', opacity: 0.9 }}>
                  {customerQueue.length + (currentCustomer ? 1 : 0)} customer{customerQueue.length + (currentCustomer ? 1 : 0) !== 1 ? 's' : ''} remaining
                </div>
              )}
            </motion.div>
          )}
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Customer Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              flex: '0 0 380px',
              background: 'linear-gradient(135deg, #ffe4e1 0%, #ffd7d7 100%)',
              padding: '25px',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '3px solid #ff6b6b',
              minHeight: '500px'
            }}
          >
            {currentCustomer ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '80px', marginBottom: '10px' }}>{currentCustomer.avatar}</div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '26px',
                    color: '#8b4513',
                    fontFamily: '"Fredoka One", cursive'
                  }}>
                    {currentCustomer.name}
                  </h3>
                  <div style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: currentCustomer.intensity > 0.6 ? 'linear-gradient(135deg, #ff6347 0%, #ff4500 100%)' : 'linear-gradient(135deg, #90ee90 0%, #7cdb7c 100%)',
                    borderRadius: '8px',
                    display: 'inline-block',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {currentCustomer.intensity > 0.6 ? '🔥 Bold Flavors' : '🌱 Mild Flavors'}
                  </div>
                  <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#5c4033',
                    fontStyle: 'italic'
                  }}>
                    "I'd like something with these flavors..."
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.6)',
                  padding: '20px',
                  borderRadius: '15px',
                  marginBottom: '15px'
                }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#8b4513', textAlign: 'center' }}>Target Flavor Profile</h4>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <FlavorRadar flavor={currentCustomer.target} target={null} size={200} />
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  fontSize: '14px',
                  color: '#5c4033'
                }}>
                  <div style={{ background: 'rgba(255,255,255,0.6)', padding: '10px', borderRadius: '8px' }}>
                    <strong>Tolerance:</strong> {currentCustomer.tolerance < 2.5 ? 'Very Low' : currentCustomer.tolerance < 3 ? 'Low' : currentCustomer.tolerance < 3.5 ? 'Medium' : 'High'}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.6)', padding: '10px', borderRadius: '8px' }}>
                    <strong>Base Tip:</strong> ${currentCustomer.tip}
                  </div>
                </div>

                {/* Allergy Warning */}
                {currentCustomer.allergy && (
                  <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
                    borderRadius: '12px',
                    border: '3px solid #ff0000',
                    animation: 'pulse 2s infinite'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#fff',
                      textAlign: 'center',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      🚨 ALLERGY WARNING 🚨
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#fff',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      NO {currentCustomer.allergy.toUpperCase()}!
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.9)',
                      textAlign: 'center',
                      marginTop: '8px',
                      fontStyle: 'italic'
                    }}>
                      Using allergenic ingredients = -10 reputation!
                    </div>
                  </div>
                )}

                {customerQueue.length > 0 && (
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    background: 'rgba(255,200,100,0.3)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#8b4513'
                  }}>
                    👥 {customerQueue.length} customer{customerQueue.length !== 1 ? 's' : ''} waiting...
                  </div>
                )}
              </>
            ) : customerQueue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>✨</div>
                <h3 style={{ color: '#8b4513', marginBottom: '15px' }}>All customers served!</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGameState('results')}
                  style={{
                    padding: '15px 30px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255, 140, 0, 0.4)',
                    fontFamily: '"Fredoka One", cursive'
                  }}
                >
                  See Results
                </motion.button>
              </div>
            ) : null}
          </motion.div>

          {/* Cooking Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              flex: '1 1 600px',
              background: 'linear-gradient(135deg, #e6f3ff 0%, #cce5ff 100%)',
              padding: '25px',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '3px solid #4682b4'
            }}
          >
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '26px',
              color: '#8b4513',
              fontFamily: '"Fredoka One", cursive'
            }}>
              👨‍🍳 Compose Your Dish
            </h3>

            {/* Available ingredients */}
            <div style={{
              background: 'rgba(255,255,255,0.6)',
              padding: '15px',
              borderRadius: '15px',
              marginBottom: '20px',
              maxHeight: '180px',
              overflowY: 'auto'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#5c4033', fontSize: '16px' }}>Available Ingredients</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(inventory).filter(([_, count]) => count > 0).map(([key, count]) => {
                  const isAllergenic = currentCustomer && currentCustomer.allergy && INGREDIENTS[key].allergen === currentCustomer.allergy;
                  
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addIngredient(key)}
                      disabled={selectedIngredients.length >= 5}
                      style={{
                        padding: '8px 14px',
                        background: isAllergenic 
                          ? 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)' 
                          : (selectedIngredients.length < 5 ? 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)' : '#ddd'),
                        border: isAllergenic ? '3px solid #ff0000' : '2px solid #8b4513',
                        borderRadius: '10px',
                        cursor: selectedIngredients.length < 5 ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: isAllergenic ? '#fff' : '#5c4033',
                        opacity: selectedIngredients.length < 5 ? 1 : 0.5,
                        position: 'relative'
                      }}
                    >
                      {INGREDIENTS[key].emoji} {INGREDIENTS[key].name} ({count})
                      {isAllergenic && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          fontSize: '18px'
                        }}>
                          🚫
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Current dish */}
            <div style={{
              background: 'rgba(255,255,255,0.8)',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '20px',
              border: '3px dashed #8b4513',
              minHeight: '120px'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#5c4033', fontSize: '18px' }}>
                🍽️ Current Dish ({selectedIngredients.length}/5)
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                {selectedIngredients.map((key, index) => (
                  <motion.div
                    key={`${key}-${index}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      padding: '10px 15px',
                      background: 'linear-gradient(135deg, #90ee90 0%, #7cdb7c 100%)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: '2px solid #228b22',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2d5016',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => removeIngredient(index)}
                  >
                    {INGREDIENTS[key].emoji} {INGREDIENTS[key].name}
                    <span style={{ color: '#ff0000', fontSize: '16px' }}>×</span>
                  </motion.div>
                ))}
              </div>
              {selectedIngredients.length === 0 && (
                <div style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                  Click ingredients above to add them to your dish
                </div>
              )}
            </div>

            {/* Flavor preview */}
            {selectedIngredients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  padding: '20px',
                  borderRadius: '15px',
                  marginBottom: '20px'
                }}
              >
                <h4 style={{ margin: '0 0 15px 0', color: '#5c4033', textAlign: 'center' }}>
                  Dish Flavor Profile
                </h4>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <FlavorRadar
                    flavor={calculateDishFlavor()}
                    target={currentCustomer ? currentCustomer.target : null}
                    size={180}
                  />
                </div>
                {currentCustomer && (
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    background: 'rgba(255,200,100,0.3)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#8b4513'
                  }}>
                    Solid line = your dish | Dashed line = target
                  </div>
                )}
              </motion.div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={serveDish}
                disabled={selectedIngredients.length === 0 || !currentCustomer}
                style={{
                  flex: 1,
                  padding: '15px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  background: selectedIngredients.length > 0 && currentCustomer ? 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: selectedIngredients.length > 0 && currentCustomer ? 'pointer' : 'not-allowed',
                  boxShadow: selectedIngredients.length > 0 && currentCustomer ? '0 4px 15px rgba(255, 140, 0, 0.4)' : 'none',
                  fontFamily: '"Fredoka One", cursive'
                }}
              >
                🍽️ Serve!
              </motion.button>
            </div>
          </motion.div>
        </div>
        </div>
      )}

      {/* Results Phase */}
      {gameState === 'results' && !gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '3px solid #ff8c00'
          }}
        >
          <h2 style={{
            margin: '0 0 25px 0',
            fontSize: '32px',
            color: '#8b4513',
            fontFamily: '"Fredoka One", cursive',
            textAlign: 'center'
          }}>
            📊 Day {day} Summary
          </h2>

          {/* Day Overview */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: dayEarnings >= getMinimumEarnings(day) 
                ? 'linear-gradient(135deg, #90ee90 0%, #7cdb7c 100%)' 
                : 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
              padding: '25px',
              borderRadius: '15px',
              marginBottom: '25px',
              border: '3px solid #fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '60px', marginBottom: '10px' }}>
                {dayEarnings >= getMinimumEarnings(day) ? '🎉' : '😰'}
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '28px',
                color: '#fff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                marginBottom: '10px'
              }}>
                {dayEarnings >= getMinimumEarnings(day) ? 'Great Job!' : 'Warning: Below Target!'}
              </h3>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.9)',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Started With</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b4513' }}>${dayStartMoney}</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.9)',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Day Earnings</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: dayEarnings >= getMinimumEarnings(day) ? '#228b22' : '#ff0000' }}>
                  ${dayEarnings}
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.9)',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Ending With</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff8c00' }}>${money}</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.9)',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center',
                border: dayEarnings >= getMinimumEarnings(day) ? '3px solid #228b22' : '3px solid #ff0000'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Required</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: dayEarnings >= getMinimumEarnings(day) ? '#228b22' : '#ff0000' }}>
                  ${getMinimumEarnings(day)}
                </div>
              </div>
            </div>
            
            {dayEarnings < getMinimumEarnings(day) && (
              <div style={{
                marginTop: '15px',
                padding: '12px',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '10px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#ff0000',
                fontWeight: '600'
              }}>
                ⚠️ You didn't meet the minimum! Next time you fall short, it's Game Over!
              </div>
            )}
          </motion.div>

          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '22px',
            color: '#8b4513',
            fontFamily: '"Fredoka One", cursive'
          }}>
            Customer Reviews
          </h3>

          {dayResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                background: result.allergyIncident ? 'linear-gradient(135deg, #ffe6e6 0%, #ffcccc 100%)' : '#fff',
                padding: '20px',
                borderRadius: '15px',
                marginBottom: '15px',
                border: result.allergyIncident ? '3px solid #ff0000' : '2px solid #daa520',
                boxShadow: result.allergyIncident ? '0 4px 20px rgba(255,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '40px' }}>{result.avatar}</div>
                  <div>
                    <h3 style={{ margin: 0, color: '#8b4513', fontSize: '20px' }}>{result.customer}</h3>
                    <div style={{
                      fontSize: '11px',
                      color: '#666',
                      marginTop: '4px',
                      padding: '3px 8px',
                      background: result.intensity > 0.6 ? '#ffe4e1' : '#e6ffe6',
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      {result.intensity > 0.6 ? '🔥 Bold' : '🌱 Mild'}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: result.allergyIncident ? '#ff0000' : (result.accuracy >= 75 ? '#90ee90' : result.accuracy >= 60 ? '#ffd700' : '#ff6b6b'),
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: '#fff'
                }}>
                  {result.allergyIncident ? '🚨 ALLERGY!' : `${result.accuracy}%`}
                </div>
              </div>

              <div style={{
                padding: '15px',
                background: result.allergyIncident ? 'rgba(255,0,0,0.1)' : 'rgba(139, 69, 19, 0.05)',
                borderRadius: '10px',
                marginBottom: '15px',
                fontStyle: 'italic',
                color: result.allergyIncident ? '#cc0000' : '#5c4033',
                fontSize: '15px',
                fontWeight: result.allergyIncident ? '600' : 'normal'
              }}>
                "{result.feedback}"
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '10px', background: '#e6ffe6', borderRadius: '8px' }}>
                  <strong>Earnings:</strong> ${result.earnings}
                </div>
                <div style={{
                  padding: '10px',
                  background: result.repChange > 0 ? '#e6ffe6' : '#ffe6e6',
                  borderRadius: '8px'
                }}>
                  <strong>Reputation:</strong> {result.repChange > 0 ? '+' : ''}{result.repChange}
                </div>
              </div>
            </motion.div>
          ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextDay}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #228b22 0%, #32cd32 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(34, 139, 34, 0.4)',
              fontFamily: '"Fredoka One", cursive',
              marginTop: '20px'
            }}
          >
            🌅 Next Day
          </motion.button>
        </motion.div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
            border: '4px solid #ff0000',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>💔</div>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '38px',
            color: '#ff6b6b',
            fontFamily: '"Fredoka One", cursive',
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)'
          }}>
            Game Over
          </h2>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '25px',
            color: '#fff',
            fontSize: '18px',
            lineHeight: '1.6'
          }}>
            {gameOverReason}
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '25px'
          }}>
            <h3 style={{ color: '#ffa500', margin: '0 0 15px 0', fontSize: '22px' }}>Final Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Days Survived</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{day}</div>
              </div>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Final Money</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>${money}</div>
              </div>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Final Reputation</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{reputation}</div>
              </div>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Goal Progress</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{Math.round((day/15 + reputation/80) * 50)}%</div>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={restartGame}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(255, 140, 0, 0.4)',
              fontFamily: '"Fredoka One", cursive'
            }}
          >
            🔄 Try Again
          </motion.button>
        </motion.div>
      )}

      {/* Victory Screen */}
      {gameState === 'victory' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
            padding: '50px',
            borderRadius: '25px',
            boxShadow: '0 20px 80px rgba(255, 215, 0, 0.6)',
            border: '5px solid #ff8c00',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto'
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
            style={{ fontSize: '120px', marginBottom: '20px' }}
          >
            ⭐
          </motion.div>
          
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              margin: '0 0 15px 0',
              fontSize: '48px',
              color: '#8b4513',
              fontFamily: '"Fredoka One", cursive',
              textShadow: '3px 3px 6px rgba(0,0,0,0.2)'
            }}
          >
            Michelin Star Earned!
          </motion.h2>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              fontSize: '22px',
              color: '#5c4033',
              marginBottom: '30px',
              fontWeight: '600'
            }}
          >
            🎉 Congratulations, Chef! 🎉
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              background: 'rgba(139, 69, 19, 0.15)',
              padding: '30px',
              borderRadius: '20px',
              marginBottom: '30px',
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#5c4033'
            }}
          >
            <p style={{ margin: '0 0 20px 0' }}>
              After <strong>15 days</strong> of culinary mastery, the Michelin inspectors arrived at Umami Lab.
            </p>
            <p style={{ margin: '0 0 20px 0' }}>
              They were blown away by your innovative vegan cuisine and precise flavor balancing. Your reputation of <strong>{reputation}</strong> speaks for itself.
            </p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#8b4513' }}>
              Umami Lab is now a Michelin-starred restaurant! 🌟
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              background: 'rgba(255,255,255,0.4)',
              padding: '25px',
              borderRadius: '15px',
              marginBottom: '30px'
            }}
          >
            <h3 style={{ color: '#8b4513', margin: '0 0 20px 0', fontSize: '24px' }}>Final Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Money</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#228b22' }}>${money}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Final Reputation</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff8c00' }}>{reputation}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Days</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4682b4' }}>{day}</div>
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={restartGame}
            style={{
              width: '100%',
              padding: '20px',
              fontSize: '26px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(139, 69, 19, 0.4)',
              fontFamily: '"Fredoka One", cursive'
            }}
          >
            🔄 Play Again
          </motion.button>
        </motion.div>
      )}
      </div>
    </div>
  );
}

export default UmamiLab;
