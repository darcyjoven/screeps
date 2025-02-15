const { pathsToModuleNameMapper } = require('ts-jest')
// const { compilerOptions } = require('./tsconfig')

module.exports = {
    preset: 'ts-jest',
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleNameMapper: {
        "^(utils/.+)$": "<rootDir>/src/$1"
      },
    // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }),
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv : [
        '<rootDir>/test/setup.ts'
    ],
}