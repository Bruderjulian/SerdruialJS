const jasmine = new (require("jasmine"))();
jasmine.loadConfig({
  spec_dir: "tests",
  spec_files: ["**/*test.js"],
  helpers: ["src/utils.js"],
  env: {
    stopSpecOnExpectationFailure: false,
    random: false,
  },
  jsLoader: "require",
});
jasmine.exitOnCompletion = false;

jasmine.execute().then(function (data) {
  console.log(
    "Completed all Tests with Status",
    data.overallStatus,
    "in",
    data.totalTime,
    "ms\n"
  );
});
