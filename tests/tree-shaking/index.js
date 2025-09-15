// best output: swc - console.log('Hi')
// ONLY swc can remove dead code
{
  let AOT = true;
  // const setAOT = () => {
  //   AOT = false;
  // };
  // setAOT();
  const fn = AOT ? () => console.log('Hi') : () => {};
  fn();
}

// best output: swc - (()=>{})()
// ONLY swc can remove dead code
{
  let AOT = true;
  const setAOT = () => {
    AOT = false;
  };
  setAOT();
  const fn = AOT ? () => console.log('Hi') : () => {};
  fn();
}
