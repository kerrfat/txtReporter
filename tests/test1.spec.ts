describe("Name of the group", () => {
  describe("Nested Suite 1", () => {
    for (let i = 1; i <= 10; i++) {
      it(`Test ${i}`, () => {
        expect(1).toBe(1);
      });
    }
  });

  describe("Nested Suite 2", () => {
    for (let i = 11; i <= 20; i++) {
      it(`Test ${i}`, () => {
        expect(1).toBe(1);
      });
    }
  });
});
