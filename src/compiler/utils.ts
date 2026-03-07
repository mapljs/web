export const PARAMS_MAP: string[] = ['', `${constants.PARAMS}0`];
for (let i = 1; i <= 16; i++) PARAMS_MAP.push(`${PARAMS_MAP[i]},${constants.PARAMS}${i}`);
