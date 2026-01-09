// tests/finalDemo.js
// Final demonstration of UPSC Question Generator with proper answer shuffling

const UPSCQuestionGenerator = require('../utils/upscQuestionGenerator');

console.log('FINAL DEMONSTRATION: UPSC Question Generator with Proper Answer Shuffling\n');
console.log('=' .repeat(70));

const questions = UPSCQuestionGenerator.generateQuestions({
    difficulty: 'Medium',
    topics: ['Indian Polity', 'Geography', 'History', 'Economy', 'Science'],
    count: 10
});

console.log('Generated 10 UPSC-style questions with properly shuffled answers:\n');

questions.forEach((q, index) => {
    console.log(`${index + 1}. [Format ${q.format}] ${q.question.split('\n')[0].substring(0, 60)}...`);
    console.log('   Options:');
    q.options.forEach((option, i) => {
        console.log(`     ${String.fromCharCode(97 + i)}) ${option}`);
    });
    console.log(`   Correct Answer: ${q.correctAnswer}`);
    console.log('');
});

// Verify answer position distribution
const answerPositionCounts = { A: 0, B: 0, C: 0, D: 0 };
questions.forEach(q => {
    const correctIndex = q.options.indexOf(q.correctAnswer);
    if (correctIndex >= 0 && correctIndex < 4) {
        const position = String.fromCharCode(65 + correctIndex);
        answerPositionCounts[position] = (answerPositionCounts[position] || 0) + 1;
    }
});

console.log('Answer Position Distribution:');
Object.keys(answerPositionCounts).forEach(position => {
    const count = answerPositionCounts[position];
    const percentage = ((count / questions.length) * 100).toFixed(1);
    console.log(`  Option ${position}: ${count} questions (${percentage}%)`);
});