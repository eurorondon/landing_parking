"use client";

import * as RadixSelect from "@radix-ui/react-select";

interface Props {
  id?: string;
  value: string;
  opciones: readonly string[];
  onChange: (valor: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * Select con desplegable propio (Radix UI), estilizado como el resto de la
 * landing en lugar del aspecto nativo del navegador. Estilos en landing.css
 * (.select-trigger, .select-content, .select-item).
 */
export default function Select({ id, value, opciones, onChange, disabled, ariaLabel }: Props) {
  return (
    <RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled}>
      <RadixSelect.Trigger id={id} className="select-trigger" aria-label={ariaLabel}>
        <RadixSelect.Value />
        <RadixSelect.Icon className="select-chevron">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content className="select-content" position="popper" sideOffset={6}>
          <RadixSelect.ScrollUpButton className="select-scrollbtn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m18 15-6-6-6 6" />
            </svg>
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="select-viewport">
            {opciones.map((opcion) => (
              <RadixSelect.Item key={opcion} value={opcion} className="select-item">
                <RadixSelect.ItemText>{opcion}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="select-check">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="select-scrollbtn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
