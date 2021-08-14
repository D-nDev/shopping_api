[1, 2, 3].forEach(async (num) => {
  await waitFor(50);
  console.log(num);
});
console.log("Done");
