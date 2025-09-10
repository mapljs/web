// best output: swc - console.log('Hi')
// ONLY swc can remove dead code
{
  let AOT = true;
  const getAOT = /* @__NO_SIDE_EFFECTS__ */ () => AOT;
  // const setAOT = () => {
  //   AOT = false;
  // };
  // setAOT();
  const fn = getAOT() ? () => console.log("Hi") : () => {};
  fn();
}

// best output: swc - (()=>{})()
// ONLY swc can remove dead code
{
  let AOT = true;
  const getAOT = /* @__NO_SIDE_EFFECTS__ */ () => AOT;
  const setAOT = () => {
    AOT = false;
  };
  setAOT();
  const fn = getAOT() ? () => console.log("Hi") : () => {};
  fn();
}

{
  const __MAPL_AOT__ = true;
  const fn = __MAPL_AOT__ ? () => console.log("Hi") : () => {};
  fn();
}
