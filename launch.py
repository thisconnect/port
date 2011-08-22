#import PdSocket, Puredata
from support.pdsocket import PdSocket
from support.pdsocket import Puredata
import os


r = PdSocket.PdSocket()
r.prepare(sendPort = 4541, receivePort = 4542)
r.start()


def hello(self):
	self.send('symbol Hello\ Pd!')
	#self.send('some more...;\n...messages at once')
	#self.send(['list items', 'work', 'as well'])
	#self.send(('tuple', 'too'))
	#self.send({'key': 'value', 'more': 3})

r.addEvent('ready', hello)


def log(self, data):
	print 'Receive: ' + data

r.addEvent('receive', log)


pd = Puredata.Puredata()
pd.prepare(dir = os.getcwd() + '/', file = 'base.pd')
pd.start()

