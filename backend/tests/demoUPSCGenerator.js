// tests/demoUPSCGenerator.js
// Demonstration script for the enhanced UPSC Question Generator with different parameters

const UPSCQuestionGenerator = require('../utils/upscQuestionGenerator');

console.log('Demonstration of Enhanced UPSC Question Generator\n');
console.log('=' .repeat(60));

// Demo 1: Generate 10 questions with different difficulty levels
console.log('\nDemo 1: Mixed Difficulty Levels');
console.log('-'.repeat(30));

const mixedDifficultyQuestions = UPSCQuestionGenerator.generateQuestions({
    difficulty: 'Hard',
    topics: ['Indian Economy', 'Science and Technology'],
    count: 3
});

mixedDifficultyQuestions.forEach((q, index) => {
    console.log(`${index + 1}. [${q.format}] ${q.question.substring(0, 50)}...`);
});

// Demo 2: Generate questions for specific topics
console.log('\nDemo 2: Specific Topics');
console.log('-'.repeat(20));

const topicSpecificQuestions = UPSCQuestionGenerator.generateQuestions({
    difficulty: 'Medium',
    topics: ['Ancient History', 'Medieval History', 'Modern History'],
    count: 4
});

topicSpecificQuestions.forEach((q, index) => {
    console.log(`${index + 1}. [${q.format}] Topic-based question on ${q.question.substring(10, 30)}...`);
});

// Demo 3: Easy difficulty questions
console.log('\nDemo 3: Easy Difficulty Questions');
console.log('-'.repeat(25));

const easyQuestions = UPSCQuestionGenerator.generateQuestions({
    difficulty: 'Easy',
    topics: ['General Knowledge'],
    count: 3
});

easyQuestions.forEach((q, index) => {
    console.log(`${index + 1}. [${q.format}] ${q.question.substring(0, 40)}...`);
});

console.log('\n' + '='.repeat(60));
console.log('Demonstration Complete!');