export const PASSWORD_MIN_LENGTH=8;
export const PASSWORD_REQUIREMENTS='Use pelo menos 8 caracteres, com uma letra maiúscula e um número.';

export function validNewPassword(value){
 return typeof value==='string'&&value.length>=PASSWORD_MIN_LENGTH&&/[A-Z]/.test(value)&&/[0-9]/.test(value);
}
