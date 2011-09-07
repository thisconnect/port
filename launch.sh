#!/bin/bash

case $OSTYPE in
    'linux-gnu')
		pd base.pd
		;;
    'darwin10.0')
		open base.pd
		;;
esac

node support/pdsocket.node.js
