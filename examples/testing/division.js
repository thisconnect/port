// Example: testing Pd's [/] object
// node examples/test-division.js
// or node test-division.js

var path = require('path'),
	print = require('util').print;
	port = require('../../port');

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
		input: ['cold 10', 'hot 100'],
		expect: 9 // wrong!
		// expect to FAIL
	}, {
		input: ['hot 40 4'],
		expect: 10
	}, {
		input: ['hot 0.1 -0.5'],
		expect: -0.2
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

console.log('\ntesting the [/] object: 6 should pass, 1 should fail, 3 should error\n');

var i = -1;

function run(){
	if (++i >= tests.length) return pd.destroy();
	pd.write(tests[i].input.join(';\n') + ';\n');
}

var pd = port({
	read: 8105, // [netsend]
	write: 8106, // [netreceive]
	flags: [
		'-noprefs', '-stderr', '-nogui', '-send', 'netsend connect localhost 8105',
		'-open', dir + '/division.pd'
	]
}).on('stderr', function(buffer){
	var data = buffer.toString(), result = data.match(/^result:\s(.+)/);
	if (!!result){
		if (result[1] == tests[i].expect) print('\u001B[32m', 'PASSED');
		else print('\u001B[31m', 'FAILED');
		
		print('\u001B[0m', ' (' + i + ') ');
		
		console.log('input:', tests[i].input.join('; ') + ';',
			'expected:', tests[i].expect, 'got:', result[1]
		);
		return run();
	}
	var error = data.match(/^error:(.*)/);
	if (error){
		print('\u001B[31m', 'ERROR');
		print('\u001B[0m', ' (' + i + ') ');
		console.log(error[1]);
		run();
	} else {
		print('\u001B[33m', data, '\u001B[0m');
	}
})
.on('connect', run)
.create();

