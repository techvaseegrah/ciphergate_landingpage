// tests/testThreeSets.js
// Test script for generating three separate question sets

const UPSCQuestionGenerator = require('../utils/upscQuestionGenerator');

console.log('Testing Generation of Three Separate Question Sets\n');
console.log('=' .repeat(50));

const result = UPSCQuestionGenerator.generateThreeQuestionSets({
    difficulty: 'Medium',
    topics: ['Indian Polity', 'Geography', 'History'],
    count: 5
});

console.log('Set A:');
result.setA.forEach((q, index) => {
    console.log(`  ${index + 1}. [${q.format}] ${q.question.substring(0, 50)}...`);
    console.log(`     Correct Answer: ${q.correctAnswer}`);
});

console.log('\nSet B:');
result.setB.forEach((q, index) => {
    console.log(`  ${index + 1}. [${q.format}] ${q.question.substring(0, 50)}...`);
    console.log(`     Correct Answer: ${q.correctAnswer}`);
});

console.log('\nSet C:');
result.setC.forEach((q, index) => {
    console.log(`  ${index + 1}. [${q.format}] ${q.question.substring(0, 50)}...`);
    console.log(`     Correct Answer: ${q.correctAnswer}`);
});

// Check for uniqueness between sets
console.log('\nUniqueness Check:');
const setAQuestions = new Set(result.setA.map(q => q.question));
const setBQuestions = new Set(result.setB.map(q => q.question));
const setCQuestions = new Set(result.setC.map(q => q.question));

const overlapAB = [...setAQuestions].filter(q => setBQuestions.has(q));
const overlapAC = [...setAQuestions].filter(q => setCQuestions.has(q));
const overlapBC = [...setBQuestions].filter(q => setCQuestions.has(q));

console.log(`  Overlapping questions between Set A and Set B: ${overlapAB.length}`);
console.log(`  Overlapping questions between Set A and Set C: ${overlapAC.length}`);
console.log(`  Overlapping questions between Set B and Set C: ${overlapBC.length}`);

if (overlapAB.length === 0 && overlapAC.length === 0 && overlapBC.length === 0) {
    console.log('  ✅ All sets are unique!');
} else {
    console.log('  ❌ Some questions are repeated between sets');
}

// Check answer distribution
console.log('\nAnswer Distribution Check:');
['setA', 'setB', 'setC'].forEach(setName => {
    const set = result[setName];
    const positionCounts = { A: 0, B: 0, C: 0, D: 0 };
    
    set.forEach(q => {
        const correctIndex = q.options.indexOf(q.correctAnswer);
        if (correctIndex >= 0 && correctIndex < 4) {
            const position = String.fromCharCode(65 + correctIndex);
            positionCounts[position]++;
        }
    });
    
    console.log(`  ${setName}: A=${positionCounts.A}, B=${positionCounts.B}, C=${positionCounts.C}, D=${positionCounts.D}`);
});