// tests/demoThreeSets.js
// Demonstration of three-set question generation

const UPSCQuestionGenerator = require('../utils/upscQuestionGenerator');

console.log('Demonstration of Three-Set Question Generation\n');
console.log('=' .repeat(50));

const result = UPSCQuestionGenerator.generateThreeQuestionSets({
    difficulty: 'Medium',
    topics: ['Indian Polity', 'Geography', 'History'],
    count: 3
});

console.log('Generated three separate question sets:\n');

// Display Set A
console.log('SET A:');
result.setA.forEach((q, index) => {
    console.log(`${index + 1}. [Format ${q.format}] ${q.question.split('\n')[0].substring(0, 60)}...`);
    console.log('   Options:');
    q.options.forEach((option, i) => {
        console.log(`     ${String.fromCharCode(97 + i)}) ${option}`);
    });
    console.log(`   Correct Answer: ${q.correctAnswer}\n`);
});

// Display Set B
console.log('SET B:');
result.setB.forEach((q, index) => {
    console.log(`${index + 1}. [Format ${q.format}] ${q.question.split('\n')[0].substring(0, 60)}...`);
    console.log('   Options:');
    q.options.forEach((option, i) => {
        console.log(`     ${String.fromCharCode(97 + i)}) ${option}`);
    });
    console.log(`   Correct Answer: ${q.correctAnswer}\n`);
});

// Display Set C
console.log('SET C:');
result.setC.forEach((q, index) => {
    console.log(`${index + 1}. [Format ${q.format}] ${q.question.split('\n')[0].substring(0, 60)}...`);
    console.log('   Options:');
    q.options.forEach((option, i) => {
        console.log(`     ${String.fromCharCode(97 + i)}) ${option}`);
    });
    console.log(`   Correct Answer: ${q.correctAnswer}\n`);
});

// Verification
console.log('VERIFICATION:');
console.log('============');

// Check for uniqueness between sets
const setAQuestions = new Set(result.setA.map(q => q.question));
const setBQuestions = new Set(result.setB.map(q => q.question));
const setCQuestions = new Set(result.setC.map(q => q.question));

const overlapAB = [...setAQuestions].filter(q => setBQuestions.has(q));
const overlapAC = [...setAQuestions].filter(q => setCQuestions.has(q));
const overlapBC = [...setBQuestions].filter(q => setCQuestions.has(q));

console.log(`Overlapping questions between Set A and Set B: ${overlapAB.length}`);
console.log(`Overlapping questions between Set A and Set C: ${overlapAC.length}`);
console.log(`Overlapping questions between Set B and Set C: ${overlapBC.length}`);

if (overlapAB.length === 0 && overlapAC.length === 0 && overlapBC.length === 0) {
    console.log('✅ SUCCESS: All sets are completely unique!');
} else {
    console.log('❌ FAILURE: Some questions are repeated between sets');
}

// Check answer distribution
console.log('\nAnswer Position Distribution:');
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
    
    console.log(`${setName}: A=${positionCounts.A}, B=${positionCounts.B}, C=${positionCounts.C}, D=${positionCounts.D}`);
});

// Check format distribution
console.log('\nFormat Distribution:');
['setA', 'setB', 'setC'].forEach(setName => {
    const set = result[setName];
    const formatCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    
    set.forEach(q => {
        if (q.format in formatCounts) {
            formatCounts[q.format]++;
        }
    });
    
    console.log(`${setName}: A=${formatCounts.A}, B=${formatCounts.B}, C=${formatCounts.C}, D=${formatCounts.D}, E=${formatCounts.E}`);
});

console.log('\nDemonstration completed successfully!');