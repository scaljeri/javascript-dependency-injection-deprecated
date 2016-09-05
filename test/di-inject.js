import chai from 'chai';
import DI from '../di';
import * as fixtures from './di-fixtures-inject';

let should = chai.should();

describe("DI", () => {
  let di;

  beforeEach(() => {
    di = new DI();
  });

  describe('#register', () => {
    describe('Auto detect', () => {
      beforeEach(() => {
        di.register('$barSimple', fixtures.BarSimple);
        di.register('$barBasic', fixtures.BarBasic);
        di.register('$barComplex', fixtures.BarComplex);
        di.register('$foo', fixtures.Foo);
      });

      it('should initialize without injection', () => {
        di.getInstance('$barSimple').should.exist;
      });
    });
  });
});