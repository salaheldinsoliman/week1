const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16 } = require("snarkjs");
const { plonk } = require("snarkjs");


// function Convert from string to big ints
function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    
   
    let Verifier;
    let verifier;

    beforeEach(async function () {
        
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        
        
        //fullprove functions give back the proof and the inputs
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // function Convert from string to big ints
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);


        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
      


        //split elements by comma and replace () with spaces then convert hex to bigint, then big int to strings
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];


        const Input = argv.slice(8);
      

            // pass inputs and outputs to verify proofs
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        //passing invalid inputs to verify proofs
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe("Multiplier3 with Groth16", function () {

 
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
       
        // same as above, but pass the valid parameters as this contract multiplies three numbers
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2", "c": "3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

  

        //cast to to bigints
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);



        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
        
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]

        //passing invalid inputs to verify proofs
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
        
        
    });
});


describe("Multiplier3 with PLONK", function () {
 
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("_plonk_Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        
       
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2", "c": "3"}, "contracts/circuits/_plonk_Multiplier3/_plonk_Multiplier3_js/_plonk_Multiplier3.wasm","contracts/circuits/_plonk_Multiplier3/circuit_final.zkey");


 
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

            //now we want to pass this call data to prove, but we want to split call data first as it holds both the proof and the pubsignals
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        splitting= calldata.split(',');
        const SplittedProof = splitting[0] 
        const SplittedPublicSignals = JSON.parse(splitting[1]).map(x => BigInt(x).toString())

        //passing the splitted calldata
        expect(await verifier.verifyProof(SplittedProof, SplittedPublicSignals)).to.be.true;
        
    });
    it("Should return false for invalid proof", async function () {
       
        let falseproof = '0xffff'
        let falsepubsignal = [0];
        // passing false proof to see the  test failing
        expect(await verifier.verifyProof(falseproof, falsepubsignal)).to.be.false;
    });
});