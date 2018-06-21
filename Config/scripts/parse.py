import re
import sys
from datetime import datetime
import calendar

if len(sys.argv) < 2:
    print("Usage:\n\tpython parse.py [nginx-log-file]")
    sys.exit(0)

fileName = sys.argv[1]
f = open(fileName, 'r')

class NginxRequest:
    def __init__(self, request):
        self.raw = request   
        self.pattern = r"([^\s\"\[]+)[\s\-]*\[([^\]]*)\] \"([^\"]*)\" (\d*) (\d*) \"([^\"]*)\" \"([^\"]*)\" ([\d]*\.[\d]*|\-) ([\d]*\.[\d]*|\-)"
        self.parseRequest()
    
    def parseRequest(self):
        if not self.raw: 
            return
        m = re.match(self.pattern, self.raw)
        self.fromIp = m.group(1)  
        self.timeStamp = self.parseTimeStamp(m.group(2).split(" ")[0])
        self.endpoint = m.group(3)
        self.status = m.group(4) 
        self.unknown = int(m.group(5))
        self.fromDomain = m.group(6)
        self.fromAgent = m.group(7)
        if m.group(8) is "-":
            self.latency = 0
        else:
            self.latency = float(m.group(8))
        if m.group(9) is "-":
            self.upstreamLatency = 0
        else:
            self.upstreamLatency = float(m.group(9))

    def parseTimeStamp(self, unparsedTime):
        date = unparsedTime.split('/')
        time = date[2].split(':')
        date[2] = time[0]
        date[1] = list(calendar.month_abbr).index(date[1])        
        time.pop(0)
        date = [int(d) for d in date]
        time = [int(t) for t in time]
        dt = datetime(date[2], date[1], date[0], time[0], time[1], time[2])
        return dt

    def getDataList(self):
        return [self.fromIp, self.timeStamp, self.endpoint, self.status, self.latency, self.fromDomain, self.fromAgent]

class NginxRequestGroup: 
    def __init__(self, groupType):
        self.groupType = groupType
        self.requests = []
        self.maxLatency = 0
        self.minLatency = 0
        self.totalLatency = 0
        self.length = 0
        self.cutoffLatency = 0.3      
        self.requestsOverCutoff = 0        
    
    def append(self, req):
        self.requests.append(req)
        if req.latency > self.maxLatency:
            self.maxLatency = req.latency
        if req.latency < self.minLatency:
            self.minLatency = req.latency
        self.totalLatency += req.latency
        if req.latency >= self.cutoffLatency:
            self.requestsOverCutoff += 1
        self.length += 1
    
    def __str__(self):
        avgLatency = 0
        medianLatency = 0
        if self.length:
            avgLatency = self.totalLatency / self.length
            medianLatency = self.requests[int(self.length / 2)].latency
        return "TYPE: " + self.groupType + "\nMAX_MS: " + str(self.maxLatency) + "\nMIN_MS: " + \
        str(self.minLatency) + "\nAVG_MS: " + str(avgLatency) +  "\nMEDIAN_MS: " + str(medianLatency) + \
        "\nREQ_COUNT: " + str(self.length) + "\nCUTOFF: " + str(self.cutoffLatency) + "\nOVER_CUTOFF: " +  \
        str(self.requestsOverCutoff) + "\n=============\n"


line = f.readline()
requests = []
lineCount = 0
while line:
    if line.isspace(): 
        line = f.readline()
        continue
    requests.append(NginxRequest(line))
    lineCount += 1
    #print(lineCount)
    line = f.readline()

requestGroups = {
    "POST /additem": NginxRequestGroup("POST /additem"),
    "POST /verify": NginxRequestGroup("POST /verify"),
    "POST /adduser": NginxRequestGroup("POST /adduser"),
    "POST /login": NginxRequestGroup("POST /login"),
    "POST /follow": NginxRequestGroup("POST /follow"),
    "POST /search": NginxRequestGroup("POST /search"),
    "POST /addmedia": NginxRequestGroup("POST /addmedia"),
    "GET /media": NginxRequestGroup("GET /media"),
    "GET /item": NginxRequestGroup("GET /item"),
    "/like": NginxRequestGroup("/like") 
}
for req in requests:
    for rGroup in requestGroups:
        if rGroup in req.endpoint:
            requestGroups[rGroup].append(req)

for r in requestGroups:
    print(str(requestGroups[r]))

# for like in requestGroups["/like"].requests:
#     print(like.endpoint)



