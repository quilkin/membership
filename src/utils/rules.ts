
/**
 * Rules checking for form input fields
 */
//import rideData from '@/utils/ridedata'

export const nameRules =   [ 
                            (value: string) => !!value || 'Required.', 
                            (value: string) => {
                                if (value.includes(' ')) return 'No spaces in names please'
                                if (value.length >= 2) return true
                                return 'name is min 2 characters.'
                                },
                            ];
export const addressRules =   [ 
                            (value: string) => !!value || 'Required.', 
                            (value: string) => {
                                if (value.length >= 5) return true
                                return 'address is min 5 characters.'
                                },
                            ];
export const genderRules =   [ 
                            (value: string) => !!value || 'Required.', 
                            (value: string) => {
                                if (value =='m') return true;
                                if (value =='f') return true;
                                if (value =='t') return true;
                                return 'please enter m,f, or t.'
                                },
                            ];

export const pwRules =     [ 
                            (value: string) => !!value || 'Required.', 
                            (value: string) => {
                                if (value?.length >= 6) return true
                                return 'password is 6 characters or more.'
                                },
                            ];
export const emailRules = [
                            (value: string) => !!value || 'Required.',
                            (value: string) => {
                            if (/.+@.+\..+/.test(value)) return true
                            return 'E-mail must be a valid address.'
                            },
                        ];
export const subsRules = [ 
                            (value: number) => !!value || 'Required.', 
                            (value: number) => {
                                if (value >= 5 ) return true
                                return 'subs (in £) invalid'
                                },
                            ];
// export const dateRules = [
//                             (value: string) => !!value || 'Required.',
//                             (value: string) => {
//                                 const parts = value.split('//');
//                                 const date = parseInt(parts[0]);
//                                 const month = parseInt(parts[1]);
//                                 const year = parseInt(parts[2]);
//                             if (date >0 && date <31 && month >0 && month < 13 && year >25 && year <99) return true;
//                             return 'Date must be valid DD/MM/YY.'
//                             },
//                         ];


