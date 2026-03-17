import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './form-field';

describe('FormField', () => {
  it('should render label and children', () => {
    render(
      <FormField label='Email' name='email'>
        <input id='email' />
      </FormField>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should show required indicator when required', () => {
    render(
      <FormField label='Email' name='email' required>
        <input id='email' />
      </FormField>,
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should not show required indicator by default', () => {
    render(
      <FormField label='Email' name='email'>
        <input id='email' />
      </FormField>,
    );
    expect(screen.queryByText('*')).toBeNull();
  });

  it('should show description when provided and no error', () => {
    render(
      <FormField label='Email' name='email' description='Enter your email'>
        <input id='email' />
      </FormField>,
    );
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('should show error and hide description when error exists', () => {
    render(
      <FormField
        label='Email'
        name='email'
        description='Enter your email'
        error='Email is required'
      >
        <input id='email' />
      </FormField>,
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.queryByText('Enter your email')).toBeNull();
  });

  it('should associate label with input via htmlFor', () => {
    render(
      <FormField label='Email' name='email'>
        <input id='email' />
      </FormField>,
    );
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email');
  });
});
