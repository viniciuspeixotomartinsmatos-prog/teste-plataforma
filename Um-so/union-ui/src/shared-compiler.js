let initializing;
export function browserCompiler(){
 if(!initializing){
   initializing=import('esbuild-wasm').then(async compiler=>{
     await compiler.initialize({wasmURL:'/assets/esbuild.wasm',worker:true});
     return compiler;
   }).catch(error=>{initializing=undefined;throw error;});
 }
 return initializing;
}
