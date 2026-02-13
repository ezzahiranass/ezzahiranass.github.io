'use client';

import type { ModelDefinition } from './types';

type ModelSwitcherProps = {
  models: ModelDefinition[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function ModelSwitcher({ models, activeId, onSelect }: ModelSwitcherProps) {
  return (
    <div className="configurator-switcher" role="tablist" aria-label="Configurator models">
      {models.map((model) => (
        <button
          key={model.id}
          className={`configurator-switcher__button ${
            activeId === model.id
              ? 'is-active'
              : ''
          }`}
          role="tab"
          aria-selected={activeId === model.id}
          aria-controls={`configurator-${model.id}`}
          onClick={() => onSelect(model.id)}
          type="button"
        >
          {model.name}
        </button>
      ))}
    </div>
  );
}
