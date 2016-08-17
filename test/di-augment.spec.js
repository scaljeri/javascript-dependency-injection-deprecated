import chai from 'chai';
import DI from '../di';
import * as fixtures from './di-augment-fixtures';

let should = chai.should();

describe.only("DI", () => {
    let di, bar;

    beforeEach(() => {
        di = new DI();

        di.register('$bar', fixtures.Bar, { augment: true });
        bar = di.getInstance('$bar');
    });

    it('should augment', () => {
        bar.should.equals(10);
    })
});

