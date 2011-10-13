#!/bin/bash

node support/pdsocket.node.js & nodepid=$!

case $OSTYPE in
    'linux-gnu')
		pd ./base.pd
		;;
    'darwin10.0')
		# open ./base.pd
		/Applications/Pd-0.*.app/Contents/Resources/bin/pd ./base.pd
		;;
esac

kill $nodepid 2> /dev/null
