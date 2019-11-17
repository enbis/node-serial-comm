var assert = require('assert');
describe('Tests', function() {
  describe('functions validation tests', function() {
    it('regex test', function() {
      
      const fullResp = "S S 1234 g"
      let res = -1
      if (fullResp.endsWith('g')) {
        var regex = /\d+/
        var matches = regex.exec(fullResp);
        res = matches.length
      }
      
      assert.equal(res, 1);
    });

  });
});