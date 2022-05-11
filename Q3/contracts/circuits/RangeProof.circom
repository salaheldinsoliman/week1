pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template RangeProof() {
    signal input min;
    signal input max;
    signal input in;
    
    signal output out;

    component lt = LessEqThan(32);
    component gt = GreaterEqThan(32);
    
    lt.in[0] <== in;
    lt.in[1] <== min;

    gt.in[0] <== in;
    gt.in[1] <== max;



    out <== lt.out * gt.out;
}

