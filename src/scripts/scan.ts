import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {

    const homeConnections = ns.scan()
    let scannerControl = new ScannerControl()
    scannerControl.next(homeConnections, null)

    while (scannerControl.stillScanning) {
        const server = ns.getServer(scannerControl.serverToGet)
        const connectedServers = ns.scan(scannerControl.serverToGet)
        scannerControl.next(connectedServers, server)
    }

    ns.rm("/data/environment.txt")
    ns.write("/data/environment.txt", JSON.stringify(scannerControl.environmentMap))
}

export interface ServerWithPathAndConnections extends Server {
    path: string[];
    connections: string[];
}

export class ScannerControl {

    private pathForServers: Map<string, string[]> = new Map();
    private serversToScanQueue: string[] = []

    public stillScanning = true;

    public environmentMap: ServerWithPathAndConnections[] = [];

    public serverToGet: string = "";

    public next(connectedServers: string[], server: Server | null) {
        if (server) {

            const serverWithPathAndConnections = this.createEvironmentMapServer(server, connectedServers);
            this.environmentMap.push(serverWithPathAndConnections);

            connectedServers.forEach(hostname => {
                if (!this.environmentMap.find(x => x.hostname === hostname) && hostname !== "home") {

                    const pathForHost = serverWithPathAndConnections.path.concat([hostname])
                    this.pathForServers.set(hostname, pathForHost)

                    if(!this.serversToScanQueue.find(x => x === hostname)){
                        this.serversToScanQueue.push(hostname)
                    }
                }
            });
        } else {
            connectedServers.forEach(hostname => {
                this.pathForServers.set(hostname, [hostname])
            });

            this.serversToScanQueue = this.serversToScanQueue.concat(connectedServers)
        }

        if (this.serversToScanQueue.length > 0) {
            this.serverToGet = this.serversToScanQueue.pop()!
        } else {
            this.stillScanning = false;
        }
    }

    private createEvironmentMapServer(server: Server, connectedServers: string[]) {
        let serverWithPathAndConnections = server as ServerWithPathAndConnections;

        if (this.pathForServers.has(server.hostname)) {
            serverWithPathAndConnections.path = this.pathForServers.get(server.hostname)!;
        }

        serverWithPathAndConnections.connections = connectedServers;
        return serverWithPathAndConnections
    }
}
