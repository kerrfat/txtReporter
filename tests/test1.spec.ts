describe("First Suite", () => {
  describe("Nested Suite 1", () => {
    for (let i = 1; i <= 10; i++) {
      it(`Test ${i}`, () => {
        // Test logic here
      });
    }
  });

  describe("Nested Suite 2", () => {
    for (let i = 11; i <= 20; i++) {
      it(`Test ${i}`, () => {
        // Test logic here
      });
    }
  });
});


