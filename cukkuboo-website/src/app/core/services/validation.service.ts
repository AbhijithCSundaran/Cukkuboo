export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
        let config: any = {
            'selectValidator': 'select a Value',
            'required': 'Required',
            'invalidNumber': `Invalid Number`,
            'invalidValue': `Invalid Value`,
            'invalidChar': `Invalid Character`,
            'stringValidator': `Not Valid`,
            'LatLongValidator': `Not Valid`,
            'invalidEmailAddress': 'Invalid email address',
            'invalidPhoneNo': 'Invalid phone number',
            'invalidPassword': 'Password must be 8+ characters with uppercase, lowercase, number, symbol.',
            'passwordsMismatch': 'Passwords Mismatch',
            'minlength': `Minimum length ${validatorValue.requiredLength}`,
            'maxlength': `Maximum length ${validatorValue.requiredLength}`,
            'max': `Maximum value is ${validatorValue.max}`,
            'min': `Minimum value is ${validatorValue.min}`,
            'pattern': `Invalid Mobile Number`
        };
        return config[validatorName];
    }


    static LatLongValidator(control: any) {
        var regexStr = "^[0-9.]*$";
        if (control.value.match(regexStr)) {
            return null;
        } else {
            return { 'LatLongValidator': true };
        }
    }

    static numberValidator(control: any) {
        var regexStr0 = "^[0]$"
        var regexStr1 = "^[1-9][0-9]*$"
        if (control.value != undefined && control.value != null && control.value != '') {
            if (String(control.value).match(regexStr0) || String(control.value).match(regexStr1)) {
                return null;
            } else {
                return { 'invalidNumber': true };
            }
        }
        return null;
    }
    static nonZeroInteger(control: any) {
        // var regexStr0 = "^[1-9]$"
        var regexStr = "^[1-9][0-9]*$"
        if (control.value != undefined && control.value != null && control.value != '') {
            // if (String(control.value).match(regexStr0) || String(control.value).match(regexStr1)) {
            if (String(control.value).match(regexStr)) {
                return null;
            } else {
                return { 'invalidNumber': true };
            }
        }
        return null;
    }
    static integerValidator(control: any) {
        var regexStr0 = "^[-+]?[0]$"
        var regexStr1 = "^[-+]?[1-9][0-9]*$"
        if (control.value != undefined && control.value != null && control.value != '') {
            if (String(control.value).match(regexStr0) || String(control.value).match(regexStr1)) {
                return null;
            } else {
                return { 'invalidNumber': true };
            }
        }
        return null;
    }
    static nonZeroFloatValidator(control: any) {
        var regexStr0 = "^[0][.][0-9]*[1-9][0-9]*$"
        var regexStr1 = "^[1-9][0-9]*([.][0-9][0-9]*)?$"
        if (control.value != undefined && control.value != null && control.value != '') {
            if (String(control.value).match(regexStr0) || String(control.value).match(regexStr1))
                return null;
            else
                return { 'invalidValue': true };
        }
        return null;
    }
    static floatValidator(control: any) {
        var regexStr0 = "^[-+]?[0]([.][0-9][0-9]*)?$"
        var regexStr1 = "^[-+]?[1-9][0-9]*([.][0-9][0-9]*)?$"
        if (control.value != undefined && control.value != null && control.value != '') {
            if (String(control.value).match(regexStr0) || String(control.value).match(regexStr1))
                return null;
            else
                return { 'invalidValue': true };
        }
        return null;
    }
    static stringOfNumbersValidator(control: any) {
        var regexStr = "^[0-9]*$"
        if (control.value != undefined && control.value != null && control.value != '') {
            if (String(control.value).match(regexStr)) {
                return null;
            } else {
                return { 'invalidChar': true };
            }
        }
        return null;
    }

    static stringValidator(control: any) {
        var regexStr = "^[a-zA-Z ]*$";
        if (control.value != undefined && control.value != null && control.value != '') {
            if (control.value.match(regexStr)) {
                return null;
            } else {
                return { 'stringValidator': true };
            }
        }
        return null;
    }
    static selectValidator(control: any) {
        if (Number(control.value) > 0) {
            return null;
        } else {
            return { 'selectValidator': true };
        }
    }

    static emailValidator(control: any) {
        // var regexStr = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-][a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*[@][a-z0-9._-][a-z0-9._-]*[.][a-z]?[a-z][a-z]$";
        // blocked special chars $%&
        var regexStr = "^[a-zA-Z0-9.!#'*+/?^_`{|}~-][a-zA-Z0-9.!#'*+/?^_`{|}~-]*[@][a-z0-9._-][a-z0-9._-]*[.][a-z]?[a-z][a-z]$";
        if (control.value != undefined && control.value != null && control.value != '') {
            if (control.value.match(regexStr))
                return null;
            else
                return { 'invalidEmailAddress': true };
        }
        return null;

    }

    static phoneValidator(control: any) { // Abhi
        // var regexStr = "^([+]{0,1}[ ]{0,1}[(]{0,1}[0-9][)]{0,1}[ ]{0,1}[-]{0,1}[ ]{0,1})([0-9]{5,13})$";
        var regexStr = "^([ ]*[+]?[ ]*[0-9]*)?([0-9]*([- /]?[0-9]*)*[(][ ]?[0-9]([- /]*[0-9][0-9]*)*[ ]?[)])*([- /]?[0-9][0-9]*)*$";
        if (control.value != undefined && control.value != null && control.value != '') {
            if (control.value.match(regexStr)) {
                return null;
            } else {
                return { 'invalidPhoneNo': true };
            }
        }
        return null;
    }

    static passwordValidator(control: any) {
        // {6,100}           - Assert password is between 8 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        // var regexStr = "^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,100}$"
        // var regexStr = "^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,100}$"
        var regexStr = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$"
        if (control.value != undefined && control.value != null && control.value != '') {
            if (control.value.match(regexStr)) {
                return null;
            } else {
                return { 'invalidPassword': true };
            }
        }
        return null;
    }

    static multipleOf(control: any) {
        var value: number = 500;
        if (control.value != undefined && control.value != null && control.value != '') {
            if (Number(control.value) % Number(value) == 0) {
                return null;
            } else {
                return { 'invalidValue': true };
            }
        }
        return null;
    }

}
