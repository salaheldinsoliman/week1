pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals

template _plonk_Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal temp;
   signal output d; 

   temp <== a* b; 

   // Constraints.  
   d <== temp * c;  
}

component main = _plonk_Multiplier3();