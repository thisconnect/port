exports.setup = function(tests){

	require('./test.pd').setup(tests);
	require('./test.connection').setup(tests);

};
