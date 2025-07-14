import { NumWithCommaPipe } from './num-with-comma.pipe';

describe('NumWithCommaPipe', () => {
  it('create an instance', () => {
    const pipe = new NumWithCommaPipe();
    expect(pipe).toBeTruthy();
  });
});
