var Testigo = require('./testigo/Source/testigo').Testigo,
	Tests = new Testigo(),
	Runner = new Testigo.Runners.Simple('node', Tests);

// Import test cases
require('./suites/tests').setup(Tests);

// Run tests
Runner.run();
