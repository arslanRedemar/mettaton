module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/interfaces/**',
    '!src/application/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
