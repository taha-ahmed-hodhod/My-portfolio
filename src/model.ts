export function surfacePoint(u:number,v:number,form:number):[number,number,number] {
 const tube=0.39 + (form===1 ? 0.11*Math.cos(3*u) : 0.075*Math.sin(3*u));
 const radius=0.95 + tube*Math.cos(v);
 return [radius*Math.cos(u),radius*Math.sin(u),tube*Math.sin(v)+(form===1 ? 0.18*Math.sin(2*u):0.07*Math.cos(3*u))];
}
