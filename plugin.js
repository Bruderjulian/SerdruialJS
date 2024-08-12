var test = {
  $metadata: {
    name: "Test Plugin",
    id: "test",
    description: "A Test Plugin",
    version: 1.0,
    author: "Julizey",
    license: "MIT",
    priority: 2,
  },
  $dependicies: {
    // [id]:[version]
    // -> "test2": 1.0
  },
  boards: {
    Arduino_Imaginary: {
      name: "Arduino_Imaginary",
      pinData: "D0-D13/A1-A5",
    },
  },
  commands: {
    say: {
      name: "say",
      description: "say HelloWorld",
      input: "say %hash",
      output: "say %hash Hello-World",
    },
  },
  components: {},
};

module.exports = test;
