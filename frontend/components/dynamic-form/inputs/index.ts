// Base components
export { InputWrapper, BaseInputField } from './BaseInput';

// Basic input components
export { default as TextInput } from './TextInput';
export { default as TextareaInput } from './TextareaInput';
export { default as SelectInput } from './SelectInput';
export { default as MultiselectInput } from './MultiselectInput';
export { default as ScaleInput } from './ScaleInput';
export { default as NumberInput } from './NumberInput';
export { default as DateInput } from './DateInput';
export { default as EmailInput } from './EmailInput';
export { default as UrlInput } from './UrlInput';

// Rich input components
export {
  RadioPillsInput,
  RadioCardsInput,
  CheckboxPillsInput,
  CheckboxCardsInput,
  EnhancedScaleInput,
  LabeledSliderInput,
  ToggleSwitchInput,
  CurrencyInputComponent,
  NumberSpinnerInput,
} from './RichInputs';

// Input component mapping
import { InputType } from '@/lib/dynamic-form';
import TextInput from './TextInput';
import TextareaInput from './TextareaInput';
import SelectInput from './SelectInput';
import MultiselectInput from './MultiselectInput';
import ScaleInput from './ScaleInput';
import NumberInput from './NumberInput';
import DateInput from './DateInput';
import EmailInput from './EmailInput';
import UrlInput from './UrlInput';
import {
  RadioPillsInput,
  RadioCardsInput,
  CheckboxPillsInput,
  CheckboxCardsInput,
  EnhancedScaleInput,
  LabeledSliderInput,
  ToggleSwitchInput,
  CurrencyInputComponent,
  NumberSpinnerInput,
} from './RichInputs';

export const getInputComponent = (type: InputType) => {
  switch (type) {
    // Basic inputs
    case 'text':
      return TextInput;
    case 'textarea':
      return TextareaInput;
    case 'select':
      return SelectInput;
    case 'multiselect':
      return MultiselectInput;
    case 'scale':
      return ScaleInput;
    case 'number':
      return NumberInput;
    case 'date':
      return DateInput;
    case 'email':
      return EmailInput;
    case 'url':
      return UrlInput;
    // Rich visual inputs
    case 'radio_pills':
      return RadioPillsInput;
    case 'radio_cards':
      return RadioCardsInput;
    case 'checkbox_pills':
      return CheckboxPillsInput;
    case 'checkbox_cards':
      return CheckboxCardsInput;
    case 'enhanced_scale':
      return EnhancedScaleInput;
    case 'labeled_slider':
      return LabeledSliderInput;
    case 'toggle_switch':
      return ToggleSwitchInput;
    case 'currency':
      return CurrencyInputComponent;
    case 'number_spinner':
      return NumberSpinnerInput;
    default:
      console.warn(`Unknown input type: ${type}`);
      return TextInput;
  }
};
