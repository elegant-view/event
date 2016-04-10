import Event from 'Event';

describe('Event', () => {

    let event;
    beforeEach(() => {
        event = new Event();
    });

    it('synchronous trigger', done => {
        event.on('change', () => {
            expect(true).toBe(true);
            done();
        });
        event.on('change', () => {
            done(new Error('error'));
        });
        event.trigger('change');
    });

    it('safe trigger', done => {
        let handler1 = () => {
            event.off('change');
        };
        let handler2 = () => {
            expect(true).toBe(true);
            done();
        };
        event.on('change', handler1);
        event.on('change', handler2);
        event.safeTrigger('change');
    });
});
