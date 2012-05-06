#!/bin/bash

node lib/station/station.js & nodepid=$!

case $OSTYPE in
    'linux-gnu')
		pd ./base.pd
		;;
    'darwin10.0')
		# open ./base.pd
		#/Applications/Pd-0.43-0.app/Contents/Resources/bin/pd -stderr -noprefs ./base.pd 
		/Applications/Pd-0.43-0.app/Contents/Resources/bin/pd -stderr -noprefs -nogui ./base.pd 
		;;
esac

kill $nodepid 2> /dev/null
