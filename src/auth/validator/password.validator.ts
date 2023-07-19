import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'password' })
@Injectable()
export class PasswordValidator implements ValidatorConstraintInterface {
  async validate(value: string): Promise<boolean> {
    const upperCaseLetters = /[A-Z]/g;
    const lowerCaseLetters = /[a-z]/g;
    const numbers = /[0-9]/g;
    if (
      value.match(upperCaseLetters) &&
      value.match(lowerCaseLetters) &&
      value.match(numbers) &&
      value.length >= 8
    )
      return true;
    else return false;
  }
  defaultMessage() {
    return `Password must include at least an upper case character, a lower case character, and a digit.`;
  }
}
