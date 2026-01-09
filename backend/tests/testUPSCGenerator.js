// tests/testUPSCGenerator.js
// Test script for the enhanced UPSC Question Generator

const UPSCQuestionGenerator = require('../utils/upscQuestionGenerator');

console.log('Testing Enhanced UPSC Question Generator with Multiple Formats\n');

// Test parameters
const testParams = {
    difficulty: 'Medium',
    topics: ['Indian Polity', 'Geography', 'History', 'Economy', 'Science'],
    count: 20
};

console.log('Generation Parameters:');
console.log('- Difficulty:', testParams.difficulty);
console.log('- Topics:', testParams.topics.join(', '));
console.log('- Number of Questions:', testParams.count);
console.log('\n' + '='.repeat(60) + '\n');

// Generate questions
const questions = UPSCQuestionGenerator.generateQuestions(testParams);

// Display results
questions.forEach((q, index) => {
    console.log(`Question ${index + 1} (Format ${q.format}):`);
    console.log(q.question.substring(0, 100) + (q.question.length > 100 ? "..." : ""));
    console.log('Options:');
    q.options.forEach((option, i) => {
        console.log(`  ${String.fromCharCode(97 + i)}) ${option}`);
    });
    console.log(`Correct Answer: ${q.correctAnswer}`);
    console.log('-'.repeat(40) + '\n');
});

console.log('Total Questions Generated:', questions.length);

// Verify format diversity
const formatCounts = {};
questions.forEach(q => {
    formatCounts[q.format] = (formatCounts[q.format] || 0) + 1;
});

console.log('\nFormat Distribution:');
Object.keys(formatCounts).sort().forEach(format => {
    console.log(`  Format ${format}: ${formatCounts[format]} questions`);
});

// Verify answer position distribution
const answerPositionCounts = { A: 0, B: 0, C: 0, D: 0 };
questions.forEach(q => {
    const correctIndex = q.options.indexOf(q.correctAnswer);
    if (correctIndex >= 0 && correctIndex < 4) {
        const position = String.fromCharCode(65 + correctIndex); // Convert 0-3 to A-D
        answerPositionCounts[position] = (answerPositionCounts[position] || 0) + 1;
    }
});

console.log('\nAnswer Position Distribution:');
Object.keys(answerPositionCounts).forEach(position => {
    console.log(`  Option ${position}: ${answerPositionCounts[position]} questions`);
});

// Check if distribution is reasonably even
const totalAnswers = Object.values(answerPositionCounts).reduce((sum, count) => sum + count, 0);
console.log('\nDistribution Analysis:');
if (totalAnswers > 0) {
    Object.keys(answerPositionCounts).forEach(position => {
        const percentage = ((answerPositionCounts[position] / totalAnswers) * 100).toFixed(1);
        console.log(`  Option ${position}: ${percentage}%`);
    });
    
    // Calculate standard deviation to measure evenness
    const mean = totalAnswers / 4;
    let sumSquareDiffs = 0;
    Object.values(answerPositionCounts).forEach(count => {
        sumSquareDiffs += Math.pow(count - mean, 2);
    });
    const stdDev = Math.sqrt(sumSquareDiffs / 4);
    const cv = (stdDev / mean) * 100; // Coefficient of variation
    
    console.log(`\nDistribution Evenness: ${cv < 20 ? 'Good' : cv < 30 ? 'Fair' : 'Poor'} (Coefficient of Variation: ${cv.toFixed(1)}%)`);
}