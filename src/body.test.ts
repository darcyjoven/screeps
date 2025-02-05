const getConfigs = require('./body');

describe('body', () => {
    test('getConfig', () => {
        expect(getConfigs()).toBe("work");
    });
});