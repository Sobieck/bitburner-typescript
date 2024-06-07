import { ScannerControl } from "../scripts/scan"
import { MockServer } from "./MockServer";



describe("ScannerControl", () => {

///         home
///     A           B       C        H
///   D   C       E   F       G    A   I  home
///  E      G           H
///
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


