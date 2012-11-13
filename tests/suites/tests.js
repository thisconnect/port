exports.setup = function(tests){

	require('./test.create').setup(tests);
	require('./test.connect').setup(tests);
	require('./test.events').setup(tests);

};
