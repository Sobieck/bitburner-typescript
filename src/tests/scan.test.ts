import { ScannerControl } from "../scripts/scan"
import { Server } from "@ns"


describe("ScannerControl", () => {
    const scannerControl = new ScannerControl() 

    test("should set serverToGet to H", () => {
        scannerControl.next(["A","B","C","H"], null)

        expect(scannerControl.serverToGet).toBe("H")
        expect(scannerControl.stillScanning).toBeTruthy()
    });

    test("should set serverToGet to I and correct environment map", () => {
        const server = new MockServer("H")
        const connections = ["A","I","home"]
        scannerControl.next(connections, server)

        expect(scannerControl.stillScanning).toBeTruthy()

        const latestEnvironmentItem = scannerControl.environmentMap[0];
        expect(latestEnvironmentItem.connections).toBe(connections)
        expect(latestEnvironmentItem.path).toEqual(["H"])
        
        expect(scannerControl.serverToGet).toBe("I")
    });

    test("should set serverToGet to C and set correct environment map", () => {
        const server = new MockServer("I")
        const connections = ["H"]
        scannerControl.next(connections, server)

        expect(scannerControl.stillScanning).toBeTruthy()

        const latestEnvironmentItem = scannerControl.environmentMap[1]
        expect(latestEnvironmentItem.connections).toBe(connections)
        expect(latestEnvironmentItem.path).toEqual(["H","I"])

        expect(scannerControl.serverToGet).toBe("C")
    });
}); 



export class MockServer implements Server {
    constructor(public hostname: string) { }
    ip: string = "";
    sshPortOpen: boolean = false;
    ftpPortOpen: boolean = false;
    smtpPortOpen: boolean = true;
    httpPortOpen: boolean = false;
    sqlPortOpen: boolean = false;
    hasAdminRights: boolean = false;
    cpuCores: number = 123;
    isConnectedTo: boolean = true;
    ramUsed: number = 12;
    maxRam: number = 25;
    organizationName: string = "asdf";
    purchasedByPlayer: boolean = false;
    backdoorInstalled?: boolean | undefined;
    baseDifficulty?: number | undefined;
    hackDifficulty?: number | undefined;
    minDifficulty?: number | undefined;
    moneyAvailable?: number | undefined;
    moneyMax?: number | undefined;
    numOpenPortsRequired?: number | undefined;
    openPortCount?: number | undefined;
    requiredHackingSkill?: number | undefined;
    serverGrowth?: number | undefined;
}