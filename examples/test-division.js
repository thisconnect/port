// Example: testing Pd's [/] object
// node examples/test-division.js
// or node test-division.js

var path = require('path'),
	station = require('../station');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));

var tests = [{
		input: ['cold 2', 'hot 10'],
		expect: 5
	}, {
		input: ['cold -1', 'hot 1'],
		expect: -1
	}, {
		input: ['cold -0.5', 'hot 0.1'],
		expect: -0.2
	}, {
		input: ['cold 0', 'hot 1'],
		expect: 0 // whoot?
	}, {
		input: ['hot 40 4'],
		expect: 10
	}, {
		input: ['hot 0.1 -0.5'],
		expect: -0.2
	}, {
		input: ['cold 10', 'hot 100'],
		expect: 9 // wrong!
		// expect to FAIL
	}, {
		input: ['cold -1', 'hot symbol a']
		// expects error:
		// error: /: no method for 'symbol'
	}, {
		input: ['hot a b']
		// expects error:
		// error: /: no method for 'a'
	}, {
		input: ['cold b']
		// expects error:
		// error: inlet: expected 'float' but got 'b'
	}
];

console.log('expect to run ' + tests.length + ' tests. 6 passing, 1 failing and 3 to error\n');

var i = -1;

function run(){
	if (++i >= tests.length) return pd.destroy();
	pd.write(tests[i].input.join(';\n') + ';\n');
}

var pd = station({
	read: 8105, // [netsend]
	write: 8106, // [netreceive]
	flags: [
		'-noprefs', '-stderr', '-nogui', '-send', 'netsend connect localhost 8105',
		'-open', dir + '/test-division.pd'
	]
}).on('print', function(buffer){
	var data = buffer.toString(), result = data.match(/^result:\s(.+)/);
	if (!!result){
		console.log(
			result[1] == tests[i].expect ? 'PASSED' : 'FAILED',
			'(test ' + i + ')',
			'input:', tests[i].input.join(';') + ';',
			'expected:', tests[i].expect, 'got:', result[1],
			'\n'
		);
		return run();
	}
	console.log(data);
	if (data.match(/^error:(.+)/)) run();
}).on('connect', run).create();

